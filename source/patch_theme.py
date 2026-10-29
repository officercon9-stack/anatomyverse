#!/usr/bin/env python3
"""Rebrand to '3D Anatomy' and apply the anatomical-atlas theme (ink and bone palette, serif display type, heart logo)."""
import sys, glob, os, re, shutil
ROOT = sys.argv[1]
A = ROOT + '/assets'
# ---------- CSS tokens + extras ----------
cssf = glob.glob(A + '/index-*.css')[0]
c = open(cssf).read()
i = c.index(':root,:root[data-theme=dark]{'); j = c.index('html,body,#root{height:100%}')
tokens = (":root,:root[data-theme=dark]{--av-bg:#0e0a09;--av-bg-elevated:#140e0d;--av-surface:#1b1311;--av-surface-2:#261a17;--av-viewport:#110c0b;"
 "--av-border:#38271f;--av-border-strong:#573b30;--av-text:#f3eadb;--av-text-muted:#c9baa6;--av-text-faint:#93816f;--av-teal:#ec6a55;--av-cyan:#7fb0e0;"
 "--av-accent:#c9372b;--av-accent-ink:#fff;--av-amber:#e6b84a;--av-ok:#86c595;--av-warn:#e6b84a;--av-danger:#ff8070;--av-focus:#f3b3a5;"
 "--av-shadow:0 1px 0 #ffffff08 inset, 0 10px 30px -12px #000a;--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}"
 ":root[data-theme=light]{--av-bg:#f1e9d8;--av-bg-elevated:#faf4e6;--av-surface:#fffaf0;--av-surface-2:#efe4ce;--av-viewport:#110c0b;"
 "--av-border:#dccdb2;--av-border-strong:#bfa98a;--av-text:#2b1b14;--av-text-muted:#5e4a3e;--av-text-faint:#7d6858;--av-teal:#a3281f;--av-cyan:#2f6aa3;"
 "--av-accent:#a3281f;--av-accent-ink:#fff;--av-amber:#8a5a0b;--av-ok:#2f6f43;--av-warn:#8a5a0b;--av-danger:#a32020;--av-focus:#a3281f;"
 "--av-shadow:0 8px 24px -14px #3b1d1459;--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}")
c = c[:i] + tokens + c[j:]
if '/*av-atlas*/' not in c:
    c += """/*av-atlas*/
:root{--font-display:'Cormorant Garamond',Georgia,'Times New Roman',serif}
h1,h2,h3,.av-display{font-family:var(--font-display);font-weight:600;letter-spacing:0;font-size-adjust:.5}
h1{font-weight:600}
.av-panel{border-color:var(--av-border)}
header.av-panel,aside.av-panel{box-shadow:inset 0 -1px 0 var(--av-border-strong)}
.av-btn--primary{box-shadow:0 0 0 1px #00000040 inset}
body{background-image:radial-gradient(1200px 600px at 85% -10%,#c9372b14,transparent 60%)}
:root[data-theme=light] body{background-image:radial-gradient(1200px 600px at 85% -10%,#a3281f12,transparent 60%)}
"""
open(cssf, 'w').write(c)
# ---------- fonts ----------
FS = 'fontsrc/node_modules/@fontsource/cormorant-garamond/files/'
fcss = open(ROOT + '/fonts/fonts.css').read()
if 'Cormorant' not in fcss:
    add = []
    for w in (500, 600, 700):
        for sub, rng in (('latin', "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"),
                         ('latin-ext', "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF")):
            fn = 'cormorant-garamond-%s-%d-normal.woff2' % (sub, w)
            shutil.copy(FS + fn, ROOT + '/fonts/' + fn)
            add.append("@font-face{font-family:'Cormorant Garamond';font-style:normal;font-display:swap;font-weight:%d;src:url(./%s) format('woff2');unicode-range:%s}" % (w, fn, rng))
    open(ROOT + '/fonts/fonts.css', 'w').write(fcss + "\n".join(add) + "\n")
    shutil.copy('fontsrc/node_modules/@fontsource/cormorant-garamond/LICENSE', ROOT + '/fonts/LICENSE-CormorantGaramond-OFL.txt')
