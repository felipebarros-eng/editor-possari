# Editor de documentos da Biblioteca Possari

Este repositório é um **site estático** (GitHub Pages) com um editor de documentos parecido com o Word, que roda
**inteiro no navegador** de quem usa. A Biblioteca de Peças (Google Apps Script) mostra este editor dentro da própria
página para editar as peças `.docx` sem servidor e sem custo.

Endereço: `https://felipebarros-eng.github.io/editor-possari/possari.html`

## Os documentos não ficam aqui

Aqui só está o programa (HTML, JavaScript, WebAssembly e fontes). **Nenhum documento do escritório é enviado para o
GitHub nem para outro servidor.** O caminho de uma peça é:

```
Google Drive  ->  Biblioteca (Apps Script)  ->  possari.html (este site, no navegador)  ->  editor
        ^                                                                                    |
        +----------------- bytes do .docx / .pdf salvo, pelo mesmo caminho -----------------+
```

- Os bytes do arquivo passam de uma página para a outra por mensagens do navegador (`postMessage`), dentro do
  computador de quem está editando.
- `possari.html` só conversa com a Biblioteca (endereços `https://…-script.googleusercontent.com`) e sempre informa o
  destinatário exato da mensagem (nunca `'*'`). Mensagens de outras páginas são ignoradas.
- Quem grava no Drive é sempre a Biblioteca. O Ctrl+S, o disquete e "Arquivo › Salvar" do editor só pedem à
  Biblioteca que salve (`pedido-salvar`); o editor continua mostrando "alterações não salvas" até a Biblioteca
  salvar de fato.
- Todas as páginas têm uma *Content-Security-Policy* que só deixa o editor carregar e pedir arquivos deste próprio site
  (mais `blob:`/`data:`, que são da memória do navegador). Mesmo que algo tentasse, o navegador bloqueia o envio de
  dados para qualquer outro endereço.

## O que tem aqui

| Caminho | O que é |
|---|---|
| `possari.html`, `possari.js` | A ponte entre a Biblioteca e o editor (escrita para a Possari). |
| `onlyoffice.html` | Página que carrega o editor (do build original, com as correções abaixo). |
| `9.3.0.133-…/vendor/` | O editor ONLYOFFICE 9.3.0.133 só com a parte de texto (Word): `sdkjs`, `web-apps`, `x2t.wasm` (conversor de arquivos) e `fonts`. |
| `fontes/LICENCAS.md`, `fontes/licencas/` | Lista de cada fonte com a sua licença e os textos das licenças. |
| `ferramentas/montar.py` | Script que monta a pasta do editor a partir do build original e aplica as correções. |
| `ferramentas/service_worker.js` | O service worker do editor (escrito para a Possari). O `montar.py` o copia para `9.3.0.133-…/vendor/document_editor_service_worker.js`, no lugar do que vem no build (seção "Cache do editor"). |
| `ferramentas/relatorio_fontes.tsv` | Classificação de todas as fontes do build (o que ficou e o que saiu, e por quê). |
| `LICENSE.txt` | Licença do editor: GNU AGPL versão 3. |
| `.nojekyll` | Diz ao GitHub Pages para publicar os arquivos como estão. |
| `.gitignore` | Impede que arquivos gerados pelo Python (`__pycache__/`, `*.pyc`) entrem no repositório. |

## Licença e de onde veio o código

- O editor é o **ONLYOFFICE Docs** (© Ascensio System SIA), software livre sob a **GNU AGPL v3** (`LICENSE.txt`).
  Código-fonte original: <https://github.com/ONLYOFFICE/sdkjs>, <https://github.com/ONLYOFFICE/web-apps> e
  <https://github.com/ONLYOFFICE/core> (conversor `x2t`).
- A versão que roda sem servidor (compilada para o navegador, com o `x2t` em WebAssembly) é a do repositório
  <https://github.com/fernfei/OnlyofficePersonal>, branch `9.3.0.133` (commit `7583158067fb0c9bdb312cbdc76d4f9fa32ef6c9`).
  `ferramentas/montar.py` usa sempre esse commit e confere o sha256 dos arquivos principais (`x2t.wasm`, `sdk-all.js`,
  `sdk-all-min.js`, `app.js`, `api.js` e os que ele corrige) antes de mexer em qualquer coisa; se algo mudou, ele para.
