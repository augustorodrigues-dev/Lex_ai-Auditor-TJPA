/* ==================================================================
   Navegação
================================================================== */
function renderNav(){
  const itens = NAV[perfil]||NAV.gp;
  $('nav').innerHTML = itens.map(([id,nome,ic],idx)=>{
    const meio = Math.floor(itens.length/2);
    if(idx===meio && id==='ler'){
      return `<button class="scan" data-t="ler" data-action="ir" data-value="ler" ${aba==='ler'?'aria-current="page"':''}>
        <span class="fab" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-7.07 17.07l1.41-1.41A8 8 0 1 1 20 12h2A10 10 0 0 0 12 2zm0 4a6 6 0 0 0-4.24 10.24l1.41-1.41A4 4 0 1 1 16 12h2a6 6 0 0 0-6-6zm0 4a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2z"/></svg></span>
        <span class="lb">Ler bem</span></button>`;
    }
    const n = badgeDe(id);
    return `<button data-t="${id}" data-action="ir" data-value="${escapeAttr(id)}" ${aba===id?'aria-current="page"':''}>
      <span class="ic" aria-hidden="true">${ic}</span>${nome}${n?`<span class="b">${n}</span>`:''}</button>`;
  }).join('');
}
function badgeDe(id){
  const pend = minhasPendencias().length;
  if(id==='pend') return perfil==='dt'?0:pend;
  if(id==='hoje') return (perfil==='dt'?ACEITES.filter(a=>!a.aceito).length:0) + (pend?1:0);
  if(id==='meus') return ACEITES.filter(a=>!a.aceito).length;
  if(id==='ler')  return leituras.filter(l=>l.sit!=='ok').length;
  if(id==='bens') return 0;
  if(id==='perfil') return fila.length?fila.length:0;
  return 0;
}
function minhasPendencias(){
  const ab=PEND.filter(p=>!p.resolvida);
  if(perfil==='dt') return ab.filter(p=>/Recusa|recus/.test(p.t));
  if(perfil==='au'||perfil==='ci') return [];
  return ab;
}
function atualizarBadges(){
  renderNav();
  $('filaN').textContent=fila.length;
  $('btnFila').style.display = fila.length?'grid':'grid';
  $('connTxt').textContent = offline ? `Offline · ${fila.length} ação(ões) no aparelho`
    : (fila.length?`Online · ${fila.length} ação(ões) para sincronizar`:'Online · tudo sincronizado');
  const nf=$('nFila'); if(nf) nf.textContent=minhasPendencias().length + (perfil==='dt'?ACEITES.filter(a=>!a.aceito).length:0);
}
function ir(id){
  aba=id;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  const el=$('v-'+id); if(el) el.classList.add('on');
  document.querySelectorAll('.bottomnav button').forEach(b=>{
    if(b.dataset.t===id) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  const tit={hoje:'Custódia de Bens',ler:'Ler bem por NFC',bens:'Bens da unidade',pend:'Pendências e aprovações',meus:'Meus bens',perfil:'Perfil e ajustes'};
  $('abTitulo').textContent=tit[id]||'Custódia de Bens';
  $('abSub').textContent=`${ORGAO.setor} · ${usuarioAtual().n}`;
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='perfil') renderPerfil();
}
