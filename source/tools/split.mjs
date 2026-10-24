// Usage: node tools/split.mjs <config.json>
// Splits one compiled chunk (already de-bundled by webcrack) into readable modules:
//  - external/imported minified names are replaced by real imports (config.externals)
//  - top-level names are renamed (config.rename), selected function locals too (config.fn)
//  - (0, A.jsx)(...) calls are turned back into JSX
//  - each top-level declaration is written to the module chosen in config.modules
import fs from 'node:fs';
import path from 'node:path';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import prettier from 'prettier';
const traverse = _traverse.default ?? _traverse;
const generate = _generate.default ?? _generate;

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const src = fs.readFileSync(cfg.input, 'utf8');
const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });
const body = ast.program.body;

// ---- 1. split multi-declarator `var a = 1, b = 2` ----
const flat = [];
for (const n of body) {
  if (t.isVariableDeclaration(n) && n.declarations.length > 1) for (const d of n.declarations) flat.push(t.variableDeclaration(n.kind, [d]));
  else flat.push(n);
}
ast.program.body = flat;

// ---- 2. drop imports + removed names, remember which imported locals exist ----
const importedLocals = new Set();
ast.program.body = ast.program.body.filter((n) => {
  if (t.isImportDeclaration(n)) { n.specifiers.forEach((s) => importedLocals.add(s.local.name)); return false; }
  return true;
});
const declNames = (n) =>
  t.isVariableDeclaration(n) ? n.declarations.flatMap((d) => (t.isIdentifier(d.id) ? [d.id.name] : [])) :
  (t.isFunctionDeclaration(n) || t.isClassDeclaration(n)) && n.id ? [n.id.name] : [];
const removed = new Set(cfg.remove ?? []);
ast.program.body = ast.program.body.filter((n) => {
  if (t.isExportNamedDeclaration(n)) return false;
  const names = declNames(n);
  return !(names.length && names.every((x) => removed.has(x)));
});

// ---- 3. renames ----
traverse(ast, {
  Program(p) {
    const all = { ...(cfg.rename ?? {}) };
    for (const [from, to] of Object.entries(all)) if (p.scope.hasOwnBinding(from)) p.scope.rename(from, to);
    p.stop();
  },
});
// names that were imported (or whose declaration was removed) are now free variables: rename every reference
traverse(ast, {
  Identifier(p) {
    const to = cfg.rename?.[p.node.name];
    if (!to || p.scope.hasBinding(p.node.name, true)) return;
    if (p.isReferencedIdentifier()) p.node.name = to;
  },
  JSXIdentifier(p) {
    const to = cfg.rename?.[p.node.name];
    if (to && !p.scope.hasBinding(p.node.name, true)) p.node.name = to;
  },
});
traverse(ast, {
  Function(p) {
    const name = p.node.id?.name ?? (p.parent.type === 'VariableDeclarator' && t.isIdentifier(p.parent.id) ? p.parent.id.name : null);
    const m = name && cfg.fn?.[name];
    if (!m) return;
    for (const [from, to] of Object.entries(m)) if (p.scope.hasOwnBinding(from)) p.scope.rename(from, to);
  },
});

