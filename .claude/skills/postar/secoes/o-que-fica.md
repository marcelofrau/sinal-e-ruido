# O Que Fica

**O que entra:** memória, vivências pessoais, marcas do passado, autocrítica e aprendizados que atravessam o tempo.

**Tom:** íntimo, honesto, sem se vitimizar nem embelezar. Admite o que não era bonito ("era medo com bom vocabulário"). Frases secas, sem pedir desculpa pelo tamanho ("este post é curto").

**Tamanho e estrutura:** 120 a 350 palavras. Abre dizendo que o assunto é difícil ou raro de escrever, conta duas ou três coisas concretas, faz a autocrítica, fecha com o que ficou de verdade. Poucos parágrafos, sem lista.

**Elementos ricos:** foto antiga com `<figure>` e legenda; `image:` como imagem de topo se for central. Raramente link ou vídeo. Sem avisos coloridos.

**Front matter:** `title`, `description` e `tags` obrigatórios. Tags típicas: memoria, autocritica, infancia, familia. `description` em uma frase, sem entregar o fecho.

**Cuidados:** não invente lembranças nem detalhes de pessoas reais; só o que o usuário contou. Texto sensível: preserve as palavras dele ao máximo e não suavize. Nomes de terceiros: perguntar se devem aparecer.

**Esqueleto:**

```
node scripts/new-post.mjs o-que-fica "O que a escola ensina fora da sala de aula"
```

```markdown
Eu não escrevo sobre isso quase nunca.

Aprendi duas coisas: primeira, ... Segunda, ...

A autocrítica que carrego disso: ...

O que fica, de verdade: ...
```
