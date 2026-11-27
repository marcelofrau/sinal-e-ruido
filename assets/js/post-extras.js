// Extras de post: barra de código com "Copiar", Mermaid e KaTeX (os dois só carregam do CDN se a página tiver).
// Chamado no load e pelo desktop.js depois de inserir um post em popup (window.snrEnhance).
(() => {
  "use strict";
  const doc = document;
  const MERMAID = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  const KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/";
  let mermaidP, katexP;

  const el = (tag, cls, text) => {
    const e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };
  const once = (n) => (n.dataset.snr ? false : (n.dataset.snr = "1", true));

  const codeBars = (root) => {
    root.querySelectorAll("div.highlighter-rouge").forEach((box) => { // span/code inline também tem a classe
      if (/\blanguage-mermaid\b/.test(box.className) || !once(box)) return;
      const lang = (box.className.match(/language-([\w+#-]+)/) || [])[1] || "plaintext";
      const bar = el("div", "code-bar");
      bar.append(el("span", "code-lang", lang === "plaintext" ? "TEXTO" : lang.toUpperCase()));
      const btn = el("button", "code-copy", "Copiar");
      btn.type = "button";
      btn.addEventListener("click", () => {
        const code = box.querySelector("code");
        navigator.clipboard?.writeText(code ? code.textContent : "").then(() => {
          btn.textContent = "Copiado!";
          setTimeout(() => (btn.textContent = "Copiar"), 1500);
        }, () => {}); // sem permissão: fica quieto
      });
      bar.append(btn);
      box.prepend(bar);
    });
  };

  const loadMermaid = () => mermaidP ||= import(MERMAID).then((m) => {
    m.default.initialize({
      startOnLoad: false, securityLevel: "strict", theme: "base",
      themeVariables: {
        background: "#FBFAF6", primaryColor: "#FBFAF6", primaryTextColor: "#1F2328", primaryBorderColor: "#000080",
        lineColor: "#000080", secondaryColor: "#eef0f8", tertiaryColor: "#FBFAF6",
        fontFamily: '"IBM Plex Mono", ui-monospace, Consolas, monospace', fontSize: "13px",
      },
    });
    return m.default;
  });

  const mermaids = (root) => {
    // sem lexer no Rouge, o kramdown gera <pre><code class="language-mermaid">: troca o <pre> inteiro
    const blocks = [...root.querySelectorAll(".language-mermaid")].map((n) => n.tagName === "CODE" && n.closest("pre") || n).filter(once);
    if (!blocks.length) return;
    loadMermaid().then(async (mermaid) => {
      for (const b of blocks) {
        const src = b.textContent;
        const fig = el("figure", "mermaid-box");
        const pre = el("pre", "mermaid", src);
        fig.append(pre);
        b.replaceWith(fig);
        try {
          await mermaid.run({ nodes: [pre] });
        } catch (e) {
          b.dataset.snr = "1"; // volta o código-fonte, sem tentar de novo
          fig.replaceWith(b);
          b.after(el("p", "warn", "Não foi possível desenhar o diagrama."));
        }
      }
    }, () => blocks.forEach((b) => b.after(el("p", "warn", "Não foi possível desenhar o diagrama."))));
  };

  const loadKatex = () => katexP ||= new Promise((ok, no) => {
    const css = el("link");
    css.rel = "stylesheet";
    css.href = KATEX + "katex.min.css";
    doc.head.append(css);
    const js = el("script");
    js.src = KATEX + "katex.min.js";
    js.onload = () => ok(window.katex);
    js.onerror = no;
    doc.head.append(js);
  });

  // O kramdown (math_engine mathjax) solta o $$…$$ como texto cru: \(…\) na linha e \[…\] em bloco,
  // sem elemento em volta. Varre os nós de texto do .post-body (fora de código) e embrulha cada fórmula.
  // Retorna [elemento, tex, displayMode].
  const MATH = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
  const mathItems = (root) => {
    const items = [];
    root.querySelectorAll(".post-body, .page-body").forEach((body) => {
      const walk = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode: (t) => t.parentElement.closest("pre, code, .kdmath, script, style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
      });
      const texts = [];
      while (walk.nextNode()) if (/\\[[(]/.test(walk.currentNode.data)) texts.push(walk.currentNode);
      for (const t of texts) {
        const frag = doc.createDocumentFragment();
        let last = 0;
        for (const m of t.data.matchAll(MATH)) {
          frag.append(t.data.slice(last, m.index));
          const d = m[1] != null, n = el(d ? "div" : "span", "kdmath");
          n.textContent = m[0];
          frag.append(n);
          items.push([n, (d ? m[1] : m[2]).trim(), d]);
          last = m.index + m[0].length;
        }
        if (!last) continue;
        frag.append(t.data.slice(last));
        t.replaceWith(frag);
      }
    });
    return items;
  };

  const maths = (root) => {
    const items = mathItems(root);
    if (!items.length) return;
    loadKatex().then((katex) => {
      for (const [n, tex, displayMode] of items) katex.render(tex, n, { displayMode, throwOnError: false });
    }, () => {}); // sem rede: o TeX cru continua visível
  };

  window.snrEnhance = (root) => {
    root = root || doc;
    codeBars(root);
    mermaids(root);
    maths(root);
  };
  window.snrEnhance(doc);
})();