# ---------- logo mark ----------
HEART = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#140e0d"/>'
 '<path d="M32 55C18 45 11 35 13 25C15 16 24 13 29 19C31 21 32 23 32 23C32 23 34 20 38 18C44 15 52 19 52 28C52 39 45 48 32 55Z" fill="#c9372b"/>'
 '<path d="M32 23C32 33 30 44 32 55" stroke="#8f2219" stroke-width="1.6" fill="none"/>'
 '<path d="M34 21C34 11 42 8 48 11" stroke="#ec6a55" stroke-width="3.2" stroke-linecap="round" fill="none"/>'
 '<path d="M29 20C27 12 21 10 16 13" stroke="#7fb0e0" stroke-width="3.2" stroke-linecap="round" fill="none"/>'
 '<path d="M38 22L38 10" stroke="#7fb0e0" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>')
open(ROOT + '/icons/logo.svg', 'w').write(HEART)
chunk = glob.glob(A + '/index-*.js')[0]
s = open(chunk).read()
old_i = s.index('(0,U.jsxs)(`svg`,{width:`26`,height:`26`,viewBox:`0 0 64 64`')
old_j = s.index('(0,U.jsxs)(`span`,{children:[`AnatomyVerse`')
old_k = s.index('})]})]})}var Gi=', old_j)
new_svg = ('(0,U.jsxs)(`svg`,{width:`28`,height:`28`,viewBox:`0 0 64 64`,"aria-hidden":!0,children:[(0,U.jsx)(`rect`,{width:`64`,height:`64`,rx:`14`,fill:`#140e0d`}),'
 '(0,U.jsx)(`path`,{d:`M32 55C18 45 11 35 13 25C15 16 24 13 29 19C31 21 32 23 32 23C32 23 34 20 38 18C44 15 52 19 52 28C52 39 45 48 32 55Z`,fill:`#c9372b`}),'
 '(0,U.jsx)(`path`,{d:`M32 23C32 33 30 44 32 55`,stroke:`#8f2219`,strokeWidth:`1.6`,fill:`none`}),'
 '(0,U.jsx)(`path`,{d:`M34 21C34 11 42 8 48 11`,stroke:`#ec6a55`,strokeWidth:`3.2`,strokeLinecap:`round`,fill:`none`}),'
 '(0,U.jsx)(`path`,{d:`M29 20C27 12 21 10 16 13`,stroke:`#7fb0e0`,strokeWidth:`3.2`,strokeLinecap:`round`,fill:`none`}),'
 '(0,U.jsx)(`path`,{d:`M38 22L38 10`,stroke:`#7fb0e0`,strokeWidth:`2.6`,strokeLinecap:`round`,fill:`none`})]}),')
new_txt = '(0,U.jsxs)(`span`,{className:`av-display text-[1.35rem] leading-none`,style:{whiteSpace:`nowrap`},children:[(0,U.jsx)(`span`,{className:`mr-1 text-[var(--av-teal)]`,children:`3D`}),` Anatomy`]})'
s = s[:old_i] + new_svg + new_txt + s[old_k + 5:]
open(chunk, 'w').write(s)
# ---------- rename ----------
def rename(t):
    t = t.replace('AnatomyVerse 3D', '3D Anatomy')
    t = re.sub(r'(?<![\w.-])AnatomyVerse(?![\w.-])', '3D Anatomy', t)
    return t
for f in glob.glob(A + '/*.js') + [ROOT + '/index.html', ROOT + '/manifest.webmanifest', ROOT + '/first-run.js']:
    t = open(f).read(); n = rename(t)
    if n != t: open(f, 'w').write(n)
h = open(ROOT + '/index.html').read()
h = h.replace('content="#0b1324"', 'content="#140e0d"')
open(ROOT + '/index.html', 'w').write(h)
m = open(ROOT + '/manifest.webmanifest').read().replace('"short_name": "3D Anatomy"', '"short_name": "3D Anatomy"').replace('#0b1324', '#140e0d')
open(ROOT + '/manifest.webmanifest', 'w').write(m)
fr = open(ROOT + '/first-run.js').read()
for a, b in (('#101a30', '#1b1311'), ('#22d3ee', '#c9372b'), ('#04202a', '#fff'), ('#e6edf7', '#f3eadb'), ('#b9c6da', '#c9baa6'), ('#7dd3fc', '#f3b3a5')):
    fr = fr.replace(a, b)
open(ROOT + '/first-run.js', 'w').write(fr)
print('theme patched')
# trailing-period names
for f in glob.glob(A + '/*.js'):
    t = open(f).read(); n = re.sub(r'AnatomyVerse(?=\.(?:\s|[`"\'<]|$))', '3D Anatomy', t)
    if n != t: open(f, 'w').write(n)
