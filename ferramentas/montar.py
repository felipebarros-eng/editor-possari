#!/usr/bin/env python3
"""Monta o site do editor a partir do build estatico do OnlyOffice 9.3.0.133 (repositorio fernfei/OnlyofficePersonal).

O que faz, nesta ordem:
  0. confere que o build e o do commit fixado (COMMIT) e o sha256 dos arquivos principais (SHA256_DO_BUILD), antes
     de qualquer correcao; se algo mudou, para;
  1. copia so a parte do Word (sdkjs/common, sdkjs/word, web-apps do documenteditor) + LICENSE.txt e onlyoffice.html;
  2. tira fontes que nao podem ser redistribuidas (Microsoft, Monotype, fontes chinesas comerciais...) e faz as
     familias delas apontarem para fontes livres de mesma metrica (Arial -> Liberation Sans, Calibri -> Carlito...);
     escreve fontes/LICENCAS.md (cada arquivo de fonte que ficou, com a licenca e o texto em fontes/licencas/);
  3. corrige os postMessage com destino '*' que levam dados do documento (onlyoffice.html, x2t_helper.js, api.js,
     app.js, sdk-all-min.js) e faz o onlyoffice.html aceitar comandos so do proprio site;
  4. poe uma Content-Security-Policy (meta) em todas as paginas HTML do build, para nada sair para a internet;
  5. corrige uma corrida do build: com o editor no cache, o documento chegava antes do catalogo de fontes;
  6. da mais tempo (10 min, em vez de 60 s) para o x2t.wasm (42 MB) baixar na 1a abertura com internet lenta;
  7. nomes dos estilos em portugues como no Word (Titulo, Subtitulo, Titulo 1..9, Citacao...) no idioma pt.

Nao mexe em possari.html, possari.js, README.md, .nojekyll, .gitignore, fontes/licencas/ nem nesta pasta
ferramentas/ (alem do relatorio_fontes.tsv, que ele mesmo gera).
Cada correcao confere o texto exato do build; se o build mudar, o script para e diz o que nao achou.

Uso:
  python3 ferramentas/montar.py                      # baixa o build do GitHub (precisa de git) e monta na pasta do site
  python3 ferramentas/montar.py --origem <clone>     # usa um clone ja baixado (commit COMMIT da branch 9.3.0.133)
"""
import argparse, atexit, base64, hashlib, json, os, re, shutil, struct, subprocess, sys, tempfile

VERSAO = '9.3.0.133'
REPO = 'https://github.com/fernfei/OnlyofficePersonal'
COMMIT = '7583158067fb0c9bdb312cbdc76d4f9fa32ef6c9'   # branch 9.3.0.133 conferida em outubro de 2026
V = '9.3.0.133-24e34b4f401d86dfb31def637358e2fa/vendor'
# sha256 dos arquivos do build nesse commit, como vem do GitHub (antes das correcoes deste script). x2t.wasm e
# sdk-all.js vao para o site sem mudanca; os outros sao corrigidos adiante. Arquivo diferente = build diferente: para.
SHA256_DO_BUILD = {
    V + '/sdkjs/common/wasm/x2t/x2t.wasm': '7db02f5c74976a82c3fe630c371a163d5df669a6c84fddc553f03e76f67d3dd2',
    V + '/sdkjs/word/sdk-all.js': 'd24f52732e932c72fdaf402340ce6f60425fb753932e2edfc523ee71aa1fdc01',
    V + '/sdkjs/word/sdk-all-min.js': '81d080b5099f9b9b8c18f3ac08271129dfa6012bcdd15a244124dc903bab5ba4',
    V + '/web-apps/apps/documenteditor/main/app.js': '1ee2001a89af2ebe7a3714bdcd135faa5d6577626a5a7bb3e2c4aa3aa0645a88',
    V + '/web-apps/apps/api/documents/api.js': '8c954d5f6ee773b988d2607a2aac7e15eb4c191d40e321847a0d74c4a86c5f94',
    # tambem corrigidos por este script
    'onlyoffice.html': '86aa7850f640a384ba046462aa5b3881cb3615255787c871084d92ab2c2f9c7a',
    V + '/sdkjs/common/wasm/x2t/x2t_helper.js': '93a50eced5b4f2bf19875ea59e6bcbc2ced7d9b2221e8ae85368fb0dce203137',
    V + '/sdkjs/common/AllFonts.js': 'c3375c97382d0ef5233da457031617c847a56cd838a1132ff5e0573aa76debcc',
    V + '/web-apps/apps/documenteditor/main/locale/pt.json': '7da6ac7e3976ad75e442a524c459240ff94cfe8b5cae55493aa0e4477606fe52',
}
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Partes copiadas do build (o mesmo recorte "so Word" do montar_enxuto.sh que ja foi testado).
COPIAR = [
    'onlyoffice.html', 'LICENSE.txt',
    V + '/document_editor_service_worker.js',
    V + '/fonts',
    V + '/sdkjs/common', V + '/sdkjs/word',
    V + '/web-apps/vendor',
    V + '/web-apps/apps/api', V + '/web-apps/apps/common',
    V + '/web-apps/apps/documenteditor/main',
]
REMOVER = [V + '/web-apps/apps/documenteditor/main/resources/help']  # ajuda online (paginas grandes, nao usadas)

