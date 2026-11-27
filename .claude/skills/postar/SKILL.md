---
name: postar
description: Cria e publica um post no blog Sinal e Ruído a partir de material colado (texto, links, imagens, vídeos), escolhendo a seção certa. Usar quando o dono pedir "postar", "posta isso", "me ajuda a postar", "novo post", "publicar no blog", "escreve um post sobre isso", "manda pro ruído branco", "salva como fragmento" ou colar conteúdo para virar post.
---

# Postar no Sinal e Ruído

Leia `AGENTS.md` e `CLAUDE.md` do repo se ainda não leu. Regras duras: conta pessoal `marcelofrau`, nunca push sem aprovação, nunca front matter à mão.

## 1. Entender e escolher a seção

Leia o material colado (texto, links, imagens, vídeos). Escolha a seção:

| Chave | Critério |
|---|---|
| `abas-abertas` | descoberta, link comentado, ferramenta, projeto curioso (log de exploração) |
| `entre-margens` | reflexão sobre mundo, equidade, justiça social, direitos, política, filosofia cotidiana |
| `o-que-fica` | memória, vivência pessoal, marcas do passado, autocrítica, aprendizado |
| `fora-de-escopo` | devaneio, humor ácido, observação que não cabe em gaveta |
| `linha-de-comando` | programação: código, ferramentas, scripts, diagramas, explicação técnica |
| `fragmentos` | nota curtíssima, ideia embrionária, semente de assunto maior |
| `ruido-branco` | microblog: pensamento solto do dia, sem pretensão de post |

Leia `secoes/<chave>.md` da escolhida. Pergunte ao usuário só se estiver ambíguo entre duas seções (cite as duas). Se o usuário disser a seção, use a dele. Não crie seção nova.

## 2. Criar o arquivo

Sempre com o script, da raiz do repo:

```
node scripts/new-post.mjs <secao> "Título curto"
```

Em `fragmentos` e `ruido-branco`, omita o título (o slug sai automático). Nas demais, preencha `description` (uma frase, a mesma que aparece na listagem) e `tags` (minúsculas, sem acento, 1 a 3). Não mexa em `date` nem no nome do arquivo.

## 3. Escrever

- Preserve as palavras do usuário. Edição leve: pontuação, typos, parágrafos. Português do Brasil.
- Não invente fatos, citações, links nem números. Faltou informação, pergunte ou deixe de fora.
- Título curto, sem clickbait. O texto é do autor: não acrescente conclusão moralizante nem "em resumo".
- Link local sempre com `relative_url`; nunca caminho absoluto.

## 4. Conteúdo rico

- **Imagem de capa/miniatura:** copie o arquivo para `assets/img/posts/<slug>/` (nome minúsculo, sem espaços; reduza se for enorme) e ponha no front matter `image: /assets/img/posts/<slug>/arq.jpg`, `image_alt: "..."`, `image_caption: "..."` (opcional). `hero: banner` faz a imagem virar faixa de título.
- **Imagem inline:** `<figure>` direto no Markdown, sem linha em branco dentro e sem indentação:
  `<figure><img src="{{ '/assets/img/posts/<slug>/arq.jpg' | relative_url }}" alt="..."><figcaption>...</figcaption></figure>`
- **Vídeo:** `{% include video.html youtube="ID" title="..." caption="..." %}` (também `vimeo="ID"` ou `src="/assets/media/x.mp4"`). Extraia o ID da URL.
- **Link:** `{% include link.html url="..." title="..." desc="por que vale o clique" %}`.
- **Código:** cercas com a linguagem (```js). **Diagramas:** cerca ```mermaid. **Fórmulas:** `$$...$$`.
- **Avisos:** citação seguida de `{: .note}`, `{: .tip}` ou `{: .warn}` na linha logo abaixo.
- Referência visual de tudo: `_pages/estilos.md`.

Imagem que o usuário só descreveu ou colou no chat sem arquivo: peça o caminho do arquivo.

## 5. Validar

Build sem warning e índice parseável. Não use `bundle` do Windows.

```
wsl -e sh -c 'cd /mnt/d/workspace/_non_work_/sinal-e-ruido && /usr/bin/bundle3.2 exec jekyll build'
```

Sem WSL: `podman run --rm -v "<repo>:/srv" -v sr-gems:/gems -e BUNDLE_PATH=/gems -e BUNDLE_APP_CONFIG=/tmp/bundle -w /srv docker.io/library/ruby:3.3 sh -c "bundle install && bundle exec jekyll build"`.

Depois: `node -e "JSON.parse(require('fs').readFileSync('_site/index.json','utf8'))"`. Confira que o post aparece em `_site/` e que imagens/vídeos têm o caminho certo. Corrija qualquer warning antes de seguir.

## 6. Mostrar, commitar, publicar

1. Mostre ao usuário o caminho do arquivo, o conteúdo final e um resumo de 2 linhas (seção escolhida, o que foi editado). Aceite ajustes.
2. Confirme a identidade: `git config user.email` deve ser `marcelofrau@gmail.com`. Se não for, pare.
3. Commit só dos arquivos do post (`git add` explícito, nunca `-A`), mensagem no estilo do repo: `post(<secao>): <título>` (fragmento/ruído sem título: `post(fragmentos): fragmento sobre <tema>`). Inclua a linha de co-autoria exigida pelo ambiente.
4. **Push em `main` publica direto.** Só faça push com aprovação explícita do usuário nesta conversa. Pergunte: "Posso dar push?".
5. Após o push: `gh run list -R marcelofrau/sinal-e-ruido -L 1`; espere ficar verde (`gh run watch`) e informe a URL: `https://marcelofrau.github.io/sinal-e-ruido/AAAA/MM/<slug>/`.

## Editar ou apagar post existente

- URL é imutável depois de publicado: nunca renomeie o arquivo nem mude `date` (muda o permalink). Edite só o conteúdo, `description` e `tags`.
- Título mudou? Mude só o `title`; o slug do arquivo fica.
- Apagar quebra links já compartilhados: confirme com o usuário antes. Mesmo fluxo de validar, commit e aprovação de push.
