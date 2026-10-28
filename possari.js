// Ponte Possari: liga a Biblioteca (pagina-mae, Apps Script) ao editor (onlyoffice.html, mesmo site).
// Recebe os bytes do .docx, abre no editor e devolve os bytes salvos (.docx ou .pdf).
// O documento nunca sai do navegador: so trafega por postMessage, sempre com a origem conferida.
//
// Protocolo (versao 1)
//   ponte -> pai: ponte-pronta {versao} | documento-pronto | alterado {alterado} | salvo {requestId, ok, formato, buffer?, erro?} | erro {erro}
//   pai -> ponte: abrir {nome, bytes, usuario:{id,nome}} | salvar {requestId, formato:'docx'|'pdf'} | estilo {nome}
(function () {
  'use strict';

  var VERSAO = '1';
  // Biblioteca publicada pelo HtmlService (n-xxxx-script.googleusercontent.com) e, para testes, localhost.
  var ORIGENS_DO_PAI = [/^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
  var MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  var TEMPO_MAXIMO_SALVAR_MS = 120000;

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

  function origemPermitida(origem) {
    return typeof origem === 'string' && ORIGENS_DO_PAI.some(function (re) { return re.test(origem); });
  }

  // Origem da pagina que nos colocou no iframe. Sem ela nao falamos com ninguem (nunca '*').
  function descobrirOrigemPai() {
    if (window.parent === window) return null;
    var origem = null;
    try {
      if (location.ancestorOrigins && location.ancestorOrigins.length) origem = location.ancestorOrigins[0];
    } catch (e) {}
    if (!origem && document.referrer) {
      try { origem = new URL(document.referrer).origin; } catch (e) {}
    }
    return origemPermitida(origem) ? origem : null;
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

  // ---------------------------------------------------------------- pedidos do pai
  function abrir(d) {
    if (!comeca(d.bytes, 'PK')) { paraPai({ type: 'erro', erro: 'arquivo-invalido' }); return; }
    // um documento novo substitui o anterior: pedidos de salvar pendentes nao valem mais
    fila.splice(0).forEach(function (p) { responderSalvo(p, { ok: false, error: 'documento-trocado' }); });
    if (emAndamento) { clearTimeout(emAndamento.timer); responderSalvo(emAndamento, { ok: false, error: 'documento-trocado' }); emAndamento = null; }
    documentoAberto = false;
    ultimoAlterado = null;
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
    enviarConfig();
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

  paraPai({ type: 'ponte-pronta', versao: VERSAO });
})();