# ---------------------------------------------------------------- fontes
CHAVE_FONTE = [160, 102, 214, 32, 20, 150, 71, 250, 149, 105, 184, 80, 176, 65, 73, 72]  # XOR dos 32 1os bytes

# Fabricantes cujas fontes nao podem ser redistribuidas aqui (aparecem no copyright/licenca do proprio arquivo).
MARCAS_PROPRIETARIAS = ['microsoft', 'monotype', 'founder', 'sinotype', 'zhongyi', 'stone co', 'greatwall',
                        'linotype', 'eula']
# Textos que comprovam licenca livre.
MARCAS_LIVRES = ['open font license', 'scripts.sil.org/ofl', 'ofl 1.1', 'apache license', 'gnu general public',
                 'gnu gpl', 'gpl version', 'gpl v', 'gnu.org/copyleft/gpl', 'gnu.org/licenses/gpl', 'free software',
                 'dejavu', 'liberation fonts license', 'ubuntu font licen', 'arphic public license',
                 'ipa_font_license', 'free for any use']
# Revisadas a mao (o arquivo nao traz a licenca, mas a origem e conhecida).
LIVRES_REVISADAS = {
    'ASCW3': 'fonte do proprio OnlyOffice (Ascensio), distribuida com o editor (AGPL)',
    'NanumBarunGothic': 'SIL OFL 1.1 (Naver)', 'NanumGothic': 'SIL OFL 1.1 (Naver)',
    'NanumMyeongjo': 'SIL OFL 1.1 (Naver)', 'NanumSquare': 'SIL OFL 1.1 (Naver)',
    'NanumSquare Bold': 'SIL OFL 1.1 (Naver)',
    'OpenSymbol': 'LibreOffice (LGPLv3/MPL)', 'Khmer OS': 'GPL', 'Khmer OS System': 'GPL',
    'Lohit Kannada': 'SIL OFL 1.1', 'Lohit Tamil Classical': 'SIL OFL 1.1', 'Lohit Telugu': 'SIL OFL 1.1',
    'Likhan': 'GPL 2+', 'mry_KacstQurn': 'GPL', 'Mitra Mono': 'GPL (projeto Mukti)', 'Ani': 'GPL (projeto Mukti)',
    'Ubuntu': 'Ubuntu Font Licence 1.0', 'Ubuntu Condensed': 'Ubuntu Font Licence 1.0',
    'Ubuntu Light': 'Ubuntu Font Licence 1.0', 'Ubuntu Mono': 'Ubuntu Font Licence 1.0',
}
# Licenca ambigua ("glifos com copyright de terceiro"): fica de fora por cautela.
DUVIDOSAS = {'Rekha', 'padmaa'}

