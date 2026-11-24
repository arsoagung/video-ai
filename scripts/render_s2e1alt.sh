#!/bin/bash
# Render S2E1AltFull (episode "Kapan waktu terbaik untuk tes HIV?", 2D flat penuh, 1080x1920, 30 fps, 2302 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_s2e1.sh   (dari root repo; public/vo/S2E1.mp3 harus ada; suara disusun ulang ke out/S2E1/vo_synced.wav; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s2e1alt.log
: > $LOG
mkdir -p out/S2E1alt
BR=${BROWSER:+--browser-executable=$BROWSER}
node scripts/retime.mjs build S2E1 >> $LOG 2>&1 || { echo "retime build gagal"; exit 1; }
echo "start $(date)" >> $LOG
rm -rf out/bundlealt;  npx remotion bundle src/index.ts --out-dir=out/bundlealt >> $LOG 2>&1
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 2249" "2250 2301"; do
  set -- $rng
  f=out/S2E1alt/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundlealt S2E1AltFull "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S2E1alt/list.txt
for j in 0 1 2 3 4 5; do echo "file 'c$j.mp4'" >> out/S2E1alt/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S2E1alt/list.txt -c copy out/S2E1alt/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S2E1alt/all.mp4 -i out/S2E1/vo_synced.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S2E1_alt.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
