# Sinal e Ruído

Blog pessoal. Jekyll + GitHub Pages. Tema: desktop Windows 98 com janelas de botões Windows 3.11, navegador Netscape Communicator 4, posts em popup e um MS-DOS (js-dos) de verdade.

> "Desde o tempo em que não existiam abas…"

## Seções

| Seção | Categoria | Uso |
|---|---|---|
| Abas Abertas | `abas-abertas` | Descobertas, links, ferramentas |
| Entre Margens | `entre-margens` | Reflexões, equidade, filosofia |
| O Que Fica | `o-que-fica` | Memória, vivências, autocrítica |
| Fora de Escopo | `fora-de-escopo` | Devaneios, humor |
| Fragmentos | `fragmentos` | Notas curtíssimas, sem título obrigatório |

## Fluxo de publicação

```powershell
# novo post (título opcional só em fragmentos)
node scripts/new-post.mjs entre-margens "A fila não é neutra"
node scripts/new-post.mjs fragmentos

# escrever em _posts/<arquivo>.md, então validar localmente
bundle exec jekyll serve
```

Commit em `main` → GitHub Actions builda e publica no Pages. Feed em `/feed.xml`.

## Build local

O Ruby do Windows (4.0.9) não compila as gems nativas do Jekyll (eventmachine, bigdecimal). Use o WSL (Ruby 3.2.3 + `ruby-dev`, gems em `~/.gems/sinal-e-ruido`):

```powershell
# primeira vez:
#   wsl -u root -e apt-get install -y ruby-dev
#   wsl -e sh -c 'cd /mnt/d/workspace/_non_work_/sinal-e-ruido && /usr/bin/bundle3.2 config set --local path ~/.gems/sinal-e-ruido && /usr/bin/bundle3.2 install'
wsl -e sh -c 'cd /mnt/d/workspace/_non_work_/sinal-e-ruido && /usr/bin/bundle3.2 exec jekyll serve'
# → http://localhost:4000/sinal-e-ruido/
```

Deploy: push para `main` (com aprovação). Site em `https://marcelofrau.github.io/sinal-e-ruido/`.
