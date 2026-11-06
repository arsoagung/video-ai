import React from 'react';

// Desain baku tokoh seri HIV (dari video "Kenapa HIV menyerang CD4?"). Dipakai ulang di SEMUA episode baru.
// Semua gambar datar (flat), tanpa wajah/ekspresi. Koordinat lokal: pusat di (0,0), ditempatkan lewat cx/cy.

export const SHAPE_COL = {
  cd4: '#8FBDF7', // badan sel CD4 / komandan
  cd4Dark: '#5B97E0', // inti sel & topi
  virion: '#FF9C85', // badan virus HIV
  spike: '#FF8E70', // batang duri virus
  spikeKnob: '#FFE3DA', // ujung duri virus
  receptor: '#F4D77E', // batang reseptor CD4 & bintang komandan
  receptorKnob: '#FFF3C4', // ujung reseptor CD4
};

export const Star: React.FC<{ cx: number; cy: number; r: number; fill: string }> = ({ cx, cy, r, fill }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} />;
};

// Figur manusia datar. cmd = komandan (CD4 dalam analogi tentara): badan biru, topi biru tua, bintang emas.
// Tanpa cmd = prajurit (figur sama tanpa bintang; beri warna lain/netral lewat c & cap).
export const Figure: React.FC<{ cx: number; cy: number; s: number; c: string; cap: string; cmd?: boolean; op?: number; rise?: number }> = ({ cx, cy, s, c, cap, cmd, op = 1, rise = 0 }) => (
  <g transform={`translate(${cx} ${cy + rise}) scale(${s})`} opacity={op}>
    <path d="M -135 170 Q -135 -20 0 -20 Q 135 -20 135 170 Z" fill={c} />
    <circle cx={0} cy={-120} r={66} fill={c} />
    <path d="M -66 -128 A 66 66 0 0 1 66 -128 Z" fill={cap} />
    <rect x={-80} y={-134} width={160} height={16} rx={8} fill={cap} />
    <circle cx={-22} cy={-130} r={22} fill="#FFFFFF" opacity={0.12} />
    {cmd && <Star cx={0} cy={52} r={34} fill={SHAPE_COL.receptor} />}
    {cmd && <rect x={-96} y={20} width={44} height={10} rx={5} fill={SHAPE_COL.receptor} opacity={0.8} />}
  </g>
);

// Virus HIV: bola koral + 14 duri pendek radial (batang + bulatan pucat di ujung) + highlight putih kiri atas.
export const FlatVirus: React.FC<{ cx: number; cy: number; r: number; color?: string; dim?: number; rot?: number }> = ({ cx, cy, r, color = SHAPE_COL.virion, dim = 1, rot = 0 }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={dim}>
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.2;
      return (
        <g key={i}>
          <line x1={Math.cos(a) * r * 0.95} y1={Math.sin(a) * r * 0.95} x2={Math.cos(a) * r * 1.34} y2={Math.sin(a) * r * 1.34} stroke={SHAPE_COL.spike} strokeWidth={r * 0.1} strokeLinecap="round" />
          <circle cx={Math.cos(a) * r * 1.42} cy={Math.sin(a) * r * 1.42} r={r * 0.12} fill={SHAPE_COL.spikeKnob} />
        </g>
      );
    })}
    <circle r={r} fill={color} />
    <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.35} fill="#FFFFFF" opacity={0.18} />
  </g>
);

// Sel datar. Sel CD4: color = SHAPE_COL.cd4, nuc = SHAPE_COL.cd4Dark, rec 0..1 = panjang batang reseptor CD4 kuning di permukaan.
// Sel lain (netral/B cell/dll): ganti color & nuc, rec tetap 0.
export const FlatCell: React.FC<{ cx: number; cy: number; r: number; color: string; nuc: string; op?: number; rec?: number; recN?: number }> = ({ cx, cy, r, color, nuc, op = 1, rec = 0, recN = 16 }) => (
  <g transform={`translate(${cx} ${cy})`} opacity={op}>
    {rec > 0.01 &&
      Array.from({ length: recN }, (_, i) => {
        const a = (i / recN) * Math.PI * 2 + 0.1;
        const l1 = r * 0.96;
        const l2 = r * (0.96 + 0.2 * rec);
        return (
          <g key={i}>
            <line x1={Math.cos(a) * l1} y1={Math.sin(a) * l1} x2={Math.cos(a) * l2} y2={Math.sin(a) * l2} stroke={SHAPE_COL.receptor} strokeWidth={Math.max(3, r * 0.05)} strokeLinecap="round" />
            <circle cx={Math.cos(a) * (l2 + r * 0.02)} cy={Math.sin(a) * (l2 + r * 0.02)} r={Math.max(4, r * 0.065) * rec} fill={SHAPE_COL.receptorKnob} />
          </g>
        );
      })}
    <circle r={r} fill={color} />
    <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.36} fill="#FFFFFF" opacity={0.16} />
    <circle cx={r * 0.14} cy={r * 0.12} r={r * 0.42} fill={nuc} opacity={0.85} />
  </g>
);
