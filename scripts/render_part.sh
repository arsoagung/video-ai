#!/bin/bash
# usage: render_part.sh N START END
cd /home/claude/hiv
npx remotion render out/bundle ARV3D out/p$1.mp4 --frames=$2-$3 --gl=swangle --concurrency=2 --crf=18 --muted --log=info > /tmp/render_p$1.log 2>&1
echo done >> /tmp/render_p$1.log
