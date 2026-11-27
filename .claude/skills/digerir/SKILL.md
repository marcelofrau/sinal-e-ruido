---
name: digerir
description: Tria material bruto (itens da inbox sincronizada do Telegram e o backlog manual em drafts/ideas.md), classifica por seção, entrevista o dono pra expandir o comentário dele e gera rascunhos em _drafts/ seguindo o guia da seção. Usar quando o dono pedir "digerir inbox", "processar a inbox", "triar o que mandei", "o que tem na inbox", "triar o backlog", "transformar isso em rascunho" ou "me ajuda a escrever o rascunho X".
---

# Digerir inbox → rascunhos

Leia "Rascunhos e material bruto" no `AGENTS.md` se ainda não leu. Este skill só tria e rascunha: **publicar é sempre o fluxo do skill `postar`**.

## 1. Carregar o material

- **Inbox:** liste `inbox/*.md` (subpastas como `feito/` e o `.state.json` não contam). Vazia e com `TELEGRAM_BOT_TOKEN` no ambiente: rode `node scripts/inbox-telegram.mjs` e liste de novo.
- **Backlog:** se o dono pedir, encaminhe pra skill `distribuir` (o `ideas.md` vira stubs em `drafts/<seção>/`). A inbox segue sendo sua fonte principal.
- Sem material nenhum: encerre.

## 2. Triar item por item

Pra cada item mostre: link/mídia, a frase crua do dono, sua sugestão de seção (critérios na tabela do skill `postar`) e o porquê em uma linha. Ele escolhe: uma seção, `ruido-branco` (microblog, pule a entrevista) ou descartar. Ambiguidade entre duas seções: cite as duas e pergunte. Nunca crie seção nova.

## 3. Expandir a fala do dono

O item traz no máximo uma frase. Pergunte o que falta — o que incomodou/animou, o que faria com aquilo. As regras do `postar` valem aqui: preserve as palavras dele, não escreva por ele, não invente fatos, citações ou links. Sem resposta ainda: deixe o item na inbox e siga os outros.

## 4. Gerar o rascunho

1. `node scripts/new-post.mjs --draft <secao> "Título curto"` (sem título em `fragmentos` e `ruido-branco`).
2. Leia `.claude/skills/postar/secoes/<chave>.md` (tom, tamanho, elementos ricos, esqueleto) e monte o corpo com o material do item + o que o dono falou. Onde faltar informação dele, marque `<!-- falta: ... -->` em vez de escrever.
3. Front matter: preencha `tags` (1 a 3, minúsculas, sem acento) e `description` conforme o guia. Nunca escreva `date` — só entra na promoção.
4. Link do item vira `{% include link.html url=... title=... desc=... %}` no achado principal, ou link em negrito na lista, conforme o guia da seção.
5. Origem: item da inbox → mova pra `inbox/feito/` (não apague sem confirmação); linha do backlog → remova a linha de `ideas.md` (o assunto agora vive no rascunho).

## 5. Fechar

Resuma: itens → rascunhos criados (caminhos), descartados, pendentes de resposta. Lembre o dono: preview com `jekyll serve --drafts`; pra publicar, pedir ao skill `postar` (promoção conforme `AGENTS.md`). Este skill não commita nem dá push.
