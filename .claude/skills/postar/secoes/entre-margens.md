# Entre Margens

**O que entra:** reflexões sobre o mundo, equidade, justiça social, direitos, política e filosofia cotidiana. Argumento com ponto de vista, partindo de uma imagem ou situação concreta.

**Tom:** firme e claro, sem panfleto. Frases curtas, uma metáfora central que sustenta o texto (a fila, o dado marcado). Primeira pessoa quando é opinião, nada de "todos sabemos". Fecho que fica na cabeça, em uma frase.

**Tamanho e estrutura:** 150 a 400 palavras. Abre com o argumento comum que será questionado, vira com "mas", desenvolve a imagem, fecha com a frase de impacto. Parágrafos de 1 a 4 linhas.

**Elementos ricos:** citação (`>`) para a fala questionada, `{: .note}` para ressalva ou fonte, `link.html` para a matéria ou dado citado. Evite imagem decorativa; se houver, `image:` com `image_alt`.

**Front matter:** `title`, `description` e `tags` obrigatórios. Tags típicas: equidade, justica-social, direitos, politica, filosofia. A `description` resume o argumento, não só o tema.

**Cuidados:** não invente dados nem estatísticas; se o usuário citou número, mantenha a fonte ou o link dele. Não ponha palavras novas na boca do autor sobre pessoas ou partidos reais.

**Esqueleto:**

```
node scripts/new-post.mjs entre-margens "A fila não é neutra"
```

```markdown
Existe um tipo de argumento que aparece toda hora: "...".

A coisa parece neutra. Mas ela não começa onde parece: começa em quem...

Quando alguém diz "...", está olhando só para o que aparece.

Frase final que resume o argumento.
```
