// S.T.A.R.L.I.G.H.T. — Full Build
let currentAI="MIA";
const orb=document.getElementById("orb");
const aiLabel=document.getElementById("aiLabel");
const secondsInput=document.getElementById("seconds");
const countdownEl=document.getElementById("countdown");
const stopBtn=document.getElementById("stopBtn");
const boot=document.getElementById("boot");
let timerId=null;

// Voice selection
let VOICES=[];
speechSynthesis.onvoiceschanged=()=>VOICES=speechSynthesis.getVoices();
VOICES=speechSynthesis.getVoices();
const MIA_PREFERRED=[
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Google UK English Female","Google US English",
  "Samantha","Victoria","Karen"
];
const BRIAN_PREFERRED=[
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Christopher Online (Natural) - English (United States)",
  "Google UK English Male","Daniel","Tom"
];
function pick(list){ if(!VOICES.length) return null;
  for(const name of list){ const v=VOICES.find(v=>v.name===name)||VOICES.find(v=>v.name.includes(name)); if(v) return v; }
  const femaleGuess=VOICES.find(v=>/female|aria|jenny|samantha|victoria|karen/i.test(v.name));
  return femaleGuess||VOICES[0];
}
function speak(ai,text){
  const u=new SpeechSynthesisUtterance(text);
  if(ai==="MIA"){ u.voice=pick(MIA_PREFERRED); u.pitch=1.18; u.rate=0.97; }
  else { u.voice=pick(BRIAN_PREFERRED); u.pitch=0.95; u.rate=1.05; }
  startTalk(); u.onend=stopTalk; speechSynthesis.speak(u);
}

// Assistant switching & bios
document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); currentAI=b.dataset.ai;
  aiLabel.textContent="Selected: "+currentAI;
  orb.classList.toggle("mia",currentAI==="MIA"); orb.classList.toggle("brian",currentAI==="BRIAN");
  document.getElementById("bioMIA").classList.toggle("show",currentAI==="MIA");
  document.getElementById("bioBRIAN").classList.toggle("show",currentAI==="BRIAN");
  speak(currentAI,"Steele Tech presents S.T.A.R.L.I.G.H.T. Systems online. Ready to assist with focus and harmony.");
});

// Presets
document.querySelectorAll(".pill").forEach(p=>p.onclick=()=>{
  secondsInput.value=p.dataset.secs;
  speak(currentAI,`Preset set to ${Math.round(p.dataset.secs/60)} minutes.`);
});

// Timer start/stop
document.getElementById("startBtn").onclick=()=>{
  stopTimer();
  let s=Math.max(1,parseInt(secondsInput.value||"600"));
  let t=s;
  speak(currentAI,`Starting timer for ${Math.floor(s/60)} minutes ${s%60? (s%60 + " seconds"):""}.`);
  tick(); timerId=setInterval(tick,1000);
  function tick(){
    countdownEl.textContent = t>0 ? `${Math.floor(t/60)}m ${t%60}s remaining` : "Time's up!";
    if(t<=0){ clearInterval(timerId); timerId=null; speak(currentAI,"Timer complete. Well done."); }
    t--;
  }
};
document.getElementById("stopBtn").onclick=()=>{
  if(timerId){ clearInterval(timerId); timerId=null; countdownEl.textContent="Stopped."; speak(currentAI,"Timer stopped."); }
};

// Orb "talking" rings (synthetic amplitude)
let talking=false,phase=0;
function startTalk(){ talking=true; }
function stopTalk(){ talking=false; }
(function loop(){
  const rings=[...document.querySelectorAll(".ring")];
  if(talking){
    phase+=0.12;
    const a=Math.abs(Math.sin(phase*1.3));
    rings.forEach((ring,i)=>{
      const scale=1 + a*(i+0.6)*.1;
      ring.style.transform=`scale(${scale})`;
      ring.style.borderColor = currentAI==="MIA" ? ["#a5eaff66","#7fd0ff55","#4aa9ff44"][i] : ["#61ffb066","#48e79a55","#2bcf8450"][i];
    });
  }
  requestAnimationFrame(loop);
})();

// Boot overlay + soft chime + intro line
function playChime(){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type="sine"; o.frequency.value=880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.35);
    o.start(); o.stop(ctx.currentTime+0.4);
  }catch(e){}
}
window.addEventListener("load", ()=>{
  // Show boot, wait a moment, then speak
  boot.classList.remove("hidden");
  setTimeout(()=>{
    playChime();
    speak("MIA","Steele Tech presents S.T.A.R.L.I.G.H.T. — A Life‑Integrated AI Timer for Growth and Harmony. Systems online.");
    setTimeout(()=> boot.classList.add("hidden"), 2400);
  }, 250);
});

// PWA install
let deferredPrompt=null;
const installBtn=document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", (e)=>{ e.preventDefault(); deferredPrompt=e; installBtn.classList.remove("hidden"); });
installBtn.onclick=async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.classList.add("hidden"); };

// Service worker
if("serviceWorker" in navigator){ navigator.serviceWorker.register("./sw.js"); }
