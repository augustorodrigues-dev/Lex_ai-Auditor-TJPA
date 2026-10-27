/* ==================================================================
   ESTADO
================================================================== */
let perfil='gp', aba='hoje', offline=false, leituras=[], fila=[], selPend=new Set(), filtroPend='all', filtroBem='all';
const $=id=>document.getElementById(id);
const fmtBRL=v=>v?v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—';

// Protege valores inseridos nos atributos HTML dos templates.
const escapeAttr = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
