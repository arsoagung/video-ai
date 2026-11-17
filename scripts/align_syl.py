#!/usr/bin/env python3
# Penyelaras suara berbasis suku kata (pengganti/pelengkap `retime.mjs analyze`).
#   python3 scripts/align_syl.py <KODE> <narasi.txt>   -> src/<kode>/segments.json (format sama dengan retime analyze)
# Cara kerja: hitung puncak energi suku kata di mp3 dan jeda nyata (silencedetect), lalu DP monoton memilih jeda yang menjadi batas
# kalimat sehingga jumlah puncak per kalimat cocok dengan jumlah suku kata teks (bukan proporsi karakter). Klausa (koma/titik dua)
# ditempel ke jeda terdekat; kalau tidak ada jeda, ke kuantil puncak suku kata. Laju di luar 3,2 sampai 8,5 suku kata/dtk ditandai.
# Lanjutkan dengan: node scripts/retime.mjs build <KODE> (holds.json tetap dipakai).
import numpy as np, wave, re, json, subprocess, sys
from scipy.signal import butter, filtfilt, find_peaks
code=sys.argv[1]; txt=open(sys.argv[2]).read()
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'public/vo/{code}.mp3','-ac','1','-ar','16000',f'/tmp/{code}_align.wav'])
w=wave.open(f'/tmp/{code}_align.wav');x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float);sr=16000
b,a=butter(2,[300/(sr/2),3000/(sr/2)],'band');y=filtfilt(b,a,x)
fr=160;n=len(y)//fr
e=np.log10(np.convolve(np.sqrt((y[:n*fr].reshape(n,fr)**2).mean(1)),np.ones(5)/5,'same')+1)
pk,_=find_peaks(e,distance=7,prominence=0.12);t=pk*0.01
r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',f'public/vo/{code}.mp3','-af','silencedetect=noise=-32dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st=[float(m) for m in re.findall(r'silence_start: ([\d.]+)',r)];en=[float(m) for m in re.findall(r'silence_end: ([\d.]+)',r)]
P=[(s,e_) for s,e_ in zip(st,en)]
D=len(y)/sr
def syl(s):
    s=s.lower().replace('1.000','seribu').replace('u=u','yu sama dengan yu')
    s=re.sub(r'[^a-z ]','',s);n=0
    for wd in s.split(): n+=max(1,len(re.findall(r'ai|au|oi|[aiueo]',wd)))
    return n
sents=[]
txt=txt.replace('1.000','1\u2024000')
for para in txt.strip().split('\n'):
    sents+= [m.strip().replace('\u2024','.') for m in re.findall(r'[^.?!]+[.?!]["”]*',para)]
S=[syl(s) for s in sents];N=len(sents)
# candidate boundaries: pause midpoints; sentence 1 starts at first speech, last ends at last speech
sp0=P[0][1] if P and P[0][0]<0.05 else 0
spE=P[-1][0] if P and P[-1][1]>D-0.05 else D
Pm=[(s,e_) for s,e_ in P if s>sp0+0.3 and e_<spE-0.3]
cnt=lambda a,b:sum(1 for q in t if a<=q<b)
K=len(Pm);INF=1e18
dp=[[INF]*(K+1) for _ in range(N+1)];bk=[[None]*(K+1) for _ in range(N+1)]
# dp[i][k]: first i sentences placed, i-th ends at pause k (k index 0..K-1); i=N ends at K (end)
dp[0][K]=0 # dummy start
def cost(i,a,b,pa,pb):
    c=cnt(a,b);exp=S[i]*0.875
    dur=b-a
    return (c-exp)**2/max(4,exp)+((S[i]/max(dur,0.2)-5.6)/2.0)**2
for i in range(1,N+1):
    for k in range(K+1):
        if i==N and k!=K: continue
        if i<N and k==K: continue
        bestv,bestj=INF,None
        prevs=[K] if i==1 else range(0,K)
        for j in prevs:
            if dp[i-1][j]>=INF: continue
            if i>1 and j>=k: continue
            a0=sp0 if i==1 else Pm[j][1]
            b0=spE if i==N else Pm[k][0]
            if b0-a0<0.5: continue
            c=dp[i-1][j]+cost(i-1,a0,b0,0,0)
            if i<N:
                pd=Pm[k][1]-Pm[k][0]
                c+=-1.5*min(pd,0.6)
            if c<bestv:bestv,bestj=c,j
        dp[i][k]=bestv;bk[i][k]=bestj
k=K;res=[]
for i in range(N,0,-1):
    j=bk[i][k];res.append((i,k,j));k=j
res=res[::-1]
def clauses_of(text):
    t=text.replace('1.000','1\u2024000')
    parts=re.split(r'(?<=[,:;])\s+',t)
    return [p.replace('\u2024','.') for p in parts]
def r2(v): return round(v,2)
out=[];flags=[]
for i,k,j in res:
    a0=sp0 if i==1 else Pm[j][1];b0=spE if i==N else Pm[k][0]
    pa=0 if i==N else round(Pm[k][1]-Pm[k][0],2)
    cl=clauses_of(sents[i-1]);cs=[syl(c) for c in cl];tot=sum(cs)
    pks=[q for q in t if a0<=q<=b0]
    inner=[(s_,e_) for s_,e_ in P if a0+0.3<s_ and e_<b0-0.3]
    bounds=[(a0,False,a0)] # (start time of clause, anchored, prev end)
    cum=0;cb=[]
    for c in range(len(cl)-1):
        cum+=cs[c];f=cum/tot
        if pks:
            ix=min(len(pks)-1,max(0,int(round(f*len(pks)))-1));tt=pks[ix]+0.08
        else: tt=a0+(b0-a0)*f
        cand=[p for p in inner if abs((p[0]+p[1])/2-tt)<0.45]
        if cand:
            p=min(cand,key=lambda p:abs((p[0]+p[1])/2-tt));cb.append((p[0],p[1],True))
        else: cb.append((tt,tt,False))
    clauses=[];cur=a0
    for c,text in enumerate(cl):
        if c<len(cb): end,nxt,anc=cb[c]
        else: end,nxt,anc=b0,b0,True
        clauses.append({"text":text,"a":r2(cur),"b":r2(end),"anchored":bool(anc)});cur=nxt
    fl=[]
    rate=S[i-1]/max(b0-a0,0.1)
    if rate>8.5 or rate<3.2: fl.append(f"laju {rate:.1f} suku kata/dtk")
    out.append({"n":i,"text":sents[i-1],"a":r2(a0),"b":r2(b0),"pauseAfter":pa,"clauses":clauses,"flags":fl})
    print(f"{i:3d} {a0:6.2f}-{b0:6.2f} jeda {pa} suku {S[i-1]} puncak {cnt(a0,b0)} klausa {len(cl)} {sents[i-1][:40]} {'!! '+fl[0] if fl else ''}")
import os
os.makedirs(f'src/{code.lower()}',exist_ok=True)
json.dump({"code":code,"duration":round(D,2),"speech":[r2(sp0),r2(spE)],"noiseDb":-32,"minPause":0.12,"sentences":out},open(f'src/{code.lower()}/segments.json','w'),indent=1,ensure_ascii=False)
print('-> src/%s/segments.json'%code.lower())