# Familia proprietaria -> familia livre do proprio catalogo (as de metrica compativel nao mudam a paginacao).
SUBSTITUTAS = {
    'Arial': 'Liberation Sans', 'Arial Black': 'Liberation Sans', 'Arial Narrow': 'Liberation Sans Narrow',
    'Times New Roman': 'Liberation Serif', 'Courier New': 'Liberation Mono', 'Andale Mono': 'Liberation Mono',
    'Calibri': 'Carlito', 'Cambria': 'Caladea', 'Georgia': 'DejaVu Serif',
    'Verdana': 'DejaVu Sans', 'Tahoma': 'DejaVu Sans', 'Trebuchet MS': 'DejaVu Sans',
    'Comic Sans MS': 'DejaVu Sans', 'Impact': 'DejaVu Sans',
    'Webdings': 'OpenSymbol', 'Wingdings': 'OpenSymbol', 'Symbol': 'OpenSymbol',
    'Rekha': 'Lohit Gujarati', 'padmaa': 'Lohit Gujarati',
}
# Licenca de cada familia que fica -> (rotulo, textos em fontes/licencas/). Conferida na tabela 'name' de cada
# arquivo e no repositorio ONLYOFFICE/core-fonts, de onde vieram as fontes do build. A 1a regra que casar vale.
LICENCA_POR_FAMILIA = [
    (r'^Liberation Sans Narrow$', 'GPL 2 com excecao de fontes (Liberation 1.x)', ['GPL-2.0.txt', 'GPL-excecao-de-fontes.txt']),
    (r'^Liberation ', 'SIL OFL 1.1', ['OFL-1.1.txt']),
    (r'^DejaVu', 'Bitstream Vera / DejaVu (livre)', ['DejaVu-Bitstream-Vera.txt']),
    (r'^(Carlito|Abyssinica SIL|Asana|Padauk|Lohit |Noto |Nanum)', 'SIL OFL 1.1', ['OFL-1.1.txt']),
    (r'^(Caladea|Droid Sans Fallback|Open Sans)', 'Apache 2.0', ['Apache-2.0.txt']),
    (r'^Symbola$', 'livre para qualquer uso (George Douros)', ['Symbola-uso-livre.txt']),
    (r'^AR PL UKai', 'Arphic Public License', ['Arphic-Public-License.txt']),
    (r'^Takao', 'IPA Font License 1.0', ['IPA-Font-License-1.0.txt']),
    (r'^Ubuntu', 'Ubuntu Font Licence 1.0', ['Ubuntu-Font-Licence-1.0.txt']),
    (r'^OpenSymbol$', 'MPL 2.0 (LibreOffice)', ['MPL-2.0.txt']),
    (r'^(Free(Sans|Serif|Mono)|Tibetan Machine Uni|Samyak )', 'GPL 3 com excecao de fontes', ['GPL-3.0.txt', 'GPL-excecao-de-fontes.txt']),
    (r'^(WenQuanYi Zen Hei|Pothana2000|Vemana2000)$', 'GPL 2 com excecao de fontes', ['GPL-2.0.txt', 'GPL-excecao-de-fontes.txt']),
    (r'^(Kacst|mry_KacstQurn|Jamrul$|Likhan$|Mukti Narrow$|Ani$|Mitra Mono$)', 'GPL 2', ['GPL-2.0.txt']),
    (r'^Khmer OS', 'LGPL 2.1 ou posterior', ['LGPL-2.1.txt']),
    (r'^ASCW3$', 'parte do ONLYOFFICE (AGPL 3)', ['../../LICENSE.txt']),
]

SUBSTITUTA_CJK = 'Droid Sans Fallback'   # Apache 2.0, TrueType (exporta para PDF)
SUBSTITUTA_PADRAO = 'Liberation Sans'


def falhar(msg):
    print('ERRO: ' + msg, file=sys.stderr)
    sys.exit(1)


def nomes_da_fonte(caminho):
    """Le a tabela 'name' (familia, copyright, licenca...) de um arquivo da pasta fonts do build."""
    b = bytearray(open(caminho, 'rb').read())
    for i in range(min(32, len(b))):
        b[i] ^= CHAVE_FONTE[i % 16]
    if b[:4] not in (b'\x00\x01\x00\x00', b'OTTO', b'true', b'ttcf'):
        return None
    off = struct.unpack('>I', b[12:16])[0] if b[:4] == b'ttcf' else 0
    n = struct.unpack('>H', b[off + 4:off + 6])[0]
    tabs = {}
    for i in range(n):
        t, _c, o, l = struct.unpack('>4sIII', b[off + 12 + 16 * i:off + 28 + 16 * i])
        tabs[t] = (o, l)
    o = tabs[b'name'][0]
    _f, cnt, so = struct.unpack('>HHH', b[o:o + 6])
    res = {}
    for i in range(cnt):
        pid, _e, lid, nid, ln, lo = struct.unpack('>HHHHHH', b[o + 6 + 12 * i:o + 18 + 12 * i])
        ingles = (pid == 3 and lid == 0x409) or (pid == 1 and lid == 0) or pid == 0
        if nid in res and not ingles:
            continue
        raw = bytes(b[o + so + lo:o + so + lo + ln])
        res[nid] = raw.decode('utf-16-be', 'replace') if pid in (0, 3) else raw.decode('latin-1')
    return {'familia': res.get(1, ''), 'estilo': res.get(2, ''), 'copyright': res.get(0, ''),
            'licenca': ' '.join(res.get(k, '') for k in (0, 13, 14)).lower(),
            'texto': ' '.join(res.get(k, '') for k in (0, 7, 8, 13, 14)).lower()}


def classificar(info):
    if info is None:
        return 'desconhecida', 'arquivo ilegivel'
    fam = info['familia']
    if fam in DUVIDOSAS:
        return 'duvidosa', 'licenca ambigua'
    # licenca livre escrita no copyright/licenca vale mais que o nome do fabricante
    # (as Noto, por exemplo, sao OFL mas citam a Monotype como projetista)
    for m in MARCAS_LIVRES:
        if m in info['licenca']:
            return 'livre', m
    if fam in LIVRES_REVISADAS:
        return 'livre', LIVRES_REVISADAS[fam]
    for m in MARCAS_PROPRIETARIAS:
        if m in info['texto']:
            return 'proprietaria', m
    return 'desconhecida', 'sem licenca no arquivo'


