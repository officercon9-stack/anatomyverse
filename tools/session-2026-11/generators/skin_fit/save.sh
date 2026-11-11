#!/bin/bash
# usage: save.sh "status line"  -> copies scripts + preview pictures to the repo and pushes
cd /tmp/claude-0/-home-claude/f7d7ef6f-0b20-52fe-a210-678745f291ac/scratchpad
D=ghclone/tools/session-2026-11/generators/skin_fit
cp skinwork/*.py skinwork/*.js skinwork/*.sh $D/ 2>/dev/null
for f in skinwork/fit_m.png skinwork/fit_f.png skinwork/dbg_m.png skinwork/dbg_f.png; do [ -f $f ] && python3 -c "
from PIL import Image;import sys
im=Image.open('$f');im.thumbnail((1600,1600));im.save('$D/'+'$f'.split('/')[-1])"; done
echo "- $(date -u +%Y-%m-%dT%H:%MZ) $1" >> $D/PROGRESS.md
cd ghclone && git add -A tools/session-2026-11/generators/skin_fit && git commit -q -m "Skin fitting progress: $1

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WsoZ5LokSXdKW9LutWNZcj" && git push -q origin HEAD:main && git log --oneline -1
