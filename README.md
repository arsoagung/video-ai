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

---

## Gaya visual baku (berlaku untuk SEMUA episode baru)

Dipakai sebagai default. Referensi implementasi: `src/ep2/` (episode "Apa bedanya HIV dan AIDS?", composition `Ep2Full` = `Plate2` + `Overlay2` + audio). Judul baru cukup dibuatkan `timeline.ts`, `World*.tsx`, `Overlay*.tsx` baru dengan aturan ini, tanpa tanya ulang soal gaya.

**Format**: 9:16, 1080x1920, 30 fps, Remotion 4, font Plus Jakarta Sans (400/600/800; tidak ada 700).

**Latar**
- Hanya gradien vertikal 3 warna. TIDAK ada bokeh/partikel melayang (2D maupun 3D).
- Warna gradien bergeser halus (±1,4 dtk) tiap pergantian scene, lihat `GRADS` di `World2.tsx`: biru laut (pembuka/sel), indigo (grafik CD4), ungu kebiruan (dua jalur), teal (viral load vs CD4), biru laut (rantai), hijau teal (ARV), biru lembut (penutup). Palet tetap dingin dan tenang, jangan merah/gelap mengancam.
- Di atas gradien ada glow radial lembut di tengah.

**Tidak ada indikator tahap/step pill bernomor.** Alur dibuat mengalir. Hanya ada legenda kecil statis di atas (y=250): titik biru = CD4, titik koral = Virus HIV (`SHOW_LEGEND` di `Overlay2.tsx`, matikan dengan `false`). Muncul saat CD4 pertama disebut, hilang menjelang penutup.

**Label (pill)**
- Pill bulat terisi (tanpa garis tepi), bayangan lembut, teks tebal 800. Tidak harus tersambung garis ke objek.
- Palet `PK`: virus koral `#FF9C85`, sel/CD4 biru `#8FBDF7`, reseptor kuning `#F4D77E`, RT/ARV teal `#72E3D3`, buruk/AIDS merah `#FF6B5E`, netral `#EAF2FB`, abu `#B9C3D0`.
- Hemat: hanya istilah kunci. Kalimat yang sudah jelas di narasi/subtitle tidak diulang jadi label.

**Subtitle**
- Kecil, di y=1462, ukuran 42, tengah, bayangan teks; tidak menutupi animasi. Mengikuti kolom `narasi_final` di sheet.
- Kata kunci diberi warna aksen: CD4 biru `#8FBDF7`, HIV/virus/viral/load koral muda `#FFB7A5`, AIDS `#FF8A7A`, ARV teal `#72E3D3`, angka 200 kuning `#F4D77E` (tabel `ACC` di `Overlay2.tsx`).
- Subtitle disembunyikan saat teks penutup tampil.

**Kartu & grafik**: kartu berisi gradasi putih transparan + bayangan lembut, TANPA garis tepi. Grafik: sumbu `#E8F0FA`, CD4 biru `#8FBDF7`, viral load `#FF6B4D`, ambang 200 putus-putus kuning.

**Transisi**: tiap layer datar baru masuk dengan zoom-out halus (1,035 -> 1,0 dalam 1 dtk, fungsi `settle`); layer 3D hanya dipasang pada rentang 3D agar render hemat.

**Penutup**: teks muncul pelan berurutan (fade+naik ±1 dtk) sesuai narasi, gambar orang bergerak sangat halus. Kalimat terakhir selalu menampilkan referensi + logo, lihat bagian "Penutup: referensi jurnal + logo" di bawah.

**Pagar konten (wajib)**: tidak menampilkan nomor stadium (pakai "tahap lanjut"); ARV tidak digambarkan sebagai senjata; HIV tidak digambarkan hilang total (kurva viral load tetap di atas sumbu); tanpa citra pasien/rumah sakit.

