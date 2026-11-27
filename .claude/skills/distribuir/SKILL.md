---
name: distribuir
description: Espalha o backlog de drafts/ideas.md em um stub markdown por assunto, em subpastas por seção (drafts/<chave>/slug.md), com headers de esqueleto elaborados e links de referência pesquisados. Remove do ideas.md cada linha que virou stub. Usar quando o dono pedir "distribuir ideias", "distribui o ideas", "processa o backlog", "dá uma olhada no ideas.md", "espalha o backlog" ou "tem coisa nova no ideas".
---

# Distribuir ideas.md → drafts/<seção>/

O dono escreve linhas curtas em `drafts/ideas.md`, agrupadas por seção (`## Nome`). Este skill transforma cada linha num stub de rascunho. **Não escreve o post** — só o andaime (headers + referências). Tudo dentro de `drafts/` (local, gitignored, fora do build).

## 1. Ler e mapear

Leia `drafts/ideas.md` (releia sempre — o dono edita direto nele). Cabeçalho `## Nome` → chave: Abas Abertas→abas-abertas, Entre Margens→entre-margens, O Que Fica→o-que-fica, Fora de Escopo→fora-de-escopo, Linha de comando→linha-de-comando, Fragmentos→fragmentos, Ruído Branco→ruido-branco (confira `_data/sections.yml`). Só linhas com conteúdo contam. A seção do ideas.md manda; não reclassifique.

## 2. Criar o stub

Pra cada linha: `drafts/<chave>/<slug>.md` — slug da própria linha (minúsculo, sem acento, curto). Stub já existe? Pule sem sobrescrever. Formato:

```
# <Assunto como título>

> do ideas.md (<data>) · seção: <chave>

<!-- Stub do distribuir: andaime para o dono escrever; apague os comentários ao longo -->

## <headers do esqueleto da seção, adaptados ao assunto>
<!-- falta: ... -->

## Referências
- [Nome](url) — por que vale o clique
```

Headers vêm do esqueleto em `.claude/skills/postar/secoes/<chave>.md`, adaptados ao assunto. Marcações `<!-- falta: ... -->` orientam o dono; nada de escrever por ele.

## 3. Pesquisar referências

Assunto concreto (ferramenta, projeto, pessoa, especificação): `websearch` e liste 1–3 links **reais encontrados**, com uma linha de por quê. Assunto vago ou reflexão: não pesquise; ponha `<!-- pesquisar na hora de escrever -->`. Nunca invente link nem atribua citação. Pesquisa inconclusiva: marque `<!-- não achei referência confiável -->`.

## 4. Limpar o ideas.md

Stub criado → remova a linha correspondente do `ideas.md` (mantenha os cabeçalhos de seção). Não remova linha cujo stub foi pulado.

## 5. Resumo

Informe: stubs criados (caminhos), pulados e dúvidas marcadas com `<!-- esclarecer: ... -->`. Não commit, não push. Quando o dono terminar um stub e pedir revisão: confira contra o guia da seção (tom, tamanho), ajuste com ele e publique pelo skill `postar` (arquivo do stub funciona como rascunho de origem).
