#!/bin/bash
# Render S2E3Full (episode "Baru didiagnosis HIV? Merasa kaget itu wajar.", 2D flat penuh, 1080x1920, 30 fps, 1886 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_s2e3.sh   (dari root repo; public/vo/S2E3.mp3 harus ada; suara disusun ulang ke out/S2E3/vo_synced.wav; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s2e3.log
: > $LOG
mkdir -p out/S2E3
BR=${BROWSER:+--browser-executable=$BROWSER}
node scripts/retime.mjs build S2E3 >> $LOG 2>&1 || { echo "retime build gagal"; exit 1; }
echo "start $(date)" >> $LOG
[ -d out/bundle ] || npx remotion bundle src/index.ts --out-dir=out/bundle >> $LOG 2>&1
i=0
for rng in "0 449" "450 899" "900 1349" "1350 1799" "1800 1885"; do
  set -- $rng
  f=out/S2E3/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle S2E3Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S2E3/list.txt
for j in 0 1 2 3 4; do echo "file 'c$j.mp4'" >> out/S2E3/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S2E3/list.txt -c copy out/S2E3/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S2E3/all.mp4 -i out/S2E3/vo_synced.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S2E3.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
