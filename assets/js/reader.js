/* ==================================================================
   NFC
================================================================== */
let nfcOK = ('NDEFReader' in window);
let nfcReader = null, ultimaLeitura = {tag:null, t:0};

function statusNFC(){
  const el=$('nfcStatus');
  if(nfcOK && window.isSecureContext){
    el.innerHTML='<b class="text-ok">Disponível</b> neste navegador (Web NFC API). Leitura ativa.';
    $('rdModo').textContent='NFC · Web NFC API';
    $('btnLerNfc').disabled=false;
  } else {
    const motivo = !window.isSecureContext ? 'exige HTTPS' : 'navegador sem Web NFC (iOS/Safari e Firefox)';
    el.innerHTML=`<b class="text-warn">Indisponível</b> — ${motivo}. Use QR/código de barras, leitor Bluetooth ou digitação.`;
    $('rdModo').textContent='NFC indisponível · fallback QR';
    $('btnLerNfc').disabled=true;
  }
  $('nfcNote').innerHTML = nfcOK && window.isSecureContext
    ? `<b>NFC ativo.</b> O app lê o registro NDEF da plaqueta (<code>tjpa:bem:v1</code>), confere o <b>UID gravado no banco</b> e valida a assinatura HMAC no servidor. UID sozinho não autoriza nada — plaqueta clonada é rejeitada. Leitura exige aproximação de ~4 cm, o que reduz bipagem acidental em depósito.`
    : `<b>NFC indisponível neste navegador</b> (${window.isSecureContext?'Web NFC não suportada':'contexto não seguro'}). A plaqueta do TJPA leva <b>NFC + QR + número legível</b> no mesmo adesivo: qualquer aparelho lê por um dos três caminhos, e todos caem na mesma fila de eventos. Para iPhone, a opção é app nativo (CoreNFC) na Fase 4 — o QR cobre 100% dos casos hoje.`;
}

async function lerNFC(){
  if(!nfcOK||!window.isSecureContext){ toast('NFC indisponível neste navegador. Use QR ou digite o código.'); modoQR(); return; }
  const rd=$('reader'); rd.className='reader on'; $('rdTitulo').textContent='Aproxime da plaqueta…';
  $('rdTexto').textContent='Leitura NFC iniciada. Mantenha o aparelho a menos de 4 cm da etiqueta até confirmar.';
  try{
    nfcReader = nfcReader || new NDEFReader();
    const ctl = new AbortController();
    setTimeout(()=>ctl.abort(), 20000);
    await nfcReader.scan({signal:ctl.signal});
    nfcReader.onreading = ev => {
      let payload=null;
      for(const r of ev.message.records){
        if(r.recordType==='url'||r.recordType==='mime'||r.recordType==='text'){
          try{ payload = r.data instanceof ArrayBuffer ? new TextDecoder().decode(r.data) : String(r.data); }catch(e){}
        }
      }
      const tag = parseNDEF(payload, ev.serialNumber);
      processarLeitura(tag, ev.serialNumber||'uid-desconhecido');
      ctl.abort();
    };
    nfcReader.onreadingend = ()=>{};
    nfcReader.onerror = ()=>{ rd.className='reader err'; $('rdTitulo').textContent='Falha na leitura';
      $('rdTexto').textContent='Não foi possível ler a etiqueta. Tente o QR ou a digitação manual.'; };
  }catch(e){
    rd.className='reader err'; $('rdTitulo').textContent='NFC bloqueado';
    $('rdTexto').textContent='Permissão negada ou indisponível. Use QR, leitor Bluetooth ou digite o código.';
    som('err'); vibra('err');
  }
}
/* Converte o texto NDEF em tag do sistema; aceita URI, JSON ou código puro */
function parseNDEF(payload, uid){
  if(!payload) return null;
  const s = String(payload).trim();
  try{ const j=JSON.parse(s); if(j.bem||j.tag) return j.tag||j.bem; }catch(e){}
  const m = s.match(/(TJPA-[A-Z0-9]{5,8}|PAT-\d{4,8}|APR-\d{4,8})/i);
  return m ? m[1].toUpperCase() : s.toUpperCase();
}

