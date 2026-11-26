---
layout: post
title: "Teste de estilos"
description: "Página de referência com todos os elementos que um post pode usar. Não aparece no feed, no sitemap nem nas listagens."
permalink: /estilos/
sitemap: false
noindex: true
image: /assets/img/estilos-exemplo.jpg
image_alt: "Céu noturno com um meteoro sobre colinas"
tags: [referencia, markdown]
---

Parágrafo normal com um [link interno]({{ '/arquivo/' | relative_url }}), um [link externo](https://example.com), **negrito**, *itálico*, `código inline`, <mark>marcação destacada</mark> e um atalho <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Del</kbd>. Notas de rodapé também funcionam.[^1]

## Subtítulo de seção

Um texto mais longo para ver o ritmo da leitura. A ideia é que o corpo tenha linha confortável, coluna estreita o bastante pra não cansar e contraste suficiente pra ler à noite sem forçar a vista.

### Listas

- Item simples
- Item com [link](https://example.com)
- Item com sublista
  - Sub-item
  - Outro sub-item

1. Primeiro passo
2. Segundo passo
3. Terceiro passo

### Citação e avisos

> Uma citação comum fica em itálico, com a barra azul à esquerda.

> **Nota:** use `{: .note}` na linha logo abaixo de uma citação pra virar aviso.
{: .note}

> **Dica:** `{: .tip}` usa a lâmpada do Windows 98.
{: .tip}

> **Atenção:** `{: .warn}` é pro que pode dar errado.
{: .warn}

## Mídia

<figure>
  <img src="{{ '/assets/img/estilos-exemplo.jpg' | relative_url }}" alt="Céu noturno com um meteoro sobre colinas">
  <figcaption>Figura com legenda (HTML direto no Markdown).</figcaption>
</figure>

{% include video.html youtube="dQw4w9WgXcQ" title="Um vídeo qualquer" caption="Vídeo do YouTube: só carrega depois do clique." %}

## Links

{% include link.html url="https://windowsicons.alexmeub.com/" title="Windows Icons" desc="Ícones de todas as versões do Windows, de onde saíram os do desktop." %}
{% include link.html url="https://js-dos.com/" title="js-dos" desc="DOSBox em WebAssembly, o que roda o MS-DOS daqui." %}

## Código

```js
// comentário
function sorteia(lista) {
  const i = Math.floor(Math.random() * lista.length);
  return lista[i] ?? "nada";
}
```

## Tabela

| Jogo | Ano | Comando |
|---|---|---|
| Doom | 1993 | `DOOM` |
| Duke Nukem 3D | 1996 | `DUKE` |
| Xargon | 1994 | `XARGON` |

<details>
<summary>Detalhes recolhíveis</summary>

Conteúdo escondido até clicar.

</details>

---

Último parágrafo depois de um separador.

[^1]: Uma nota de rodapé de exemplo.
