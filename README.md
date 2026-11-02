# video-ai

Template video edukasi HIV/ARV (9:16, hybrid 3D + flat), dibuat dengan Remotion.

Alur: baris GSheet "Antrean Konten AI (HIV)" -> mp3 dari Drive -> segmentasi jeda -> render lapisan 3D (Plate3D) + lapisan label (Overlay) -> komposit ffmpeg + loudnorm.

## Perintah
- `npm install`
- `npx remotion bundle src/index.ts --out-dir=out/bundle`
- Lapisan 3D: `npx remotion render out/bundle Plate3D out/plN.mp4 --frames=A-B --gl=swangle --muted`
- Lapisan label: `npx remotion render out/bundle Overlay out/overlay.webm --codec=vp8 --pixel-format=yuva420p --image-format=png`
- Gabung: lihat `scripts/hybrid.sh`

Catatan: `public/vo.mp3` (suara) tidak disimpan di repo; ambil dari Drive per baris.
