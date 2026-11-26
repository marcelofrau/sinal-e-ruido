# Fontes

Baixadas do Google Fonts (subset latino, `woff2`) e servidas pelo próprio site, então nenhuma requisição vai para o Google. Todas usam a [SIL Open Font License 1.1](https://openfontlicense.org/).

| Arquivo | Família | Uso |
|---|---|---|
| `fraunces-600-700.woff2` | Fraunces (Undercase Type), variável | títulos |
| `newsreader-400-600.woff2`, `newsreader-400-italic.woff2` | Newsreader (Production Type), variável | texto dos posts |
| `ibm-plex-mono-400.woff2`, `ibm-plex-mono-500.woff2` | IBM Plex Mono (IBM) | datas, metadados, código |
| `silkscreen-400.woff2` | Silkscreen (Jason Kottke) | rótulos pixel |

Para trocar uma fonte, pegue o CSS em `https://fonts.googleapis.com/css2?family=...` com um User-Agent de navegador moderno, baixe o `woff2` do bloco `/* latin */` e ajuste o `@font-face` no topo de `assets/css/site.css`.