def eh_cjk(nome):
    return bool(re.search('[　-鿿가-힯]', nome)) or nome.startswith(('ST', 'FZ')) or nome in {
        'FangSong', 'SimHei', 'SimSun', 'NSimSun', 'KaiTi', 'LiSu', 'YouYuan', 'XiaoBiaoSong', 'Microsoft YaHei',
        'DengXian', 'MS Mincho', 'MS Gothic', 'Batang', 'Gulim', 'Dotum', 'MingLiU', 'PMingLiU'}


def ler_array_js(texto, nome):
    i = texto.index('window["%s"]' % nome)
    j = texto.index('[', i + len(nome) + 4)
    prof = 0
    for k in range(j, len(texto)):
        if texto[k] == '[':
            prof += 1
        elif texto[k] == ']':
            prof -= 1
            if prof == 0:
                return j, k + 1, json.loads(texto[j:k + 1])
    falhar('array %s mal formado' % nome)


def limpar_fontes(dest):
    pasta = os.path.join(dest, V, 'fonts')
    allfonts = os.path.join(dest, V, 'sdkjs/common/AllFonts.js')
    texto = open(allfonts, encoding='utf-8-sig').read()
    _a, _b, arquivos = ler_array_js(texto, '__fonts_files')
    ini, fim, linhas = ler_array_js(texto, '__fonts_infos')

    decisao, relatorio = {}, []
    for arq in sorted(os.listdir(pasta)):
        info = nomes_da_fonte(os.path.join(pasta, arq))
        tipo, motivo = classificar(info)
        decisao[arq] = tipo
        tam = os.path.getsize(os.path.join(pasta, arq))
        relatorio.append([arq, (info or {}).get('familia', ''), (info or {}).get('estilo', ''), tipo, motivo, tam,
                          ((info or {}).get('copyright', '') or '').replace('\t', ' ').replace('\n', ' ')[:120]])
    fora = {a for a, t in decisao.items() if t != 'livre'}

    por_nome = {l[0]: l for l in linhas}
    trocas = []
    for l in linhas:
        faces = [l[1], l[3], l[5], l[7]]
        if not any(p >= 0 and arquivos[p] in fora for p in faces):
            continue
        alvo = SUBSTITUTAS.get(l[0]) or (SUBSTITUTA_CJK if eh_cjk(l[0]) else SUBSTITUTA_PADRAO)
        sub = por_nome.get(alvo)
        if not sub or any(p >= 0 and arquivos[p] in fora for p in (sub[1], sub[3], sub[5], sub[7])):
            falhar('substituta %r para %r nao existe ou tambem saiu' % (alvo, l[0]))
        if alvo == SUBSTITUTA_PADRAO and l[0] not in SUBSTITUTAS:
            print('aviso: %r sem substituta definida; usando %s' % (l[0], alvo))
        l[1:9] = sub[1:9]   # a linha passa a apontar para os arquivos da substituta (o nome continua o mesmo)
        trocas.append((l[0], alvo))
    # Nenhuma linha pode continuar apontando para arquivo removido.
    for l in linhas:
        for p in (l[1], l[3], l[5], l[7]):
            if p >= 0 and arquivos[p] in fora:
                falhar('linha %r ainda aponta para %s' % (l[0], arquivos[p]))

    novo = '[\n' + ',\n'.join(json.dumps(l, ensure_ascii=False, separators=(',', ':')) for l in linhas) + '\n]'
    texto = texto[:ini] + novo + texto[fim:]
    open(allfonts, 'w', encoding='utf-8').write(texto)
    for a in fora:
        os.remove(os.path.join(pasta, a))

    os.makedirs(os.path.join(dest, 'ferramentas'), exist_ok=True)
    with open(os.path.join(dest, 'ferramentas', 'relatorio_fontes.tsv'), 'w', encoding='utf-8') as f:
        f.write('arquivo\tfamilia\testilo\tdecisao\tmotivo\tbytes\tcopyright\n')
        for r in relatorio:
            f.write('\t'.join(str(x) for x in r) + '\n')
        f.write('\n# familias redirecionadas (nome no documento -> fonte livre usada)\n')
        for de, para in trocas:
            f.write('#\t%s\t->\t%s\n' % (de, para))
    livres = len(decisao) - len(fora)
    escrever_licencas(dest, [r for r in relatorio if r[3] == 'livre'], len(fora), trocas)
    print('fontes: %d mantidas (livres), %d removidas, %d familias redirecionadas' % (livres, len(fora), len(trocas)))


