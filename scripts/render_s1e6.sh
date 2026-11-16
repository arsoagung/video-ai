#!/bin/bash
# Render S1E6Full (episode "Bagaimana HIV memperbanyak diri?", 2D flat penuh, 1080x1920, 30 fps, 2928 frame)
# dalam potongan berurutan, bisa dilanjut (potongan yang sudah ada dilewati), lalu gabung + audio loudnorm.
# usage: bash scripts/render_s1e6.sh   (dari root repo; public/vo/S1E6.mp3 harus ada; suara disusun ulang ke out/S1E6/vo_synced.wav; BROWSER=path chrome jika perlu)
cd "$(dirname "$0")/.."
LOG=/tmp/s1e6.log
: > $LOG
mkdir -p out/S1E6
BR=${BROWSER:+--browser-executable=$BROWSER}
node scripts/retime.mjs build S1E6 >> $LOG 2>&1 || { echo "retime build gagal"; exit 1; }
echo "start $(date)" >> $LOG
[ -d out/bundle ] || npx remotion bundle src/index.ts --out-dir=out/bundle >> $LOG 2>&1
i=0
for rng in "0 462" "463 925" "926 1388" "1389 1851" "1852 2314" "2315 2777" "2778 2927"; do
  set -- $rng
  f=out/S1E6/c$i.mp4
  if [ ! -s "$f" ]; then
    npx remotion render out/bundle S1E6Full "$f.tmp.mp4" --frames=$1-$2 --concurrency=2 --crf=18 --muted --log=error $BR >> $LOG 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "chunk $i ($1-$2) done $(date)" >> $LOG
  i=$((i+1))
done
rm -f out/S1E6/list.txt
for j in 0 1 2 3 4 5 6; do echo "file 'c$j.mp4'" >> out/S1E6/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/S1E6/list.txt -c copy out/S1E6/all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/S1E6/all.mp4 -i out/S1E6/vo_synced.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,apad[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/S1E6.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
