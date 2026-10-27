/* ==================================================================
   Util
================================================================== */
let tt;
function toast(m,undo){
  const el=$('toast');
  el.innerHTML=`<span>${m}</span>`+(undo?'<button class="u" id="tu">Desfazer</button>':'');
  if(undo) $('tu').addEventListener('click',()=>{undo();el.classList.remove('on');},{once:true});
  el.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>el.classList.remove('on'),undo?9000:4200);
}
function abrir(id){ $(id).classList.add('on'); document.body.style.overflow='hidden'; }
function fechar(id){ $(id).classList.remove('on'); if(!$('sheet').classList.contains('on')) document.body.style.overflow=''; }
function tglSw(el,nome){
  const v=el.getAttribute('aria-checked')==='true';
  el.setAttribute('aria-checked',String(!v));
  toast(`${nome} ${!v?'ativado':'desativado'}.`);
  if(el.id==='swNfc') statusNFC();
}
function tglBig(el){
  const v=el.getAttribute('aria-checked')==='true';
  el.setAttribute('aria-checked',String(!v));
  document.documentElement.style.fontSize = !v?'17.5px':'15px';
  toast(!v?'Texto grande ativado: fonte e alvo de toque aumentados.':'Tamanho padrão restaurado.');
}
function entrar(via){
  $('telaLogin').classList.add('off');
  const p=$('loginPerfil').value;
  perfil=p; aba='hoje';
  renderNav(); renderHoje(); renderBens(); renderPend(); renderMeus(); renderPerfil(); statusNFC(); atualizarBadges(); ir('hoje');
  setTimeout(()=>toast(`Entrada via ${via}. Fator: ${via==='gov.br'?'biometria + selo ouro':'e-mail institucional + PIN'} — registrado no log de auditoria.`),400);
}
function sair(){ $('telaLogin').classList.remove('off'); toast('Sessão encerrada. As ações da fila offline permanecem no aparelho.'); }