def escrever_licencas(dest, mantidas, removidas, trocas):
    """fontes/LICENCAS.md: cada arquivo de fonte do site, com familia, licenca e o texto da licenca."""
    pasta = os.path.join(dest, 'fontes', 'licencas')
    linhas = []
    for arq, fam, estilo, _t, _m, tam, cop in mantidas:
        regra = next((r for r in LICENCA_POR_FAMILIA if re.search(r[0], fam)), None)
        if not regra:
            falhar('fonte %s (%s) sem licenca conhecida em LICENCA_POR_FAMILIA' % (arq, fam))
        for t in regra[2]:
            if not os.path.exists(os.path.join(pasta, t)):
                falhar('falta o texto da licenca fontes/licencas/%s' % t)
        textos = ', '.join('[%s](licencas/%s)' % (os.path.basename(t), t) for t in regra[2])
        cop = re.sub(r'\s+', ' ', cop).replace('|', '/').strip()
        linhas.append('| `%s` | %s | %s | %s | %s | %s |' % (arq, fam, estilo, regra[1], textos, cop[:90] + ('...' if len(cop) > 90 else '')))
    md = ['# Fontes do editor e suas licencas', '',
          'Gerado por `ferramentas/montar.py` (nao edite a mao). As fontes ficam em `%s/fonts/`, com o nome numerico '
          'que o build do OnlyOffice usa (o editor embaralha os 32 primeiros bytes de cada arquivo; o resto, inclusive o '
          'copyright e a licenca gravados dentro dele, e o arquivo original).' % V, '',
          'So ficaram fontes cuja licenca permite redistribuir: %d arquivos. Outros %d arquivos do build (Microsoft, '
          'Monotype, fontes chinesas comerciais e 2 de licenca ambigua) foram retirados; ver `ferramentas/relatorio_fontes.tsv`.'
          % (len(mantidas), removidas), '',
          '## Fontes do Word trocadas por fontes livres de mesmas medidas', '',
          'Um documento que pede a fonte da esquerda e mostrado e exportado (PDF) com a da direita. As de metrica compativel '
          '(Liberation, Carlito, Caladea) tem a mesma largura de cada letra, entao a paginacao nao muda.', '',
          '| No documento | Fonte usada |', '|---|---|']
    md += ['| %s | %s |' % (de, para) for de, para in trocas if not eh_cjk(de)]
    md += ['| Cambria | Caladea (o proprio editor ja faz essa troca: `FD_Ascii_Font_Like_Names` no sdkjs) |',
           '| fontes chinesas/japonesas comerciais | Droid Sans Fallback |', '',
           '## Lista completa', '',
           '| Arquivo | Familia | Estilo | Licenca | Texto da licenca | Copyright (gravado na fonte) |',
           '|---|---|---|---|---|---|'] + linhas + ['']
    os.makedirs(os.path.join(dest, 'fontes'), exist_ok=True)
    open(os.path.join(dest, 'fontes', 'LICENCAS.md'), 'w', encoding='utf-8').write('\n'.join(md))


# ---------------------------------------------------------------- correcoes de postMessage
def trocar(caminho, antes, depois, vezes=1, opcional=False):
    texto = open(caminho, encoding='utf-8').read()
    n = texto.count(antes)
    if n == 0 and opcional:
        return
    if n != vezes:
        falhar('%s: esperava %d ocorrencia(s) de %r, achei %d' % (caminho, vezes, antes[:80], n))
    open(caminho, 'w', encoding='utf-8').write(texto.replace(antes, depois))


