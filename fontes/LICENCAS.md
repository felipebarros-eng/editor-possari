# Fontes do editor e suas licencas

Gerado por `ferramentas/montar.py` (nao edite a mao). As fontes ficam em `9.3.0.133-24e34b4f401d86dfb31def637358e2fa/vendor/fonts/`, com o nome numerico que o build do OnlyOffice usa (o editor embaralha os 32 primeiros bytes de cada arquivo; o resto, inclusive o copyright e a licenca gravados dentro dele, e o arquivo original).

So ficaram fontes cuja licenca permite redistribuir: 186 arquivos. Outros 81 arquivos do build (Microsoft, Monotype, fontes chinesas comerciais e 2 de licenca ambigua) foram retirados; ver `ferramentas/relatorio_fontes.tsv`.

## Fontes do Word trocadas por fontes livres de mesmas medidas

Um documento que pede a fonte da esquerda e mostrado e exportado (PDF) com a da direita. As de metrica compativel (Liberation, Carlito, Caladea) tem a mesma largura de cada letra, entao a paginacao nao muda.

| No documento | Fonte usada |
|---|---|
| Andale Mono | Liberation Mono |
| Arial | Liberation Sans |
| Arial Black | Liberation Sans |
| Calibri | Carlito |
| Comic Sans MS | DejaVu Sans |
| Courier New | Liberation Mono |
| Georgia | DejaVu Serif |
| Impact | DejaVu Sans |
| padmaa | Lohit Gujarati |
| Rekha | Lohit Gujarati |
| Times New Roman | Liberation Serif |
| Trebuchet MS | DejaVu Sans |
| Verdana | DejaVu Sans |
| Webdings | OpenSymbol |
| Cambria | Caladea (o proprio editor ja faz essa troca: `FD_Ascii_Font_Like_Names` no sdkjs) |
| fontes chinesas/japonesas comerciais | Droid Sans Fallback |

## Lista completa

