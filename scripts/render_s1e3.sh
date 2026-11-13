#!/bin/bash
# Render S1E3Full (episode "Bagaimana ARV menghentikan replikasi HIV?", 2D flat penuh, 1080x1920, 30 fps, 2772 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_s1e3.sh   (dari root repo; public/vo/S1E3.mp3 harus ada; suara disusun ulang oleh scripts/retime.mjs -> out/S1E3/vo_synced.wav; BROWSER=path chrome jika perlu)
# hasil akhir: out/S1E3.mp4
cd "$(dirname "$0")/.."
LOG=/tmp/s1e3.log
mkdir -p out/S1E3
BR=${BROWSER:+--browser-executable=$BROWSER}
echo "start $(date)" > $LOG
node scripts/retime.mjs build S1E3 >> $LOG 2>&1
npx remotion bundle src/index.ts --out-dir=out/bundle-s1e3 >> $LOG 2>&1
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 2249" "2250 2699" "2700 2771"; do
  set -- $rng
  f=out/S1E3/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle-s1e3 S1E3Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S1E3/list.txt
for j in 0 1 2 3 4 5 6; do echo "file 'c$j.mp4'" >> out/S1E3/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S1E3/list.txt -c copy out/S1E3/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S1E3/all.mp4 -i out/S1E3/vo_synced.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S1E3.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