def corrigir_mensagens(dest):
    oo = os.path.join(dest, 'onlyoffice.html')
    trocar(oo, '<html lang="zh-CN">', '<html lang="pt-BR">')
    trocar(oo, '    <link rel="icon" href="./assets/favicon.ico" type="image/x-icon"/>\n', '')
    trocar(oo, "        window.parent.postMessage(message, '*', transfer || [])",
           "        // Possari: so a pagina do proprio site que hospeda o editor (possari.html) recebe; nunca '*'.\n"
           "        window.parent.postMessage(message, window.location.origin, transfer || [])")
    # O api.js troca o <div id="editor"> pelo iframe name="frameEditor": '#editor iframe' nunca acha nada.
    trocar(oo, "        const frame = document.querySelector('#editor iframe')\n",
           "        const frame = document.querySelector('iframe[name=\"frameEditor\"]')\n")
    trocar(oo, "    function handleMessage(event) {\n        const data = event.data\n        if (!data) return\n",
           "    function editorFrameWindow() {\n"
           "        const frame = document.querySelector('iframe[name=\"frameEditor\"]')\n"
           "        return frame && frame.contentWindow\n"
           "    }\n\n"
           "    function handleMessage(event) {\n"
           "        // Possari: comandos so do proprio site -- config/save da pagina-mae (possari.html),\n"
           "        // file-stream do editor interno. Mensagem de outra origem ou janela e ignorada.\n"
           "        if (event.origin !== window.location.origin) return\n"
           "        const data = event.data\n"
           "        if (!data) return\n"
           "        const doPai = event.source === window.parent && window.parent !== window\n"
           "        const doEditor = !!event.source && event.source === editorFrameWindow()\n"
           "        if ((data.type === 'onlyoffice-config' || data.type === 'onlyoffice-save') && !doPai) return\n"
           "        if (data.type === 'onlyoffice-file-stream' && !doEditor) return\n")
    # mensagens de erro em portugues (chegam a Biblioteca como texto de erro)
    for zh, pt in [("'编辑器未就绪'", "'o editor ainda nao esta pronto'"), ("'未获取到文件流'", "'o editor nao devolveu o arquivo'"),
                   ("`编辑器错误: ", "`erro do editor: "), ("'onRequestSaveAs 未返回文件地址'", "'onRequestSaveAs sem endereco do arquivo'"),
                   ("`下载失败 HTTP ", "`falha ao baixar HTTP "), ("`文档.", "`documento."),
                   ("'本地文档缺少二进制内容'", "'documento local sem conteudo'"),
                   ("'OnlyOffice API 未加载，请检查文档服务器地址'", "'A API do editor nao carregou.'")]:
        trocar(oo, zh, pt, vezes=open(oo, encoding='utf-8').read().count(zh) or 1)

    x2t = os.path.join(dest, V, 'sdkjs/common/wasm/x2t/x2t_helper.js')
    trocar(x2t,
           "                var targets = [];\n"
           "                if (window.parent && window.parent !== window) targets.push(window.parent);\n"
           "                if (window.top && window.top !== window && window.top !== window.parent) targets.push(window.top);\n"
           "                targets.forEach(function (t) {\n"
           "                    try { t.postMessage(payload, '*'); } catch (e) {}\n"
           "                });\n",
           "                // Possari: os bytes vao so para a pagina do proprio site que hospeda o editor\n"
           "                // (onlyoffice.html), nunca para window.top nem com destino '*'.\n"
           "                if (window.parent && window.parent !== window) {\n"
           "                    try { window.parent.postMessage(payload, window.location.origin); } catch (e) {}\n"
           "                }\n")

    # Corrida do build: com o editor ja no cache do navegador, o .docx chega ao conversor antes de o catalogo de
    # fontes (AscFonts.g_font_infos) existir e a abertura falhava com "reading 'forEach'". Espera o catalogo.
    trocar(x2t,
           "    X2TConverter.prototype.fetchFonts = async function () {\n"
           "        let that = this;\n",
           "    // Possari: espera o catalogo de fontes do editor ficar pronto (ate 10 min, internet lenta) antes de usa-lo.\n"
           "    function esperarCatalogoDeFontes() {\n"
           "        return new Promise(function (resolve) {\n"
           "            var inicio = Date.now();\n"
           "            (function ver() {\n"
           "                if ((window.AscFonts && window.AscFonts.g_font_infos) || Date.now() - inicio > 600000) return resolve();\n"
           "                setTimeout(ver, 50);\n"
           "            })();\n"
           "        });\n"
           "    }\n\n"
           "    X2TConverter.prototype.fetchFonts = async function () {\n"
           "        let that = this;\n"
           "        await esperarCatalogoDeFontes();\n")

    # Na 1a abertura em cada computador o x2t.wasm (42 MB) precisa baixar inteiro antes do limite de 60 s do build;
    # com internet abaixo de ~6-10 Mbit/s a abertura falhava com o erro -82 ("Ocorreu um erro ao abrir o arquivo").
    trocar(x2t,
           "        this.INIT_TIMEOUT = 60000;\n",
           "        // Possari: 10 min. O x2t.wasm tem 42 MB e, na 1a abertura com internet lenta, passa de 60 s para baixar.\n"
           "        this.INIT_TIMEOUT = 600000;\n")

    api = os.path.join(dest, V, 'web-apps/apps/api/documents/api.js')
    trocar(api, 'buffer ? wnd.postMessage(msg, "*", [buffer]) : wnd.postMessage(window.JSON.stringify(msg), "*");',
           '// Possari: o iframe do editor e do mesmo site; destino explicito em vez de "*".\n'
           '            buffer ? wnd.postMessage(msg, window.location.origin, [buffer]) : '
           'wnd.postMessage(window.JSON.stringify(msg), window.location.origin);')

    gw_antes = 'e?window.parent.postMessage(t,"*",[e]):window.parent.postMessage(window.JSON.stringify(t),"*")'
    gw_depois = ('e?window.parent.postMessage(t,window.location.origin,[e]):'
                 'window.parent.postMessage(window.JSON.stringify(t),window.location.origin)')
    trocar(os.path.join(dest, V, 'web-apps/apps/documenteditor/main/app.js'), gw_antes, gw_depois)
    trocar(os.path.join(dest, V, 'web-apps/apps/documenteditor/main/ie/app.js'), gw_antes, gw_depois, opcional=True)

    trocar(os.path.join(dest, V, 'sdkjs/word/sdk-all-min.js'), 'a.parent&&a.parent.postMessage(ub.data,"*")',
           'a.parent&&a.parent.postMessage(ub.data,a.location.origin)')


