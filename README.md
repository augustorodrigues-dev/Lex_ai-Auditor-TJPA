# Custódia de Bens — app móvel

Protótipo de demonstração do TJPA com dados fictícios. HTML, CSS e JavaScript puro, sem dependências de instalação ou etapa de build.

## Como abrir

Abra `app-mobile.html` diretamente no navegador. Para entrar na demonstração de leitura, use `app-mobile.html?demo=ler`.

Também é possível servir a pasta localmente:

```sh
python3 -m http.server 8000
```

Depois, acesse `http://localhost:8000/app-mobile.html`.

## Organização

```text
app-mobile.html              Estrutura das seis telas, diálogos e login
assets/
  css/
    styles.css               Tokens, layout, componentes e classes das telas
  js/
    data.js                  Dados fictícios, estados dos bens, perfis e abas
    state.js                 Estado compartilhado e auxiliares de formatação
    feedback.js              Sons e vibração
    reader.js                NFC, entrada manual, resultados e sessão de leitura
    sync.js                  Fila em memória e simulação de conectividade
    navigation.js            Navegação, escopo das pendências e contadores
    views.js                 Renderização e ações de bens, pendências e perfis
    ui.js                    Toasts, diálogos, ajustes e sessão de demonstração
    app.js                   Eventos e inicialização
```

Os scripts clássicos usam `defer`: executam após a leitura do HTML e na ordem declarada. Compartilham o mesmo escopo, preservando a abertura direta pelo navegador. Mantenha a ordem dos scripts ao editar o HTML; `app.js` deve ser o último.

Os eventos ficam em `app.js`, inclusive os dos elementos gerados dinamicamente. O HTML informa a ação por atributos `data-action` e `data-change`; os parâmetros usam `data-value` e `data-index`. Os estilos ficam em `styles.css`; JavaScript continua atualizando os valores que dependem do estado, como a largura das barras de progresso.

## Análise do arquivo original

O arquivo único reunia seis telas (Hoje, Ler bem, Bens, Pendências, Meus bens e Perfil), diálogos, login, um bloco CSS e um bloco JavaScript. O JavaScript misturava dados de demonstração, estado, regras de leitura, renderização, eventos inline e inicialização. Havia estilos inline tanto na estrutura estática quanto nos templates das telas.

A reestruturação mantém os dados, textos, regras e fluxos existentes. Os estilos inline foram convertidos em classes CSS, e os eventos inline foram substituídos por eventos delegados, sem executar código contido em atributos HTML.

## Limites da demonstração

A fila e as alterações de estado ficam em memória e são reiniciadas ao recarregar a página. Login, assinatura, sincronização, QR por câmera e integrações institucionais são simulações; a descrição de PWA na interface não corresponde a um service worker ou manifesto implementado. NFC real depende de aparelho e navegador compatíveis, permissão e contexto seguro. A separação dos arquivos não implementa essas integrações.