- Como pede a AGPL (§7 b/e), o logotipo e a tela "Sobre" do ONLYOFFICE continuam no editor, e "ONLYOFFICE" **não** é
  usado como nome deste produto.
- Este site é uma versão **modificada** (AGPL §5). Alterações feitas pela Possari em outubro e novembro de 2026, todas aplicadas
  por `ferramentas/montar.py` (o script confere o texto original de cada trecho antes de trocar):
  1. cópia só da parte de texto (sem planilhas, apresentações, ajuda online e arquivos `.map`);
  2. retiradas as fontes que não podem ser redistribuídas; as famílias delas usam fontes livres de mesmas medidas
     (Arial → Liberation Sans, Times New Roman → Liberation Serif, Calibri → Carlito, Cambria → Caladea…);
  3. `postMessage` com destino `'*'` que levavam o arquivo ou eventos para a janela de cima (`onlyoffice.html`,
     `x2t_helper.js`, `api.js`, `app.js`, `sdk-all-min.js`) agora usam a origem do próprio site, e `onlyoffice.html`
     só aceita comandos de páginas deste site;
  4. *Content-Security-Policy* em todas as páginas;
  5. correção de uma corrida do build (com o editor no cache, o documento podia chegar antes do catálogo de fontes e
     a abertura falhava);
  6. textos de erro em português e `lang="pt-BR"` no `onlyoffice.html`. No mesmo arquivo, também: sai o
     `<link rel="icon">` do build (o favicon daria 404, porque a pasta `assets/` não vem) e o seletor do quadro do editor
     passa de `#editor iframe` para `iframe[name="frameEditor"]` (o `api.js` troca o `<div id="editor">` pelo quadro).
     Hoje esta troca não muda nada: a marca `OO_FILE_STREAM_ONLY` já vale no próprio `onlyoffice.html`, e o
     `x2t_helper.js` a procura nas janelas de cima;
  7. mais tempo (10 minutos em vez de 60 segundos) para o conversor `x2t.wasm` (42 MB) carregar na primeira abertura
     com internet lenta. Abaixo de uns 6 a 10 Mbit/s, a abertura falhava com "Ocorreu um erro ao abrir o arquivo";
  8. nomes dos estilos em português como no Word (`locale/pt.json`, que é o arquivo que o editor carrega em pt-BR):
     Title → "Título", Subtitle → "Subtítulo", Heading 1…9 → "Título 1…9", Quote → "Citação",
     Intense Quote → "Citação Intensa" (antes: "Titulo", "Legenda", "Cabeçalho 1…9", "Citar"; Caption continua "Legenda");
  9. o conversor `x2t` guarda as fontes do documento entre uma conversão e outra (`x2t_helper.js`). Antes ele baixava de
     novo e regravava todas a cada conversão (22 arquivos, 7 MB numa peça comum), inclusive ao gerar o `.docx`, que não
     usa fontes; agora só busca quando falta alguma, e o `.docx` não busca nenhuma. O "Gerar PDF" da Biblioteca (salva o
     `.docx` e exporta o PDF) pagava isso duas vezes, e depois dos 10 minutos de cache do GitHub Pages eram 44
     revalidações de fontes por clique;
  10. (v15.4) saíram os 3 pedidos que davam 404 em toda abertura: `themes.json` (temas extras de um servidor de
      documentos, `app.js`) e o dicionário `en_US` do corretor (`dictionaries/en_US/en_US.aff` e `.dic`, `spell.js`;
      este site não tem dicionários e o corretor fica desligado). O editor fica exatamente como ficava com os 404: sem
      temas extras, e o dicionário que não chega nunca é usado;
  11. (v15.4) o *service worker* do build (`vendor/document_editor_service_worker.js`, que o editor registra) foi trocado
      pelo `ferramentas/service_worker.js`. O do build buscava tudo na rede e só usava a cópia dele sem internet: online
      só atrasava (+0,5 s por peça) e regravava ~137 MB no disco a cada abertura. O novo serve os arquivos do programa
      direto do *Cache Storage* do navegador, um cache por versão do site, e só guarda o arquivo que tem o tamanho certo
      (o `montar.py` grava nele o tamanho de cada arquivo do programa; seção "Cache do editor").