# ---------------------------------------------------------------- nomes dos estilos em portugues
# O editor em pt-BR carrega locale/pt.json ('pt-br' nao esta entre os idiomas de 4 letras do build -- pt-pt, zh-tw,
# sr-cyrl -- e cai em 'pt'). Ali Title vinha "Titulo", Subtitle "Legenda" (igual a Caption), Heading 1..9
# "Cabecalho 1..9" e Quote "Citar". Passam a ser os nomes do Word em portugues (galeria de estilos e listas).
ESTILOS_COMO_NO_WORD = [
    ('Title', 'Titulo', 'Título'), ('Subtitle', 'Legenda', 'Subtítulo'),
    ('Quote', 'Citar', 'Citação'), ('Intense_Quote', 'Citação intensa', 'Citação Intensa'),
] + [('Heading_%d' % i, 'Cabeçalho %d' % i, 'Título %d' % i) for i in range(1, 10)]


def traduzir_estilos(dest):
    pt = os.path.join(dest, V, 'web-apps/apps/documenteditor/main/locale/pt.json')
    for chave, antes, depois in ESTILOS_COMO_NO_WORD:
        k = '"DE.Controllers.Main.txtStyle_%s":' % chave
        trocar(pt, k + json.dumps(antes, ensure_ascii=False), k + json.dumps(depois, ensure_ascii=False))
    json.loads(open(pt, encoding='utf-8').read())   # continua JSON valido
    print('estilos: %d nomes como no Word em portugues (locale/pt.json)' % len(ESTILOS_COMO_NO_WORD))


# ---------------------------------------------------------------- Content-Security-Policy
def politica(hashes):
    extra = ''.join(" 'sha256-%s'" % h for h in sorted(hashes))
    return ("default-src 'self'; "
            "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes'%s; "
            "style-src 'self' 'unsafe-inline' blob:; "
            "img-src 'self' data: blob:; font-src 'self' data: blob:; "
            "connect-src 'self' data: blob:; media-src 'self' data: blob:; "
            "worker-src 'self' blob:; frame-src 'self' blob:; child-src 'self' blob:; "
            "object-src 'none'; base-uri 'self'; form-action 'none'; manifest-src 'self'" % extra)


def h256(s):
    return base64.b64encode(hashlib.sha256(s.encode('utf-8')).digest()).decode()


def aplicar_csp(dest):
    n = 0
    for raiz, _d, arqs in os.walk(dest):
        if os.path.abspath(raiz).startswith(os.path.join(dest, 'ferramentas')):
            continue
        for a in arqs:
            if not a.endswith('.html') or (raiz == dest and a == 'possari.html'):
                continue
            caminho = os.path.join(raiz, a)
            texto = open(caminho, encoding='utf-8').read()
            if 'Content-Security-Policy' in texto:
                falhar('%s ja tem CSP' % caminho)
            hashes = set()
            for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', texto, re.S | re.I):
                hashes.add(h256(m.group(1)))
            for m in re.finditer(r'\son[a-z]+="([^"]*)"', texto):   # atributos onload="..." (precisam de 'unsafe-hashes')
                hashes.add(h256(m.group(1).replace('&#39;', "'").replace('&quot;', '"')))
            meta = '<meta http-equiv="Content-Security-Policy" content="%s">' % politica(hashes)
            m = re.search(r'<head[^>]*>', texto, re.I)
            if not m:
                falhar('%s sem <head>' % caminho)
            pos = m.end()
            # logo depois do <meta charset> (que precisa ficar nos 1os 1024 bytes), se ele vier antes de qualquer recurso
            c = re.search(r'<meta[^>]*charset[^>]*>', texto[pos:], re.I)
            r = re.search(r'<(script|link|style)\b', texto[pos:], re.I)
            if c and (not r or c.start() < r.start()):
                pos += c.end()
            texto = texto[:pos] + '\n    ' + meta + texto[pos:]
            open(caminho, 'w', encoding='utf-8').write(texto)
            n += 1
    print('CSP aplicada em %d paginas HTML do build' % n)