**Render**: `scripts/render_ep2.sh` (potongan berurutan, bisa dilanjut, lalu gabung + loudnorm I=-14). Bagian 3D ±4,4 dtk/frame (software GL), bagian datar ±0,5-0,9 dtk/frame; total ±1 jam untuk 82 dtk. Suara `public/vo.mp3` tidak disimpan di repo; ambil dari link_dubbing di sheet.

---

## Desain tokoh baku: CD4, virus HIV, komandan (wajib dipakai ulang di SEMUA episode baru)

Arso suka desain CD4 dan virus HIV dari video "Kenapa HIV menyerang CD4?" dan ingin seri berikutnya tetap memakai bentuk yang sama. Kode acuannya ada di `src/shared/shapes.tsx` (`FlatVirus`, `FlatCell`, `Figure`, `Star`, palet `SHAPE_COL`). Import dari sana, jangan menggambar ulang atau membuat varian baru.

- **Virus HIV (`FlatVirus`)**: bola koral `#FF9C85`, 14 duri pendek radial (batang `#FF8E70`, bulatan pucat `#FFE3DA` di ujung), highlight putih tipis di kiri atas. Tanpa wajah. Boleh diberi `rot` dan `dim`, bentuknya tidak diubah.
- **Sel CD4 (`FlatCell`)**: bola biru muda `#8FBDF7`, inti biru tua `#5B97E0` sedikit bergeser ke kanan bawah, highlight yang sama. Reseptor CD4 = batang kuning `#F4D77E` dengan bulatan kuning pucat `#FFF3C4` di ujung, melingkar di permukaan (`rec` 0..1 mengatur panjangnya, 16 batang). Sel kekebalan lain memakai `FlatCell` yang sama dengan warna netral (abu `#B9C3D0`, sel B `#C9C3E6`) dan tanpa reseptor.
- **Komandan = CD4 dalam analogi tentara (`Figure` dengan `cmd`)**: figur datar bertubuh biru `#8FBDF7`, topi biru tua `#5B97E0`, bintang emas `#F4D77E` di dada. Prajurit = figur yang sama tanpa bintang, warna netral.

### Katalog library objek (`src/shared/library.tsx`)

Selain `shapes.tsx`, semua objek di bawah ini WAJIB diimpor dari `src/shared/library.tsx` (storyboard dan video). Jangan menggambar ulang; kalau butuh objek baru, tambahkan dulu ke library, lalu catat di sini. Semua komponen: `cx, cy` (posisi), `s` (skala, default 1), `rot` (derajat), `op` (opacity). Warna dari `LIB_COL` (+ `SHAPE_COL`). Flat, tanpa outline, tanpa wajah.

| Kelompok | Komponen (parameter khusus) |
|---|---|
| Biologi | `TCytoCell`, `BCell`, `Antibody(color)`, `RNAStrand(len)`, `DNAHelix(len)`, `Enzyme(kind: rt/integrase/protease)`, `Membrane(w, receptors:[{x, kind: cd4/ccr5/cxcr4}])` |
| Obat | `Capsule(colorA, colorB)`, `Tablet`, `Blister(taken)`, `PillBottle`, `Syringe(fill)` |
| Data | `LineChart(points, threshold, progress)`, `PercentBars(items:[{label,pct}])`, `Clock(frac, hour)`, `Calendar(marks)` |
| Tes | `BloodDrop`, `BloodTube(level)`, `TestKit(lines: 0/1/2)`, `CheckBadge`, `CrossBadge` |
| Analogi | `Train(wagons, wagonColor)`, `Station(label, state: open/blocked/virus)`, `Dam(level)`, `Battery(level)`, `City(lit)`, `Shield` |
| Manusia & tempat | `Person(color, kid)`, `Group(n)`, `Heart`, `Hug`, `MotherBaby`, `Home`, `Clinic`, `SpeechBubble(text, tail)`, `Lock(open)`, `Document(kind: paper/card, stamp)` |

### Scene-spec JSON (storyboard → video)

Storyboard bukan gambar mati: tiap scene disimpan sebagai data yang dipakai langsung untuk membangun video. Halaman artifact storyboard memuat satu blok `<script type="application/json" id="scene-spec">` dengan format:

