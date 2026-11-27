# Abas Abertas

**O que entra:** descobertas do dia, links comentados, ferramentas e projetos curiosos. É um log de exploração: o que achei, por que achei interessante, o que fiz com isso.

**Tom:** curioso, direto, primeira pessoa, ritmo de log. Opinião curta ("a parte mágica foi...", "anotado para roubar um dia"). Termina sem moral: "Nenhum desses vai virar projeto. E é exatamente por isso que valeu."

**Tamanho e estrutura:** 120 a 300 palavras. Intro de uma linha, lista numerada ou com marcadores (um item por achado, nome em negrito com link), fecho de uma linha. Um achado só vira post curto com um cartão de link.

**Elementos ricos:** `{% include link.html %}` para o achado principal, link em negrito nas listas, `{% include video.html %}` para demo, código para comandos, imagem/captura de tela. Aviso `.tip` para dica prática.

**Front matter:** `title`, `description` e `tags` obrigatórios. Tags típicas: ferramentas, ia, simuladores, projetos. A `description` diz o que são os achados, em uma frase.

**Não confundir:** reflexão longa sobre um tema vai para `entre-margens`; uma linha solta com link vai para `ruido-branco`.

**Esqueleto:**

```
node scripts/new-post.mjs abas-abertas "Três achados da semana"
```

```markdown
Semana curta de superfoco, então vai em ritmo de log:

1. **[Nome da coisa](https://exemplo.com)**: o que é, o que fiz, o que me surpreendeu.

2. **Outra coisa**: uma frase de contexto e uma de opinião.

Fecho curto, sem moral.
```
