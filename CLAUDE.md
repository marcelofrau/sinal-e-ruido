# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Regras de conteúdo, identidade Git e seções estão em `AGENTS.md` (leia primeiro). Resumo do que importa aqui: nunca dar push sem aprovação explícita (push em `main` publica direto), usar só a conta pessoal `marcelofrau`, e criar posts com o script, não à mão.

## Comandos

Blog estático Jekyll 4.3 sem testes nem lint. Validação = build sem warning + `_site/index.json` parseável.

O Ruby do Windows não compila as gems nativas; **nunca rode `bundle install`/`bundle exec` pelo Windows**. Use o WSL com o binário explícito `/usr/bin/bundle3.2` (o shim `bundle` do Windows sombreia o do WSL).

O projeto vive em `D:\workspace\_non_work_\sinal-e-ruido`, ou seja `/mnt/d/workspace/_non_work_/sinal-e-ruido` no WSL. O WSL precisa de `ruby-dev` pras gems nativas.

```powershell
# build (validação)
wsl -e sh -c 'cd /mnt/d/workspace/_non_work_/sinal-e-ruido && /usr/bin/bundle3.2 exec jekyll build'
# servir em http://localhost:4000/sinal-e-ruido/
wsl -e sh -c 'cd /mnt/d/workspace/_non_work_/sinal-e-ruido && /usr/bin/bundle3.2 exec jekyll serve'
# novo post (Node, roda no Windows)
node scripts/new-post.mjs <secao> ["título"]
```

Gems ficam em `~/.gems/sinal-e-ruido` via `.bundle/config`; nunca apontar `path` para dentro do projeto (Bundler recusa diretório world-writable em `/mnt`). CI (`.github/workflows/pages.yml`) usa Ruby 3.3 e faz deploy via Actions a cada push em `main`.

## Arquitetura

- **Seções** são a fonte única em `_data/sections.yml` (5 chaves fixas). Elas alimentam a Personal Toolbar (`_includes/toolbar.html`), o taskpane, as pastas do desktop (`_includes/launchers.html`) e os links de categoria em `post.html`/`home.html`. Cada seção tem uma página em `_pages/<key>.md` (layout `category`, `category_key` = chave) e o post referencia a seção em `categories: [<key>]`. O `scripts/new-post.mjs` tem a lista de seções duplicada; ao mudar `sections.yml`, mude o script também.
- **`_pages` é uma collection** (`output: true`, permalink `/:path/`), não o `pages` padrão. Cada arquivo precisa de `permalink:` explícito no front matter.
- **Fragmentos** (`categories: [fragmentos]`) não têm página própria na listagem: `home.html` e `category.html` renderizam o conteúdo inline via `_includes/fragment-card.html` (moldura "Bloco de Notas"). Posts normais viram `post-item` com título e `description`. Título é opcional só em fragmentos, então qualquer template que use `post.title` precisa de fallback (`default: 'Fragmento'`).
- **`/index.json`** vem de `_pages/index.json` (Liquid + `jsonify`) e é consumido por `assets/js/random.js` (botão Aleatório) a partir de `data-baseurl` no `<html>`. Se mudar o formato do índice, ajuste os dois.
- **`assets/js/search.js`** só é carregado por `_layouts/archive.html` e filtra `li[data-text]` no cliente; `random.js` (qualquer `[data-random]`) é carregado por `default.html`.
- **Desktop / "SO"**: `_layouts/default.html` monta o desktop (ícones de `_data/desktop.yml` + pastas das seções), a janela do Netscape (`titlebar` + `toolbar` + `masthead` + `sidebar` + `statusbar`), a barra de tarefas, o menu Iniciar e os `<template>` (`tpl-win`, `tpl-dlg-<id>`). Toda a lógica está em `assets/js/desktop.js`: janelas (arrastar, min/max, menu de controle 3.11), taskbar, `data-open` (`browser`, `dos`, `notepad`, `shutdown`, `dlg:<id>`; o Bloco de Notas salva em `localStorage`), `data-cmd` da toolbar, throbber (`html.is-loading`).
- **Popups de post**: `a[data-popup]` → `fetch` da página do post, extrai o `.post` e mostra numa janela em cascata, com `pushState` pra URL real do post (back fecha). Por isso o `post.html` precisa manter o `article.post` com o `h1`. Acesso direto à URL renderiza o post na janela principal.
- **MS-DOS**: js-dos v8 do CDN (`v8.js-dos.com/latest`), carregado só ao abrir; bundle em `site.dos_bundle` (`_config.yml`, exposto via `data-dos` no `<html>`). O `assets/dos/shareware.jsdos` é gerado por `scripts/build-dos-bundle.py` (os zips de origem ficam fora do repo; licenças em `assets/dos/FONTES.md`). Em `.BAT`, nunca use `|`, `<` ou `>` em `echo`.
- **Tema** é CSS puro em `assets/css/site.css` (chrome 98/3.11 e Netscape 4; conteúdo em leitura moderna com detalhes retrô), sem framework. As fontes (Fraunces nos títulos, Newsreader no texto, IBM Plex Mono em metadados e código, Silkscreen nos rótulos pixel, só a 16px) vêm do Google Fonts mas ficam versionadas em `assets/fonts/` e são servidas pelo site, nunca pelo CDN do Google. O layout do conteúdo usa container queries em `.ns-content`/`.pop-page`, ou seja, responde ao tamanho da janela e não da tela. Ícones em três lugares: `assets/icons/` (PNGs 32px do set Windows 98 para desktop, diálogos e menu Iniciar, referenciados pelo nome sem `.png`); `assets/img/ns/` (toolbar do Netscape, recortes do tema Classic do Mozilla 1.x, MPL, com o README de origem); e `_includes/fa-sprite.html` (Font Awesome Free, CC BY 4.0, embutido como `<symbol id="fa-NOME">` e usado na sidebar; o `icon` e a `color` de cada seção estão em `sections.yml`; para um ícone novo, gere o sprite de novo a partir dos SVGs em `@fortawesome/fontawesome-free/svgs/solid/`). A bandeira do Iniciar é o `#i-start` em `ns-sprite.html`, desenhado pixel a pixel. A faixa do título do post usa a `color` da seção (`--band`). O throbber é o GIF original do Netscape (`assets/img/netscape-throbber.gif`, sempre animado; o `.png` é o quadro parado usado com `prefers-reduced-motion`).
- **Conteúdo rico nos posts**: `{% include video.html youtube="ID" %}` (também `vimeo=` ou `src=` mp4; o iframe só entra no clique), `{% include link.html url=… title=… desc=… %}` (cartão de link) e avisos via IAL do kramdown (`> texto` + `{: .note}` / `.tip` / `.warn`). `image:` no front matter vira miniatura na listagem e imagem de topo no post. Includes usados dentro de Markdown precisam ter saída sem linha em branco e sem indentação (`{%- -%}`), senão o kramdown quebra o HTML. A referência visual de tudo isso está em `/estilos/` (`_pages/estilos.md`, `noindex` e fora do sitemap).
- **Build local sem WSL**: `podman run --rm -v "<repo>:/srv" -v sr-gems:/gems -e BUNDLE_PATH=/gems -e BUNDLE_APP_CONFIG=/tmp/bundle -w /srv docker.io/library/ruby:3.3 sh -c "bundle install && bundle exec jekyll build"`, igual ao CI.
- **`baseurl: /sinal-e-ruido`**: todo link/asset local passa por `relative_url`; em JS use `data-baseurl` (veja `random.js`), nunca caminho absoluto.