```json
{ "episode": 3, "w": 1080, "h": 1920, "scenes": [
  { "n": 1, "start": 0.0, "end": 8.5, "bg": ["#0A1F3D", "#123A60", "#17506F"],
    "caption": "satu kalimat ringkas",
    "objects": [ { "c": "Train", "cx": 540, "cy": 900, "s": 1.2, "props": { "wagons": 2 } } ] }
] }
```

Aturan: `c` = nama komponen persis seperti di katalog (library.tsx atau shapes.tsx); `cx, cy, s, rot, op` = posisi dan skala; `props` = parameter khusus komponen. Hanya komponen dari katalog yang boleh dipakai; objek baru ditambahkan ke library dulu. `start/end` dalam detik (dari timeline narasi). Penutup (logo, referensi, dukung dan follow kami) bukan objek JSON; ditandai `{ "n": N, "closing": true }` dan dirender dari template baku.

Proses video: baca link di kolom `storyboard`, ambil JSON itu, petakan `c` ke komponen lewat registry (`import * as L from src/shared/library`), render tiap scene pada `start–end` dengan animasi masuk standar (fade/slide halus), pakai `narasi_final` + `link_dubbing` untuk audio dan subtitle. Bila JSON tidak ada, bilang ke Arso, jangan menebak adegan.

Tema latar video (semuanya gelap, bergradasi, berganti halus antar adegan): biru laut `#0A1F3D→#123A60→#17506F`, indigo/ungu `#14183F→#2A2A6B→#3B4A8A`, teal-hijau `#08283A→#0F4A5C→#167A80`, biru tua `#0D1B45→#1E2F6B→#2B4A85`.

- Catatan: `src/ep3/shapes.tsx` dan `src/ep5/shapes5.tsx` punya versi lama (bergradasi). Episode baru memakai `src/shared/shapes.tsx`; episode lama boleh diselaraskan kalau dirender ulang.

## Penutup: referensi jurnal + logo (wajib, berlaku untuk SEMUA episode baru)

**Sumber data per baris sheet "Antrean"**: kolom `narasi_final` (teks + subtitle, sinkron dengan audio), `referensi` (daftar referensi ilmiah), `link_dubbing` (suara). Kolom dicari berdasarkan NAMA header di baris 1, bukan huruf kolom, jadi aman kalau kolom bergeser. Kolom `narasi` (header panjang berisi pola Hook → ... → callback) sudah tidak dipakai; jangan dibaca. Kolom `crosscheck` dan `narasi_revisi` sudah dihapus; jangan dicari. Narasi dibaca langsung dari `narasi_final`, sudah final dari Arso, jangan diubah.

**Saat kalimat penutup terakhir** (kalimat paling akhir di `narasi_final`) mulai diucapkan, tampilkan tiga hal bersamaan, bertahan sampai video selesai:
1. **Referensi jurnal**: isi kolom `referensi` apa adanya (judul sesuai baris pertama kolom, saat ini "Referensi"; entri bernomor, DOI/URL sebagai teks kecil). Jangan dipotong, diringkas, atau diganti. Kalau kolom kosong, panel referensi tidak ditampilkan, logo tetap muncul.
2. **Logo Makna Positif**: pakai file asli `public/logo-makna-positif.png` (1254x1254, PNG putih berlatar transparan, area isi sekitar x105-1172, y328-929). Jangan digenerate ulang atau digambar ulang.
3. **Kotak "Dukung dan follow kami"**: di bawah kotak referensi, isi dan gaya baku di bagian "Kotak Dukung dan follow kami" di bawah.

