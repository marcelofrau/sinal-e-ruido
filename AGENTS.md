# Sinal e Ruído — Agent Guide

## Scope

Blog pessoal estático. Jekyll 4.3 + GitHub Pages (deploy via Actions, não Pages nativo). Tema próprio em CSS puro, sem framework; fontes do Google Fonts versionadas em `assets/fonts/` (nunca o CDN): desktop Windows 98 (janelas com os botões do Windows 3.11), navegador Netscape Communicator 4 e páginas de leitura moderna com detalhes retrô. Ícones: PNGs do Windows 98 versionados em `assets/icons/`. Dependências externas só sob demanda: js-dos v8 (CDN), carregado ao abrir o MS-DOS, e iframes de YouTube/Vimeo, carregados no clique do vídeo. Única chamada externa em todo carregamento: o contador de visitas (abacus, um `fetch` JSON sem cookie, só no GitHub Pages). Conteúdo rico (vídeo, cartão de link, avisos): ver `CLAUDE.md` e `/estilos/`.

## Identity and Git

- Conta GitHub pessoal `marcelofrau`. Remote `git@github-personal:marcelofrau/sinal-e-ruido.git`.
- Git identity local: `Marcelo Frau <marcelofrau@gmail.com>`.
- Nunca usar conta corporativa, credentials, remote ou email.
- Push para `main` publica direto. Não fazer push sem aprovação explícita do usuário.

## Content Rules

- Posts em `_posts/YYYY-MM-DD-slug.md`; data no filename e no front matter devem bater.
- Front matter obrigatório: `date`, `categories` (uma das chaves de `_data/sections.yml`). `title`, `tags` e `description` opcionais **apenas** nas categorias `fragmentos` e `ruido-branco`; nas demais, sempre incluir.
- URLs são imutáveis após publicação: permalink `/:year/:month/:title/`.
- Usar `relative_url` em todo link/asset local (site roda sob `/sinal-e-ruido/`).
- Um post por categoria nas listagens; fragmentos são renderizados como Bloco de Notas inline (include `fragment-card.html`); posts de `ruido-branco` (microblog) são renderizados inline pelo include `micro-card.html`.
- Links para posts em listagens levam `data-popup` (abrem em janela popup via `assets/js/desktop.js`, que extrai o `.post` da página do post). Sem JS, viram link normal.
- Índice estático `/index.json` (gerado de `_pages/index.json`) alimenta o botão Aleatório. Sempre via Liquid, nunca editar à mão o output.
- Criar posts com `node scripts/new-post.mjs <secao> [titulo]` — não inventar front matter na mão.
- Comentários nos posts via giscus: IDs vêm das Actions Variables `GISCUS_REPO_ID`/`GISCUS_CATEGORY_ID` no CI (`scripts/prepare-giscus.mjs` gera o gitignored `_data/giscus.yml`). Sem as variáveis, build sai sem comentários. O loader fica em `assets/js/desktop.js` (`activateGiscus`), pois o popup extrai o `.post` sem executar scripts.

## Sections

Chaves fixas: `abas-abertas`, `entre-margens`, `o-que-fica`, `fora-de-escopo`, `fragmentos`, `ruido-branco`. Não criar categoria nova sem aprovação. Páginas das seções em `_pages/<key>.md` (layout `category`, `category_key` = chave).

## Validation

Antes de considerar pronto: build via WSL sem warning e `_site/index.json` parseável. CI (`.github/workflows/pages.yml`) precisa estar verde antes do deploy.

## Local toolchain

- Ruby do Windows (4.0.9, `C:\Ruby40-x64`) NÃO compila as gems nativas do Jekyll. Nunca rodar `bundle install` do Windows aqui.
- Local: WSL com Ruby 3.2.3 + `ruby-dev` (headers pras gems nativas). Gems em `~/.gems/sinal-e-ruido` (`.bundle/config` aponta pra lá via `bundle3.2 config set --local path ~/.gems/sinal-e-ruido`; nunca apontar `path` pro projeto — /mnt é world-writable e o Bundler recusa).
- Comandos: `wsl -e sh -c 'cd /mnt/d/workspace/_non_work_/sinal-e-ruido && /usr/bin/bundle3.2 exec jekyll build'` (ou `serve`). O shim `bundle` do Windows sombreia o do WSL — usar `/usr/bin/bundle3.2` explícito.
- CI usa Ruby 3.3 (setup-ruby), onde tudo compila normal.
