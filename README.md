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
| `ferramentas/relatorio_fontes.tsv` | Classificação de todas as fontes do build (o que ficou e o que saiu, e por quê). |
| `LICENSE.txt` | Licença do editor: GNU AGPL versão 3. |
| `.nojekyll` | Diz ao GitHub Pages para publicar os arquivos como estão. |

## Licença e de onde veio o código

- O editor é o **ONLYOFFICE Docs** (© Ascensio System SIA), software livre sob a **GNU AGPL v3** (`LICENSE.txt`).
  Código-fonte original: <https://github.com/ONLYOFFICE/sdkjs>, <https://github.com/ONLYOFFICE/web-apps> e
  <https://github.com/ONLYOFFICE/core> (conversor `x2t`).
- A versão que roda sem servidor (compilada para o navegador, com o `x2t` em WebAssembly) é a do repositório
  <https://github.com/fernfei/OnlyofficePersonal>, branch `9.3.0.133` (commit `7583158067fb0c9bdb312cbdc76d4f9fa32ef6c9`).
- Como pede a AGPL (§7 b/e), o logotipo e a tela "Sobre" do ONLYOFFICE continuam no editor, e "ONLYOFFICE" **não** é
  usado como nome deste produto.
- Este site é uma versão **modificada** (AGPL §5). Alterações feitas pela Possari em outubro de 2026, todas aplicadas
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
  6. textos de erro em português e `lang="pt-BR"` no `onlyoffice.html`;
  7. mais tempo (10 minutos em vez de 60 segundos) para o conversor `x2t.wasm` (42 MB) carregar na primeira abertura
     com internet lenta. Abaixo de uns 6 a 10 Mbit/s, a abertura falhava com "Ocorreu um erro ao abrir o arquivo".
- As fontes têm licenças próprias (OFL, Apache, GPL com exceção de fontes etc.): veja `fontes/LICENCAS.md`.

## Como a Biblioteca conversa com a ponte (`possari.html`)

| Sentido | Mensagem |
|---|---|
| ponte → Biblioteca | `{type:'ponte-pronta', versao:'1'}` ao carregar |
| Biblioteca → ponte | `{type:'abrir', nome, bytes:ArrayBuffer, usuario:{id, nome}}` |
| ponte → Biblioteca | `{type:'documento-pronto'}` |
| ponte → Biblioteca | `{type:'alterado', alterado:true/false}` quando o documento passa a ter (ou deixa de ter) alterações não salvas |
| Biblioteca → ponte | `{type:'salvar', requestId, formato:'docx' ou 'pdf'}` |
| ponte → Biblioteca | `{type:'salvo', requestId, ok, formato, buffer}` (ou `ok:false` com `erro`) |
| Biblioteca → ponte | `{type:'estilo', nome:'Heading 1'}` aplica ao parágrafo atual o estilo com esse nome (`Title`, `Subtitle`, `Normal`, `Heading 1/2/3`…) |
| ponte → Biblioteca | `{type:'erro', erro}`: `estilo-desconhecido` (o documento não tem esse estilo), `documento-nao-aberto`, `arquivo-invalido` ou erro do editor |

A ponte só aceita mensagens da janela que a contém (`window.parent`) vindas de `https://<algo>-script.googleusercontent.com`
(ou `http://localhost`/`127.0.0.1`, para testes) e responde sempre para essa origem.

## Como atualizar o editor

1. Num computador com `git` e Python 3, dentro desta pasta: `python3 ferramentas/montar.py`
   (baixa o build do GitHub; ou `--origem <pasta>` com um clone já baixado). O script apaga e recria só a pasta
   `9.3.0.133-…`, `onlyoffice.html`, `LICENSE.txt`, `fontes/LICENCAS.md` e `ferramentas/relatorio_fontes.tsv`.
2. Para uma versão nova, troque `VERSAO` e `V` no começo do script. Se o build mudou um trecho que o script corrige,
   ele para e diz qual: ajuste a correção antes de publicar.
3. Rode o teste automático (fica com a equipe, fora deste repositório: `editor_site_testes/teste.js`), que abre uma
   peça de exemplo, edita, salva `.docx`/`.pdf` e confere a segurança.
4. Publique (commit + push). Nenhum arquivo pode passar de 95 MB (o maior hoje é o `x2t.wasm`, com 40 MB).

## Tamanho

- Site inteiro: 1.300 arquivos, 302 MB (fontes 155 MB, `sdkjs` 60 MB, `x2t.wasm` 40 MB, `web-apps` 47 MB).
- Na primeira abertura o navegador baixa só o necessário: 74 arquivos, 74 MB sem compressão (cerca de 56 MB com a
  compressão que o GitHub Pages aplica a HTML/JS/CSS, ou 23 MB se ele comprimir também o `.wasm`). Das 186 fontes,
  só vêm as usadas (21 arquivos, 7 MB: Liberation, Carlito, Caladea, OpenSymbol).
- Nas aberturas seguintes os arquivos vêm do cache do navegador (no teste: 0 bytes baixados).