- `possari.html` e `possari.js` não vêm do ONLYOFFICE: são a ponte escrita para a Possari.
  Ela também muda o comportamento do editor em tempo de execução: troca a função de salvar do editor (`asc_Save`, usada
  pelo Ctrl+S, pelo disquete e por "Arquivo › Salvar") por um aviso à Biblioteca, e marca o documento como salvo só
  depois que a Biblioteca recebe o `.docx`. Uns 2 segundos depois que o documento abre, com o navegador ocioso, ela pede
  ao conversor que já guarde as fontes do documento (alteração 9), para o primeiro PDF não esperar por elas.
  Para telas pequenas (seção abaixo), ela abre o editor compacto quando a Biblioteca pede, só com opções de
  configuração do próprio ONLYOFFICE (`customization`), e ajusta o zoom pela API do editor quando a folha não cabe na
  largura. Antes de carregar o editor, ela pede ao navegador que confira se o service worker do site mudou (seção
  "Cache do editor"). Nada disso muda o código do editor: não há alteração nova na lista acima.
- `ferramentas/service_worker.js` também não vem do ONLYOFFICE: foi escrito para a Possari e substitui o do build
  (alteração 11).
- As fontes têm licenças próprias (OFL, Apache, GPL com exceção de fontes etc.): veja `fontes/LICENCAS.md`.

## Como a Biblioteca conversa com a ponte (`possari.html`)

| Sentido | Mensagem |
|---|---|
| ponte → Biblioteca | `{type:'ponte-pronta', versao:'1'}` ao carregar |
| Biblioteca → ponte | `{type:'abrir', nome, bytes:ArrayBuffer, usuario:{id, nome}, interface:{compacta:true}}`. O campo `interface` é opcional (desde a v15.3): com `compacta:true` o editor abre compacto (seção "Telas pequenas"); sem ele, ou com `compacta:false`, abre como sempre. Uma ponte antiga ignora o campo |
| ponte → Biblioteca | `{type:'documento-pronto'}` |
| ponte → Biblioteca | `{type:'alterado', alterado:true/false}` quando o documento passa a ter (ou deixa de ter) alterações não salvas. Só vira `false` depois de um `salvar` docx bem-sucedido em que ninguém editou durante o salvamento |
| ponte → Biblioteca | `{type:'pedido-salvar'}` quando a pessoa usa Ctrl+S, o disquete ou "Arquivo › Salvar" no editor. A Biblioteca faz o mesmo que o seu botão Salvar (pede `salvar` docx e grava no Drive). O editor não gera arquivo nem deixa de estar modificado por causa disso |
| Biblioteca → ponte | `{type:'salvar', requestId, formato:'docx' ou 'pdf'}`. Pedidos seguidos são atendidos um de cada vez, na ordem em que chegaram, e cada um recebe o seu `salvo`: a Biblioteca pode pedir o `pdf` logo depois do `docx`, sem esperar a resposta |
| ponte → Biblioteca | `{type:'salvo', requestId, ok, formato, buffer}` (ou `ok:false` com `erro`) |
| Biblioteca → ponte | `{type:'estilo', nome:'Heading 1'}` aplica ao parágrafo atual o estilo com esse nome (`Title`, `Subtitle`, `Normal`, `Heading 1/2/3`…) |
| ponte → Biblioteca | `{type:'erro', erro}`: `estilo-desconhecido` (o documento não tem esse estilo), `documento-nao-aberto`, `arquivo-invalido` ou erro do editor |

A ponte só aceita mensagens da janela que a contém (`window.parent`) vindas de `https://<algo>-script.googleusercontent.com`
(ou `http://localhost`/`127.0.0.1`, para testes) e responde sempre para essa origem.

Endereço que a Biblioteca usa no iframe: `possari.html#origem=<location.origin da Biblioteca, com encodeURIComponent>`,
por exemplo `possari.html#origem=https%3A%2F%2Fn-abc123-script.googleusercontent.com`. Para saber a quem mandar a
primeira mensagem (`ponte-pronta`), a ponte usa, nesta ordem: `location.ancestorOrigins[0]` (Chrome, Edge, Safari;
quando existe, vale sozinho), a origem do `#origem` (Firefox não tem `ancestorOrigins`) e `document.referrer` (o Apps
Script pode não mandar). Todas passam pela mesma lista de origens permitidas; um `#origem` fora dela é ignorado. Mesmo
que alguém coloque um `#origem` falso, o navegador só entrega a mensagem se a janela de cima for de fato dessa origem, e
o que chega dela continua sendo conferido.

