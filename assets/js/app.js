/* Eventos delegados também atendem aos elementos gerados pelas views. */
const clickActions = {
  abrirFila: () => abrirFila(),
  ir: el => ir(el.dataset.value),
  toggleOffline: () => toggleOffline(),
  lerNFC: () => lerNFC(),
  modoQR: () => modoQR(),
  lerManual: () => lerManual(),
  selAll: () => selAll(),
  aprovarSel: () => aprovarSel(),
  abrirAceite: () => abrirAceite(),
  tglSw: el => tglSw(el, el.dataset.value),
  tglBig: el => tglBig(el),
  toast: el => toast(el.dataset.value),
  abrir: el => abrir(el.dataset.value),
  sair: () => sair(),
  fecharSheet: () => fecharSheet(),
  fechar: el => fechar(el.dataset.value),
  assinar: () => assinar(),
  sincronizar: () => sincronizar(),
  entrar: el => entrar(el.dataset.value),
  abrirFicha: el => abrirFicha(el.dataset.value),
  abrirExcecao: el => abrirExcecao(el.dataset.value),
  fecharResultado: () => { $('result').className = 'result'; },
  lerTagDemo: el => lerTagDemo(el.dataset.value),
  descartar: el => descartar(el.dataset.value),
  filtrarBem: el => { filtroBem = el.dataset.value; renderBens(); },
  filtrarPend: el => { filtroPend = el.dataset.value; renderPend(); },
  resolver: el => resolver(Number(el.dataset.index), el.dataset.value),
  aceitar: el => aceitar(Number(el.dataset.index)),
  recusar: el => recusar(Number(el.dataset.index)),
};

const changeActions = {
  confirmarAssinatura: el => { $('btnAssinar').disabled = !el.checked; },
  togglePend: el => togglePend(Number(el.dataset.index)),
};

document.addEventListener('click', event => {
  const el = event.target.closest('[data-action]');
  if (el && !el.disabled && Object.hasOwn(clickActions, el.dataset.action)) {
    clickActions[el.dataset.action](el);
  }
});

document.addEventListener('change', event => {
  const el = event.target.closest('[data-change]');
  if (el && Object.hasOwn(changeActions, el.dataset.change)) {
    changeActions[el.dataset.change](el);
  }
});

$('fBens').addEventListener('input',renderBens);
$('inManual').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lerManual();}});
$('selPerfilMob').addEventListener('change',e=>trocarPerfil(e.target.value));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if($('sheet').classList.contains('on')) fecharSheet();
    else { const m=document.querySelector('.modal.on'); if(m) fechar(m.id); } }
});
window.addEventListener('online',()=>{ if(offline) return; toggleOffline(); toggleOffline(); });
window.addEventListener('offline',()=>{ if(!offline) toggleOffline(); });

/* init */
$('loginPerfil').innerHTML=PERFIS.map(p=>`<option value="${p.c}">${p.n} — ${p.u}</option>`).join('');
fila=[
  {id:idem(),a:'LEITURA_NFC',d:'PAT-000122',m:'leituras feitas no depósito, sem sinal',t:new Date(Date.now()-8*60000)},
  {id:idem(),a:'AVARIA_REPORTADA',d:'PAT-000789',m:'foto 1,4 MB comprimida em WebP no aparelho',t:new Date(Date.now()-5*60000)},
  {id:idem(),a:'TRANSFERENCIA_CONCLUIDA',d:'PAT-000330',m:'handshake presencial por NFC',t:new Date(Date.now()-2*60000)}
];
nfcOK = ('NDEFReader' in window);
renderNav(); renderHoje(); renderBens(); renderPend(); renderMeus(); renderPerfil(); renderTaglist(); renderSessao(); statusNFC(); atualizarBadges();
ir('hoje');
if(location.search.includes('demo=ler')){ entrar('gov.br'); ir('ler'); }