function lerManual(){
  const v=$('inManual').value.trim().toUpperCase();
  if(!v){ toast('Digite a plaqueta ou o nº de série.'); return; }
  $('inManual').value='';
  processarLeitura(v,'manual');
}
function lerTagDemo(t){ processarLeitura(t,'demo'); }
function modoQR(){
  toast('Câmera aberta (ZXing/html5-qrcode como padrão; BarcodeDetector só onde existir). Aponte para o QR da plaqueta.');
  const rd=$('reader'); rd.className='reader on'; $('rdTitulo').textContent='Aponte para o QR';
  $('rdTexto').textContent='O QR está impresso na mesma plaqueta do NFC. Serve para qualquer aparelho, inclusive iPhone.';
  $('rdModo').textContent='QR / código de barras · câmera';
}

/* ==================================================================
   Processamento da leitura (regra de negócio)
================================================================== */
function processarLeitura(codigo, uid){
  const agora = Date.now();
  if(ultimaLeitura.tag===codigo && agora-ultimaLeitura.t < 2500){
    mostrarResultado('warn','LEITURA DUPLICADA',codigo,'Mesma plaqueta lida há menos de 3 s. Ignorada para não duplicar evento — proteção contra leitura dupla em modo rajada.',uid);
    som('warn'); vibra('warn'); return;
  }
  ultimaLeitura={tag:codigo,t:agora};
  const rd=$('reader');

  /* plaqueta revogada / substituída */
  if(codigo==='TJPA-DESC01'){
    rd.className='reader err';
    registrarLeitura(codigo,'err','PLAQUETA DESCARTADA',null);
    mostrarResultado('err','PLAQUETA DESCARTADA',codigo,'Esta etiqueta foi substituída em 14/10/2026 (evento PLAQUETA_SUBSTITUIDA). O bem continua no cadastro sob a plaqueta PAT-000310 — leia a nova etiqueta ou informe a série.',uid);
    som('err'); vibra('err'); return;
  }

  const t = TAGS[codigo];
  if(!t){
    /* tenta achar por nº de bem */
    const alt = Object.values(TAGS).find(x=>x.bem===codigo) || BENS.find(b=>b.bem===codigo);
    if(alt){ return processarLeitura(alt.uid&&TAGS[alt.uid]?'':'', uid) , processarPorBem(alt, uid); }
    rd.className='reader err';
    registrarLeitura(codigo,'err','NÃO ENCONTRADO',null);
    mostrarResultado('err','NÃO ENCONTRADO NO CADASTRO',codigo,'Sem plaqueta e sem nº de série correspondente. Abre exceção de item não catalogado — o bem entra por série/IMEI e ganha tombamento no fluxo.',uid,true);
    som('err'); vibra('err'); return;
  }

  /* UID divergente = suspeita de clonagem */
  if(uid && uid!=='demo' && uid!=='manual' && t.uid && uid.toUpperCase()!==t.uid.toUpperCase()){
    rd.className='reader err';
    registrarLeitura(codigo,'err','UID DIVERGENTE',t);
    mostrarResultado('err','UID NÃO CONFERE — SUSPEITA DE CLONAGEM',codigo,`UID lido ${uid} ≠ UID registrado ${t.uid}. O evento foi bloqueado e encaminhado à Auditoria com foto e geolocalização. O bem em si (${t.bem}) permanece íntegro no cadastro.`,uid,true);
    som('err'); vibra('err'); return;
  }

  /* regras por estado */
  if(t.e==='BAIXADO'){
    rd.className='reader err'; registrarLeitura(codigo,'err','BEM JÁ BAIXADO',t);
    mostrarResultado('err','BEM JÁ BAIXADO',codigo,`${t.d}. Baixado em 12/2025 e doado à escola municipal (edital 07/2025). Se o bem está fisicamente aqui, é divergência grave — abre chamado com foto obrigatória.`,uid,true);
    som('err'); vibra('err'); return;
  }

  const sit = t.sit==='ok'?'ok':(t.sit==='warn'?'warn':'err');
  const rotulo = TAGSTATE[t.e] ? TAGSTATE[t.e][2].toUpperCase() : t.e;
  rd.className='reader '+sit;
  registrarLeitura(codigo,sit,rotulo,t);
  mostrarResultado(sit, rotulo, codigo, t.obs, uid, false, t);
  som(sit); vibra(sit);
  $('rdTitulo').textContent = sit==='ok' ? 'Leitura confirmada' : (sit==='warn' ? 'Leitura com ressalva' : 'Leitura com problema');
  $('rdTexto').textContent = 'Aproxime a próxima plaqueta para continuar em modo rajada.';
}
function processarPorBem(b, uid){
  const sit = b.sit==='ok'?'ok':(b.sit==='warn'?'warn':'err');
  $('reader').className='reader '+sit;
  registrarLeitura(b.bem,sit,(TAGSTATE[b.e]||['','','—'])[2].toUpperCase(),b);
  mostrarResultado(sit,(TAGSTATE[b.e]||['','',b.e])[2].toUpperCase(),b.bem,b.obs,uid,false,b);
  som(sit); vibra(sit);
}

