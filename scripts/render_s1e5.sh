#!/bin/bash
# Render S1E5Full (episode "Kenapa ARV harus diminum rutin?", 2D flat penuh, 1080x1920, 30 fps, 2540 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_s1e5.sh   (dari root repo; public/vo/S1E5.mp3 harus ada; suara disusun ulang ke out/S1E5/vo_synced.wav; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s1e5.log
: > $LOG
mkdir -p out/S1E5
node scripts/retime.mjs build S1E5 >> /tmp/s1e5.log 2>&1 || { echo "retime build gagal"; exit 1; }
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" >> $LOG
[ -d out/bundle ] || npx remotion bundle src/index.ts --out-dir=out/bundle >> $LOG 2>&1
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 2249" "2250 2539"; do
  set -- $rng
  f=out/S1E5/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle S1E5Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S1E5/list.txt
for j in 0 1 2 3 4 5; do echo "file 'c$j.mp4'" >> out/S1E5/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S1E5/list.txt -c copy out/S1E5/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S1E5/all.mp4 -i out/S1E5/vo_synced.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S1E5.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
