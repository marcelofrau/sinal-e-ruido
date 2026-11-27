# Ruído Branco

**O que entra:** microblog, estática do dia a dia, pensamentos soltos que não viram post. Menos cerimônia que fragmento: algo que aconteceu ou passou pela cabeça hoje.

**Tom:** casual, sem filtro e sem headline. Pode ser observação, link com uma frase, atualização do que está fazendo.

**Tamanho e estrutura:** 1 a 3 parágrafos curtos (até uns 80 palavras). Sem título, sem intertítulos, sem fecho obrigatório. Renderiza inline como micro-card na home e na seção.

**Elementos ricos:** link inline, `código` inline, uma imagem via `<figure>` sem legenda longa, ou `video.html` se o ponto é o vídeo. Sem `image:` de capa, sem avisos.

**Front matter:** `title` e `description` opcionais; `tags: []` pode ficar vazio. Rode sem título: `node scripts/new-post.mjs ruido-branco` (slug `ruido-DDMM-HHMM`). Dois ruídos no mesmo minuto colidem (o script não sobrescreve): espere ou passe título.

**Atenção ao título:** o Jekyll titleiza o slug de post sem título ("Ruido 2611 2019" vira h1 e entrada no `index.json`). É comportamento conhecido, não é erro; não "conserte" com título falso.

**Esqueleto:**

```
node scripts/new-post.mjs ruido-branco
```

```markdown
Primeira transmissão. Ligando o transmissor, ajustando a antena: por aqui vai sair estática do dia a dia, sem filtro e sem headline.
```
