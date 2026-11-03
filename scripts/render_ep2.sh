#!/bin/bash
# Render Ep2Full (Plate2 + Overlay2) dalam beberapa potongan lalu gabung + audio.
# usage: render_ep2.sh   (jalankan dari root repo; public/vo.mp3 harus sudah ada)
cd "$(dirname "$0")/.."
LOG=/tmp/ep2.log
mkdir -p out/ep2
echo "start $(date)" > $LOG
i=0
for rng in "0 249" "250 491" "492 1427" "1428 1583" "1584 1739" "1740 2459"; do
  set -- $rng
  f=out/ep2/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle Ep2Full "$f.tmp.mp4" --frames=$1-$2 --gl=swangle --concurrency=2 --crf=18 --muted --log=error >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/ep2/list.txt
for j in 0 1 2 3 4 5; do echo "file 'c$j.mp4'" >> out/ep2/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/ep2/list.txt -c copy out/ep2/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/ep2/all.mp4 -i public/vo.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 82 out/ep2/HIV-vs-AIDS.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