| Arquivo | Familia | Estilo | Licenca | Texto da licenca | Copyright (gravado na fonte) |
|---|---|---|---|---|---|
| `050` | DejaVu Sans | Bold | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `051` | DejaVu Sans Mono | Bold | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `052` | DejaVu Sans Mono | Bold Oblique | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `053` | DejaVu Sans Mono | Oblique | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `054` | DejaVu Serif | Bold | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `055` | Liberation Mono | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `056` | Liberation Mono | Bold Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `057` | Liberation Mono | Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `058` | Liberation Mono | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `059` | Liberation Sans | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `060` | Liberation Sans | Bold Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `061` | Liberation Sans | Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `062` | Liberation Sans | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `063` | Liberation Sans Narrow | Bold | GPL 2 com excecao de fontes (Liberation 1.x) | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2010 Oracle and/or its affiliates |
| `064` | Liberation Sans Narrow | Bold Italic | GPL 2 com excecao de fontes (Liberation 1.x) | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2010 Oracle and/or its affiliates |
| `065` | Liberation Sans Narrow | Italic | GPL 2 com excecao de fontes (Liberation 1.x) | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2010 Oracle and/or its affiliates |
| `066` | Liberation Sans Narrow | Regular | GPL 2 com excecao de fontes (Liberation 1.x) | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2010 Oracle and/or its affiliates |
| `067` | Liberation Serif | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `068` | Liberation Serif | Bold Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `069` | Liberation Serif | Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `070` | Liberation Serif | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Digitized data copyright (c) 2010 Google Corporation. Copyright (c) 2012 Red Hat, Inc. |
| `100` | ASCW3 | Regular | parte do ONLYOFFICE (AGPL 3) | [LICENSE.txt](licencas/../../LICENSE.txt) | Copyright (c) Ascensio System SIA 2012-2014. All rights reserved |
| `101` | Abyssinica SIL | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright (c) 2000-2013 by SIL International. All rights reserved. |
| `102` | Symbola | Regular | livre para qualquer uso (George Douros) | [Symbola-uso-livre.txt](licencas/Symbola-uso-livre.txt) | Unicode Fonts for Ancient Scripts; George Douros; 2017 |
| `103` | AR PL UKai CN | Book | Arphic Public License | [Arphic-Public-License.txt](licencas/Arphic-Public-License.txt) | This font is derieved from the "AR PL " and "AR PL " fonts. ((c) Copyright 1994-1999, Arph... |
| `104` | Asana | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright (C) 2007-2015 Apostolos Syropoulos. Copyright (C) 2000 Young Ryu. Copyright (C) ... |
| `105` | Caladea | Bold | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Copyright (c) 2012 Huerta Tipografia |
| `106` | Caladea | Italic | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Copyright (c) 2012 Huerta Tipografia |
| `107` | Caladea | Italic | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Copyright (c) 2012 Huerta Tipografia |
| `108` | Caladea | Regular | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Copyright (c) 2012 Huerta Tipografia |
| `109` | Carlito | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright (c) 2010-2013 by tyPoland Lukasz Dziedzic with Reserved Font Name "Carlito". Lic... |
| `110` | Carlito | Bold Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright (c) 2010-2013 by tyPoland Lukasz Dziedzic with Reserved Font Name "Carlito". Lic... |
| `111` | Carlito | Italic | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright (c) 2010-2013 by tyPoland Lukasz Dziedzic with Reserved Font Name "Carlito". Lic... |
| `112` | Carlito | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright (c) 2010-2013 by tyPoland Lukasz Dziedzic with Reserved Font Name "Carlito". Lic... |
| `113` | DejaVu Math TeX Gyre | Regular | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `114` | DejaVu Sans | Bold Oblique | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `115` | DejaVu Sans Light | ExtraLight | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `116` | DejaVu Sans | Oblique | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `117` | DejaVu Sans | Book | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `118` | DejaVu Sans Condensed | Bold | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `119` | DejaVu Sans Condensed | Bold Oblique | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `120` | DejaVu Sans Condensed | Oblique | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `121` | DejaVu Sans Condensed | Book | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Copyright (c) 2006 by Tavmjong ... |
| `122` | DejaVu Sans Mono | Book | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `123` | DejaVu Serif | Bold Italic | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `124` | DejaVu Serif | Italic | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `125` | DejaVu Serif | Book | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `126` | DejaVu Serif Condensed | Bold | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `127` | DejaVu Serif Condensed | Bold Italic | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `128` | DejaVu Serif Condensed | Italic | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `129` | DejaVu Serif Condensed | Book | Bitstream Vera / DejaVu (livre) | [DejaVu-Bitstream-Vera.txt](licencas/DejaVu-Bitstream-Vera.txt) | Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. DejaVu changes are in public do... |
| `130` | Droid Sans Fallback | Regular | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Digitized data copyright Google Corporation © 2006 |
| `131` | Jamrul | Normal | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | Copyright (C) Deepayan Sarkar <deepayan@bengalinux.org>, Free Software Foundation, Inc. (n... |
| `132` | Likhan | Normal | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | Copyright Deepayan Sarkar <deepayan@bengalinux.org> License: GPL version 2 (or later, at y... |
| `133` | Mukti Narrow | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | GNU GPL © Mukta Bangla Font Project 2003 Free Software. For detail licence agreement see w... |
| `134` | Mukti Narrow | Bold | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | GNU GPL © Mukta Bangla Font Project 2002-3 Free Software. For detail licence agreement see... |
| `135` | Ani | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | © Dr Anirban Mitra 2002 Free Software |
| `136` | Mitra Mono | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) |  |
| `139` | Pothana2000 | Regular | GPL 2 com excecao de fontes | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright (c) 2000, 2006 K.Desikachary GNU GPL V.2 or later (with Font Exception) |
| `140` | Vemana2000 | Regular | GPL 2 com excecao de fontes | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright (c) 2005 K.Desikachary , GNU GPL V.2 or later (with Font Exception) |
| `141` | FreeMono | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `142` | FreeMono | Bold | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `143` | FreeMono | Bold Oblique | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `144` | FreeMono | Oblique | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `145` | FreeSans | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `146` | FreeSans | Bold | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `147` | FreeSans | Bold Oblique | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `148` | FreeSans | Oblique | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `149` | FreeSerif | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `150` | FreeSerif | Bold | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `151` | FreeSerif | Bold Italic | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `152` | FreeSerif | Italic | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright 2002, 2003, 2005, 2008, 2009, 2010, 2012 GNU Freefont contributors. |
| `153` | KacstOne | Bold | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST.... |
| `154` | KacstOne | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST.... |
| `155` | KacstArt | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `156` | KacstBook | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `157` | KacstDecorative | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `158` | KacstDigital | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `159` | KacstFarsi | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `160` | KacstLetter | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `161` | KacstNaskh | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `162` | KacstOffice | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `163` | KacstPen | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `164` | KacstPoster | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `165` | KacstQurn | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `166` | KacstScreen | KacstScreen | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `167` | KacstTitle | Medium | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `168` | KacstTitleL | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | KACST holds the copyright of the included Arabic font which is donated under GPL by KACST. |
| `169` | mry_KacstQurn | Regular | GPL 2 | [GPL-2.0.txt](licencas/GPL-2.0.txt) | Copyright (C) Meor Ridzuan, meory at yahoo dot com, donated under GPL. KACST holds the cop... |
| `170` | Lohit Assamese | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-15 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `171` | Lohit Bengali | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-15 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `172` | Lohit Devanagari | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-12 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `173` | Lohit Gujarati | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-13 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `174` | Lohit Kannada | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-12 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Licens... |
| `175` | Lohit Malayalam | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013-14 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `176` | Lohit Odia | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-15 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `177` | Lohit Gurmukhi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2014-15 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `178` | Lohit Tamil Classical | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-12 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Licens... |
| `179` | Lohit Tamil | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-14 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Open t... |
| `180` | Lohit Telugu | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2011-15 Lohit Fonts Project contributors. <http://fedorahosted.org/lohit> Licens... |
| `181` | NanumBarunGothic | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright ⓒ 2013 NHN Corporation. All rights reserved. Font designed by FONTRIX Inc. |
| `182` | NanumBarunGothic | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright ⓒ 2013 NHN Corporation. All rights reserved. Font designed by FONTRIX Inc. |
| `183` | NanumGothic | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright © 2011 NHN Corporation. All rights reserved. Font designed by Sandoll Communicat... |
| `184` | NanumGothic | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright © 2011 NHN Corporation. All rights reserved. Font designed by Sandoll Communicat... |
| `185` | NanumMyeongjo | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright © 2010 NHN Corporation. All rights reserved. Font designed by FONTRIX. |
| `186` | NanumSquare Bold | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright ⓒ 2016 NAVER Corporation. All rights reserved. Font designed by Sandoll Communic... |
| `187` | NanumSquare | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright ⓒ 2016 NAVER Corporation. All rights reserved. Font designed by Sandoll Communic... |
| `188` | Noto Emoji | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `189` | Noto Naskh Arabic | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2014 Google Inc. All Rights Reserved. |
| `190` | Noto Naskh Arabic | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2014 Google Inc. All Rights Reserved. |
| `191` | Noto Naskh Arabic UI | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `192` | Noto Naskh Arabic UI | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `193` | Noto Sans Adlam Unjoined | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `194` | Noto Sans AnatoHiero | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `195` | Noto Sans Avestan | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `196` | Noto Sans Bamum | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `197` | Noto Sans Brahmi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `198` | Noto Sans Buginese | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `199` | Noto Sans Canadian Aboriginal | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `200` | Noto Sans Chakma | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `201` | Noto Sans Cuneiform | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `202` | Noto Sans Cypriot | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `203` | Noto Sans EgyptHiero | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `204` | Noto Sans Glagolitic | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `205` | Noto Sans ImpAramaic | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `206` | Noto Sans InsPahlavi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `207` | Noto Sans InsParthi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `208` | Noto Sans Javanese | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `209` | Noto Sans Kaithi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `210` | Noto Sans Kayah Li | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `211` | Noto Sans Kharoshthi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `212` | Noto Sans Limbu | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `213` | Noto Sans Lydian | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `214` | Noto Sans Mongolian | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `215` | Noto Sans NewTaiLue | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `216` | Noto Sans Osage | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `217` | Noto Sans Osmanya | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `218` | Noto Sans Phoenician | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `219` | Noto Sans Rejang | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `220` | Noto Sans Tagalog | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `221` | Noto Sans Tagbanwa | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `222` | Noto Sans Tai Le | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2012 Google Inc. All Rights Reserved. |
| `223` | Noto Sans Tai Tham | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2013 Google Inc. All Rights Reserved. |
| `224` | Noto Sans Tamil | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `225` | Noto Sans Yi | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2017 Google Inc. All Rights Reserved. |
| `226` | Noto Serif Sinhala | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright 2016 Google Inc. All Rights Reserved. |
| `227` | Noto Sans KR Black | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | © 2014-2020 Adobe (http://www.adobe.com/). |
| `228` | Noto Sans KR | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | © 2014-2020 Adobe (http://www.adobe.com/). |
| `229` | Noto Sans KR Light | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | © 2014-2020 Adobe (http://www.adobe.com/). |
| `230` | Noto Sans KR Medium | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | © 2014-2020 Adobe (http://www.adobe.com/). |
| `231` | Noto Sans KR | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | © 2014-2020 Adobe (http://www.adobe.com/). |
| `232` | Noto Sans KR Thin | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | © 2014-2020 Adobe (http://www.adobe.com/). |
| `233` | OpenSymbol | Regular | MPL 2.0 (LibreOffice) | [MPL-2.0.txt](licencas/MPL-2.0.txt) | (c) 2009 Sun Microsystems Inc. THERE DOES NOT EXIST (c) 2011 Julien Nabet PRECEDES <-> DOE... |
| `234` | Open Sans | Bold | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Digitized data copyright © 2010-2011, Google Corporation. |
| `235` | Open Sans Extrabold | Regular | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Digitized data copyright © 2011, Google Corporation. |
| `236` | Open Sans Light | Regular | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Digitized data copyright © 2010-2011, Google Corporation. |
| `237` | Open Sans | Regular | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Digitized data copyright © 2010-2011, Google Corporation. |
| `238` | Open Sans Semibold | Regular | Apache 2.0 | [Apache-2.0.txt](licencas/Apache-2.0.txt) | Digitized data copyright © 2011, Google Corporation. |
| `239` | Padauk | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright SIL International, all rights reserved |
| `240` | Padauk Book | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright SIL International, all rights reserved |
| `241` | Padauk Book | Bold | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright SIL International, all rights reserved |
| `242` | Padauk | Regular | SIL OFL 1.1 | [OFL-1.1.txt](licencas/OFL-1.1.txt) | Copyright SIL International, all rights reserved |
| `243` | Samyak Gujarati | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Created by: Rahul Bhalerao <b.rahul.pm@gmail.com>, Sandeep Shedmake <sandeep.shedmake@gmai... |
| `244` | Samyak Malayalam | Medium | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Created by: Rahul Bhalerao <b.rahul.pm@gmail.com>, Sandeep Shedmake <sandeep.shedmake@gmai... |
| `245` | Samyak Tamil | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Created by: Rahul Bhalerao <b.rahul.pm@gmail.com>, Sandeep Shedmake <sandeep.shedmake@gmai... |
| `246` | Samyak Devanagari | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Created by: Rahul Bhalerao <b.rahul.pm@gmail.com>, Sandeep Shedmake <sandeep.shedmake@gmai... |
| `247` | TakaoExGothic | Regular | IPA Font License 1.0 | [IPA-Font-License-1.0.txt](licencas/IPA-Font-License-1.0.txt) | Copyright(c) Information-technology Promotion Agency, Japan (IPA), 2003-2009. You must acc... |
| `248` | TakaoGothic | Regular | IPA Font License 1.0 | [IPA-Font-License-1.0.txt](licencas/IPA-Font-License-1.0.txt) | Copyright(c) Information-technology Promotion Agency, Japan (IPA), 2003-2011. Copyright(c)... |
| `249` | TakaoPGothic | Regular | IPA Font License 1.0 | [IPA-Font-License-1.0.txt](licencas/IPA-Font-License-1.0.txt) | Copyright(c) Information-technology Promotion Agency, Japan (IPA), 2003-2011. Copyright(c)... |
| `250` | Tibetan Machine Uni | Regular | GPL 3 com excecao de fontes | [GPL-3.0.txt](licencas/GPL-3.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright (c) 2003-2007 by Tibetan and Himalayan Digital Library (THDL). Portions (c) Copy... |
| `251` | Khmer OS | Regular | LGPL 2.1 ou posterior | [LGPL-2.1.txt](licencas/LGPL-2.1.txt) | KhmerOS - font for the Khmer language of Cambodia Copyright 2005 Danh Hong Copyright 2005 ... |
| `252` | Khmer OS System | Regular | LGPL 2.1 ou posterior | [LGPL-2.1.txt](licencas/LGPL-2.1.txt) | KhmerOS - font for the Khmer language of Cambodia Copyright 2005 Danh Hong Copyright 2005 ... |
| `253` | Ubuntu | Bold | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `254` | Ubuntu | Bold Italic | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `255` | Ubuntu Condensed | Regular | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `256` | Ubuntu Light | Regular | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `257` | Ubuntu Light | Italic | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `258` | Ubuntu Light | Bold | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `259` | Ubuntu Light | Bold Italic | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `260` | Ubuntu | Regular | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `261` | Ubuntu | Italic | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `262` | Ubuntu Mono | Bold | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `263` | Ubuntu Mono | Bold Italic | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `264` | Ubuntu Mono | Regular | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `265` | Ubuntu Mono | Italic | Ubuntu Font Licence 1.0 | [Ubuntu-Font-Licence-1.0.txt](licencas/Ubuntu-Font-Licence-1.0.txt) | Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0 |
| `266` | WenQuanYi Zen Hei | Regular | GPL 2 com excecao de fontes | [GPL-2.0.txt](licencas/GPL-2.0.txt), [GPL-excecao-de-fontes.txt](licencas/GPL-excecao-de-fontes.txt) | Copyright (c) Qianqian Fang and WenQuanYi Board of Trustees Version: 0.9 Codename: Fightin... |
