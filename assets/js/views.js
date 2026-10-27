/* ==================================================================
   Views
================================================================== */
function usuarioAtual(){ return PERFIS.find(p=>p.c===perfil)||PERFIS[0]; }

function renderHoje(){
  const u=usuarioAtual();
  const h=new Date().getHours();
  $('saudacao').textContent=`${h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'}, ${u.u.split(' ')[0]}`;
  const np=minhasPendencias().length;
  $('resumoDia').textContent = perfil==='dt'
    ? `${ACEITES.filter(a=>!a.aceito).length} aceite(s) dependem de você. NFC disponível para conferir a carga.`
    : `${np} aprovação(ões) e 1 guia de remessa aguardando conferência.`;
  $('instRight').textContent = ORGAO.comarcas[0];

  const k = perfil==='dt'
    ? [['w',ACEITES.filter(a=>!a.aceito).length,'Aceites pendentes','1 há 7 dias'],['',6,'Bens em minha carga','R$ 31.480,00'],
       ['s',4,'Confirmados no inventário','de 6 bens'],['e',1,'Chamado aberto','impressora em garantia']]
    : [['w',200,'Itens da GR-2026-0148','0 conferidos'],['e',np,'Aprovações paradas','3 baixas com laudo'],
       ['w',47,'Aceites pendentes','9 há mais de 3 dias'],['s',78,'Inventário 2026','% do escopo']];
  $('kpisHoje').innerHTML = k.map(([c,v,l,d])=>`<div class="kpi ${c}"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join('');

  const tasks = perfil==='dt' ? [
    ['u','Aceite pendente há 7 dias — Notebook PAT-000456','Lembrete D+7 enviado. Se não responder, escala para o Diretor de Secretaria.',
      [['pri','Aceitar agora','ir','meus'],['sec','Ver ficha','abrirFicha','PAT-000456']]],
    ['a','2 bens sem confirmação no inventário 2026','Impressora PAT-000789 e notebook PAT-000456. Confirme por NFC ou QR.',
      [['pri','Confirmar por NFC','ir','ler'],['sec','Ver lista','ir','meus']]],
    ['','Chamado de avaria — impressora PAT-000789','Bem em garantia até 14/11/2026. OS 2231/2026 aberta pelo Gestor de Patrimônio.',
      [['sec','Acompanhar','abrirFicha','PAT-000789']]]
  ] : [
    ['u','Guia de remessa GR-2026-0148 — 200 itens','Recebida em 29/10/2026 · SEI 26.0.000148/2026-11 · origem: Almoxarifado TJ Sede.',
      [['pri','Conferir por NFC','ir','ler'],['sec','Ver itens','ir','bens']]],
    ['e','Servidor exonerado com 3 bens ativos','A. Nunes · gatilho automático da folha em 27/10. Bloqueia Certidão Nada Consta.',
      [['pri','Conduzir devolução','ir','pend']]],
    ['a','3 laudos de baixa aguardando aprovação','Todos com valor de referência PNCP coletado em 29/10. Segregação verificada.',
      [['pri','Aprovar em lote','ir','pend']]],
    ['','Revisão de bem apreendido — Embarcação APR-000017','Prazo de revisão venceu. Autos 0012345-67.2026.8.14.0301 · 2ª Vara Criminal.',
      [['sec','Revisar custódia','ir','pend']]]
  ];
  $('listaHoje').innerHTML = tasks.map(([c,t,m,acts])=>`
    <div class="task ${c}"><div class="bd"><div class="t">${t}</div><div class="m">${m}</div>
      <div class="acts">${acts.map(([k,l,action,value])=>`<button class="btn ${k} sm" data-action="${action}" data-value="${escapeAttr(value)}">${l}</button>`).join('')}</div>
    </div></div>`).join('');
}

function renderBens(){
  const q=($('fBens').value||'').toLowerCase();
  const rows = BENS.filter(b=>{
    if(filtroBem!=='all' && b.e!==filtroBem) return false;
    if(perfil==='dt' && !MEUS.some(m=>m.p===b.bem) && !['PAT-000456'].includes(b.bem)) return false;
    if(q && !(b.bem+b.d+b.r+b.u+b.c+(b.proc||'')).toLowerCase().includes(q)) return false;
    return true;
  });
  $('bensCount').textContent=rows.length;
  $('bensSub').textContent = perfil==='dt' ? 'Sua carga patrimonial · toque para ver a ficha.' : `${ORGAO.unidades[0]} e unidades vinculadas · toque para ver a ficha.`;
  const estados=[['all','Todos'],...[...new Set(BENS.map(b=>b.e))].map(e=>[e,TAGSTATE[e]?TAGSTATE[e][2]:e])];
  $('chipsBens').innerHTML = estados.map(([v,l])=>`<button class="chip ${filtroBem===v?'on':''}" data-action="filtrarBem" data-value="${escapeAttr(v)}">${l}</button>`).join('');
  $('listaBens').innerHTML = rows.length ? rows.map(b=>{
    const st=TAGSTATE[b.e]||['neu','●',b.e];
    return `<div class="row" data-action="abrirFicha" data-value="${escapeAttr(b.bem)}">
      <div class="ic" aria-hidden="true">${b.uid&&b.uid!=='—'?'📶':'▦'}</div>
      <div class="bd"><b>${b.d}</b><span class="mono">${b.bem}${b.proc?` · ${b.proc.slice(0,15)}…`:''} · ${b.u}</span></div>
      <div class="rt"><span class="tag ${st[0]}"><span class="i">${st[1]}</span>${st[2]}</span>
        <span class="asset-value">${fmtBRL(b.v)}</span></div>
    </div>`;
  }).join('') : '<div class="empty"><span class="e">🔍</span>Nenhum bem com esse filtro.<br>Limpe a busca ou leia uma plaqueta por NFC.</div>';
}

function renderPend(){
  const rows = minhasPendencias().filter(p=>filtroPend==='all'||p.f===filtroPend);
  $('pendTitulo').textContent = perfil==='dt' ? 'Minhas pendências' : 'Pendências e aprovações';
  const fs=[['all','Todas'],['baixa','Baixas'],['excecao','Exceções'],['transf','Transferências'],['desl','Desligamento'],['apreen','Apreendidos'],['sync','Offline']];
  $('chipsPend').innerHTML = fs.filter(([f])=>f==='all'||minhasPendencias().some(p=>p.f===f))
    .map(([f,l])=>`<button class="chip ${filtroPend===f?'on':''}" data-action="filtrarPend" data-value="${escapeAttr(f)}">${l}</button>`).join('');
  const somenteLeitura = (perfil==='au'||perfil==='ci'||perfil==='dt');
  $('listaPend').innerHTML = rows.length ? rows.map(p=>{
    const idx=PEND.indexOf(p);
    return `<div class="task ${p.f==='desl'||p.f==='sync'?'u':(p.f==='apreen'?'a':'')}">
      <div class="bd">
        ${somenteLeitura?'':`<label class="chk pending-selection"><input type="checkbox" ${selPend.has(idx)?'checked':''} data-change="togglePend" data-index="${idx}" aria-label="Selecionar"><span class="pending-selection-label">Selecionar</span></label>`}
        <div class="t">${p.t}</div><div class="m">${p.m}</div>
        <div class="acts">${p.tags.map(t=>`<span class="tag ${t[0]}">${t[1]}</span>`).join('')}
        ${somenteLeitura?'<span class="tag neu">Somente leitura</span>':`
          <button class="btn pri sm" data-action="resolver" data-index="${idx}" data-value="aprovar">${p.seg?'Encaminhar':'Aprovar'}</button>
          <button class="btn dan sm" data-action="resolver" data-index="${idx}" data-value="negar">Negar</button>`}
        </div>
      </div></div>`;
  }).join('') : '<div class="empty"><span class="e">✓</span>Nenhuma pendência neste filtro.</div>';
  $('bulkPendBox').style.display = somenteLeitura?'none':'flex';
}
function togglePend(i){ selPend.has(i)?selPend.delete(i):selPend.add(i); atualizarBadges(); }
function selAll(){
  const rows=minhasPendencias().filter(p=>filtroPend==='all'||p.f===filtroPend);
  rows.forEach(p=>selPend.add(PEND.indexOf(p)));
  toast(`${rows.length} pendências selecionadas.`);
}
function aprovarSel(){
  if(selPend.size<2){ toast('Selecione 2 ou mais itens do mesmo tipo para aprovar em lote.'); return; }
  const n=selPend.size;
  [...selPend].forEach(i=>{ const p=PEND[i]; if(!(p.seg&&perfil==='gp')) p.resolvida=true; });
  selPend.clear(); renderPend(); atualizarBadges();
  enfileirar('APROVACAO_LOTE',`${n} itens`,'assinatura avançada gov.br');
  toast(`${n} aprovadas em lote. Registros encadeados no log.`,()=>{ PEND.forEach(p=>delete p.resolvida); renderPend(); atualizarBadges(); });
}
function resolver(i,acao){
  const p=PEND[i]; if(!p) return;
  if(acao==='aprovar'&&p.seg&&perfil==='gp'){
    toast('Segregação de funções: você é a autora do laudo. Encaminhado ao Gestor de Unidade — nada gravado como aprovado.');
    return;
  }
  if(acao==='negar'){
    const mot=prompt('Motivo da negativa (obrigatório, fica no log e vai para o autor):','');
    if(!mot) return; p.motivo=mot;
  }
  p.resolvida=true; selPend.delete(i);
  enfileirar(acao==='aprovar'?'APROVACAO':'NEGATIVA',p.t.slice(0,38),'assinatura avançada gov.br');
  renderPend(); renderHoje(); atualizarBadges();
  toast(acao==='aprovar'?'Aprovado. Registro encadeado no log com assinatura avançada gov.br.':'Negado com motivo. O autor foi notificado.',
    ()=>{delete p.resolvida;delete p.motivo;renderPend();renderHoje();atualizarBadges();});
}

function renderMeus(){
  const pend=ACEITES.filter(a=>!a.aceito);
  $('nAceites').textContent=pend.length;
  $('kpisMeus').innerHTML=[
    ['w',pend.length,'Aguardando meu aceite','prazo 5 dias úteis'],['',6,'Bens em minha carga','R$ 31.480,00'],
    ['s',4,'Confirmados no inventário','de 6 bens'],['e',1,'Chamado aberto','impressora em garantia']
  ].map(([c,v,l,d])=>`<div class="kpi ${c}"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join('');
  $('listaAceites').innerHTML = pend.length?pend.map(a=>{
    const idx=ACEITES.indexOf(a);
    return `<div class="task ${a.dias>=7?'u':'a'}"><div class="bd">
      <div class="t">${a.d} <span class="mono asset-code">· ${a.p}</span></div>
      <div class="m">${a.m} · ${fmtBRL(a.v)}</div>
      <div class="m mt-5"><b>Observação da entrega:</b> ${a.obs}</div>
      <div class="acts">
        <button class="btn pri sm" data-action="aceitar" data-index="${idx}">Aceitar</button>
        <button class="btn dan sm" data-action="recusar" data-index="${idx}">Recusar</button>
        <button class="btn gho sm" data-action="toast" data-value="Foto e descrição obrigatórias. O chamado cai na fila do Gestor de Patrimônio com prioridade.">Reportar avaria</button>
        <span class="tag ${a.dias>=7?'err':'warn'}">${a.dias>=7?`${a.dias} dias sem resposta`:`prazo em ${a.dias} dias`}</span>
      </div></div></div>`;
  }).join('') : '<div class="empty"><span class="e">✓</span>Nenhum aceite pendente. Sua carga está regular — certidão liberada.</div>';
  $('btnAceiteLote').style.display = pend.length>1?'flex':'none';
  $('listaMeus').innerHTML = MEUS.map(b=>{
    const st=TAGSTATE[b.e]||['neu','●',b.e];
    return `<div class="row" data-action="abrirFicha" data-value="${escapeAttr(b.p)}">
      <div class="ic" aria-hidden="true">${b.inv?'📶':'▦'}</div>
      <div class="bd"><b>${b.d}</b><span class="mono">${b.p} · desde ${b.desde}</span></div>
      <div class="rt">${b.inv?'<span class="tag ok"><span class="i">✓</span>Inventariado</span>':'<span class="tag warn"><span class="i">!</span>Confirmar</span>'}
        <span class="asset-status"><span class="tag ${st[0]}"><span class="i">${st[1]}</span>${st[2]}</span></span></div>
    </div>`;
  }).join('');
}
function aceitar(i){
  const a=ACEITES[i]; if(!a||a.aceito) return; a.aceito=true;
  enfileirar('ACEITE',a.p,'assinatura simples gov.br · fator biometria');
  renderMeus(); renderHoje(); atualizarBadges();
  toast(`${a.p} aceito. Termo de Responsabilidade gerado e assinado.`,()=>{a.aceito=false;renderMeus();renderHoje();atualizarBadges();});
}
function recusar(i){
  const a=ACEITES[i]; if(!a) return;
  const mot=prompt(`Motivo da recusa de ${a.p} (obrigatório, fica no log):`,'');
  if(!mot) return;
  a.aceito=true; a.recusado=true; renderMeus(); renderHoje(); atualizarBadges();
  toast('Recusa registrada com motivo. O bem voltou ao fluxo e o Gestor de Patrimônio foi notificado com a foto.',
    ()=>{a.aceito=false;delete a.recusado;renderMeus();renderHoje();atualizarBadges();});
}
function abrirAceite(){
  const pend=ACEITES.filter(a=>!a.aceito);
  if(pend.length<2){ toast('Aceite em lote precisa de 2 itens ou mais.'); return; }
  const tot=pend.reduce((s,a)=>s+a.v,0);
  $('acResumo').innerHTML = pend.map(a=>`<div class="row compact-row">
      <div class="ic" aria-hidden="true">📶</div>
      <div class="bd"><b>${a.d}</b><span class="mono">${a.p} · ${fmtBRL(a.v)}</span></div></div>`).join('')
    + `<div class="acceptance-total">
        <span>Total</span><span>${fmtBRL(tot)}</span></div>`;
  $('chkConf').checked=false;$('chkRess').checked=false;$('btnAssinar').disabled=true;
  $('seloMob').textContent = perfil==='dt'?'prata':'ouro';
  abrir('mAceite');
}
function assinar(){
  if($('chkRess').checked){ toast('Ressalva marcada: registre o item e a foto. Sem foto o sistema não aceita a ressalva.'); return; }
  ACEITES.forEach(a=>{ if(!a.aceito){ a.aceito=true; enfileirar('ACEITE_LOTE',a.p,'assinatura avançada gov.br · selo '+$('seloMob').textContent); } });
  fechar('mAceite'); renderMeus(); renderHoje(); atualizarBadges();
  toast('Itens aceitos com uma assinatura. Termo de Responsabilidade e log encadeado gerados.',
    ()=>{ACEITES.forEach(a=>a.aceito=false);renderMeus();renderHoje();atualizarBadges();});
}

function abrirFicha(cod){
  const b = BENS.find(x=>x.bem===cod) || Object.values(TAGS).find(x=>x.bem===cod);
  if(!b){ toast('Bem não encontrado.'); return; }
  const st=TAGSTATE[b.e]||['neu','●',b.e];
  const hist=[
    ['Entrada por guia de remessa','29/10/2026 07:55 · GR-2026-0148 · Maria R. Souza (Gestor de Patrimônio)'],
    ['Leitura NFC no recebimento','29/10/2026 08:14 · Sala 3 — Depósito · UID '+ (b.uid&&b.uid!=='—'?b.uid:'—')],
    b.e==='PENDENTE_ACEITE'?['Atribuição inicial','30/10/2026 09:02 · para J. Cavalcante · aguardando aceite']
      :['Atribuição e aceite concluídos','30/10/2026 · assinatura avançada gov.br · selo ouro']
  ];
  $('sheetBody').innerHTML=`
    <div class="sheet-header">
      <div class="flex-content"><h3 id="shTitulo" class="sheet-title">${b.d}</h3>
        <div class="mono sheet-subtitle">${b.bem}${b.uid&&b.uid!=='—'?` · UID ${b.uid}`:''}</div></div>
      <button class="btn gho sm" data-action="fecharSheet" aria-label="Fechar">✕</button>
    </div>
    <div class="sheet-tags">
      <span class="tag ${st[0]}"><span class="i">${st[1]}</span>${st[2]}</span>
      <span class="tag neu">${b.c}</span>
      ${b.proc?`<span class="tag gold"><span class="i">§</span>Bem apreendido</span>`:''}
    </div>
    <dl class="dl">
      <dt>Responsável</dt><dd>${b.r}</dd>
      <dt>Local</dt><dd>${b.l} — ${b.u}</dd>
      <dt>Categoria</dt><dd>${b.cat}</dd>
      <dt>Aquisição</dt><dd>${b.nf}</dd>
      <dt>Valor</dt><dd>${fmtBRL(b.v)}</dd>
      ${b.vida?`<dt>Vida útil</dt><dd>${b.vida} anos</dd>`:''}
      <dt>Fonte do valor</dt><dd>${b.fonte}</dd>
      ${b.proc?`<dt>Processo (CNJ)</dt><dd class="mono text-12">${b.proc}</dd>`:''}
      <dt>Comarca</dt><dd>${ORGAO.comarcas[0]}</dd>
    </dl>
    ${b.proc?`<div class="note mt-6"><b>Dupla custódia:</b> bem apreendido responde ao juízo da 2ª Vara Criminal e ao setor de patrimônio. Qualquer movimentação exige autorização nos autos e registro do depositário.</div>`:''}
    <div class="sech mt-14"><h3>Histórico encadeado</h3><span class="ln"></span></div>
    <div class="tl">${hist.map(([a,b2])=>`<div class="e"><b>${a}</b><span>${b2}</span></div>`).join('')}</div>
    <div class="hashbox">sha256 9f2c…${b.bem.slice(-4)}a1 · encadeado ao registro anterior · verificado em ${new Date().toLocaleDateString('pt-BR')}</div>
    <div class="btnrow mt-14">
      <button class="btn sec" data-action="toast" data-value="QR da ficha aberto. Qualquer servidor escaneia e vê responsável, histórico e o botão reportar problema.">QR</button>
      <button class="btn sec" data-action="toast" data-value="Chamado de avaria criado com foto obrigatória — prioridade alta na fila do Gestor de Patrimônio.">Avaria</button>
      <button class="btn pri" data-action="toast" data-value="Transferência por QR/NFC iniciada: o colega aproxima o aparelho e o handshake presencial acontece na hora.">Transferir</button>
    </div>
    <button class="btn gho blk mt-6" data-action="toast" data-value="Impressão A4: cabeçalho do TJPA, dados do bem, histórico e QR de verificação.">Imprimir ficha</button>`;
  $('sheet').classList.add('on');
  document.body.style.overflow='hidden';
}
function fecharSheet(){ $('sheet').classList.remove('on'); document.body.style.overflow=''; }

function renderPerfil(){
  const u=usuarioAtual();
  $('pfIni').textContent=u.ini; $('pfNome').textContent=u.u; $('pfInfo').textContent=u.i;
  $('pfPerfis').innerHTML=`<span class="tag info">${u.n}</span>`;
  $('pfNota').innerHTML=`<b>${u.n}.</b> ${u.d}`;
  $('selPerfilMob').innerHTML=PERFIS.map(p=>`<option value="${p.c}" ${p.c===perfil?'selected':''}>${p.n} — ${p.u}</option>`).join('');
}
function trocarPerfil(c){
  perfil=c; const u=usuarioAtual();
  if(!(NAV[perfil]||[]).some(x=>x[0]===aba)) aba='hoje';
  $('seloMob').textContent = c==='dt'?'prata':'ouro';
  renderNav(); renderHoje(); renderBens(); renderPend(); renderMeus(); renderPerfil(); atualizarBadges(); ir(aba);
  toast(`Perfil ${u.n}: o app mostra só o que este perfil pode fazer.`);
}
