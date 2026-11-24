#!/bin/bash
# Render S2E5AltFull (episode "Makan sepiring dengan ODHIV, tertular nggak ya?", 2D flat penuh, 1080x1920, 30 fps) dalam potongan berurutan, bisa dilanjut, lalu gabung + audio loudnorm.
# usage: bash scripts/render_s2e5alt.sh   (dari root repo; public/vo/S2E5.mp3 harus ada; suara disusun ulang ke out/S2E5/vo_synced.wav (sama dengan S2E5); BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s2e5alt.log
: > $LOG
mkdir -p out/S2E5alt
BR=${BROWSER:+--browser-executable=$BROWSER}
node scripts/retime.mjs build S2E5 >> $LOG 2>&1 || { echo "retime build gagal"; exit 1; }
echo "start $(date)" >> $LOG
[ -d out/bundlealt ] || npx remotion bundle src/index.ts --out-dir=out/bundlealt >> $LOG 2>&1
TOTAL=$(node -e "const s=require('fs').readFileSync('src/s2e5/sync.ts','utf8');const m=s.match(/SYNC_DUR\s*=\s*([0-9.]+)/);console.log(Math.ceil(parseFloat(m[1])*30))")
CH=450
i=0
LIST=out/S2E5alt/list.txt
rm -f $LIST
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $((TOTAL-1)) ] && b=$((TOTAL-1))
  f=out/S2E5alt/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundlealt S2E5AltFull "$f.tmp.mp4" --frames=$a-$b --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($a-$b) done $(date)" >> $LOG
  echo "file 'c$i.mp4'" >> $LIST
  i=$((i+1))
done
ffmpeg -y -loglevel error -f concat -safe 0 -i $LIST -c copy out/S2E5alt/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S2E5alt/all.mp4 -i out/S2E5/vo_synced.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S2E5alt.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
