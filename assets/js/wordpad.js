// WordPad (Windows 98): contenteditable + execCommand, salva em localStorage.
// Carregado sob demanda pelo desktop.js (data-open="wordpad").
(() => {
  "use strict";
  const { makeWin, restore } = window.__snr;
  const doc = document;
  const KEY = "sr.wordpad";
  const WELCOME = "<p>Bem-vindo ao WordPad. Escreva aqui o que quiser: o texto é salvo automaticamente, mas só neste navegador.</p>";

  // remove script, atributos on* e URLs javascript: do HTML restaurado
  function sanitize(html) {
    const d = new DOMParser().parseFromString(html, "text/html");
    d.querySelectorAll("script,iframe,object,embed,style,link,meta").forEach(n => n.remove());
    d.body.querySelectorAll("*").forEach(el => {
      for (const a of [...el.attributes]) {
        if (/^on/i.test(a.name) || /^\s*(javascript|data|vbscript):/i.test(a.value.replace(/[\s\u0000-\u001f]/g, ""))) el.removeAttribute(a.name);
      }
    });
    return d.body.innerHTML;
  }

  window.snrWordpad = () => {
    const old = doc.querySelector(".win-wordpad");
    if (old) return restore(old);

    const el = (tag, cls, txt) => {
      const e = doc.createElement(tag);
      if (cls) e.className = cls;
      if (txt != null) e.textContent = txt;
      return e;
    };

    const body = el("div", "wp");
    const menu = el("div", "wp-menu");
    ["Arquivo", "Editar", "Exibir", "Inserir", "Formatar", "Ajuda"].forEach((m, i) => {
      if (i) menu.append(" ");
      const s = el("span");
      s.append(el("u", null, m[0]), m.slice(1));
      menu.append(s);
    });

    const page = el("div", "wp-page");
    page.contentEditable = "true";
    page.spellcheck = false;
    page.setAttribute("role", "textbox");
    page.setAttribute("aria-multiline", "true");
    page.setAttribute("aria-label", "Documento do WordPad");

    // seleção salva: selects tiram o foco da página
    let saved = null;
    const keep = () => {
      const s = getSelection();
      if (s.rangeCount && page.contains(s.anchorNode)) saved = s.getRangeAt(0).cloneRange();
    };
    const back = () => {
      page.focus();
      if (saved) { const s = getSelection(); s.removeAllRanges(); s.addRange(saved); }
    };
    doc.addEventListener("selectionchange", keep);

    const exec = (cmd, val) => { back(); doc.execCommand(cmd, false, val); save(); };

    const bar = el("div", "wp-bar");
    const select = (label, opts, cmd, fmt) => {
      const s = el("select");
      s.setAttribute("aria-label", label);
      opts.forEach(o => s.append(new Option(o[1], o[0])));
      s.addEventListener("change", () => exec(cmd, fmt ? fmt(s.value) : s.value));
      return s;
    };
    const btn = (label, title, cmd, style) => {
      const b = el("button", null, label);
      b.type = "button";
      b.title = title;
      b.setAttribute("aria-label", title);
      if (style) b.style.cssText = style;
      b.addEventListener("mousedown", e => e.preventDefault());
      b.addEventListener("click", () => exec(cmd));
      return b;
    };
    const fonts = ["Times New Roman", "Arial", "Courier New", "Comic Sans MS", "Verdana"].map(f => [f, f]);
    // execCommand fontSize usa 1-7; mapeia pt -> escala
    const sizes = [8, 10, 12, 14, 18, 24, 36].map((p, i) => [i + 1, String(p)]);
    const fontSel = select("Fonte", fonts, "fontName");
    const sizeSel = select("Tamanho", sizes, "fontSize");
    sizeSel.value = "4";
    const colorSel = select("Cor", [["#000000", "Preto"], ["#ff0000", "Vermelho"], ["#008000", "Verde"], ["#0000ff", "Azul"], ["#800080", "Roxo"]], "foreColor");
    const sep = () => el("span", "sep");
    bar.append(
      fontSel, sizeSel, colorSel, sep(),
      btn("N", "Negrito", "bold", "font-weight:bold"),
      btn("I", "Itálico", "italic", "font-style:italic"),
      btn("S", "Sublinhado", "underline", "text-decoration:underline"),
      sep(),
      btn("≡", "Alinhar à esquerda", "justifyLeft"),
      btn("≣", "Centralizar", "justifyCenter"),
      btn("≢", "Alinhar à direita", "justifyRight"),
      btn("•", "Marcadores", "insertUnorderedList")
    );

    const scroll = el("div", "wp-scroll");
    scroll.append(page);
    body.append(menu, bar, el("div", "wp-ruler"), scroll, el("div", "wp-status", "Para obter Ajuda, pressione F1"));

    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* storage bloqueado */ }
    page.innerHTML = stored ? sanitize(stored) : WELCOME;

    let timer;
    function save() {
      clearTimeout(timer);
      timer = setTimeout(() => { try { localStorage.setItem(KEY, page.innerHTML); } catch (e) { /* cheio ou bloqueado */ } }, 300);
    }
    page.addEventListener("input", save);

    const win = makeWin({ title: "Documento - WordPad", icon: "write_wordpad-1", cls: "win-wordpad", body, w: 600, h: 440 });
    win._onclose = () => { doc.removeEventListener("selectionchange", keep); try { localStorage.setItem(KEY, page.innerHTML); } catch (e) { /* ignore */ } };
  };
})();
