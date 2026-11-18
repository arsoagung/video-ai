#!/usr/bin/env python3
"""Waktu per kata dari mp3, disejajarkan ke puncak energi suku kata (akustik) per klausa.
usage: python3 scripts/wordsync_acoustic.py S1E11   -> src/s1e11/words.ts (+ out/<KODE>/words_dbg.json)
Syarat: src/<kode>/sync.ts (retime build). Tidak memakai model transkripsi."""
import sys, json, re, subprocess, numpy as np
from scipy.signal import find_peaks, butter, sosfilt
from scipy.io import wavfile
CODE = sys.argv[1]; kode = CODE.lower()
src = open(f'src/{kode}/sync.ts').read()
segs = json.loads(src[src.index('= [') + 2: src.rindex(']') + 1])
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'public/vo/{CODE}.mp3','-ac','1','-ar','16000','/tmp/_vo.wav'],check=True)
sr, x = wavfile.read('/tmp/_vo.wav'); x = x.astype(np.float32) / 32768
x = sosfilt(butter(4, [250, 3500], 'bandpass', fs=sr, output='sos'), x)
hop = int(sr * 0.01); win = int(sr * 0.03)
n = (len(x) - win) // hop
env = np.array([np.sqrt(np.mean(x[i*hop:i*hop+win] ** 2) + 1e-10) for i in range(n)])
db = 20 * np.log10(env + 1e-6)
db = np.convolve(db, np.ones(5) / 5, mode='same')
floor = np.percentile(db, 10)
pk, pr = find_peaks(db, prominence=2.5, distance=6)
peaks = [(p * 0.01 + 0.015, db[p] - floor) for p in pk if db[p] - floor > 12]
# jeda nyata
r = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',f'public/vo/{CODE}.mp3','-af','silencedetect=noise=-32dB:d=0.09','-f','null','-'],capture_output=True,text=True)
pauses=[]; cur=None
for l in r.stderr.split('\n'):
    m=re.search(r'silence_start:\s*(-?[\d.]+)',l)
    if m: cur=max(0,float(m.group(1))); continue
    m=re.search(r'silence_end:\s*([\d.]+)',l)
    if m and cur is not None: pauses.append((cur,float(m.group(1)))); cur=None
SP={'cdc':3,'pep':3,'prep':2,'tbc':3,'arv':3,'hiv':3,'kemenkes':4,'2025':7,'72':5,'68':6,'13–64':11,'13-64':11,'aids':2,'cd4':4}
def syl(w):
    k=re.sub(r'[^a-z0-9–-]','',w.lower())
    if k in SP: return SP[k]
    return max(1,len(re.findall(r'[aeiou]+',k)))
out=[]; dbg=[]
for s in segs:
    for ci,c in enumerate(s['clauses']):
        ma=s['sa']+(c['a']-s['a']); mb=s['sa']+(c['b']-s['a'])
        inner=[(max(a,ma),min(b,mb)) for a,b in pauses if a>ma+0.02 and b<mb-0.02]
        act=[];p=ma
        for a,b in inner:
            if a>p: act.append((p,a))
            p=b
        if mb>p: act.append((p,mb))
        total=sum(b-a for a,b in act)
        ws=c['text'].split(' '); wt=[syl(w) for w in ws]; N=sum(wt)
        def pos(f):
            d=f*total
            for a,b in act:
                if d<=b-a: return a+d
                d-=b-a
            return mb
        nom=[pos((i+0.5)/N) for i in range(N)]
        P=[t for t,_ in peaks if ma-0.02<=t<=mb+0.02 and any(a<=t<=b for a,b in act)]
        J=len(P); INF=1e9
        dp=np.full((N+1,J+1),INF); bt={}
        dp[0,:]=0
        for j in range(1,J+1): dp[0,j]=0
        for i in range(1,N+1):
            for j in range(0,J+1):
                best=INF;arg=None
                if j>=1 and dp[i-1,j-1]<INF:
                    v=dp[i-1,j-1]+(nom[i-1]-P[j-1])**2
                    if v<best: best,arg=v,('m',i-1,j-1)
                if j>=1 and dp[i,j-1]<INF:
                    v=dp[i,j-1]+0.004
                    if v<best: best,arg=v,('s',i,j-1)
                if dp[i-1,j]<INF:
                    v=dp[i-1,j]+0.03
                    if v<best: best,arg=v,('v',i-1,j)
                dp[i,j]=best;bt[(i,j)]=arg
        i,j=N,J; st=[None]*N
        while i>0:
            kind,pi,pj=bt[(i,j)]
            if kind=='m': st[i-1]=P[j-1]
            elif kind=='v': st[i-1]=nom[i-1]
            i,j=pi,pj
        # kata
        k=0; sy=[]
        for w,t in zip(ws,wt):
            sy.append(st[k:k+t]); k+=t
        for wi,w in enumerate(ws):
            first=sy[wi][0]; last=sy[wi][-1]
            if wi==0: a=ma
            else:
                prev=sy[wi-1][-1]; mid=(prev+first)/2
                gp=[pp for pp in inner if prev-0.05<=pp[0]<=first+0.05]
                a=gp[0][1] if gp else mid - 0.0
            if wi==len(ws)-1: b=mb
            else:
                nxt=sy[wi+1][0]; mid=(last+nxt)/2
                gp=[pp for pp in inner if last-0.05<=pp[0]<=nxt+0.05]
                b=gp[0][0] if gp else mid
            if not (wi==0): pass
            out.append({'n':s['n'],'k':ci,'text':w,'a':round(a-s['sa']+s['a'],2),'b':round(b-s['sa']+s['a'],2)})
        dbg.append({'n':s['n'],'k':ci,'peaks':J,'syl':N})
open(f'src/{kode}/words.ts','w').write(f"// OTOMATIS dari scripts/wordsync_acoustic.py {CODE} (jangan diedit tangan). Waktu VIDEO per kata (suku kata disejajarkan ke puncak energi suara + jeda nyata).\nexport type Word = {{ n: number; k: number; text: string; a: number; b: number }};\nexport const WORDS: Word[] = {json.dumps(out,ensure_ascii=False)};\n")
for d in dbg: print(d['n'],d['k'],'suku',d['syl'],'puncak',d['peaks'])
