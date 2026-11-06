// Service worker do editor (Possari). O ferramentas/montar.py copia este arquivo por cima do
// <build>/vendor/document_editor_service_worker.js do build (o editor o registra no index.html, com escopo vendor/) e
// troca __VERSAO_DO_SITE__ pelo resumo (sha256) de todos os arquivos do editor ja montado e corrigido.
//
// Por que: o service worker do build era 'network-first': pedia tudo a rede e, online, nunca usava a copia dele, so
// regravava ~137 MB no disco a cada abertura (+0,5 s). Depois dos 10 min de cache do GitHub Pages eram ~95 revalidacoes
// por abertura, e o x2t.wasm (42 MB) podia nem caber no cache do navegador e ser baixado de novo a cada peca.
//
// O que faz:
//   - 'cache-first': arquivo do programa do editor que ja esta no Cache Storage e servido dali, sem ir a rede;
//     o que nao esta vem da rede e, se veio inteiro e certo, e guardado. "Certo" (v15.4, revisao): 200, do proprio
//     site, sem redirecionamento, nao e pagina HTML no lugar de outro arquivo, e o arquivo esta na lista TAMANHOS
//     (gravada pelo montar.py) com exatamente aquele tamanho. Como o que esta guardado nao volta mais a rede, uma
//     resposta 200 errada (pagina de bloqueio de um proxy ou antivirus no lugar do x2t.wasm, arquivo cortado, arquivo
//     de outra versao durante a publicacao, quando o tamanho e diferente) ficaria para sempre e o editor nao abriria
//     mais naquele navegador: ela vai para a pagina como veio, mas nao e guardada, e o pedido seguinte vai de novo a
//     rede. A conferencia e so pelo tamanho: um arquivo de outra versao com o mesmo numero de bytes seria guardado;
//   - so guarda arquivos do programa: GET em vendor/web-apps/, vendor/sdkjs/ e vendor/fonts/ deste site. Nunca
//     documento (a peca chega por postMessage e vira blob:, que nao passa por aqui), possari.html, possari.js,
//     onlyoffice.html (ficam fora do escopo vendor/ e da lista) nem resposta com erro (404, 500, 206...);
//   - um cache por versao do site ('editor-possari-' + resumo). O site mudou (montar.py de novo) = este arquivo muda
//     = o navegador instala o novo service worker, que comeca com um cache vazio e, ao ativar, apaga os das versoes
//     anteriores (e o 'document_editor_static_...' do service worker antigo do build). Os outros caches da origem
//     (outros sites em felipebarros-eng.github.io) nao sao tocados;
//   - sem skipWaiting: o novo so assume quando nenhum editor da versao anterior esta aberto (a Biblioteca descarta o
//     iframe do editor ao fechar a peca). Assim a peca aberta continua com os arquivos guardados da versao com que
//     comecou (so um arquivo que essa versao nunca tinha usado, como uma fonte nova, viria da rede), e a seguinte ja
//     abre na nova. Na 1a vez (nenhum service worker ainda) ele assume na hora (clients.claim) e ja guarda o resto
//     dessa 1a abertura.
// Se o navegador nao deixar registrar (politica, "Bloquear cookies de terceiros": o editor e terceiro dentro da
// intranet), o editor funciona igual, so com o cache HTTP do navegador.
// A ponte (possari.js) pede ao navegador que confira este arquivo antes de carregar o editor (v15.4, revisao): sem
// isso, a 1a peca depois de publicar rodava o programa velho guardado com a ponte nova.
// Cuidado: o nome do cache resume os arquivos do editor, nao este arquivo. Uma mudanca so aqui mantem o cache (e o
// que estiver nele); se ela for para corrigir algo guardado errado, mude tambem o PREFIXO.
'use strict';

var VERSAO = '__VERSAO_DO_SITE__';
var PREFIXO = 'editor-possari-';
var CACHE = PREFIXO + VERSAO;
// Caches apagados ao ativar (menos o desta versao): versoes anteriores deste e os do service worker do build.
var PREFIXOS_ANTIGOS = [PREFIXO, 'document_editor_static_', 'document_editor_dynamic_'];
// Pastas do programa dentro do escopo (vendor/). fonts/ sao as fontes livres do editor, nao documentos.
var PASTAS = ['web-apps/', 'sdkjs/', 'fonts/'];
// Tamanho em bytes de cada arquivo dessas pastas nesta versao, { pasta: { arquivo: bytes } } (o montar.py troca o
// marcador pela lista; sem a troca, nada e guardado). So o que esta aqui, com esse tamanho exato, vai para o cache.
var TAMANHOS = '__TAMANHOS_DO_SITE__';

