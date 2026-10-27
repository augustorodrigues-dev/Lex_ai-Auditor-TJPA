/* ==================================================================
   ÁUDIO / TÁTIL
================================================================== */
let actx=null;
function beep(freq,dur,vol=.06,tipo='square'){
  if(!$('swSom').getAttribute('aria-checked')==='true') {}
  if($('swSom').getAttribute('aria-checked')!=='true') return;
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(),g=actx.createGain();
    o.type=tipo;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(actx.destination);o.start();
    g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+dur/1000);o.stop(actx.currentTime+dur/1000);
  }catch(e){}
}
function som(sit){
  if(sit==='ok'){ beep(1180,85,.05); setTimeout(()=>beep(1560,70,.04),90); }
  else if(sit==='warn'){ beep(760,110,.06); setTimeout(()=>beep(600,120,.06),130); }
  else { beep(300,240,.08,'sawtooth'); setTimeout(()=>beep(220,240,.07,'sawtooth'),250); }
}
function vibra(sit){
  if($('swVib').getAttribute('aria-checked')!=='true'||!navigator.vibrate) return;
  navigator.vibrate(sit==='ok'?38:(sit==='warn'?[52,42,52]:[120,60,120]));
}
