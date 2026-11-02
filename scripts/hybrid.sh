#!/bin/bash
cd /home/claude/hiv
LOG=/tmp/hybrid.log
echo "start $(date)" > $LOG
i=1
for rng in "0 239" "240 647" "648 995" "996 1451" "1452 1709" "1710 2399"; do
  set -- $rng
  npx remotion render out/bundle Plate3D out/pl$i.mp4 --frames=$1-$2 --gl=swangle --concurrency=2 --crf=16 --muted --log=error >> $LOG 2>&1
  echo "plate $i done $(date)" >> $LOG
  i=$((i+1))
done
npx remotion render out/bundle Overlay out/overlay.webm --codec=vp8 --pixel-format=yuva420p --image-format=png --concurrency=2 --log=error >> $LOG 2>&1
echo "overlay done $(date)" >> $LOG
printf "file 'pl1.mp4'\nfile 'pl2.mp4'\nfile 'pl3.mp4'\nfile 'pl4.mp4'\nfile 'pl5.mp4'\nfile 'pl6.mp4'\n" > out/plates.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i out/plates.txt -c copy out/plate-all.mp4 >> $LOG 2>&1
ffmpeg -y -loglevel error -i out/plate-all.mp4 -c:v libvpx -i out/overlay.webm -i public/vo.mp3 -filter_complex "[0:v][1:v]overlay=format=auto[o];[2:a]loudnorm=I=-14:TP=-1.5:LRA=7[a]" -map "[o]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -t 80 out/ARV-hybrid.mp4 >> $LOG 2>&1
echo "ALL DONE $(date)" >> $LOG
