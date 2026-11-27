---
layout: page
title: Sobre
description: "O que é o Sinal e Ruído, como o desktop funciona e os princípios por trás do site."
---

Sinal e Ruído é um caderno de campo pessoal: descobertas, reflexões, memórias e fragmentos, publicados sem pressa. O truque é que tudo mora dentro de um computador de mentira — um desktop Windows 98 com botões de janela do Windows 3.11, um navegador Netscape Communicator 4, um MS-DOS de verdade, Winamp, mIRC, Paint, WordPad, Campo Minado e o 3D Pinball.

## Como usar

- **Duplo clique** nos ícones da área de trabalho abre programas, páginas e diálogos.
- **Iniciar > Programas** tem o resto: Acessórios, Jogos, Internet, MS-DOS. **Iniciar > Executar...** aceita `notepad`, `winmine`, `mspaint`, `command` ou um endereço da web.
- Links de posts abrem em janelas popup. Sem JavaScript, viram links comuns.
- O Bloco de Notas e o WordPad guardam o que você escreve só neste navegador.
- No mIRC, digite `!help` para saber como entrar num servidor de IRC de verdade.
- O botão **Post aleatório** na barra lateral sorteia qualquer publicação pelo índice `/index.json`.

## As seções

<ul>
{% for s in site.data.sections %}
  {% assign sec = site.pages | where: 'category_key', s.key | first %}
  <li><a href="{{ s.key | prepend: '/' | append: '/' | relative_url }}">{{ s.name }}</a>{% if sec.description %} — {{ sec.description }}{% endif %}</li>
{% endfor %}
</ul>

## Princípios

- Nenhum cookie nem rastreador. O contador de visitas é um número anônimo, contado uma vez por sessão.
- Fontes servidas daqui (`assets/fonts/`), sem CDN de terceiros.
- Vídeos e dependências externas só carregam sob demanda.
- Leitura funciona sem JavaScript; o desktop é acessório, não requisito.
- Feed RSS em [`/feed.xml`]({{ '/feed.xml' | relative_url }}).

## Colofão

Escrito à mão no Bloco de Notas. Gerado por Jekyll, publicado via GitHub Pages. Ícones do [Windows 98 icon set](https://windowsicons.alexmeub.com/), DOS emulado com [js-dos](https://js-dos.com/). Mantido por Marcelo Frau.
