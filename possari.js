// Ponte Possari: liga a Biblioteca (pagina-mae, Apps Script) ao editor (onlyoffice.html, mesmo site).
// Recebe os bytes do .docx, abre no editor e devolve os bytes salvos (.docx ou .pdf).
// O documento nunca sai do navegador: so trafega por postMessage, sempre com a origem conferida.
//
// Protocolo (versao 1)
//   ponte -> pai: ponte-pronta {versao} | documento-pronto | alterado {alterado} | salvo {requestId, ok, formato, buffer?, erro?}
//                 | pedido-salvar (Ctrl+S, disquete ou Arquivo > Salvar do editor) | erro {erro}
//   pai -> ponte: abrir {nome, bytes, usuario:{id,nome}, interface?:{compacta}} | salvar {requestId, formato:'docx'|'pdf'}
//                 | estilo {nome}
//   Varios 'salvar' podem chegar sem esperar o 'salvo' (no Gerar PDF a Biblioteca pede o docx e logo o pdf): ficam
//   numa fila e sao atendidos um de cada vez, na ordem, cada um respondido pelo seu requestId. Gerar o pdf nao mexe no
//   'alterado' (a Biblioteca v15.2 pede so o pdf quando nada mudou desde o ultimo docx).
//   interface:{compacta:true} (opcional, v15.3) abre o editor compacto, para monitores pequenos; sem o campo, ou com
//   compacta:false, a interface e a de sempre. Com ou sem ele, a folha que nao cabe na largura abre ajustada a ela.
// Endereco: possari.html#origem=<origem do pai, codificada> (para navegadores sem location.ancestorOrigins).
(function () {
  'use strict';

  var VERSAO = '1';
  // Biblioteca publicada pelo HtmlService (n-xxxx-script.googleusercontent.com) e, para testes, localhost.
  var ORIGENS_DO_PAI = [/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
  var MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  var TEMPO_MAXIMO_SALVAR_MS = 120000;
  var INTERVALO_PEDIDO_SALVAR_MS = 1000;   // Ctrl+S segurado (repeticao da tecla) vira um pedido so
  var ESPERA_PREPARAR_FONTES_MS = 2000;    // depois que o documento abre, para nao disputar com a abertura
  var ALTURA_RECOLHER_FAIXA_PX = 420;      // compacto: abaixo disso a faixa de botoes abre recolhida (as abas ficam)
  var ESPERA_AJUSTAR_ZOOM_MS = 250;        // depois que a area do editor muda de tamanho, para o editor se ajustar antes

  var oo = document.getElementById('oo');
  var origemPai = descobrirOrigemPai();
  var editorCarregado = false;   // onlyoffice.html ja avisou que esta pronto para receber a configuracao
  var configPendente = null;
  var urlDocumento = null;       // blob: com o .docx recebido (liberado quando o documento abre)
  var documentoAberto = false;
  var ultimoAlterado = null;     // ultimo valor de 'alterado' enviado ao pai
  var fila = [];                 // pedidos de salvar, atendidos um de cada vez
  var emAndamento = null;
  var seq = 0;
  var ultimoPedidoSalvar = 0;
  var zoom = null;               // zoom automatico do documento aberto (ver iniciarZoomAutomatico)

  function origemPermitida(origem) {
    return typeof origem === 'string' && ORIGENS_DO_PAI.some(function (re) { return re.test(origem); });
  }

  // Origem da pagina que nos colocou no iframe. Sem ela nao falamos com ninguem (nunca '*').
  // Ordem: location.ancestorOrigins (dado pelo proprio navegador; quando existe, vale sozinho), o #origem=... que a
  // Biblioteca poe no endereco (Firefox nao tem ancestorOrigins) e document.referrer (o HtmlService pode nao mandar).
  // Tudo passa pela mesma lista de origens permitidas. Mesmo que alguem minta no #origem, o navegador so entrega o
  // que mandamos se a janela de cima for mesmo dessa origem, e o que chega dela continua conferido (e.source/e.origin).
  function descobrirOrigemPai() {
    if (window.parent === window) return null;
    var ancestrais = null;
    try { ancestrais = location.ancestorOrigins; } catch (e) {}
    if (ancestrais && ancestrais.length && ancestrais[0] && ancestrais[0] !== 'null') {
      return origemPermitida(ancestrais[0]) ? ancestrais[0] : null;
    }
    var doHash = origemDoHash();
    if (origemPermitida(doHash)) return doHash;
    var doReferrer = null;
    if (document.referrer) {
      try { doReferrer = new URL(document.referrer).origin; } catch (e) {}
    }
    return origemPermitida(doReferrer) ? doReferrer : null;
  }

  // possari.html#origem=https%3A%2F%2Fn-...-script.googleusercontent.com
  function origemDoHash() {
    try { return new URLSearchParams(String(location.hash || '').replace(/^#/, '')).get('origem'); } catch (e) { return null; }
  }

  function paraPai(msg, transferir) {
    if (!origemPai) return;
    window.parent.postMessage(msg, origemPai, transferir || []);
  }

  function paraEditor(msg) {
    oo.contentWindow.postMessage(msg, location.origin);
  }

  function comeca(buffer, assinatura) {
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < assinatura.length) return false;
    var u = new Uint8Array(buffer, 0, assinatura.length);
    for (var i = 0; i < assinatura.length; i++) if (u[i] !== assinatura.charCodeAt(i)) return false;
    return true;
  }

  // ---------------------------------------------------------------- acesso a API do editor (mesma origem)
  // Janela do editor de verdade (web-apps), criada pelo api.js dentro do onlyoffice.html.
  function janelaEditor() {
    try {
      var f = oo.contentWindow.document.querySelector('iframe[name="frameEditor"]');
      return (f && f.contentWindow) || null;
    } catch (e) { return null; }
  }

  function apiEditor() {
    var w = janelaEditor();
    try { return (w && w.Asc && w.Asc.editor) || (w && w.editor) || null; } catch (e) { return null; }
  }

  // Historico de edicao (desfazer/refazer) do documento; e por ele que o editor sabe se ha alteracoes.
  function historico(api) {
    try { return api.WordControl.m_oLogicDocument.History || janelaEditor().AscCommon.History || null; } catch (e) { return null; }
  }

  // Ponto do historico de edicao no momento em que o .docx foi gerado.
  function marcaDoHistorico() {
    var h = historico(apiEditor());
    return h ? { indice: h.Index, ponto: h.Points[h.Index] || null } : null;
  }

  // Depois de salvar o .docx: se ninguem editou durante o salvamento, o documento volta a "sem alteracoes".
  function marcarComoSalvo(marca) {
    var api = apiEditor(), h = historico(api);
    if (!api || !h || !marca) return;
    if (h.Index !== marca.indice || (h.Points[h.Index] || null) !== marca.ponto) return;
    try {
      h.Reset_SavedIndex(true);
      if (typeof api.CheckChangedDocument === 'function') api.CheckChangedDocument();
    } catch (e) { return; }
    informarAlterado(false);
  }

  function informarAlterado(valor) {
    valor = !!valor;
    if (!documentoAberto || valor === ultimoAlterado) return;
    ultimoAlterado = valor;
    paraPai({ type: 'alterado', alterado: valor });
  }

  function focarEditor(api) {
    try {
      var w = janelaEditor();
      if (w) w.focus();
      if (api && typeof api.asc_enableKeyEvents === 'function') api.asc_enableKeyEvents(true);
    } catch (e) {}
  }

  // Ctrl+S, o disquete e Arquivo > Salvar do editor chamam api.asc_Save. Neste site quem grava e a Biblioteca (no Drive):
  // o editor nao pode gerar o arquivo por conta propria e se marcar como "sem alteracoes" (o texto ficaria so aqui).
  // A ponte troca asc_Save por um aviso ao pai ('pedido-salvar'); o editor continua modificado ate um 'salvar' docx
  // dar certo (marcarComoSalvo). Os salvamentos automaticos do editor (asc_Save(true)) tambem nao fazem nada.
  function protegerSalvarDoEditor() {
    var api = apiEditor();
    if (!api || typeof api.asc_Save !== 'function') return false;
    if (api.asc_Save.possari) return true;
    var substituto = function (automatico) {
      if (!automatico) pedidoSalvarDoEditor();
      return false;
    };
    substituto.possari = true;
    api.asc_Save = substituto;
    return true;
  }

  function protegerSalvarQuandoPuder() {
    var tentativas = 0;
    (function tentar() {
      if (protegerSalvarDoEditor() || ++tentativas > 50) return;
      setTimeout(tentar, 200);
    })();
  }

  // O conversor do editor (x2t) precisa das fontes do documento para gerar o PDF e as guarda depois da 1a vez
  // (correcao 8 do montar.py). Com o documento aberto e o navegador ocioso, a ponte ja pede que ele as guarde: o 1o
  // Gerar PDF nao espera por elas (22 arquivos numa peca comum; passados os 10 min de cache do site, 22 revalidacoes).
  // Se nao der (editor diferente, outro documento abrindo), nada muda: o PDF busca as fontes como antes.
  function prepararFontesDoConversor() {
    setTimeout(function () {
      var agora = function () {
        try {
          var w = janelaEditor();
          var x2t = w && w.AscCommon && w.AscCommon.x2t;
          if (!documentoAberto || !x2t || !x2t.x2tModule || typeof x2t.fetchFonts !== 'function') return;
          var p = x2t.fetchFonts();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } catch (e) {}
      };
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(agora, { timeout: 3000 });
      else agora();
    }, ESPERA_PREPARAR_FONTES_MS);
  }

  function pedidoSalvarDoEditor() {
    if (!documentoAberto) return;
    var agora = Date.now();
    if (agora - ultimoPedidoSalvar < INTERVALO_PEDIDO_SALVAR_MS) return;
    ultimoPedidoSalvar = agora;
    paraPai({ type: 'pedido-salvar' });
  }

  // ---------------------------------------------------------------- tamanho da folha na tela (zoom automatico)
  // Vale com ou sem interface compacta. Se a folha nao cabe na largura do editor a 100%, a ponte liga o "Ajustar
  // largura" do proprio editor, que acompanha a janela e os paineis. Quando ela volta a caber, volta a 100%. Nunca
  // passa de 100%: num monitor de 1366 px o "Ajustar largura" puro abriria a folha a uns 150%, e num monitor baixo
  // ela mostraria um terco a menos de texto. So age se o documento abriu no zoom padrao (100%; quem escolheu outro em
  // Arquivo > Configuracoes avancadas fica com o seu) e para de vez quando a pessoa muda o zoom.
  function iniciarZoomAutomatico() {
    pararZoomAutomatico();
    var api = apiEditor(), w = janelaEditor();
    try {
      var wc = api && api.WordControl;
      if (!w || !wc || typeof wc.calculate_zoom_FitToWidth !== 'function' || typeof api.zoomFitToWidth !== 'function'
        || typeof api.zoom !== 'function' || typeof api.asc_registerCallback !== 'function') return;
      if (wc.m_nZoomType !== 0 || wc.m_nZoomValue !== 100) return;
      var z = zoom = { api: api, nosso: false, desligado: false, timer: null, parar: null };
      api.asc_registerCallback('asc_onZoomChange', function (valor, tipo) { if (zoom === z) zoomMudou(z, tipo); });
      // area da folha: muda com a janela e tambem quando abre ou fecha um painel do editor (comentarios, busca...)
      var area = w.document.getElementById('editor_sdk');
      var mudou = function () { agendarAjusteZoom(z); };
      if (area && typeof w.ResizeObserver === 'function') {
        var obs = new w.ResizeObserver(mudou);
        obs.observe(area);
        z.parar = function () { obs.disconnect(); };
      } else {
        w.addEventListener('resize', mudou);
        z.parar = function () { w.removeEventListener('resize', mudou); };
      }
      ajustarZoom(z);
    } catch (e) {}
  }

  function pararZoomAutomatico() {
    var z = zoom;
    zoom = null;
    if (!z) return;
    clearTimeout(z.timer);
    try { if (z.parar) z.parar(); } catch (e) {}
  }

  // Tipo do zoom no editor: 0 = valor fixo, 1 = ajustar a largura, 2 = ajustar a pagina.
  // Com o "Ajustar largura" ligado pela ponte, o proprio editor reajusta (tipo 1) quando a area muda; a ponte so
  // confere se nao passou de 100%. Qualquer outra mudanca que nao foi a ponte que fez e da pessoa.
  function zoomMudou(z, tipo) {
    if (z.nosso || z.desligado) return;
    if (tipo === 1 && z.largura) { agendarAjusteZoom(z); return; }
    z.desligado = true;
    clearTimeout(z.timer);
  }

  function agendarAjusteZoom(z) {
    if (z.desligado) return;
    clearTimeout(z.timer);
    z.timer = setTimeout(function () { ajustarZoom(z); }, ESPERA_AJUSTAR_ZOOM_MS);
  }

  function ajustarZoom(z) {
    if (zoom !== z || z.desligado) return;
    try {
      var wc = z.api.WordControl, area = janelaEditor().document.getElementById('editor_sdk');
      // sem a largura da folha, ou com o editor escondido, a conta nao vale (daria 99% ou o minimo de 5%)
      if (!(wc.m_dDocumentPageWidth > 0) || !area || !area.clientWidth) return;
      var cabeNaLargura = wc.calculate_zoom_FitToWidth();   // zoom em que a folha ocupa a largura da area
      z.nosso = true;
      if (cabeNaLargura < 100) {
        if (wc.m_nZoomType !== 1) z.api.zoomFitToWidth();
        z.largura = true;
      } else {
        if (wc.m_nZoomType !== 0 || wc.m_nZoomValue !== 100) z.api.zoom(100);
        z.largura = false;
      }
    } catch (e) {
    } finally { z.nosso = false; }
  }

  // ---------------------------------------------------------------- pedidos do pai
  function abrir(d) {
    if (!comeca(d.bytes, 'PK')) { paraPai({ type: 'erro', erro: 'arquivo-invalido' }); return; }
    // um documento novo substitui o anterior: pedidos de salvar pendentes nao valem mais
    fila.splice(0).forEach(function (p) { responderSalvo(p, { ok: false, error: 'documento-trocado' }); });
    if (emAndamento) { clearTimeout(emAndamento.timer); responderSalvo(emAndamento, { ok: false, error: 'documento-trocado' }); emAndamento = null; }
    documentoAberto = false;
    ultimoAlterado = null;
    pararZoomAutomatico();
    if (urlDocumento) URL.revokeObjectURL(urlDocumento);
    urlDocumento = URL.createObjectURL(new Blob([d.bytes], { type: MIME_DOCX }));
    var usuario = d.usuario || {};
    var nome = String(d.nome || 'documento.docx');
    if (!/\.docx$/i.test(nome)) nome += '.docx';
    configPendente = {
      document: {
        url: urlDocumento,
        title: nome,
        fileType: 'docx',
        key: 'possari-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        permissions: { edit: true, download: true, print: true, review: true, comment: true, copy: true, chat: false }
      },
      documentType: 'word',
      type: 'desktop',
      height: '100%',
      width: '100%',
      editorConfig: {
        mode: 'edit',
        lang: 'pt-BR',
        region: 'pt-BR',
        user: { id: String(usuario.id || 'possari'), name: String(usuario.nome || 'Usuário') },
        plugins: { autostart: [], pluginsData: [] },
        customization: {
          autosave: false, forcesave: false, // quem salva e a Biblioteca, no Drive
          help: false,                       // a ajuda online nao vem neste site
          feedback: false, goback: false, chat: false, plugins: false, macros: false,
          uiTheme: 'theme-light',
          features: { spellcheck: { mode: false, change: false } } // sem dicionarios neste site
        }
      }
    };
    if (d.interface && d.interface.compacta === true) interfaceCompacta(configPendente.editorConfig.customization);
    enviarConfig();
  }

  // Interface compacta, para monitores pequenos: o maximo de folha sem tirar o que o advogado usa. So com opcoes do
  // proprio OnlyOffice 9.3 (customization), sem mexer no build. Num editor de 512 px de altura sobram ~50 px a mais de
  // folha (389 em vez de 339):
  //   compactHeader        a linha de cima (logotipo, nome, salvar/imprimir/desfazer) vira a linha das abas: o
  //                        logotipo do ONLYOFFICE continua (AGPL 7b) e os botoes passam para a faixa (24 px)
  //   toolbarHideFileName  sem o nome do arquivo na linha das abas (a Biblioteca ja mostra o nome da peca)
  //   hideRulers           sem as reguas (26 px na altura, 19 na largura); Ver > Regras mostra de novo
  //   compactToolbar       so com a area muito baixa: a faixa de botoes abre recolhida (um clique na aba a mostra)
  // A barra de status fica: Pagina X de Y, contagem de palavras, controle de alteracoes e zoom so estao nela.
  // O que a pessoa escolhe no proprio editor (Ver > Regras, Ver > Sempre mostrar a barra de ferramentas) fica guardado
  // pelo editor e vale por cima destes valores iniciais.
  function interfaceCompacta(c) {
    c.compactHeader = true;
    c.toolbarHideFileName = true;
    c.hideRulers = true;
    var altura = window.innerHeight;
    if (altura > 0 && altura < ALTURA_RECOLHER_FAIXA_PX) c.compactToolbar = true;
  }

  function enviarConfig() {
    if (!editorCarregado || !configPendente) return;
    paraEditor({ type: 'onlyoffice-config', docConfig: configPendente });
    configPendente = null;
  }

  function pedirSalvar(d) {
    var formato = d.formato === 'pdf' ? 'pdf' : d.formato === 'docx' ? 'docx' : null;
    var pedido = { requestId: d.requestId, formato: d.formato };
    if (!formato) { responderSalvo(pedido, { ok: false, error: 'formato-invalido' }); return; }
    if (!documentoAberto) { responderSalvo(pedido, { ok: false, error: 'documento-nao-aberto' }); return; }
    pedido.formato = formato;
    fila.push(pedido);
    proximoSalvar();
  }

  function proximoSalvar() {
    if (emAndamento || !fila.length) return;
    var p = emAndamento = fila.shift();
    p.idInterno = 'possari-' + (++seq);
    p.marca = p.formato === 'docx' ? marcaDoHistorico() : null;
    p.timer = setTimeout(function () { concluirSalvar({ requestId: p.idInterno, ok: false, error: 'tempo-esgotado' }); }, TEMPO_MAXIMO_SALVAR_MS);
    paraEditor({ type: 'onlyoffice-save', requestId: p.idInterno, format: p.formato });
  }

  function concluirSalvar(d) {
    var p = emAndamento;
    if (!p || d.requestId !== p.idInterno) return;   // resposta atrasada ou que nao pedimos
    clearTimeout(p.timer);
    emAndamento = null;
    var ok = !!d.ok && comeca(d.buffer, p.formato === 'pdf' ? '%PDF' : 'PK');
    responderSalvo(p, ok ? { ok: true, buffer: d.buffer } : { ok: false, error: d.ok ? 'arquivo-invalido' : d.error });
    if (ok && p.formato === 'docx') marcarComoSalvo(p.marca);
    proximoSalvar();
  }

  function responderSalvo(p, r) {
    var msg = { type: 'salvo', requestId: p.requestId, ok: !!r.ok, formato: p.formato };
    if (r.ok) { msg.buffer = r.buffer; paraPai(msg, [r.buffer]); return; }
    msg.erro = String(r.error || 'falha-ao-salvar');
    paraPai(msg);
  }

  // Estilo de paragrafo pelo nome do estilo do documento ('Heading 1', 'Title', 'Normal'...).
  function aplicarEstilo(d) {
    var api = apiEditor();
    if (!documentoAberto) { paraPai({ type: 'erro', erro: 'documento-nao-aberto' }); return; }
    if (!api || typeof api.put_Style !== 'function') { paraPai({ type: 'erro', erro: 'estilo-indisponivel' }); return; }
    var nome = nomeDoEstilo(api, String(d.nome || ''));
    if (!nome) { paraPai({ type: 'erro', erro: 'estilo-desconhecido' }); return; }
    try { api.put_Style(nome); } catch (e) { paraPai({ type: 'erro', erro: 'estilo-indisponivel' }); return; }
    focarEditor(api);
  }

  // Nome exato do estilo de paragrafo no documento (sem diferenciar maiusculas/minusculas).
  function nomeDoEstilo(api, pedido) {
    var procurado = pedido.trim().toLowerCase();
    if (!procurado) return null;
    var estilos;
    try { estilos = api.WordControl.m_oLogicDocument.Styles.Style; } catch (e) { return pedido; }
    for (var id in estilos) {
      var s = estilos[id];
      if (!s || typeof s.GetName !== 'function') continue;
      if (typeof s.GetType === 'function' && s.GetType() !== 1) continue;   // 1 = estilo de paragrafo
      if (String(s.GetName()).toLowerCase() === procurado) return s.GetName();
    }
    return null;
  }

  // ---------------------------------------------------------------- avisos do editor
  function doEditor(d) {
    switch (d.type) {
      case 'onlyoffice-ready':
        editorCarregado = true;
        enviarConfig();
        break;
      case 'onlyoffice-document-ready':
        documentoAberto = true;
        protegerSalvarQuandoPuder();
        prepararFontesDoConversor();
        iniciarZoomAutomatico();
        if (urlDocumento) { URL.revokeObjectURL(urlDocumento); urlDocumento = null; }
        paraPai({ type: 'documento-pronto' });
        informarAlterado(false);
        break;
      case 'onlyoffice-state-change':
        informarAlterado(d.modified);
        break;
      case 'onlyoffice-saved':
        concluirSalvar(d);
        break;
      case 'onlyoffice-open-error':
        paraPai({ type: 'erro', erro: String(d.error || 'falha-ao-abrir') });
        break;
    }
  }

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object') return;
    if (e.source === oo.contentWindow && e.origin === location.origin) { doEditor(d); return; }
    if (window.parent === window || e.source !== window.parent || !origemPermitida(e.origin)) return;
    if (origemPai && e.origin !== origemPai) return;
    origemPai = e.origin;
    if (d.type === 'abrir') abrir(d);
    else if (d.type === 'salvar') pedirSalvar(d);
    else if (d.type === 'estilo') aplicarEstilo(d);
  });

  // O editor so comeca a carregar depois que a ponte ja ouve as mensagens dele: se possari.js chegasse depois do
  // onlyoffice.html (rede lenta so neste arquivo), o aviso 'onlyoffice-ready' se perderia e o documento nao abriria.
  oo.src = 'onlyoffice.html';
  paraPai({ type: 'ponte-pronta', versao: VERSAO });
})();