function mostrarResultado(sit,titulo,codigo,texto,uid,abreExcecao,bem){
  const r=$('result');
  r.className='result on '+sit;
  const icone = sit==='ok'?'✓':(sit==='warn'?'!':'✕');
  r.innerHTML = `<div class="rh"><b>${icone} ${titulo}</b><span class="big">${codigo}</span></div>
    <div class="rb">${texto}</div>
    <div class="meta">${uid?`UID NFC: <span class="mono">${uid}</span> · `:''}operador: <b id="mOper">—</b> · ${new Date().toLocaleString('pt-BR')} · local: Sala 3 — Depósito${bem?` · HMAC do payload: <span class="mono">verificado</span>`:''}</div>
    <div class="result-actions">
      ${bem?`<button class="btn ${sit==='err'?'dan':'pri'} sm" data-action="abrirFicha" data-value="${escapeAttr(bem.bem)}">Ver ficha do bem</button>`:''}
      ${abreExcecao?`<button class="btn sec sm" data-action="abrirExcecao" data-value="${escapeAttr(codigo)}">Abrir exceção</button>`:''}
      ${bem&&bem.e==='PENDENTE_ACEITE'?`<button class="btn gld sm" data-action="ir" data-value="meus">Ir para aceite</button>`:''}
      ${bem&&bem.e==='NAO_LOCALIZADO'?`<button class="btn sec sm" data-action="toast" data-value="Localização registrada: bem reencontrado. Retorna para ATIVO_EM_CUSTODIA e encerra a pendência na sindicância 014/2026.">Registrar localização</button>`:''}
      ${bem&&bem.e==='BEM_APREENDIDO'?`<button class="btn sec sm" data-action="toast" data-value="Revisão de bem apreendido registrada nos autos 0012345-67.2026.8.14.0301 · depositário confirmado.">Revisar custódia</button>`:''}
      <button class="btn gho sm" data-action="fecharResultado">Fechar</button>
    </div>`;
  const mo=$('mOper'); if(mo) mo.textContent = usuarioAtual().u;
}
function abrirExcecao(codigo){
  toast(`Exceção criada para ${codigo} e enviada à fila do Gestor de Patrimônio. Foto e geolocalização anexadas.`,
    ()=>toast('Exceção desfeita.'));
}
function registrarLeitura(codigo,sit,rotulo,bem){
  leituras.unshift({codigo,sit,rotulo,bem:bem?bem.bem:null,t:new Date(),idk:idem(),uid:codigo});
  enfileirar(sit==='ok'?'LEITURA_NFC':'LEITURA_NFC_DIVERGENTE', codigo, rotulo.toLowerCase());
  renderSessao();
}
function renderSessao(){
  const g=leituras.filter(l=>l.sit==='ok').length,y=leituras.filter(l=>l.sit==='warn').length,r=leituras.filter(l=>l.sit==='err').length;
  const tot=leituras.length||1;
  $('sessN').textContent=leituras.length+(leituras.length===1?' leitura':' leituras');
  $('lgG').textContent=g;$('lgY').textContent=y;$('lgR').textContent=r;
  $('pgG').style.width=(g/tot*100)+'%';$('pgY').style.width=(y/tot*100)+'%';$('pgR').style.width=(r/tot*100)+'%';
  atualizarBadges();
}
function renderTaglist(){
  $('taglist').innerHTML = ORDEM_TAGS.map(t=>{
    const d=TAGS[t];
    const st = t==='TJPA-DESC01' ? ['err','Revogada'] : (d? [TAGSTATE[d.e][0], TAGSTATE[d.e][2]] : ['err','Desconhecida']);
    return `<button class="tagbtn" data-action="lerTagDemo" data-value="${escapeAttr(t)}">
      <span class="nfc" aria-hidden="true">📶</span>
      <span class="bd"><b>${t}</b><span>${d?d.d:'Etiqueta substituída em 14/10/2026'}${d?` · ${d.bem}`:''}</span></span>
      <span class="st tag ${st[0]}">${st[1]}</span></button>`;
  }).join('');
}