**Aturan tampilan**
- Fade-in pelan seperti elemen penutup lain; subtitle disembunyikan (sudah aturan penutup di atas).
- **Susunan baku (seragam di semua episode), dari atas ke bawah: logo Makna Positif, kotak referensi, kotak Dukung dan follow kami.** Logo: file 560x560 px, tengah horizontal, sisi atas file di y=60 (area isi logo sekitar 476 px lebar, pusat sekitar y=340). Kotak referensi mulai y=500. Kotak Dukung dan follow kami tepat di bawah kotak referensi dengan jarak 50 px (tinggi kotak referensi bisa berubah sesuai panjang referensi, jadi posisinya mengikuti, bukan angka tetap). Jangan dibalik atau diubah urutannya. Latar penutup: gradien #0A2540 → #0F3B66 (55%) → #0B4F63 + glow radial lembut di atas.
- Panel referensi: kartu soft filled tanpa garis tepi, Plus Jakarta Sans, teks kecil tapi terbaca di layar HP (target tinggi huruf ≥ 24 px di 1080x1920). Logo dan panel di area terpisah, tidak bertumpuk dengan teks. Kalau daftar referensi panjang, kecilkan ukuran teks (tidak di bawah 24 px) atau naikkan sedikit posisi logo, tapi urutan tetap logo di atas, panel di bawah.
- Logo berwarna putih, jadi latar scene penutup harus cukup gelap agar kontras terjaga. Tetap gradien polos dingin seperti aturan latar, tinggal pilih nada yang lebih dalam di scene ini.
- Kalau kalimat penutup terlalu pendek untuk membaca referensi, tambahkan ekor diam beberapa detik di akhir video; suara tidak diubah.

### Kotak Dukung dan follow kami (wajib, di bawah kotak referensi)

Kartu seragam dengan kotak referensi: x=60, lebar 960, radius 40, isi gradien putih transparan (0.14 → 0.08), bayangan lembut, tanpa garis tepi, padding 34/46 px. Judul "Dukung dan follow kami" (800, 38 px, putih). Isi: daftar horizontal 4 baris (tinggi baris 82 px), tiap baris dari kiri ke kanan: **ikon** (kotak membulat 58 px, radius 16, warna khas platform), **nama platform** (600, 30 px, lebar kolom tetap 190 px), **handle/alamat** (800, 28 px, putih, rata kiri tepat setelah kolom nama), dan **tombol aksi** (pill 196x52 px, teks 800 25 px putih, tanpa garis tepi) rata kanan sehingga tepi kanan semua tombol lurus. Handle Instagram, YouTube, dan TikTok: `@maknapositif`. Saweria bukan sistem @, jadi ditulis `saweria.co/maknapositif`.

