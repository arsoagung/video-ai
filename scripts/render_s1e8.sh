#!/bin/bash
# Render S1E8Full (episode "Apa itu window period HIV?", 2D flat penuh, 1080x1920, 30 fps, 2475 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_s1e8.sh   (dari root repo; public/vo/S1E8.mp3 harus ada; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s1e8.log
mkdir -p out/S1E8
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" > $LOG
[ -d out/bundle ] || npx remotion bundle src/index.ts --out-dir=out/bundle >> $LOG 2>&1
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 2249" "2250 2474"; do
  set -- $rng
  f=out/S1E8/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle S1E8Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S1E8/list.txt
for j in 0 1 2 3 4 5; do echo "file 'c$j.mp4'" >> out/S1E8/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S1E8/list.txt -c copy out/S1E8/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S1E8/all.mp4 -i public/vo/S1E8.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S1E8.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