## Telas pequenas (interface compacta e zoom automático)

Nos monitores do escritório (1366×600, 1024×600 de área útil dentro do navegador e da intranet), o editor normal usa
uns 175 px de altura com cabeçalho, abas, faixa de botões, régua e barra de status, e sobra pouca folha. A partir da
v15.3, a Biblioteca pode pedir o editor compacto no `abrir`, com `interface:{compacta:true}`.

O compacto usa só opções de configuração do próprio ONLYOFFICE 9.3 (`editorConfig.customization`); o código do editor
não muda:

| Opção | O que faz |
|---|---|
| `compactHeader` | A linha de cima (logotipo, nome do arquivo, salvar, imprimir, desfazer) some e o que ela tinha vai para a linha das abas e para a faixa de botões. O logotipo do ONLYOFFICE continua à esquerda das abas (AGPL §7 b). Ganho: 24 px |
| `toolbarHideFileName` | Sem o nome do arquivo na linha das abas; a Biblioteca já mostra o nome da peça na barra dela |
| `hideRulers` | Sem as réguas: 26 px a mais na altura e 19 px na largura. "Ver › Regras" (é como o editor em português chama as réguas) mostra de novo |
| `compactToolbar` | Só quando a área do editor tem menos de 420 px de altura: a faixa de botões abre recolhida (ficam as abas, e um clique na aba mostra os botões) |

Continuam como estão as abas, a faixa de botões aberta (negrito, fontes, alinhamento, galeria de estilos), os menus da
esquerda (busca, comentários, títulos, "Sobre") e da direita, e a barra de status, que é o único lugar com
"Página X de Y", contagem de palavras, controle de alterações e zoom. Num editor de 512 px de altura (a vista do
editor da Biblioteca num monitor de 1366×600), a folha passa de 339 para 389 px de altura.

Sem `interface`, ou com `compacta:false` (ou qualquer valor que não seja `true`), o editor abre igual à v15.2.

Zoom automático, com ou sem compacto:

- Se a folha não cabe na largura do editor a 100%, a ponte liga o "Ajustar largura" do próprio editor (por exemplo,
  76% numa área de 760 px). Ele acompanha a janela e os painéis que abrem ao lado da folha (títulos, comentários,
  busca). Quando a folha volta a caber, a ponte volta para 100%.
- Nunca passa de 100%. Num monitor de 1366 px, o "Ajustar largura" puro abriria a folha a uns 150%, e num monitor
  baixo ela mostraria um terço a menos de texto. Nos tamanhos do escritório (1024, 1280, 1366 e 1600 px de largura) a
  folha cabe e fica a 100%, como antes.
- A ponte só mexe se o documento abriu no zoom padrão (100%). Quem escolheu outro em "Arquivo › Configurações
  avançadas › Valor de zoom padrão" fica com o seu, e quando a pessoa muda o zoom (botões da barra de status, Ctrl +
  roda do mouse, aba Ver), a ponte para de mexer até a próxima peça.

