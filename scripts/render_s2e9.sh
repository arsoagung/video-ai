#!/bin/bash
# Render S2E9Full (2D flat penuh, 1080x1920, 30 fps) dalam potongan berurutan, bisa dilanjut, lalu gabung + audio.
# usage: render_s2e9.sh   (jalankan dari root repo; public/vo.mp3 harus sudah ada; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s2e9.log
mkdir -p out/S2E9
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" > $LOG
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 2249" "2250 2699" "2700 3149" "3150 3590"; do
  set -- $rng
  f=out/S2E9/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle S2E9Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S2E9/list.txt
for j in 0 1 2 3 4 5 6 7; do echo "file 'c$j.mp4'" >> out/S2E9/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S2E9/list.txt -c copy out/S2E9/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S2E9/all.mp4 -i public/vo.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S2E9.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
