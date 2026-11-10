// Scene-spec episode ARV (disalin dari artifact storyboard baris sheet; waktu adegan diambil dari timeline.ts)
export type Obj = { c: string; cx: number; cy: number; s?: number; rot?: number; op?: number; props?: Record<string, any> };
export type SceneSpec = { n: number; bg: [string, string, string]; objects: Obj[] };
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
    "cy": 900,
    "s": 2.2
   },
   {
    "c": "Capsule",
    "cx": 280,
    "cy": 1250,
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
    "cy": 1300,
    "s": 0.8,
    "props": {
     "colorA": "#72E3D3",
     "colorB": "#EAF2FB"
    }
   },
   {
    "c": "Capsule",
    "cx": 800,
    "cy": 1250,
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
    "cy": 760,
    "s": 1.0,
    "props": {
     "wagons": 2
    }
   },
   {
    "c": "Station",
    "cx": 180,
    "cy": 1000,
    "s": 1,
    "props": {
     "label": "1",
     "state": "open"
    }
   },
   {
    "c": "Station",
    "cx": 400,
    "cy": 1000,
    "s": 1,
    "props": {
     "label": "2",
     "state": "open"
    }
   },
   {
    "c": "Station",
    "cx": 620,
    "cy": 1000,
    "s": 1,
    "props": {
     "label": "3",
     "state": "open"
    }
   },
   {
    "c": "Station",
    "cx": 840,
    "cy": 1000,
    "s": 1,
    "props": {
     "label": "4",
     "state": "open"
    }
   }
  ]
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
    "cy": 760,
    "props": {
     "r": 90
    }
   },
   {
    "c": "FlatVirus",
    "cx": 720,
    "cy": 800,
    "op": 0.5,
    "props": {
     "r": 90
    }
   },
   {
    "c": "Station",
    "cx": 540,
    "cy": 520,
    "s": 1,
    "props": {
     "label": "1",
     "state": "blocked"
    }
   }
  ]
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
    "cy": 720,
    "props": {
     "len": 560
    }
   },
   {
    "c": "Enzyme",
    "cx": 540,
    "cy": 1000,
    "s": 1.3,
    "props": {
     "kind": "rt"
    }
   },
   {
    "c": "DNAHelix",
    "cx": 540,
    "cy": 1300,
    "props": {
     "len": 560
    }
   },
   {
    "c": "Station",
    "cx": 540,
    "cy": 520,
    "s": 1,
    "props": {
     "label": "2",
     "state": "blocked"
    }
   }
  ]
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
    "cy": 820,
    "props": {
     "len": 560
    }
   },
   {
    "c": "Enzyme",
    "cx": 540,
    "cy": 1100,
    "s": 1.3,
    "props": {
     "kind": "integrase"
    }
   },
   {
    "c": "DNAHelix",
    "cx": 540,
    "cy": 1380,
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
    "s": 1,
    "props": {
     "label": "3",
     "state": "blocked"
    }
   }
  ]
 },
 {
  "n": 6,
  "bg": [
   "#0A1F3D",
   "#123A60",
   "#17506F"
  ],
  "objects": [
   {
    "c": "Enzyme",
    "cx": 540,
    "cy": 1000,
    "s": 1.4,
    "props": {
     "kind": "protease"
    }
   },
   {
    "c": "FlatVirus",
    "cx": 300,
    "cy": 1400,
    "op": 0.55,
    "props": {
     "r": 80
    }
   },
   {
    "c": "FlatVirus",
    "cx": 780,
    "cy": 1400,
    "op": 0.55,
    "props": {
     "r": 80
    }
   },
   {
    "c": "Station",
    "cx": 540,
    "cy": 560,
    "s": 1,
    "props": {
     "label": "4",
     "state": "blocked"
    }
   }
  ]
 },
 {
  "n": 7,
  "bg": [
   "#08283A",
   "#0F4A5C",
   "#167A80"
  ],
  "objects": [
   {
    "c": "Capsule",
    "cx": 300,
    "cy": 700,
    "props": {
     "colorA": "#72E3D3",
     "colorB": "#EAF2FB"
    }
   },
   {
    "c": "Capsule",
    "cx": 300,
    "cy": 900,
    "props": {
     "colorA": "#72E3D3",
     "colorB": "#EAF2FB"
    }
   },
   {
    "c": "Capsule",
    "cx": 300,
    "cy": 1100,
    "props": {
     "colorA": "#2FB9A6",
     "colorB": "#EAF2FB"
    }
   },
   {
    "c": "Station",
    "cx": 780,
    "cy": 800,
    "s": 1,
    "props": {
     "label": "2",
     "state": "blocked"
    }
   },
   {
    "c": "Station",
    "cx": 780,
    "cy": 1100,
    "s": 1,
    "props": {
     "label": "3",
     "state": "blocked"
    }
   },
   {
    "c": "Clock",
    "cx": 540,
    "cy": 1450,
    "s": 0.9,
    "props": {
     "frac": 1.0,
     "hour": 9
    }
   }
  ]
 },
 {
  "n": 8,
  "bg": [
   "#0D1B45",
   "#1E2F6B",
   "#2B4A85"
  ],
  "objects": [
   {
    "c": "LineChart",
    "cx": 540,
    "cy": 900,
    "s": 1.5,
    "props": {
     "points": [
      0.9,
      0.7,
      0.4,
      0.2,
      0.08,
      0.05,
      0.05
     ],
     "threshold": 0.1,
     "progress": 1
    }
   },
   {
    "c": "Calendar",
    "cx": 540,
    "cy": 1400,
    "s": 0.9,
    "props": {
     "marks": [
      1,
      2,
      3,
      4,
      5,
      6,
      7
     ],
     "markColor": "#72E3D3"
    }
   }
  ]
 }
] as SceneSpec[];
