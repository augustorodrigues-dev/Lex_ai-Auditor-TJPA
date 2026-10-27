/* ==================================================================
   Fila offline
================================================================== */
function idem(){ return 'idem_'+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4); }
function enfileirar(acao,alvo,obs){
  fila.push({id:idem(),a:acao,d:alvo,m:obs,t:new Date()});
  atualizarBadges();
}
function renderFila(){
  $('listaFila').innerHTML = fila.length ? fila.map(f=>`
    <div class="row compact-row">
      <div class="ic" aria-hidden="true">⟳</div>
      <div class="bd"><b>${f.a} · ${f.d}</b><span>${f.m} · ${f.t.toLocaleTimeString('pt-BR')}</span>
        <span class="mono queue-id">${f.id}</span></div>
      <button class="btn sec sm" data-action="descartar" data-value="${escapeAttr(f.id)}">Descartar</button>
    </div>`).join('') : '<div class="empty"><span class="e">✓</span>Fila vazia. Tudo que foi registrado já está confirmado no servidor.</div>';
}
function abrirFila(){ renderFila(); abrir('mFila'); }
function descartar(id){
  const i=fila.findIndex(f=>f.id===id); if(i<0) return;
  const [rem]=fila.splice(i,1); renderFila(); atualizarBadges();
  toast('Ação descartada da fila.',()=>{fila.splice(i,0,rem);renderFila();atualizarBadges();});
}
function sincronizar(){
  if(offline){ toast('Sem conexão: as ações continuam no aparelho. Nada se perde — o log é append-only e reordenado por UUIDv7.'); return; }
  if(!fila.length){ toast('Nada para sincronizar.'); fechar('mFila'); return; }
  const n=fila.length; fila=[]; renderFila(); atualizarBadges(); fechar('mFila');
  toast(`${n} ação(ões) sincronizada(s). Cada Idempotency-Key confirmado uma única vez no log encadeado.`);
}
function toggleOffline(){
  offline=!offline;
  $('conn').classList.toggle('off',offline);
  $('connTxt').textContent = offline ? `Offline · ${fila.length} ação(ões) no aparelho` : (fila.length?`Online · ${fila.length} ação(ões) para sincronizar`:'Online · tudo sincronizado');
  $('connBtn').textContent = offline ? 'restaurar' : 'simular queda';
  atualizarBadges();
  toast(offline?'Modo offline (demo): NFC, aceite, chamado e inventário continuam funcionando e vão para a fila.'
               :'Conexão restabelecida. Toque em ⟳ para sincronizar a fila.');
}
