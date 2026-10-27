/* ==================================================================
   DADOS DE DEMONSTRAÇÃO — contexto TJPA
================================================================== */
const ORGAO = {
  nome:'Tribunal de Justiça do Estado do Pará',
  setor:'Setor de Patrimônio',
  comarcas:['Comarca de Belém','Comarca de Marabá','Comarca de Altamira','Comarca de Santarém','Comarca de Ananindeua'],
  unidades:['Almoxarifado Central','1ª Vara Cível de Belém','2ª Vara Criminal de Belém','Secretaria de Administração','Distribuição','Central de Mandados'],
  processo:'0012345-67.2026.8.14.0301',
  sei:'26.0.000148/2026-11'
};

const TAGSTATE = { ATIVO_EM_CUSTODIA:['ok','●','Em custódia'], PENDENTE_ACEITE:['warn','◐','Pendente de aceite'],
  EM_TRANSFERENCIA:['info','→','Em trânsito'], EM_MANUTENCAO:['info','🔧','Em manutenção'],
  AGUARDANDO_BAIXA:['neu','▤','Aguardando baixa'], NAO_LOCALIZADO:['err','!','Não localizado'],
  BAIXADO:['neu','✕','Baixado'], RECEBIDO_TRANSITORIO:['warn','↓','Recebido transitório'],
  CAUTELA_EXTERNA:['info','⌂','Cautela externa'], BEM_APREENDIDO:['gold','§','Bem apreendido'] };

/* Plaquetas NFC (NDEF) — UID registrado no banco, payload assinado */
const TAGS = {
  'TJPA-000456':{uid:'04:A2:7B:9C:11:80:E1',bem:'PAT-000456',d:'Notebook Dell Latitude 3440',c:'Informática',
    e:'PENDENTE_ACEITE',r:'J. Cavalcante',u:'1ª Vara Cível de Belém',l:'Sala 12',v:5180.00,nf:'NE 2026NE00091',
    vida:5,fonte:'NF eletrônica',cat:'CATMAT 4120-0881',proc:null,sit:'ok',obs:'Aguardando aceite há 7 dias'},
  'TJPA-000912':{uid:'04:B7:11:4D:22:90:F3',bem:'PAT-000912',d:'Veículo sedan 1.6 — frota TJPA',c:'Veículo',
    e:'ATIVO_EM_CUSTODIA',r:'Setor de Transportes',u:'Almoxarifado Central',l:'Garagem',v:88900.00,nf:'CT 2023/114',
    vida:15,fonte:'FIPE 25/10/2026',cat:'FIPE 001234-0',proc:null,sit:'ok',obs:'Placa NSX-4A21 · RENAVAM válido · seguro até 03/2027'},
  'TJPA-000330':{uid:'04:C3:8E:2A:33:71:D5',bem:'PAT-000330',d:'Ar-condicionado split 18.000 BTUs',c:'Climatização',
    e:'EM_TRANSFERENCIA',r:'— (em trânsito)',u:'Almoxarifado Central',l:'Sala 3',v:3120.00,nf:'NE 2026NE00150',
    vida:10,fonte:'PNCP 29/10/2026',cat:'CATMAT 3439-0220',proc:null,sit:'warn',obs:'Destino anterior recusou por falta do controle remoto'},
  'TJPA-000204':{uid:'04:D9:5F:6B:44:12:A8',bem:'PAT-000204',d:'Scanner de mesa A4',c:'Informática',
    e:'NAO_LOCALIZADO',r:'R. Lima (último detentor)',u:'Distribuição',l:'Sala 1',v:1880.00,nf:'NE 2022NE00033',
    vida:6,fonte:'NF eletrônica',cat:'CATMAT 4130-0871',proc:null,sit:'err',obs:'Sindicância 014/2026 aberta em 28/10 · BO 00214/2026'},
  'TJPA-000088':{uid:'04:E1:3C:77:55:63:B9',bem:'PAT-000088',d:'Longarina 3 lugares',c:'Mobiliário',
    e:'AGUARDANDO_BAIXA',r:'Almoxarifado',u:'Almoxarifado Central',l:'Depósito',v:1120.00,nf:'NE 2016NE00411',
    vida:10,fonte:'PNCP 29/10/2026',cat:'CATMAT 3310-0112',proc:null,sit:'warn',obs:'Laudo: antieconômico · recuperação = 69% do valor de mercado'},
  'TJPA-APR017':{uid:'04:F4:2D:18:66:54:CA',bem:'APR-000017',d:'Embarcação de alumínio 6 m — apreendida',c:'Bem apreendido',
    e:'BEM_APREENDIDO',r:'Depositário: Oficial de Justiça P. Souza',u:'2ª Vara Criminal de Belém',l:'Pátio de apreensões',
    v:14500.00,nf:'Auto de apreensão 1147/2026',vida:0,fonte:'Laudo de avaliação 22/2026',cat:'Bens apreendidos',
    proc:'0012345-67.2026.8.14.0301',sit:'warn',obs:'Dupla custódia: patrimonial + processual. Revisão obrigatória em 12/2026'},
  'TJPA-000777':{uid:'04:AA:19:05:77:41:EE',bem:'PAT-000777',d:'Ventilador de teto',c:'Climatização',
    e:'BAIXADO',r:'—',u:'Secretaria de Administração',l:'—',v:410.00,nf:'NE 2019NE00220',
    vida:10,fonte:'NF eletrônica',cat:'CATMAT 3439-0101',proc:null,sit:'err',obs:'Baixado em 12/2025 · doado à escola municipal · edital 07/2025'},
  'TJPA-999999':{uid:'04:FF:00:99:88:77:66',bem:'PAT-000999',d:'Tablet 10" (não consta na guia)',c:'Informática',
    e:'RECEBIDO_TRANSITORIO',r:'—',u:'Almoxarifado Central',l:'Sala 3',v:0,nf:'sem nota fiscal',
    vida:4,fonte:'não informado',cat:'a classificar',proc:null,sit:'warn',obs:'Item extra na GR-2026-0148 · aguardando esclarecimento do órgão de origem'}
};
const ORDEM_TAGS = ['TJPA-000456','TJPA-000912','TJPA-APR017','TJPA-000330','TJPA-000204','TJPA-000088','TJPA-999999','TJPA-000777','TJPA-DESC01'];