// (0, React.useState)(...) -> useState(...)
cfg.externals ??= {};
const reactHooks = new Set(['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useSyncExternalStore', 'memo', 'forwardRef', 'useContext', 'createContext', 'useLayoutEffect', 'useReducer', 'useId', 'lazy', 'startTransition', 'useTransition', 'useDeferredValue']);
traverse(ast, { CallExpression(p) {
  const c = p.node.callee;
  if (t.isSequenceExpression(c) && c.expressions.length === 2 && t.isMemberExpression(c.expressions[1]) && t.isIdentifier(c.expressions[1].object, { name: 'React' }) && reactHooks.has(c.expressions[1].property.name)) {
    const name = c.expressions[1].property.name; cfg.externals[name] = { from: 'react' }; p.node.callee = t.identifier(name);
  }
} });
// plain template literals (no ${}) -> normal strings
traverse(ast, { TemplateLiteral(p) { if (p.node.expressions.length === 0 && p.node.quasis[0].value.cooked !== undefined && !p.parentPath.isTaggedTemplateExpression()) p.replaceWith(t.stringLiteral(p.node.quasis[0].value.cooked)); } });
// ---- 4. JSX restoration ----
const isJsxCall = (c) => t.isSequenceExpression(c) && c.expressions.length === 2 && t.isMemberExpression(c.expressions[1]) && ['jsx', 'jsxs'].includes(c.expressions[1].property.name);
function attr(p) {
  if (t.isSpreadElement(p)) return t.jsxSpreadAttribute(p.argument);
  if (p.computed) return null;
  const key = t.isIdentifier(p.key) ? p.key.name : t.isStringLiteral(p.key) ? p.key.value : null;
  if (key === null || !/^[A-Za-z_][\w:-]*$/.test(key)) return null;
  const v = p.value;
  if (t.isStringLiteral(v) && !/["\\\n]/.test(v.value)) return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(v.value));
  if (t.isBooleanLiteral(v) && v.value) return t.jsxAttribute(t.jsxIdentifier(key), null);
  return t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(v));
}
const child = (n) => (t.isStringLiteral(n) && !/[{}<>\n&]/.test(n.value) && n.value === n.value.trim() ? t.jsxText(n.value) : t.isJSXElement(n) || t.isJSXFragment(n) ? n : t.jsxExpressionContainer(n));
traverse(ast, {
  CallExpression: {
    exit(p) {
      if (!isJsxCall(p.node.callee)) return;
      const [type, props, key] = p.node.arguments;
      if (!t.isObjectExpression(props)) return;
      const attrs = []; let children = [];
      for (const pr of props.properties) {
        if (t.isObjectProperty(pr) && !pr.computed && (pr.key.name === 'children' || pr.key.value === 'children')) { children = t.isArrayExpression(pr.value) ? pr.value.elements : [pr.value]; continue; }
        const a = attr(pr); if (!a) return; attrs.push(a);
      }
      const kids = children.filter(Boolean).map(child);
      const isFragment = t.isMemberExpression(type) && type.property.name === 'Fragment';
      if (isFragment && !key && !attrs.length) { p.replaceWith(t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), kids)); return; }
      let nameNode;
      if (t.isStringLiteral(type)) nameNode = t.jsxIdentifier(type.value);
      else if (t.isIdentifier(type)) nameNode = t.jsxIdentifier(type.name);
      else if (t.isMemberExpression(type) && t.isIdentifier(type.object) && t.isIdentifier(type.property)) nameNode = t.jsxMemberExpression(t.jsxIdentifier(type.object.name === 'A' ? 'React' : type.object.name), t.jsxIdentifier(type.property.name));
      else return;
      if (key) attrs.unshift(t.jsxAttribute(t.jsxIdentifier('key'), t.isStringLiteral(key) ? t.stringLiteral(key.value) : t.jsxExpressionContainer(key)));
      p.replaceWith(t.jsxElement(t.jsxOpeningElement(nameNode, attrs, kids.length === 0), kids.length ? t.jsxClosingElement(nameNode) : null, kids, kids.length === 0));
    },
  },
});

// ---- 5. assign statements to modules ----
const moduleOf = {};
for (const [mod, names] of Object.entries(cfg.modules)) for (const n of names) moduleOf[n] = mod;
const finalName = (n) => cfg.rename?.[n] ?? n;
const stmtModule = new Map(); const unassigned = [];
const ownName = new Map();
for (const n of ast.program.body) {
  const names = declNames(n);
  if (!names.length) { unassigned.push(generate(n).code.slice(0, 80)); continue; }
  const mod = names.map((x) => moduleOf[x]).find(Boolean);
  if (!mod) { unassigned.push(names.join(',')); continue; }
  stmtModule.set(n, mod); names.forEach((x) => ownName.set(x, mod));
}
const provided = cfg.provided ?? {};    // name -> {from, name?}
const externals = cfg.externals ?? {};  // name -> {from, name?, ns?, default?}
const outputs = {};
for (const mod of new Set(stmtModule.values())) outputs[mod] = { stmts: [], imports: new Map(), refs: new Set() };
for (const n of ast.program.body) if (stmtModule.has(n)) outputs[stmtModule.get(n)].stmts.push(n);

// free references to program-level names
const programPath = [];
traverse(ast, { Program(p) { programPath.push(p); p.stop(); } });
const prog = programPath[0];
const usedBy = {};
traverse(ast, {
  Identifier(p) {
    if (!p.isReferencedIdentifier() && !(p.parentPath.isJSXOpeningElement() || p.parentPath.isJSXClosingElement())) return;
    const stmt = p.findParent((x) => x.parentPath && x.parentPath.isProgram());
    if (!stmt) return;
    const mod = stmtModule.get(stmt.node); if (!mod) return;
    const name = p.node.name;
    const b = p.scope.getBinding(name);
    if (b && !b.scope.path.isProgram()) return; // local binding
    (usedBy[mod] ??= new Set()).add(name);
  },
  JSXIdentifier(p) {
    const name = p.node.name; if (!/^[A-Z]/.test(name)) return;
    if (!(p.parentPath.isJSXOpeningElement() && p.key === 'name') && !(p.parentPath.isJSXMemberExpression() && p.key === 'object')) return;
    const stmt = p.findParent((x) => x.parentPath && x.parentPath.isProgram());
    const mod = stmt && stmtModule.get(stmt.node); if (!mod) return;
    const b = p.scope.getBinding(name); if (b && !b.scope.path.isProgram()) return;
    (usedBy[mod] ??= new Set()).add(name);
  },
});

