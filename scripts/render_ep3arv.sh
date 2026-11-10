#!/bin/bash
# Render Ep3ArvFull (episode "Bagaimana ARV menghentikan replikasi HIV?", 2D flat penuh, 1080x1920, 30 fps, 3339 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_ep3arv.sh   (dari root repo; public/vo.mp3 harus sudah ada; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/ep3arv.log
mkdir -p out/ep3arv
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" > $LOG
npx remotion bundle src/index.ts --out-dir=out/bundle >> $LOG 2>&1
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 2249" "2250 2699" "2700 3149" "3150 3338"; do
  set -- $rng
  f=out/ep3arv/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle Ep3ArvFull "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/ep3arv/list.txt
for j in 0 1 2 3 4 5 6 7; do echo "file 'c$j.mp4'" >> out/ep3arv/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/ep3arv/list.txt -c copy out/ep3arv/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/ep3arv/all.mp4 -i public/vo.mp3 -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/ep3arv/ARV-hentikan-replikasi-HIV.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
