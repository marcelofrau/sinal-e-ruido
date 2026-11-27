# Fragmentos

**O que entra:** notas curtíssimas, ideias embrionárias, sementes de assuntos maiores que não quero perder. Registrar vale mais que lapidar.

**Tom:** anotação rápida, pensamento em construção, primeira pessoa. Pode terminar com meta-comentário ("fragmento registrado").

**Tamanho e estrutura:** 1 a 5 linhas, sem título, sem intertítulos. Cada linha pode ser uma frase independente. Renderiza como janela de Bloco de Notas na listagem e na home.

**Elementos ricos:** quase nenhum. No máximo um link inline ou `código`. Se pede imagem, vídeo ou cartão, provavelmente é `abas-abertas` ou outra seção.

**Front matter:** `title`, `description` e `tags` opcionais. Rode o script sem título: `node scripts/new-post.mjs fragmentos` (slug `fragmento-DDMM-HHMM`). `tags: []` fica como o script gera; preencha só se o usuário pedir.

**Atenção ao título:** o Jekyll preenche `title` de post sem título com o slug titleizado ("Fragmento 2611 1019"). O `default: 'Fragmento'` nunca dispara de verdade. Se o texto pedir um título de verdade, use `title` explícito.

**Esqueleto:**

```
node scripts/new-post.mjs fragmentos
```

```markdown
Se um blog exige post pronto, ele morre na segunda semana.
A pergunta certa não é "o que escrever" mas "o que não perder".
Fragmento registrado.
```
