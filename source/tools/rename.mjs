// Usage: node tools/rename.mjs <input.js> <map.json> <output.tsx>
// Scope-aware renaming of minified identifiers + restoring JSX from (0, X.jsx)(...) calls.
import fs from 'node:fs';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import prettier from 'prettier';
const traverse = _traverse.default ?? _traverse;
const generate = _generate.default ?? _generate;

const [, , inFile, mapFile, outFile] = process.argv;
const code = fs.readFileSync(inFile, 'utf8');
const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));   // { global: {old:new}, fn: { "<function name>": {old:new} } }
const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });

// 1. rename program-level bindings
traverse(ast, {
  Program(path) {
    for (const [from, to] of Object.entries(map.global ?? {})) {
      if (path.scope.hasBinding(from)) path.scope.rename(from, to);
    }
    path.stop();
  },
});
// 2. rename inside named functions: map.fn[functionName][old] = new   (applies to params/locals of that function)
traverse(ast, {
  Function(path) {
    const name = path.node.id?.name ?? (path.parent.type === 'VariableDeclarator' ? path.parent.id.name : null);
    const m = name && map.fn?.[name];
    if (!m) return;
    for (const [from, to] of Object.entries(m)) if (path.scope.hasOwnBinding(from)) path.scope.rename(from, to);
  },
});
// 3. (0, A.jsx)(type, props)  ->  <type ...props>children</type>
const jsxNames = new Set(['jsx', 'jsxs']);
function propToAttr(p) {
  if (t.isSpreadElement(p)) return t.jsxSpreadAttribute(p.argument);
  const key = t.isIdentifier(p.key) ? p.key.name : t.isStringLiteral(p.key) ? p.key.value : null;
  if (key === null || !/^[A-Za-z_][\w:-]*$/.test(key)) return null;
  const v = p.value;
  if (t.isStringLiteral(v) && !/["\\\n]/.test(v.value)) return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(v.value));
  if (t.isBooleanLiteral(v) && v.value) return t.jsxAttribute(t.jsxIdentifier(key), null);
  return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(v));
}
function toChild(n) {
  if (t.isStringLiteral(n) && !/[{}<>\n]/.test(n.value)) return t.jsxText(n.value);
  if (t.isJSXElement(n) || t.isJSXFragment(n)) return n;
  return t.jsxExpressionContainer(n);
}
traverse(ast, {
  CallExpression: {
    exit(path) {
      const c = path.node.callee;
      if (!(t.isSequenceExpression(c) && c.expressions.length === 2 && t.isMemberExpression(c.expressions[1]) && jsxNames.has(c.expressions[1].property.name))) return;
      const [type, props] = path.node.arguments;
      const key = path.node.arguments[2];
      let nameNode;
      if (t.isStringLiteral(type)) nameNode = t.jsxIdentifier(type.value);
      else if (t.isIdentifier(type)) nameNode = t.jsxIdentifier(type.name);
      else if (t.isMemberExpression(type) && t.isIdentifier(type.object) && t.isIdentifier(type.property)) nameNode = t.jsxMemberExpression(t.jsxIdentifier(type.object.name), t.jsxIdentifier(type.property.name));
      else return;
      if (t.isMemberExpression(type) && type.object.name === 'k' && type.property.name === 'Fragment') nameNode = t.jsxIdentifier('Fragment');
      if (!t.isObjectExpression(props)) return;
      const attrs = []; let children = [];
      for (const p of props.properties) {
        if (t.isObjectProperty(p) && (p.key.name === 'children' || p.key.value === 'children') && !p.computed) {
          children = t.isArrayExpression(p.value) ? p.value.elements : [p.value];
          continue;
        }
        const a = propToAttr(p); if (!a) return; attrs.push(a);
      }
      if (key) attrs.unshift(t.jsxAttribute(t.jsxIdentifier('key'), t.isStringLiteral(key) ? t.stringLiteral(key.value) : t.jsxExpressionContainer(key)));
      const kids = children.filter(Boolean).map(toChild);
      const el = t.jsxElement(t.jsxOpeningElement(nameNode, attrs, kids.length === 0), kids.length ? t.jsxClosingElement(nameNode) : null, kids, kids.length === 0);
      path.replaceWith(el);
    },
  },
});
let out = generate(ast, { jsescOption: { minimal: true } }).code;
out = await prettier.format(out, { parser: 'typescript', printWidth: 120, singleQuote: true, trailingComma: 'all' });
fs.writeFileSync(outFile, out);
console.log('wrote', outFile, out.split('\n').length, 'lines');