const BENS = Object.values(TAGS).filter(t=>t.bem!=='PAT-000777').concat([
  {uid:'—',bem:'PAT-000789',d:'Impressora multifuncional laser',c:'Informática',e:'EM_MANUTENCAO',r:'A. Barros',
   u:'Secretaria de Administração',l:'Sala 2',v:2340.00,nf:'NE 2025NE00774',vida:6,fonte:'NF eletrônica',
   cat:'CATMAT 4130-1102',proc:null,sit:'info',obs:'Em garantia até 14/11/2026 — não abrir baixa · OS 2231/2026'},
  {uid:'—',bem:'PAT-000651',d:'Celular institucional (IMEI)',c:'Telefonia',e:'CAUTELA_EXTERNA',r:'Oficial de Justiça P. Souza',
   u:'Central de Mandados',l:'Externo',v:2050.00,nf:'NE 2026NE00070',vida:3,fonte:'NF eletrônica',
   cat:'IMEI 3569••••4412',proc:null,sit:'ok',obs:'Cautela para diligência · devolução prevista 05/11/2026'},
  {uid:'—',bem:'PAT-000561',d:'Armário de aço 2 portas',c:'Mobiliário',e:'ATIVO_EM_CUSTODIA',r:'J. Cavalcante',
   u:'1ª Vara Cível de Belém',l:'Sala 11',v:1490.00,nf:'NE 2024NE00210',vida:10,fonte:'NF eletrônica',
   cat:'CATMAT 3310-0045',proc:null,sit:'ok',obs:'Inventário 2026 confirmado por QR em 15/10'}
]);

