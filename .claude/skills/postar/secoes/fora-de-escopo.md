# Fora de Escopo

**O que entra:** devaneios, humor ácido e observações que não cabem em nenhuma gaveta.

**Tom:** irônico, seco, má vontade bem-humorada, "rigor científico zero". Metáforas de tecnologia e trabalho ("rodando em produção sem teste"). Piada boa é curta: corte a explicação.

**Tamanho e estrutura:** 80 a 250 palavras. Abertura de uma linha, lista de 3 observações (cada uma com sua piada), fecho que volta ao leitor. Também funciona como um único devaneio de dois ou três parágrafos.

**Elementos ricos:** lista de marcadores é o formato natural. Imagem/meme com `<figure>` e legenda; `video.html` para um vídeo engraçado; `{: .warn}` em tom de brincadeira. Código só se for a piada.

**Front matter:** `title`, `description` e `tags` obrigatórios. Tags típicas: humor, cotidiano, devaneio. `description` já pode carregar a graça.

**Cuidados:** não explique a piada e não troque a do autor por outra. Humor contra pessoas reais: manter só o que o usuário escreveu.

**Esqueleto:**

```
node scripts/new-post.mjs fora-de-escopo "Manual do mundo que não pede desculpas"
```

```markdown
Observações do cotidiano com o humor que elas merecem:

- Primeira observação, com a piada no fim.
- Segunda, em fórmula (X que podia ser Y, Y que podia ser Z).
- Terceira, com hipótese absurda e confiante.

Fecho que chama o leitor para dentro da piada.
```
