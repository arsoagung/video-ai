#!/bin/bash
# Render S1E6Full (2D flat penuh, 1080x1920, 30 fps) dalam potongan berurutan, bisa dilanjut, lalu gabung + audio.
# usage: render_s1e6.sh   (jalankan dari root repo; public/vo.mp3 harus sudah ada; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s1e6.log
mkdir -p out/S1E6
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" > $LOG
i=0
for rng in "0 416" "417 833" "834 1250" "1251 1667" "1668 2084" "2085 2501"; do
  set -- $rng
  f=out/S1E6/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle S1E6Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S1E6/list.txt
for j in 0 1 2 3 4 5; do echo "file 'c$j.mp4'" >> out/S1E6/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S1E6/list.txt -c copy out/S1E6/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S1E6/all.mp4 -i public/vo.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S1E6.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