const missing = new Set();
const rel = (from, to) => { let r = path.relative(path.dirname(from), to).replace(/\\/g, '/'); r = r.replace(/\.(tsx?|jsx?)$/, ''); return r.startsWith('.') ? r : './' + r; };
const outDir = cfg.outDir;
for (const [mod, o] of Object.entries(outputs)) {
  const imports = new Map(); // from -> {names:Set, ns, def}
  const add = (from, spec) => { const e = imports.get(from) ?? { names: new Map(), ns: null, def: null }; imports.set(from, e); if (spec.ns) e.ns = spec.name; else if (spec.default) e.def = spec.name; else e.names.set(spec.name, spec.local); };
  for (const name of usedBy[mod] ?? []) {
    if (ownName.get(name) === mod) continue;
    if (ownName.has(name)) { add(rel(mod, ownName.get(name)), { name, local: name }); continue; }
    const ext = externals[name] ?? provided[name];
    if (ext) { const from = ext.from.startsWith('@/') ? rel(mod, ext.from.slice(2)) : ext.from; add(from, { name: ext.name ?? name, local: name, ns: ext.ns, default: ext.default }); continue; }
    if (['React'].includes(name)) { add('react', { name: 'React', ns: true }); continue; }
    if (name in globalThis || ['window', 'document', 'navigator', 'Math', 'Object', 'Array', 'Set', 'Map', 'Symbol', 'JSON', 'Number', 'String', 'Error', 'undefined', 'performance', 'queueMicrotask', 'structuredClone', 'requestAnimationFrame', 'cancelAnimationFrame', 'fetch', 'atob', 'localStorage', 'Float32Array', 'Uint8Array', 'Promise', 'setTimeout', 'clearTimeout', 'globalThis', 'Boolean', 'Date', 'RegExp', 'isNaN', 'parseFloat', 'parseInt', 'Infinity', 'NaN', 'URL', 'Image', 'Float64Array', 'Uint16Array', 'Uint32Array', 'Int8Array', 'WeakMap', 'getComputedStyle', 'location', 'history', 'alert', 'confirm', 'Blob', 'FileReader', 'File', 'URLSearchParams', 'TextEncoder', 'AbortController', 'console', 'HTMLElement', 'Intl', 'encodeURIComponent', 'decodeURIComponent', 'crypto', 'Event', 'CustomEvent', 'sessionStorage', 'setInterval', 'clearInterval', 'matchMedia'].includes(name)) continue;
    missing.add(`${mod}: ${name}`);
  }
  let head = '// @ts-nocheck\n';
  for (const [from, e] of imports) {
    const parts = [];
    if (e.def) parts.push(e.def);
    if (e.ns) parts.push(`* as ${e.ns}`);
    const named = [...e.names].map(([n, l]) => (n === l ? n : `${n} as ${l}`));
    if (named.length) parts.push(`{ ${named.join(', ')} }`);
    // namespace imports can't be combined with named ones
    if (e.ns && named.length) head += `import * as ${e.ns} from '${from}';\nimport { ${named.join(', ')} } from '${from}';\n`;
    else head += `import ${parts.join(', ')} from '${from}';\n`;
  }
  let code = head + '\n';
  for (const s of o.stmts) {
    const node = t.isExpressionStatement(s) ? s : s;
    const decl = t.isVariableDeclaration(node) || t.isFunctionDeclaration(node) || t.isClassDeclaration(node) ? t.exportNamedDeclaration(node, []) : node;
    code += generate(decl, { jsescOption: { minimal: true } }).code + '\n\n';
  }
  const file = path.join(outDir, mod);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, await prettier.format(code, { parser: 'typescript', printWidth: 120, singleQuote: true, trailingComma: 'all' }));
  console.log('wrote', mod, code.split('\n').length);
}
if (unassigned.length) console.log('UNASSIGNED:', unassigned.join(' | '));
if (missing.size) console.log('MISSING:', [...missing].join('\n'));