# ---------------------------------------------------------------- conferencia do build
def sha256_arquivo(caminho):
    h = hashlib.sha256()
    with open(caminho, 'rb') as f:
        for bloco in iter(lambda: f.read(1 << 20), b''):
            h.update(bloco)
    return h.hexdigest()


def conferir_build(origem):
    """Para se o build nao for o do commit fixado: confere o commit (se for um clone git) e o sha256 dos arquivos."""
    if os.path.isdir(os.path.join(origem, '.git')):
        head = subprocess.check_output(['git', '-C', origem, 'rev-parse', 'HEAD']).decode().strip()
        if head != COMMIT:
            falhar('o clone em %s esta no commit %s; este script so monta o %s' % (origem, head, COMMIT))
    else:
        print('aviso: %s nao e um clone git; conferindo so o sha256 dos arquivos' % origem)
    for rel, esperado in sorted(SHA256_DO_BUILD.items()):
        caminho = os.path.join(origem, rel)
        if not os.path.isfile(caminho):
            falhar('faltando no build: ' + rel)
        achado = sha256_arquivo(caminho)
        if achado != esperado:
            falhar('%s mudou (sha256 %s, esperado %s)' % (rel, achado, esperado))
    print('build conferido: commit %s, %d arquivos com o sha256 esperado' % (COMMIT[:12], len(SHA256_DO_BUILD)))


# ---------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--origem', help='clone do fernfei/OnlyofficePersonal no commit %s (branch %s)' % (COMMIT, VERSAO))
    ap.add_argument('--destino', default=SITE)
    args = ap.parse_args()
    dest = os.path.abspath(args.destino)
    tmp = None
    origem = args.origem
    if not origem:
        # clone parcial: so os arquivos que vao para o site (o repositorio inteiro tem outros editores e bem mais fontes)
        tmp = tempfile.mkdtemp(prefix='oo-build-')
        atexit.register(shutil.rmtree, tmp, True)   # apaga o clone mesmo quando o script para no meio
        origem = os.path.join(tmp, 'build')
        subprocess.check_call(['git', 'clone', '-q', '--filter=blob:none', '--no-checkout', '--depth', '1', '-b', VERSAO, REPO, origem])
        # o commit fixado, mesmo que a branch tenha andado depois (o GitHub entrega um commit pelo hash)
        subprocess.check_call(['git', '-C', origem, 'fetch', '-q', '--filter=blob:none', '--depth', '1', 'origin', COMMIT])
        padroes = ['/' + c + ('/' if '.' not in os.path.basename(c) else '') for c in COPIAR]
        padroes += ['!/' + r + '/' for r in REMOVER] + ['!*.map']
        subprocess.check_call(['git', '-C', origem, 'sparse-checkout', 'set', '--no-cone'] + padroes)
        subprocess.check_call(['git', '-C', origem, 'checkout', '-q', COMMIT])
    conferir_build(origem)
    cab = open(os.path.join(origem, V, 'sdkjs/word/sdk-all.js'), encoding='utf-8').read(400)
    if 'Version: %s' % VERSAO not in cab:
        falhar('o build em %s nao e a versao %s' % (origem, VERSAO))
    for p in COPIAR:
        if not os.path.exists(os.path.join(origem, p)):
            falhar('faltando no build: ' + p)

    # limpa so o que vem do build
    for p in ['onlyoffice.html', 'LICENSE.txt', V.split('/')[0]]:
        alvo = os.path.join(dest, p)
        if os.path.isdir(alvo):
            shutil.rmtree(alvo)
        elif os.path.exists(alvo):
            os.remove(alvo)
    for p in COPIAR:
        de, para = os.path.join(origem, p), os.path.join(dest, p)
        os.makedirs(os.path.dirname(para), exist_ok=True)
        if os.path.isdir(de):
            shutil.copytree(de, para, ignore=shutil.ignore_patterns('*.map', '.git'))
        else:
            shutil.copy2(de, para)
    for p in REMOVER:
        shutil.rmtree(os.path.join(dest, p), ignore_errors=True)

    limpar_fontes(dest)
    corrigir_mensagens(dest)
    traduzir_estilos(dest)
    aplicar_csp(dest)
    n = sum(len(f) for _r, _d, f in os.walk(os.path.join(dest, V.split('/')[0])))
    print('pronto: %s (%d arquivos do build)' % (dest, n))


if __name__ == '__main__':
    main()