// Endereco (sem #) se o pedido e de arquivo do programa e pode vir do cache; null = segue para a rede sem passar aqui.
function chaveDoPrograma(pedido) {
  if (pedido.method !== 'GET' || pedido.headers.has('range')) return null;
  var url = pedido.url.split('#')[0];
  var escopo = self.registration.scope;   // .../vendor/
  if (url.indexOf(escopo) !== 0) return null;
  var resto = url.slice(escopo.length);
  for (var i = 0; i < PASTAS.length; i++) {
    if (resto.indexOf(PASTAS[i]) === 0) return url;
  }
  return null;
}

// Caminho dentro do escopo (vendor/), sem ? nem # e sem %xx: 'sdkjs/common/AllFonts.js'.
function relativo(chave) {
  var rel = chave.slice(self.registration.scope.length).split('?')[0];
  try { return decodeURIComponent(rel); } catch (e) { return rel; }
}

function tamanhoEsperado(chave) {
  var rel = relativo(chave);
  var barra = rel.lastIndexOf('/');
  var pasta = typeof TAMANHOS === 'object' && TAMANHOS ? TAMANHOS[rel.slice(0, barra + 1)] : null;
  var bytes = pasta ? pasta[rel.slice(barra + 1)] : undefined;
  return typeof bytes === 'number' ? bytes : -1;
}

function podeGuardar(resposta, chave) {
  if (!(!!resposta && resposta.status === 200 && resposta.type === 'basic' && !resposta.redirected)) return false;
  // Pagina HTML no lugar de um .js, .wasm, fonte...: e a pagina de bloqueio de um proxy, nunca o arquivo.
  var tipo = (resposta.headers.get('content-type') || '').toLowerCase();
  if (tipo.indexOf('text/html') === 0 && !/\.html?$/.test(relativo(chave))) return false;
  return tamanhoEsperado(chave) >= 0;
}

// Cabecalhos guardados com o corpo ja conferido: os da resposta, menos os da transferencia (o corpo ja vem descompactado).
function cabecalhosParaGuardar(resposta) {
  var cabecalhos = new Headers();
  resposta.headers.forEach(function (valor, nome) {
    if (['content-encoding', 'content-length', 'transfer-encoding'].indexOf(nome) === -1) cabecalhos.append(nome, valor);
  });
  return cabecalhos;
}

function procurarNoCache(chave) {
  return caches.open(CACHE)
    .then(function (cache) { return cache.match(chave, { ignoreVary: true }); })
    .catch(function () { return undefined; });   // sem Cache Storage (cota, politica): vai a rede
}

// 'no-cache': confere com o site antes de usar o cache HTTP (304 se nao mudou). Sem isso, logo depois de publicar uma
// versao nova o cache HTTP (10 min no GitHub Pages) podia entregar um arquivo da versao anterior, e ele ficaria guardado
// no cache da versao nova ate a proxima publicacao. So acontece uma vez por arquivo e por versao.
// O corpo e lido inteiro (uma copia; a pagina recebe a resposta como veio) e so e guardado se tiver o tamanho da lista.
// Lido na memoria (arrayBuffer), e nao como blob: com o disco quase cheio (~1% livre), o Chrome nao monta o blob nem
// guarda a resposta em fluxo dos arquivos grandes (x2t.wasm, sdk-all.js: "Failed to fetch"), e o ganho sumia sem aviso;
// a copia na memoria e guardada (testado).
function daRedeGuardando(evento, chave) {
  return fetch(new Request(evento.request, { cache: 'no-cache' })).then(function (resposta) {
    if (podeGuardar(resposta, chave)) {
      var esperado = tamanhoEsperado(chave);
      var copia = resposta.clone();
      evento.waitUntil(copia.arrayBuffer()
        .then(function (corpo) {
          if (corpo.byteLength !== esperado) return;   // cortado, de outro tamanho ou trocado no caminho: nao guarda
          return caches.open(CACHE).then(function (cache) {
            return cache.put(chave, new Response(corpo, { status: 200, statusText: 'OK', headers: cabecalhosParaGuardar(resposta) }));
          });
        })
        .catch(function () {}));   // nao coube (cota) ou a leitura falhou: fica so o cache HTTP, como sem service worker
    }
    return resposta;
  });
}

self.addEventListener('fetch', function (evento) {
  var chave = chaveDoPrograma(evento.request);
  if (!chave) return;
  evento.respondWith(procurarNoCache(chave).then(function (guardada) {
    return guardada || daRedeGuardando(evento, chave);
  }));
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(caches.keys()
    .then(function (nomes) {
      return Promise.all(nomes.filter(function (nome) {
        return nome !== CACHE && PREFIXOS_ANTIGOS.some(function (p) { return nome.indexOf(p) === 0; });
      }).map(function (nome) { return caches.delete(nome); }));
    })
    .catch(function () {})
    .then(function () { return self.clients.claim(); }));
});
