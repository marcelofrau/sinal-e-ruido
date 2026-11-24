# Sinal e Ruído — Agent Guide

## Scope

Blog pessoal estático. Jekyll 4.3 + GitHub Pages (deploy via Actions, não Pages nativo). Tema próprio Windows 95 / Netscape 4 em CSS puro, sem framework e sem fonte externa.

## Identity and Git

- Conta GitHub pessoal `marcelofrau`. Remote `git@github-personal:marcelofrau/sinal-e-ruido.git`.
- Git identity local: `Marcelo Frau <marcelofrau@gmail.com>`.
- Nunca usar conta corporativa, credentials, remote ou email.
- Push para `main` publica direto. Não fazer push sem aprovação explícita do usuário.

## Content Rules

- Posts em `_posts/YYYY-MM-DD-slug.md`; data no filename e no front matter devem bater.
- Front matter obrigatório: `date`, `categories` (uma das 5 chaves de `_data/sections.yml`). `title`, `tags` e `description` opcionais **apenas** na categoria `fragmentos`; nas demais, sempre incluir.
- URLs são imutáveis após publicação: permalink `/:year/:month/:title/`.
- Usar `relative_url` em todo link/asset local (site roda sob `/sinal-e-ruido/`).
- Um post por categoria nas listagens; fragmentos são renderizados como Bloco de Notas inline (include `fragment-card.html`).
- Índice estático `/index.json` (gerado de `_pages/index.json`) alimenta o botão Aleatório. Sempre via Liquid, nunca editar à mão o output.
- Criar posts com `node scripts/new-post.mjs <secao> [titulo]` — não inventar front matter na mão.

## Sections

Chaves fixas: `abas-abertas`, `entre-margens`, `o-que-fica`, `fora-de-escopo`, `fragmentos`. Não criar categoria nova sem aprovação. Páginas das seções em `_pages/<key>.md` (layout `category`, `category_key` = chave).

## Validation

Antes de considerar pronto: build via WSL sem warning e `_site/index.json` parseável. CI (`.github/workflows/pages.yml`) precisa estar verde antes do deploy.

## Local toolchain

- Ruby do Windows (4.0.9, `C:\Ruby40-x64`) NÃO compila as gems nativas do Jekyll. Nunca rodar `bundle install` do Windows aqui.
- Local: WSL com Ruby 3.2.3. Gems em `~/.gems/sinal-e-ruido` (`.bundle/config` aponta pra lá; nunca apontar `path` pro projeto — /mnt/f é world-writable e o Bundler recusa).
- Comandos: `wsl -e sh -c 'cd /mnt/f/workspace/sinal-e-ruido && /usr/bin/bundle3.2 exec jekyll build'` (ou `serve`). O shim `bundle` do Windows sombreia o do WSL — usar `/usr/bin/bundle3.2` explícito.
- CI usa Ruby 3.3 (setup-ruby), onde tudo compila normal.