| Baris | Ikon | Tombol |
|---|---|---|
| Instagram | gradien khas (#FEDA75 → #FA7E1E → #D62976 → #962FBF → #4F5BD5), glyph kamera putih | "+ Follow", biru #2F80ED |
| YouTube | merah #FF0000, glyph play putih | "+ Subscribe", biru #2F80ED |
| TikTok | hitam #0B0B0F, nada musik putih dengan bayangan cyan #25F4EE dan pink #FE2C55 | "+ Follow", biru #2F80ED |
| Saweria | oranye #F97316, glyph hati putih | "Donate" dengan ikon hati, oranye #F97316 |

Aturan: Threads TIDAK ditampilkan. Ikon digambar sendiri sebagai glyph sederhana berwarna khas (bukan logo resmi platform). Urutan baris tetap: Instagram, YouTube, TikTok, Saweria. Tidak ada outline/border di elemen mana pun.

Animasi (mengikuti gaya fade-in penutup lain): logo fade-in, lalu kotak referensi, lalu kotak Dukung dan follow kami; baris-baris masuk bergantian dari bawah sambil fade (jeda ±0,15 dtk antar baris). Setelah semua baris tampil: tombol Follow dan Subscribe "ditekan" (mengecil sebentar lalu kembali), lalu teksnya berubah jadi **"Following"** dan **"Subscribed"** dalam warna teal #14B8A6 dengan centang (bukan "Mengikuti"/"Berlangganan"). Tombol Donate berdenyut pelan dan ikon hatinya berdetak, tanpa berubah teks.

**Implementasi 2D flat penuh (acuan episode baru)**: `src/ep3/` (composition `Ep3Full`; `timeline.ts` = segmen suara hasil deteksi jeda, `shapes.tsx` = bentuk flat sel/virus/DNA/kapsul, `Ep3.tsx` = adegan + subtitle + penutup referensi/logo). Render: `scripts/render_ep3.sh` (8 potongan, bisa dilanjut; set `BROWSER=` ke path Chromium bila perlu). Di mesin 2 CPU sekitar 6 menit per potongan, total ±50 menit untuk 3.591 frame. Durasi = suara + ekor diam 4 dtk.

---

## Thumbnail YouTube: template baku (9:16, 1080x1920, seukuran video)

Dipilih Arso (Nov 2026) dan berlaku untuk SEMUA episode. Kalau Arso bilang "buatkan thumbnail dengan judul ...", langsung bikin dengan template ini, tanpa tanya gaya lagi.

![Contoh: Apa bedanya HIV dan AIDS?](docs/thumbnail/apa-bedanya-hiv-dan-aids.png)

**Susunan (atas ke bawah, tetap)**
1. **Logo Makna Positif** di tengah atas (x=390, y=90, lebar 300), file asli `public/logo-makna-positif.png`, jangan digambar ulang.
2. **Teks = hanya judul episode**, persis seperti kolom `judul` di sheet. Tidak ada tagline, subjudul, atau kalimat tambahan karangan. Plus Jakarta Sans 800, ukuran 116, tengah, putih; kata kunci boleh diberi warna aksen seperti subtitle video (HIV koral muda `#FFB7A5`, AIDS `#FF8A7A`, CD4 biru `#8FBDF7`, ARV teal `#72E3D3`).
3. **Ilustrasi di bawahnya** sesuai isi judul, memakai tokoh baku dari `src/shared/shapes.tsx` (virus, sel CD4, komandan), bersih dan lega. Boleh ada pill label kunci (terisi, tanpa garis tepi) yang kata-katanya diambil dari judul. Tanpa teks lain.

**Latar berganti per episode**: gradien vertikal 3 warna, dipilih sesuai warna tema video episode itu (`THEMES` di `src/thumb/Thumb.tsx`: `biru`, `indigo`, `teal`, `biruLembut`; tambah tema baru kalau videonya memakai gradien lain). Tanpa bokeh, tanpa garis tepi, ada glow radial lembut.

**Cara membuat thumbnail episode baru**: di `src/thumb/Thumb.tsx` buat komponen baru yang membungkus `<ThumbFrame theme="..." title={...}>` dengan ilustrasi di dalamnya (contoh: `ThumbHivAids`), daftarkan di `src/Root.tsx` (`<Composition id="Thumb..." width={THUMB_W} height={THUMB_H} durationInFrames={1} />`), lalu render: `npx remotion still src/index.ts <IdKomposisi> docs/thumbnail/<judul-slug>.png`. Simpan hasil final per episode di `docs/thumbnail/` dan tambahkan ke daftar di bawah. Jangan menyimpan alternatif yang tidak terpilih.

**Daftar thumbnail jadi**
- "Apa bedanya HIV dan AIDS?": tema `indigo`, `docs/thumbnail/apa-bedanya-hiv-dan-aids.png` (komposisi `ThumbHivAids`).
- "Kenapa HIV menyerang CD4?": tema `biru`, `docs/thumbnail/kenapa-hiv-menyerang-cd4.png` (komposisi `ThumbCd4`).
- "Bagaimana HIV memperbanyak diri?": tema `ungu` (baru, gradien adegan dalam sel), `docs/thumbnail/bagaimana-hiv-memperbanyak-diri.png` (komposisi `ThumbReplikasi`). Judul dipecah 3 baris (Bagaimana HIV / memperbanyak / diri?) supaya ukuran 116 tetap terpakai.
- "Apa itu viral load? Bagaimana diukurnya?": tema `teal`, `docs/thumbnail/apa-itu-viral-load-bagaimana-diukurnya.png` (komposisi `ThumbViralLoad`).