const ACEITES = [
  {p:'PAT-000456',d:'Notebook Dell Latitude 3440',m:'atribuído em 23/10/2026 · prazo vence em 30/10',v:5180,
   obs:'Sem ressalvas informadas na entrega.',dias:7},
  {p:'PAT-000330',d:'Ar-condicionado split 18.000 BTUs',m:'transferido de M. Ferreira em 28/10/2026',v:3120,
   obs:'Destino anterior recusou por falta do controle remoto — conferir antes de aceitar.',dias:2}
];
const MEUS = [
  {p:'PAT-000456',d:'Notebook Dell Latitude 3440',desde:'23/10/2026',e:'PENDENTE_ACEITE',inv:false},
  {p:'PAT-000561',d:'Armário de aço 2 portas',desde:'11/03/2024',e:'ATIVO_EM_CUSTODIA',inv:true},
  {p:'PAT-000602',d:'Monitor de vídeo 24"',desde:'11/03/2024',e:'ATIVO_EM_CUSTODIA',inv:true},
  {p:'PAT-000615',d:'Cadeira giratória com braços',desde:'02/08/2023',e:'ATIVO_EM_CUSTODIA',inv:true},
  {p:'PAT-000789',d:'Impressora multifuncional',desde:'14/05/2025',e:'EM_MANUTENCAO',inv:false},
  {p:'PAT-000651',d:'Celular institucional (IMEI)',desde:'10/01/2026',e:'CAUTELA_EXTERNA',inv:true}
];
const PEND = [
  {f:'baixa',t:'Laudo de baixa — Longarina (PAT-000088)',m:'Antieconômico: recuperação = 69% do valor de mercado (PNCP 29/10). Autora: Maria R. Souza.',tags:[['neu','Baixa'],['warn','Antieconômico']],seg:true},
  {f:'baixa',t:'Laudo de baixa — Scanner (PAT-000204)',m:'Extravio · BO 00214/2026 anexado · sindicância 014/2026 aberta. Autor: C. Menezes.',tags:[['neu','Baixa'],['err','Extravio + BO']]},
  {f:'excecao',t:'Item extra na GR-2026-0148 — Tablet (PAT-000999)',m:'Não consta na remessa e não há nota fiscal. Sugestão: tombar como exceção e pedir esclarecimento ao órgão de origem.',tags:[['warn','Exceção de guia']]},
  {f:'excecao',t:'Plaqueta ilegível (PAT-000310) — OCR com 61% de confiança',m:'Série informada SN-88214-X9. Exige confirmação humana antes de tombar.',tags:[['warn','OCR'],['info','Série']]},
  {f:'transf',t:'Transferência contestada — Ar-condicionado (PAT-000330)',m:'Destino recusou: chegou sem controle remoto. Bem retorna à origem com foto da recusa.',tags:[['info','Transferência'],['err','Recusa']]},
  {f:'desl',t:'Checklist de desligamento — A. Nunes (exonerado em 27/10)',m:'3 bens em carga. Devolução guiada por bipagem. Bloqueia Certidão Nada Consta.',tags:[['err','Bloqueio'],['neu','Desligamento']]},
  {f:'apreen',t:'Revisão de bem apreendido — Embarcação APR-000017',m:'Prazo de revisão venceu. Confirmar depositário e local nos autos 0012345-67.2026.8.14.0301.',tags:[['gold','Bem apreendido'],['warn','Prazo']]},
  {f:'sync',t:'Conflito de sincronização — PAT-000123 bipado duas vezes offline',m:'Dois conferentes, 08:14 e 08:19, sem conexão. Escolher qual leitura vale.',tags:[['warn','Offline'],['info','Conflito']]}
];
const PERFIS = [
  {c:'gp',n:'Gestor de Patrimônio',u:'Maria R. Souza',i:'matrícula 20.441-7 · gov.br ouro',ini:'MR',
   d:'Recebe lotes, bipa, tomba, prepara laudos e conduz inventário. Não aprova a própria baixa.'},
  {c:'gu',n:'Gestor de Unidade',u:'M. Ferreira',i:'matrícula 15.002-1 · Diretor de Secretaria · gov.br ouro',ini:'MF',
   d:'Aprova atribuições, transferências e baixas da sua unidade — nunca a própria.'},
  {c:'dt',n:'Detentor de Bens',u:'J. Cavalcante',i:'matrícula 18.204-3 · Técnico Judiciário · gov.br prata',ini:'JC',
   d:'Aceita, recusa, reporta avaria, pede transferência e cautela, confirma inventário.'},
  {c:'ci',n:'Conferente de Inventário',u:'Ana Prado',i:'designada para a campanha INV-2026 até 31/12',ini:'AP',
   d:'Perfil temporário com escopo de campanha. Só bipa e registra divergência.'},
  {c:'au',n:'Auditoria / Controle Interno',u:'Controle Interno TJPA',i:'somente leitura · trilha registrada',ini:'CI',
   d:'Lê tudo, verifica a hash chain e a trilha de acesso. Não altera nem aprova.'},
  {c:'ad',n:'Administrador do Sistema',u:'TI do órgão',i:'não aprova negócio',ini:'TI',
   d:'Perfis, delegações, parâmetros e conectores de dados.'}
];
/* abas por perfil — aba sem permissão não aparece */
const NAV = {
  gp:[['hoje','Hoje','🏠'],['ler','Ler','nfc'],['bens','Bens','📦'],['pend','Aprovar','✅'],['perfil','Perfil','👤']],
  gu:[['hoje','Hoje','🏠'],['ler','Ler','nfc'],['bens','Bens','📦'],['pend','Aprovar','✅'],['perfil','Perfil','👤']],
  dt:[['hoje','Hoje','🏠'],['ler','Ler','nfc'],['meus','Meus bens','🙋'],['bens','Bens','📦'],['perfil','Perfil','👤']],
  ci:[['hoje','Hoje','🏠'],['ler','Ler','nfc'],['bens','Bens','📦'],['pend','Divergências','⚠'],['perfil','Perfil','👤']],
  au:[['hoje','Hoje','🏠'],['ler','Ler','nfc'],['bens','Bens','📦'],['pend','Fila','✅'],['perfil','Perfil','👤']],
  ad:[['hoje','Hoje','🏠'],['ler','Ler','nfc'],['bens','Bens','📦'],['pend','Fila','✅'],['perfil','Perfil','👤']]
};
