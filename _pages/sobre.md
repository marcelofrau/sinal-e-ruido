---
layout: page
title: Sobre
description: "O que é o Sinal e Ruído, como o desktop funciona e os princípios por trás do site."
---

Sinal e Ruído é um caderno de campo pessoal: descobertas, reflexões, memórias e fragmentos, publicados sem pressa. O truque é que tudo mora dentro de um computador de mentira — um desktop Windows 98 com botões de janela do Windows 3.11, um navegador Netscape Communicator 4, um MS-DOS de verdade e um Bloco de Notas que não salva nada.

## Como usar

- **Duplo clique** nos ícones da área de trabalho abre seções, páginas e diálogos.
- **Menu Iniciar** na barra de tarefas tem o mesmo, mais o botão Desligar.
- Links de posts abrem em janelas popup. Sem JavaScript, viram links comuns.
- O ícone **MS-DOS Prompt** abre um DOS emulado no navegador, com shareware de época.
- O botão **Post aleatório** na barra lateral sorteia qualquer publicação pelo índice `/index.json`.

## As seções

<ul>
{% for s in site.data.sections %}
  {% assign sec = site.pages | where: 'category_key', s.key | first %}
  <li><a href="{{ s.key | prepend: '/' | append: '/' | relative_url }}">{{ s.name }}</a>{% if sec.description %} — {{ sec.description }}{% endif %}</li>
{% endfor %}
</ul>

## Princípios

- Nenhum cookie, rastreador ou contador de visitas. Só texto.
- Fontes servidas daqui (`assets/fonts/`), sem CDN de terceiros.
- Vídeos e dependências externas só carregam sob demanda.
- Leitura funciona sem JavaScript; o desktop é acessório, não requisito.
- Feed RSS em [`/feed.xml`]({{ '/feed.xml' | relative_url }}).

## Colofão

Escrito à mão no Bloco de Notas. Gerado por Jekyll, publicado via GitHub Pages. Ícones do [Windows 98 icon set](https://windowsicons.alexmeub.com/), DOS emulado com [js-dos](https://js-dos.com/). Mantido por Marcelo Frau.
