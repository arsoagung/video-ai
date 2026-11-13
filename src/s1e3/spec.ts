// Scene-spec episode S1E3 (disalin dari sel `storyboard` baris sheet; waktu adegan diambil dari timeline.ts)
export type Obj = { c: string; cx: number; cy: number; s?: number; rot?: number; op?: number; props?: Record<string, any> };
export type LegendItem = { color: string; label: string };
export type SceneSpec = { n: number; bg: [string, string, string]; objects: Obj[]; legend?: LegendItem[]; legend_mode?: 'intro' | 'hold' };
export const SCENES: SceneSpec[] = [
 {
  "n": 1,
  "bg": [
   "#0A1F3D",
   "#123A60",
   "#17506F"
  ],
  "objects": [
   {
    "c": "Tablet",
    "cx": 540,
    "cy": 800,
    "s": 2.2
   },
   {
    "c": "Capsule",
    "cx": 300,
    "cy": 1180,
    "s": 0.8,
    "rot": -15,
    "props": {
     "colorA": "#72E3D3",
     "colorB": "#EAF2FB"
    }
   },
   {
    "c": "Capsule",
    "cx": 540,
    "cy": 1230,
    "s": 0.8,
    "props": {
     "colorA": "#72E3D3",
     "colorB": "#EAF2FB"
    }
   },
   {
    "c": "Capsule",
    "cx": 780,
    "cy": 1180,
    "s": 0.8,
    "rot": 15,
    "props": {
     "colorA": "#72E3D3",
     "colorB": "#EAF2FB"
    }
   }
  ]
 },
 {
  "n": 2,
  "bg": [
   "#14183F",
   "#2A2A6B",
   "#3B4A8A"
  ],
  "objects": [
   {
    "c": "Train",
    "cx": 540,
    "cy": 640,
    "s": 1.0,
    "props": {
     "wagons": 2
    }
   },
   {
    "c": "Station",
    "cx": 180,
    "cy": 1000,
    "props": {
     "label": "1"
    }
   },
   {
    "c": "Station",
    "cx": 400,
    "cy": 1000,
    "props": {
     "label": "2"
    }
   },
   {
    "c": "Station",
    "cx": 620,
    "cy": 1000,
    "props": {
     "label": "3"
    }
   },
   {
    "c": "Station",
    "cx": 840,
    "cy": 1000,
    "props": {
     "label": "4"
    }
   }
  ],
  "legend": [
   {
    "color": "#EAF2FB",
    "label": "Stasiun = tahap replikasi HIV"
   },
   {
    "color": "#FF9C85",
    "label": "Kereta = virus"
   }
  ],
  "legend_mode": "intro"
 },
 {
  "n": 3,
  "bg": [
   "#0A1F3D",
   "#123A60",
   "#17506F"
  ],
  "objects": [
   {
    "c": "Membrane",
    "cx": 540,
    "cy": 1150,
    "props": {
     "w": 900,
     "receptors": [
      {
       "x": -250,
       "kind": "cd4"
      },
      {
       "x": 0,
       "kind": "cd4"
      },
      {
       "x": 250,
       "kind": "cd4"
      }
     ]
    }
   },
   {
    "c": "FlatVirus",
    "cx": 380,
    "cy": 780,
    "props": {
     "r": 90
    }
   },
   {
    "c": "FlatVirus",
    "cx": 720,
    "cy": 820,
    "op": 0.5,
    "props": {
     "r": 90
    }
   },
   {
    "c": "Station",
    "cx": 540,
    "cy": 520,
    "props": {
     "label": "1",
     "state": "blocked"
    }
   }
  ],
  "legend": [
   {
    "color": "#FF9C85",
    "label": "HIV"
   },
   {
    "color": "#F4D77E",
    "label": "Reseptor CD4"
   },
   {
    "color": "#72E3D3",
    "label": "Tahap diblokir obat"
   }
  ],
  "legend_mode": "intro"
 },
 {
  "n": 4,
  "bg": [
   "#08283A",
   "#0F4A5C",
   "#167A80"
  ],
  "objects": [
   {
    "c": "RNAStrand",
    "cx": 540,
    "cy": 700,
    "props": {
     "len": 560
    }
   },
   {
    "c": "Enzyme",
    "cx": 540,
    "cy": 980,
    "s": 1.3,
    "props": {
     "kind": "rt"
    }
   },
   {
    "c": "DNAHelix",
    "cx": 540,
    "cy": 1280,
    "props": {
     "len": 560
    }
   },
   {
    "c": "Station",
    "cx": 540,
    "cy": 520,
    "props": {
     "label": "2",
     "state": "blocked"
    }
   }
  ],
  "legend": [
   {
    "color": "#FF8E70",
    "label": "RNA virus"
   },
   {
    "color": "#F4A6C8",
    "label": "Enzim RT"
   },
   {
    "color": "#F4D77E",
    "label": "DNA virus"
   }
  ],
  "legend_mode": "intro"
 },
 {
  "n": 5,
  "bg": [
   "#0D1B45",
   "#1E2F6B",
   "#2B4A85"
  ],
  "objects": [
   {
    "c": "DNAHelix",
    "cx": 540,
    "cy": 780,
    "props": {
     "len": 560
    }
   },
   {
    "c": "Enzyme",
    "cx": 540,
    "cy": 1060,
    "s": 1.3,
    "props": {
     "kind": "integrase"
    }
   },
   {
    "c": "DNAHelix",
    "cx": 540,
    "cy": 1340,
    "props": {
     "len": 560,
     "colorA": "#8FBDF7",
     "colorB": "#5B97E0"
    }
   },
   {
    "c": "Station",
    "cx": 540,
    "cy": 520,
    "props": {
     "label": "3",
     "state": "blocked"
    }
   }
  ],
  "legend": [
   {
    "color": "#F4D77E",
    "label": "DNA virus"
   },
   {
    "color": "#8FBDF7",
    "label": "DNA sel"
   },
   {
    "color": "#FFC38A",
    "label": "Enzim integrase"
   }
  ],
  "legend_mode": "intro"
 },
 {
  "n": 6,
  "bg": [
   "#08283A",
   "#0F4A5C",
   "#167A80"
  ],
  "objects": [
   {
    "c": "Tablet",
    "cx": 540,
    "cy": 760,
    "s": 1.6
   },
   {
    "c": "Station",
    "cx": 300,
    "cy": 1100,
    "props": {
     "label": "2",
     "state": "blocked"
    }
   },
   {
    "c": "Station",
    "cx": 780,
    "cy": 1100,
    "props": {
     "label": "3",
     "state": "blocked"
    }
   },
   {
    "c": "Shield",
    "cx": 540,
    "cy": 1200,
    "s": 1.0
   }
  ]
 },
 {
  "n": 7,
  "bg": [
   "#14183F",
   "#2A2A6B",
   "#3B4A8A"
  ],
  "objects": [
   {
    "c": "LineChart",
    "cx": 540,
    "cy": 900,
    "s": 1.1,
    "props": {
     "points": [
      1,
      0.8,
      0.5,
      0.3,
      0.18,
      0.12
     ],
     "threshold": 0.1,
     "progress": 1,
     "color": "#72E3D3"
    }
   }
  ],
  "legend": [
   {
    "color": "#72E3D3",
    "label": "Jumlah virus"
   },
   {
    "color": "#FF6B4D",
    "label": "Batas terdeteksi"
   }
  ],
  "legend_mode": "hold"
 },
 {
  "n": 8,
  "bg": [
   "#0A1F3D",
   "#123A60",
   "#17506F"
  ],
  "objects": [
   {
    "c": "Blister",
    "cx": 540,
    "cy": 800,
    "s": 1.4,
    "props": {
     "taken": 3
    }
   },
   {
    "c": "Clock",
    "cx": 540,
    "cy": 1150,
    "s": 1.0,
    "props": {
     "frac": 0.5,
     "hour": 3
    }
   }
  ]
 }
];
