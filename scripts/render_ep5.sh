#!/bin/bash
# Render Ep5Full (2D flat penuh, 1080x1920, 30 fps) dalam potongan berurutan, bisa dilanjut, lalu gabung + audio.
# usage: render_ep5.sh   (jalankan dari root repo; public/vo.mp3 harus sudah ada; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/ep5.log
mkdir -p out/ep5
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" > $LOG
i=0
for rng in "0 416" "417 833" "834 1250" "1251 1667" "1668 2084" "2085 2501"; do
  set -- $rng
  f=out/ep5/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle Ep5Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/ep5/list.txt
for j in 0 1 2 3 4 5; do echo "file 'c$j.mp4'" >> out/ep5/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/ep5/list.txt -c copy out/ep5/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/ep5/all.mp4 -i public/vo.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/ep5/HIV-viral-load.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