O que a pessoa escolhe no próprio editor ("Ver › Regras", "Ver › Barra de status", "Ver › Sempre mostrar a barra de
ferramentas", zoom padrão) fica guardado pelo editor neste navegador e vale por cima dos valores iniciais acima, nos dois
modos. O compacto em si não fica guardado: a próxima peça aberta sem `interface` abre normal.

## Cache do editor (service worker, desde a v15.4)

O editor tem uns 75 MB (o conversor `x2t.wasm` sozinho tem 42 MB). O GitHub Pages manda guardar cada arquivo por só
10 minutos; depois disso, a cada peça aberta o navegador perguntava ao site por uns 95 arquivos ("mudou?"). E o
`x2t.wasm` pode nem caber no cache comum do Chrome (que não guarda arquivos maiores que 1/8 do tamanho dele) e ser
baixado de novo a cada peça: 3 a 7 segundos a mais.

O *service worker* (`ferramentas/service_worker.js`, registrado pelo próprio editor com escopo `9.3.0.133-…/vendor/`):

- serve os arquivos do programa do *Cache Storage* do navegador, sem ir à rede. Só busca na rede o que ainda não
  tem e guarda se veio inteiro e certo: resposta 200 deste site, sem redirecionamento, que não seja uma página HTML no
  lugar de outro arquivo e que tenha exatamente o tamanho daquele arquivo nesta versão (a lista `TAMANHOS`, gravada
  pelo `montar.py`). Como o que fica guardado não volta à rede, uma página de bloqueio de um proxy ou antivírus com 200
  no lugar do `x2t.wasm`, guardada, deixaria o editor sem abrir nenhuma peça naquele navegador; agora ela chega à
  página como veio, não é guardada, e a peça seguinte busca de novo (testado). A conferência é só pelo tamanho: um
  arquivo de outra versão com o mesmo número de bytes seria guardado. O arquivo é lido na memória antes de ser
  guardado: com o disco do computador quase cheio (~1% livre), o Chrome não guardava de outro jeito o `x2t.wasm` nem o
  `sdk-all.js`, e o ganho sumia sem aviso (testado);
- só guarda arquivos do programa: pedidos `GET` de `vendor/web-apps/`, `vendor/sdkjs/` e `vendor/fonts/`. **Nunca guarda
  documento**: a peça chega por `postMessage` e vira `blob:`, que não passa pelo service worker. `possari.html`,
  `possari.js`, `onlyoffice.html` e respostas com erro (404, 500, parciais) também nunca são guardados;
- usa um cache por versão do site: `editor-possari-<resumo>`, em que o resumo é o sha256 de todos os arquivos do editor
  já corrigidos, calculado pelo `montar.py`. Qualquer mudança no editor muda o resumo, e com ele o service worker;
- quando o site muda, a 1ª peça aberta depois já é toda da versão nova. Por conta própria, o navegador só conferia o
  service worker depois de abrir o editor, já servido pelo service worker antigo: a 1ª peça rodava o programa velho
  com a ponte nova, e a versão nova só valia da 2ª em diante. Agora a ponte (`possari.js`) pede essa conferência antes
  de carregar o editor e, se houver um service worker novo, espera ele instalar (no máximo 2 s; sem service worker ou
  com erro, segue na hora). Custo: uma ida ao GitHub a mais, antes do editor, em toda peça (~0,13 s medidos com 120 ms
  por pedido e a leitura do Drive instantânea); no uso real ela corre junto com a leitura da peça no Drive, que demora
  mais, e quase sempre fica escondida. O novo só assume quando nenhum editor da versão anterior está aberto: uma peça
  aberta naquele momento (em outra aba, por exemplo) continua com os arquivos da versão com que começou, e, enquanto
  ela continuar aberta, as peças abertas em outras abas do mesmo navegador também rodam o programa anterior, com a
  ponte nova (as duas falam o mesmo protocolo; testado). Depois que ela fechar, a peça seguinte já vem toda nova. A
  outra exceção é voltar o site para a v15.3, que não tem essa conferência (veja abaixo). Ao assumir, ele apaga
  os caches das versões anteriores (e o `document_editor_static_…` do service worker do build). Caches de outros sites
  no mesmo endereço `felipebarros-eng.github.io` não são tocados. `possari.html`, `possari.js`, `onlyoffice.html` e
  `api.js` ficam fora do service worker e seguem o cache comum (até 10 minutos depois de publicar, podem vir da versão
  anterior, como antes da v15.4);
- cada arquivo da versão nova é conferido com o site uma vez (`no-cache`), para não guardar um arquivo antigo que ainda
  estivesse no cache comum do navegador logo depois de publicar.

O navegador guarda isso por site de cima: na intranet é um cache, abrindo a Biblioteca direto pelo `script.google.com`
é outro. Se o navegador não deixar o service worker funcionar, o editor funciona igual, só com o cache comum, como
antes da v15.4 (testado). Isso acontece com **"Bloquear cookies de terceiros"** ligado no Chrome (ou a política
`BlockThirdPartyCookies` da empresa): dentro da intranet o editor é um site de terceiro, e o Chrome 153 não deixa
terceiros registrarem service worker nem usarem o Cache Storage nesse modo. Deve acontecer o mesmo na janela anônima,
que bloqueia cookies de terceiros por padrão (não testado). Para conferir num PC: DevTools (F12) › Network, abrir uma
peça duas vezes; na segunda, o `x2t.wasm` deve aparecer como "(ServiceWorker)".

O nome do cache resume os arquivos do editor, não o service worker. Uma mudança só no `ferramentas/service_worker.js`
(refeito com `python3 ferramentas/montar.py --so-service-worker`, sem baixar o build) mantém o cache e o que já está nele.

**Limpar o cache do editor num computador** (se um dia o editor não abrir em um PC só): no Chrome, abra a Biblioteca
pela intranet e **abra uma peça** (mesmo que ela não chegue a abrir). Sem peça aberta, o editor não está na página e o
F12 não mostra o cache dele. Com ela aberta, F12 › **Aplicativo** (*Application*) › **Armazenamento em cache** (*Cache
storage*): clique com o botão direito em cada `editor-possari-…` › **Excluir**. A peça seguinte busca o editor de novo
(até ~75 MB; o que ainda estiver no cache comum do Chrome não é baixado outra vez). Isso vale para o lugar onde a peça
foi aberta: o cache é separado por site de cima (a intranet é um; a Biblioteca aberta direto pelo `script.google.com` é
outro). Último recurso, fora da Biblioteca: abrir `https://felipebarros-eng.github.io/editor-possari/possari.html`,
F12 › Aplicativo › **Armazenamento** (*Storage*) › **Limpar dados do site** (*Clear site data*). Isso apaga **tudo** o que
`felipebarros-eng.github.io` guardou quando aberto direto, também de outros sites do GitHub Pages dessa conta, e não
alcança o cache usado dentro da intranet.

**Voltar o site para a versão anterior (v15.3).** Como: no clone do repositório, `git revert` do(s) commit(s) da v15.4
(ou troque o conteúdo pelo da pasta `editor_site_v15_3`: `rsync -a --delete --exclude .git editor_site_v15_3/
editor-possari/`, `git add -A` e `git commit -m "Editor: volta para a v15.3"`) e `git push origin main main:gh-pages`. Em 1
ou 2 minutos o GitHub Pages publica. O editor funciona, com duas diferenças:

- a **1ª peça** de cada navegador depois da volta ainda roda o programa da v15.4 guardado (com a ponte, o
  `onlyoffice.html` e o `api.js` da v15.3): a ponte da v15.3 não pede ao navegador que confira o service worker antes de
  carregar o editor. Vale para cada lugar onde a Biblioteca abre (a intranet e o `script.google.com` têm caches
  separados). Se a volta for por causa de um defeito do programa da v15.4, essa peça ainda o tem: feche-a (**Voltar**) e
  abra de novo; da 2ª peça em diante, tudo é da v15.3 (testado);
- o service worker da v15.3 (o do build) só apaga os caches `document_editor_static_…`: cada navegador fica com o
  `editor-possari-…` da v15.4 (~75 MB) sem uso, além do cache da v15.3. Ele é reaproveitado (ou apagado, se for de outra
  versão) quando o site da v15.4 for publicado de novo, ou pode ser apagado como acima.

Para voltar e manter a volta sem esses ~75 MB, publique a v15.3 com uma mudança no
`9.3.0.133-…/vendor/document_editor_service_worker.js` dela, na função de ativação: troque a linha

`if (cache.includes(g_cacheNamePrefix) && !cache.includes(g_cacheName)) {`

por

`if ((cache.includes(g_cacheNamePrefix) && !cache.includes(g_cacheName)) || cache.indexOf('editor-possari-') === 0) {`

(com `||`; ligada com `&&`, nada é apagado). Testado na revisão: da 2ª peça em diante fica só o cache da v15.3, também
com o navegador reaberto; publicar a v15.4 de novo refaz o `editor-possari-…`.

Os números (A/B com a v15.3, no Chromium 153) estão na seção "Tamanho".

## Como atualizar o editor

1. Num computador com `git` e Python 3, dentro desta pasta: `python3 ferramentas/montar.py`
   (baixa o build do GitHub; ou `--origem <pasta>` com um clone já baixado). O script apaga e recria só a pasta
   `9.3.0.133-…`, `onlyoffice.html`, `LICENSE.txt`, `fontes/LICENCAS.md` e `ferramentas/relatorio_fontes.tsv`.
2. Para uma versão nova, troque `VERSAO`, `COMMIT`, `V` e os valores de `SHA256_DO_BUILD` no começo do script
   (confira o código novo antes). Se o commit ou um arquivo não for o esperado, ou se o build mudou um trecho que o
   script corrige, ele para e diz qual: ajuste a correção antes de publicar. O último passo do script grava o service
   worker com o resumo e os tamanhos dos arquivos do editor: **não mude nada dentro de `9.3.0.133-…` à mão**; mude o
   `montar.py` e rode de novo (o teste confere que o resumo e os tamanhos do service worker batem com os arquivos
   publicados). Para mudar só o service worker, edite `ferramentas/service_worker.js` e rode
   `python3 ferramentas/montar.py --so-service-worker`.
3. Rode o teste automático (fica com a equipe, fora deste repositório: `editor_site_testes_v15_4/teste.js`), que abre uma
   peça de exemplo, edita, salva `.docx`/`.pdf` e confere a segurança.
4. Publique: commit e push nos ramos `main` e `gh-pages` (`git push origin main main:gh-pages`). O GitHub Pages
   publica o ramo `gh-pages`, pasta raiz. Nenhum arquivo pode passar de 95 MB (o maior hoje é o `x2t.wasm`, com 40 MB).

## Tamanho

- Site inteiro: 1.300 arquivos, 302 MB (fontes 155 MB, `sdkjs` 60 MB, `x2t.wasm` 40 MB, `web-apps` 47 MB).
- Na primeira abertura o navegador baixa só o necessário: 74 arquivos, 74 MB sem compressão (cerca de 56 MB com a
  compressão que o GitHub Pages aplica a HTML/JS/CSS, ou 23 MB se ele comprimir também o `.wasm`). Das 186 fontes,
  só vêm as usadas (21 arquivos, 7 MB: Liberation, Carlito, Caladea, OpenSymbol).
- Nas aberturas seguintes os arquivos do programa vêm do service worker, sem ir à rede, mesmo depois dos 10 minutos
  do GitHub Pages. Antes dos 10 minutos o navegador só confere o próprio service worker (2 ou 3 pedidos de 0 byte,
  304: o do navegador e o da ponte, que pede a conferência antes do editor); depois, também `possari.html`,
  `possari.js`, `onlyoffice.html` e `api.js`, que ficam fora do escopo dele: 6 ou 7 pedidos de 0 byte, contra uns 95
  antes.
- A/B v15.3 × v15.4 no Chromium 153, peça de exemplo, iframe novo a cada peça (como a Biblioteca), site servido
  localmente com os cabeçalhos do GitHub Pages; medianas de 3 a 5 rodadas intercaladas (medido antes de a ponte
  conferir o service worker, que acrescenta 1 pedido de 0 byte por peça):

  | Situação | v15.3 | v15.4 | sem service worker (só cache HTTP) |
  |---|---|---|---|
  | Peça aberta antes dos 10 min (cache válido) | 1,79 s | 1,36 s | 1,30 s |
  | Idem, com 45 s entre uma peça e outra (service worker parado) | 1,74 s | 1,44 s | 1,44 s |
  | Depois dos 10 min (tudo vencido, 50 ms por pedido) | 2,33 s, 99 pedidos | 1,62 s, 5 pedidos | 2,02 s, 95 pedidos |
  | Navegador reiniciado, cache vencido (50 ms por pedido) | 3,16 s | 1,97 s | 2,57 s |
  | Navegador reiniciado, cache ainda válido | 2,33 s | 1,93 s | 1,66 s |
  | Gravado em disco por abertura | ~240 MB | ~80 MB | ~77 MB |
  | Cache HTTP de 80, 200 ou 320 MiB: baixado a cada peça | 42 a 56 MB (`x2t.wasm` sempre) | 0 (`x2t.wasm` do service worker) | 42 a 56 MB |

  Os tempos são de rede local, sem limite de velocidade: baixar de novo os 42 MB do `x2t.wasm` custaria mais uns 3,4 s
  a 100 Mbit/s (conta, não medido). A primeira abertura num navegador (ou depois de publicar uma versão nova) fica uns
  0,3 s mais lenta que sem service worker, porque ele guarda os arquivos; o mesmo acontecia com o do build.
