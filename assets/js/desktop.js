// "Sistema operacional" do blog: janelas (arrastar, minimizar, maximizar, fechar), barra de tarefas,
// menu Iniciar, ícones do desktop, posts em popup (fetch + pushState), diálogos e o MS-DOS (js-dos).
(() => {
  "use strict";
  const doc = document, root = doc.documentElement;
  const BASE = root.dataset.baseurl || "";
  const ICONS = BASE + "/assets/icons/";
  const V = root.dataset.version ? "?v=" + root.dataset.version : "";
  const JSDOS = "https://v8.js-dos.com/latest/";
  const desk = doc.getElementById("desktop");
  const tasks = doc.getElementById("tasks");
  const startBtn = doc.getElementById("start-btn");
  const startMenu = doc.getElementById("startmenu");
  const status = doc.getElementById("ns-status");
  const browser = doc.getElementById("win-browser");
  const narrow = matchMedia("(max-width: 760px), (max-height: 520px)");
  const coarse = matchMedia("(pointer: coarse)");
  const basePath = location.pathname, baseTitle = doc.title;
  let z = 10, cascade = 0;

  // ---------- status / throbber ----------
  const DONE = "Documento: Concluído";
  function setLoading(on, msg) {
    root.classList.toggle("is-loading", on);
    if (status) status.textContent = msg || (on ? "Conectando..." : DONE);
  }
  setLoading(true, "Contatando o host: " + location.host + "...");
  addEventListener("load", () => setTimeout(() => setLoading(false), 700));
  addEventListener("pageshow", e => { if (e.persisted) setLoading(false); });
  addEventListener("beforeunload", () => setLoading(true, "Transferindo dados..."));
  doc.addEventListener("mouseover", e => {
    const a = e.target.closest(".ns-content a[href]");
    if (a && status && !root.classList.contains("is-loading")) status.textContent = a.href;
  });
  doc.addEventListener("mouseout", e => {
    if (e.target.closest(".ns-content a[href]") && status && !root.classList.contains("is-loading")) status.textContent = DONE;
  });

  // ---------- janelas ----------
  const caption = w => w.querySelector(".win-caption");

  function register(win) {
    const b = doc.createElement("button");
    b.type = "button";
    b.className = "task";
    b.innerHTML = `<img src="${ICONS}${win.dataset.icon || "html-3"}.png" alt="" width="16" height="16"><span></span>`;
    b.querySelector("span").textContent = win.dataset.title || caption(win).textContent;
    b.addEventListener("click", () => {
      if (win.hidden || win.classList.contains("is-min")) restore(win);
      else if (win.classList.contains("is-active")) minimize(win);
      else focusWin(win);
    });
    tasks.append(b);
    win._task = b;
  }

  function setCaption(win, text) {
    caption(win).textContent = text;
    win.setAttribute("aria-label", text);
    if (win._task) win._task.querySelector("span").textContent = text;
  }

  function focusWin(win) {
    doc.querySelectorAll(".win.is-active, #webamp.is-active").forEach(w => { w.classList.remove("is-active"); w._task?.classList.remove("is-active"); });
    win.classList.add("is-active");
    win._task?.classList.add("is-active");
    win.style.zIndex = ++z;
  }

  function topWin() {
    const open = [...desk.querySelectorAll(".win:not([hidden]):not(.is-min)")];
    return open.sort((a, b) => (b.style.zIndex || 0) - (a.style.zIndex || 0))[0];
  }

  function minimize(win) {
    win.classList.add("is-min");
    win.classList.remove("is-active");
    win._task?.classList.remove("is-active");
    win._onmin?.(true);
    const next = topWin();
    if (next) focusWin(next);
  }

  function restore(win) {
    win.hidden = false;
    if (win._task) win._task.hidden = false;
    win.classList.remove("is-min");
    win._onmin?.(false);
    focusWin(win);
  }

  function toggleMax(win) {
    win.classList.toggle("is-max");
    save(win);
  }

  function closeWin(win, silent) {
    win._onclose?.(silent);
    if (win === browser) { win.hidden = true; win._task.hidden = true; }
    else { win._task?.remove(); win.remove(); }
    const next = topWin();
    if (next) focusWin(next);
  }

  // Fixa left/top/width/height em px (a janela do navegador nasce ancorada pelas 4 bordas no CSS).
  function pin(win) {
    const r = win.getBoundingClientRect(), d = desk.getBoundingClientRect();
    Object.assign(win.style, { left: r.left - d.left + "px", top: r.top - d.top + "px", width: r.width + "px", height: r.height + "px", right: "auto", bottom: "auto" });
  }

  function save(win) {
    const k = win.dataset.save;
    if (!k || narrow.matches) return;
    const s = win.style;
    try { localStorage.setItem("sr.win." + k, JSON.stringify({ l: s.left, t: s.top, w: s.width, h: s.height, max: win.classList.contains("is-max") })); } catch (_) {}
  }

  function load(win) {
    let v;
    try { v = JSON.parse(localStorage.getItem("sr.win." + win.dataset.save)); } catch (_) {}
    if (!v) return;
    if (v.l) Object.assign(win.style, { left: v.l, top: v.t, width: v.w, height: v.h, right: "auto", bottom: "auto" });
    win.classList.toggle("is-max", !!v.max);
    fit(win);
  }

  // Encolhe/puxa a janela pra dentro do desktop (tamanho salvo numa tela maior passava por baixo da taskbar).
  function fit(win) {
    if (!win.style.width) return;
    const d = desk.getBoundingClientRect(), s = win.style;
    const l = Math.max(0, Math.min(parseFloat(s.left), d.width - 260)), t = Math.max(0, Math.min(parseFloat(s.top), d.height - 140));
    Object.assign(s, { left: l + "px", top: t + "px", width: Math.min(parseFloat(s.width), d.width - l) + "px", height: Math.min(parseFloat(s.height), d.height - t) + "px" });
  }

  function resetBrowser() {
    try { localStorage.removeItem("sr.win.browser"); } catch (_) {}
    const z = browser.style.zIndex;
    browser.removeAttribute("style"); // volta à ancoragem do CSS (.win-browser)
    browser.style.zIndex = z;
    browser.classList.remove("is-max");
    restore(browser);
  }

  // Cria janela a partir do template. opts: title, icon, cls, body (Node), w, h, center
  function makeWin(opts) {
    const win = doc.getElementById("tpl-win").content.firstElementChild.cloneNode(true);
    if (opts.cls) win.classList.add(...opts.cls.split(" "));
    win.dataset.icon = opts.icon || "html-3";
    win.querySelector(".win-body").append(opts.body);
    desk.append(win);
    setCaption(win, opts.title);
    const d = desk.getBoundingClientRect();
    const w = Math.min(opts.w || 640, d.width - 16), h = opts.h ? Math.min(opts.h, d.height - 16) : null;
    let l, t;
    if (opts.center) {
      l = (d.width - w) / 2; t = (d.height - (h || win.offsetHeight)) / 3;
    } else {
      const b = browser.hidden ? { left: 80, top: 20 } : browser.getBoundingClientRect();
      const step = (cascade++ % 6) * 26;
      l = Math.min(b.left - d.left + 60 + step, d.width - w - 8);
      t = Math.min(b.top - d.top + 40 + step, d.height - (h || 300) - 8);
    }
    Object.assign(win.style, { left: Math.max(0, l) + "px", top: Math.max(0, t) + "px", width: w + "px" });
    if (h) win.style.height = h + "px";
    register(win);
    focusWin(win);
    return win;
  }

  // mousedown/pointerdown: foco + arrastar pela barra de título
  desk.addEventListener("pointerdown", e => {
    const win = e.target.closest(".win");
    if (!win) return;
    if (!win.classList.contains("is-active")) focusWin(win);
    const bar = e.target.closest(".win-title");
    if (!bar || e.target.closest("button") || e.button !== 0 || win.classList.contains("is-max") || narrow.matches) return;
    pin(win);
    const d = desk.getBoundingClientRect();
    const dx = e.clientX - win.offsetLeft, dy = e.clientY - win.offsetTop;
    bar.setPointerCapture(e.pointerId);
    const move = ev => {
      win.style.left = Math.min(Math.max(ev.clientX - dx, 60 - win.offsetWidth), d.width - 60) + "px";
      win.style.top = Math.min(Math.max(ev.clientY - dy, 0), d.height - 24) + "px";
    };
    const up = () => { bar.removeEventListener("pointermove", move); bar.removeEventListener("pointerup", up); save(win); };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
  });

  // redimensionar (resize: both no CSS) -> salva o tamanho
  if ("ResizeObserver" in window) {
    let t;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (browser.style.width) save(browser); }, 300); }).observe(browser);
  }
  browser.addEventListener("pointerdown", e => {
    // começar a redimensionar pelo canto: fixa em px pra o resize nativo não brigar com as âncoras do CSS
    const r = browser.getBoundingClientRect();
    if (e.clientX > r.right - 16 && e.clientY > r.bottom - 16) pin(browser);
  });

  function closeMenus(except) {
    doc.querySelectorAll(".win-menu:not([hidden])").forEach(m => { if (m !== except) m.hidden = true; });
    if (except !== startMenu) {
      startMenu.hidden = true;
      closeSubs();
      startBtn.setAttribute("aria-expanded", "false");
      startBtn.classList.remove("is-down");
    }
  }

  desk.addEventListener("click", e => {
    const win = e.target.closest(".win");
    if (!win) return;
    const t = e.target;
    if (t.closest(".win-min")) return minimize(win);
    if (t.closest(".win-max")) return toggleMax(win);
    if (t.closest("[data-act=close]")) win === browser ? confirmCloseBrowser() : closeWin(win);
  });
  desk.addEventListener("dblclick", e => {
    const win = e.target.closest(".win");
    if (!win) return;
    if (e.target.closest(".win-title") && !e.target.closest("button") && !win.classList.contains("win-dialog")) toggleMax(win);
  });

  // ---------- diálogos ----------
  function dialog(id) {
    const tpl = doc.getElementById("tpl-dlg-" + id);
    if (!tpl) return;
    const body = doc.createElement("div");
    body.className = "dlg";
    body.innerHTML = `<div class="dlg-msg"><img src="${ICONS}${tpl.dataset.icon || "msg_information-1"}.png" alt="" width="32" height="32"><div></div></div><div class="dlg-btns"><button class="btn" type="button" data-act="close">OK</button></div>`;
    body.querySelector(".dlg-msg div").append(tpl.content.cloneNode(true));
    const win = makeWin({ title: tpl.dataset.title, icon: tpl.dataset.icon, cls: "win-dialog", body, w: 360, center: true });
    win.querySelector(".dlg-btns .btn").focus();
    return win;
  }

  // Fechar o Netscape pede confirmação e ensina a reabrir (ele é a janela do blog).
  function confirmCloseBrowser() {
    const old = desk.querySelector(".win-confirm");
    if (old) return focusWin(old);
    const win = dialog("close-browser");
    win.classList.add("win-confirm");
    const yes = doc.createElement("button");
    Object.assign(yes, { type: "button", className: "btn", textContent: "Sim" });
    yes.addEventListener("click", () => { closeWin(win); closeWin(browser); });
    const no = win.querySelector(".dlg-btns .btn");
    no.textContent = "Não";
    no.before(yes);
    no.focus();
  }

  // ---------- Feed RSS: explica o que é antes de despejar o XML na tela ----------
  function openRss(href) {
    const old = desk.querySelector(".win-rss");
    if (old) return focusWin(old);
    const win = dialog("rss");
    win.classList.add("win-rss");
    const open = win.querySelector(".dlg-btns .btn");
    open.removeAttribute("data-act"); // o "Abrir" sai da página, não fecha a janela antes
    open.textContent = "Abrir o XML";
    open.addEventListener("click", () => { location.href = href; });
    const cancel = doc.createElement("button");
    Object.assign(cancel, { type: "button", className: "btn", textContent: "Cancelar" });
    cancel.addEventListener("click", () => closeWin(win));
    open.before(cancel);
    open.focus();
  }

  doc.addEventListener("click", e => {
    const a = e.target.closest("a[href$='/feed.xml']");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openRss(a.href);
  });

  // ---------- posts em popup ----------
  const popups = new Map(); // pathname -> janela

  // giscus: o .post é extraído sem executar scripts (replaceChildren), então o
  // placeholder .giscus carrega o client.js na mão, tanto no popup quanto na página cheia.
  function activateGiscus(scope) {
    scope.querySelectorAll(".giscus[data-repo-id]:not([data-on])").forEach(el => {
      el.dataset.on = "1";
      const s = doc.createElement("script");
      for (const a of el.attributes) if (a.name.startsWith("data-")) s.setAttribute(a.name, a.value);
      s.src = "https://giscus.app/client.js";
      s.crossOrigin = "anonymous";
      s.async = true;
      el.append(s);
    });
  }
  activateGiscus(doc);

  function openPost(url, push = true) {
    const path = new URL(url, location.href).pathname;
    if (popups.has(path)) return restore(popups.get(path));
    const body = doc.createElement("div");
    body.className = "pop";
    body.innerHTML = `<div class="pop-page"><p class="pop-wait">Carregando...</p></div><div class="ns-status"><span class="panel panel-text">Documento: Concluído</span><span class="panel"><a href="${path}">Abrir na janela principal</a></span></div>`;
    const win = makeWin({ title: "Carregando... - Netscape", icon: "html-3", cls: "win-pop", body, w: Math.max(640, Math.min(1040, desk.clientWidth * 0.78)), h: desk.clientHeight - 24 });
    popups.set(path, win);
    win._onclose = silent => {
      popups.delete(path);
      doc.title = baseTitle;
      if (silent || location.pathname !== path) return;
      if (history.state?.popup === path) history.back(); else history.replaceState(null, "", basePath);
    };
    if (push && location.pathname !== path) history.pushState({ popup: path }, "", path);
    setLoading(true, "Contatando o host: " + location.host + "...");
    fetch(path)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(html => {
        const d = new DOMParser().parseFromString(html, "text/html");
        const art = d.querySelector(".post");
        if (!art) throw new Error("sem .post");
        body.querySelector(".pop-page").replaceChildren(art);
        activateGiscus(art);
        window.snrEnhance?.(art); // post-extras.js: código, mermaid, fórmulas
        const h1 = art.querySelector("h1");
        setCaption(win, (h1 ? h1.textContent.trim() : "Fragmento") + " - Netscape");
        if (popups.get(path) === win) doc.title = d.title;
      })
      .catch(() => {
        body.querySelector(".pop-page").innerHTML = `<p class="pop-wait">Não foi possível abrir o documento. <a href="${path}">Tentar na janela principal</a></p>`;
      })
      .finally(() => setLoading(false));
  }

  addEventListener("popstate", e => {
    popups.forEach((w, p) => { if (p !== location.pathname) closeWin(w, true); });
    const p = e.state?.popup;
    if (p && !popups.has(p)) openPost(p, false);
    if (e.state?.frame) openInBrowser(e.state.frame, e.state.title, false);
    else closeFrameView();
  });

  // Vídeo (_includes/video.html): o iframe do YouTube/Vimeo só entra no clique, nada de terceiros antes.
  doc.addEventListener("click", e => {
    const b = e.target.closest(".player-screen[data-embed]");
    if (!b) return;
    const f = doc.createElement("iframe");
    Object.assign(f, { src: b.dataset.embed, title: b.dataset.title, allowFullscreen: true, className: "player-frame" });
    f.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    b.replaceWith(f);
  });

  doc.addEventListener("click", e => {
    const a = e.target.closest("a[data-popup]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openPost(a.href);
  });

  // ---------- sites externos DENTRO da janela do Netscape (Favoritos) ----------
  // Navega na janela principal: o Voltar da toolbar (history.back) volta pro blog.
  const nsContent = browser.querySelector(".ns-content");
  const baseCaption = browser.querySelector(".win-caption").textContent;
  let frameView = null;

  function buildFrameView() {
    frameView = doc.createElement("div");
    frameView.className = "web";
    frameView.hidden = true;
    const bar = doc.createElement("div");
    bar.className = "web-url";
    const label = doc.createElement("b");
    label.textContent = "Endere\u00e7o:";
    const loc = doc.createElement("span");
    const back = doc.createElement("a");
    back.className = "web-back";
    back.href = "#";
    back.textContent = "\u21a9 voltar ao site";
    back.addEventListener("click", e => { e.preventDefault(); history.back(); });
    bar.append(label, loc, back);
    const frame = doc.createElement("iframe");
    Object.assign(frame, { className: "web-frame", referrerPolicy: "no-referrer" });
    const hint = doc.createElement("div");
    hint.className = "web-hint";
    hint.append(doc.createTextNode("N\u00e3o carregou? O site pode bloquear frames: "));
    const out = doc.createElement("a");
    Object.assign(out, { target: "_blank", rel: "noopener" });
    out.textContent = "abrir numa aba real";
    hint.append(out);
    frameView.append(bar, frame, hint);
    nsContent.append(frameView);
  }

  function openInBrowser(url, title, push = true) {
    if (!frameView) buildFrameView();
    const frame = frameView.querySelector("iframe");
    if (frameView.hidden) {
      nsContent.querySelector(".page").hidden = true;
      frameView.hidden = false;
    }
    frame.src = url;
    frame.title = title;
    frameView.querySelector(".web-url span").textContent = url;
    frameView.querySelector(".web-hint a").href = url;
    setCaption(browser, title + " - Netscape");
    doc.title = title;
    if (push) history.pushState({ frame: url, title }, "", location.pathname);
    setLoading(true, "Contatando o host: " + new URL(url).host + "...");
    frame.addEventListener("load", () => setLoading(false), { once: true });
  }

  function closeFrameView() {
    if (!frameView || frameView.hidden) return;
    frameView.hidden = true;
    frameView.querySelector("iframe").src = "about:blank";
    nsContent.querySelector(".page").hidden = false;
    setCaption(browser, baseCaption);
    doc.title = baseTitle;
  }

  doc.addEventListener("click", e => {
    const a = e.target.closest("a[data-frame]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openInBrowser(a.href, a.dataset.frame || a.textContent.trim());
  });

  // ---------- MS-DOS (js-dos v8, carregado só quando abre) ----------
  let dosLib;
  function loadDos() {
    return dosLib ||= new Promise((ok, fail) => {
      const l = doc.createElement("link");
      l.rel = "stylesheet"; l.href = JSDOS + "js-dos.css";
      const s = doc.createElement("script");
      s.src = JSDOS + "js-dos.js"; s.onload = ok; s.onerror = () => { dosLib = null; fail(); };
      doc.head.append(l, s);
    });
  }
  function openDos() {
    const old = desk.querySelector(".win-dos");
    if (old) return restore(old);
    const box = doc.createElement("div");
    box.className = "dos-screen";
    box.innerHTML = '<pre class="dos-boot">Iniciando MS-DOS...\n\nHIMEM is testing extended memory...done.\n\nC:\\&gt;_</pre>';
    const win = makeWin({ title: "MS-DOS Prompt", icon: "ms_dos-1", cls: "win-dos", body: box, w: 660, h: 460 });
    loadDos()
      .then(() => {
        if (!win.isConnected) return;
        box.replaceChildren();
        const props = window.Dos(box, { url: root.dataset.dos, autoStart: true, kiosk: true, theme: "dark", noCursor: false });
        win._onclose = () => props.stop();
        win._onmin = paused => props.setPaused?.(paused);
      })
      .catch(() => {
        box.querySelector("pre").textContent = "Bad command or file name.\n\nNão foi possível carregar o emulador (v8.js-dos.com).\n\nC:\\>_";
      });
  }

  // ---------- Bloco de Notas (texto salvo só no localStorage deste navegador) ----------
  const NOTE_KEY = "sr.notepad";
  const NOTE_HELLO = "Bem-vindo ao Bloco de Notas.\r\n\r\nO que você escrever aqui fica salvo só neste navegador.\r\nF5 insere a hora e a data, como no original.\r\n";
  function openNotepad() {
    const old = desk.querySelector(".win-notepad");
    if (old) return restore(old);
    const body = doc.createElement("div");
    body.className = "np";
    body.innerHTML = '<div class="np-menu" aria-hidden="true"><u>A</u>rquivo <u>E</u>ditar <u>P</u>esquisar <u>A</u>juda</div><textarea class="np-text" spellcheck="false" aria-label="Texto do Bloco de Notas"></textarea>';
    const ta = body.querySelector("textarea");
    let saved = null;
    try { saved = localStorage.getItem(NOTE_KEY); } catch (_) {}
    ta.value = saved ?? NOTE_HELLO;
    ta.addEventListener("input", () => { try { localStorage.setItem(NOTE_KEY, ta.value); } catch (_) {} });
    ta.addEventListener("keydown", e => {
      if (e.key !== "F5") return;
      e.preventDefault();
      const now = new Date();
      ta.setRangeText(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + " " + now.toLocaleDateString("pt-BR"), ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input"));
    });
    makeWin({ title: "Sem título - Bloco de Notas", icon: "notepad-3", cls: "win-notepad", body, w: 520, h: 360 });
    ta.focus();
  }

  // ---------- Winamp: Webamp no desktop, com botão na barra de tarefas ----------
  // O renderWhenReady assume o nó que recebe (no #desktop apagava tudo), então ganha um host vazio
  // só pra centralizar. As janelas skinned vão pro #webamp, que o Webamp cria no <body>: movido pra
  // dentro do #desktop (fixed = contexto de empilhamento próprio), ele entra no focusWin/minimize/restore.
  let webamp = null;
  function openWinamp() {
    const el = desk.querySelector("#webamp");
    if (el) return restore(el);
    if (webamp) return; // ainda carregando
    setLoading(true, "Carregando o Winamp...");
    openApp("https://unpkg.com/webamp@2.3.1/built/webamp.bundle.min.js", () => {
      if (typeof Webamp === "undefined") return false;
      if (!Webamp.browserIsSupported()) { setLoading(false); return true; }
      const host = doc.createElement("div");
      host.className = "webamp-host";
      desk.append(host);
      const wa = webamp = new Webamp({});
      wa.renderWhenReady(host).then(() => {
        setLoading(false);
        const win = doc.getElementById("webamp");
        win.dataset.icon = "winamp";
        win.dataset.title = "Winamp";
        desk.append(win);
        register(win);
        focusWin(win);
        win.addEventListener("pointerdown", () => { if (!win.classList.contains("is-active")) focusWin(win); }, true);
        wa.onMinimize(() => minimize(win));
        wa.onClose(() => closeWin(win));
        win._onclose = () => { webamp = null; setTimeout(() => { wa.dispose(); host.remove(); }, 0); };
      });
      return true;
    });
  }

  // App em janela pelada: titlebar 98 + iframe, sem barra de endereço (Paint, Pinball, SkiFree).
  // crop: recorta um retângulo da página (o Pinball desenha a própria moldura 98 em volta do canvas).
  const apps = new Map(); // url -> janela
  function openAppWin(url, title, icon, o = {}) {
    if (apps.has(url)) return restore(apps.get(url));
    const body = doc.createElement("div");
    body.className = "app-frame";
    const frame = doc.createElement("iframe");
    Object.assign(frame, { src: url, className: "web-frame", referrerPolicy: "no-referrer", title });
    let w = o.w, h = o.h;
    if (o.crop) {
      const c = o.crop;
      body.classList.add("app-crop");
      frame.setAttribute("scrolling", "no");
      Object.assign(frame.style, { width: c.w + 2 * c.x + "px", height: c.h + c.y + 20 + "px", margin: -c.y + "px 0 0 " + -c.x + "px" });
      w = c.w + 6; h = c.h + 26; // + borda (3px) e titlebar (20px) da .win
    }
    body.append(frame);
    const win = makeWin({ title, icon, cls: "win-app" + (o.crop ? " win-fixed" : ""), body, w, h });
    setLoading(true, "Contatando o host: " + new URL(url).host + "...");
    frame.addEventListener("load", () => setLoading(false), { once: true });
    apps.set(url, win);
    win._onclose = () => apps.delete(url);
    return win;
  }

  // ---------- Executar... (Iniciar > Executar) ----------
  const RUN = { notepad: "notepad", wordpad: "wordpad", write: "wordpad", calc: "calc", calculadora: "calc", sol: "sol", solitaire: "sol", paciencia: "sol", mspaint: "paint", paint: "paint", pbrush: "paint", winamp: "winamp", mirc: "mirc", winmine: "mines", minas: "mines", fortune: "fortune", biscoito: "fortune", pinball: "pinball", skifree: "skifree", ski: "skifree", command: "dos", cmd: "dos", dos: "dos", msdos: "dos", netscape: "browser", iexplore: "browser", navigator: "browser" };
  function runCmd(raw) {
    const c = raw.trim();
    if (/^(https?:\/\/|www\.)\S+$/i.test(c)) {
      const u = /^www\./i.test(c) ? "https://" + c : c;
      try { restore(browser); openInBrowser(new URL(u).href, c); return true; } catch (_) { return false; }
    }
    const app = RUN[c.toLowerCase().replace(/\.exe$/, "")];
    if (app) launch({ dataset: { open: app } });
    return !!app;
  }
  function openRun() {
    const old = desk.querySelector(".win-run");
    if (old) { restore(old); return old.querySelector("input").focus(); }
    const body = doc.createElement("form");
    body.className = "dlg run";
    body.innerHTML = `<div class="dlg-msg"><img src="${ICONS}executable-0.png" alt="" width="32" height="32"><p>Digite o nome de um programa, pasta, documento ou recurso da Internet, e o Windows o abrirá para você.</p></div><div class="run-row"><label for="run-in">Abrir:</label><input id="run-in" type="text" autocomplete="off" spellcheck="false"></div><div class="dlg-btns"><button class="btn" type="submit">OK</button><button class="btn" type="button" data-act="close">Cancelar</button></div>`;
    const win = makeWin({ title: "Executar", icon: "executable-0", cls: "win-dialog win-run", body, w: 360, center: true });
    const input = body.querySelector("input");
    try { input.value = localStorage.getItem("sr.run") || ""; } catch (_) {}
    input.focus(); input.select();
    input.addEventListener("keydown", e => { if (e.key === "Escape") closeWin(win); });
    body.addEventListener("submit", e => {
      e.preventDefault();
      const c = input.value.trim();
      if (!c) return;
      try { localStorage.setItem("sr.run", c); } catch (_) {}
      closeWin(win);
      if (!runCmd(c)) {
        const d = dialog("notfound");
        d.querySelector(".nf-msg").textContent = `Não é possível encontrar '${c}'. Verifique se o nome foi digitado corretamente e tente novamente.`;
      }
    });
  }

  // ---------- logoff: tela rápida e recarrega a página ----------
  function logoff() {
    const o = doc.createElement("div");
    o.className = "shutdown";
    o.innerHTML = "<p>Fazendo logoff...</p>";
    doc.body.append(o);
    setTimeout(() => location.reload(), 1200);
  }

  // ---------- Ajuda: a página /sobre/ numa janela de HTML Help do 98 ----------
  function openHelp() {
    const old = desk.querySelector(".win-help");
    if (old) return restore(old);
    const body = doc.createElement("div");
    body.className = "hlp";
    body.innerHTML = `<div class="hlp-bar"><button type="button" class="hlp-btn" data-h="hide"><i>&#9703;</i><span>Ocultar</span></button><button type="button" class="hlp-btn" data-h="back" disabled><i>&#9664;</i><span>Voltar</span></button><button type="button" class="hlp-btn" data-h="opts"><i>&#9776;</i><span>Opções</span></button></div>
<div class="hlp-main"><div class="hlp-nav"><div class="hlp-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="toc">Conteúdo</button><button type="button" role="tab" data-tab="idx">Índice</button><button type="button" role="tab" data-tab="find">Pesquisar</button></div>
<div class="hlp-panes"><div class="hlp-pane" data-pane="toc"></div><div class="hlp-pane" data-pane="idx" hidden></div><div class="hlp-pane" data-pane="find" hidden><label>Digite a palavra a procurar:<input type="text" spellcheck="false"></label><div class="hlp-results"></div></div></div></div>
<div class="hlp-topic"><p class="hlp-wait">Carregando...</p></div></div>`;
    const win = makeWin({ title: "Ajuda do Sinal e Ruído", icon: "help_book_big-0", cls: "win-help", body, w: 700, h: 470 });
    const $ = s => body.querySelector(s);
    const view = $(".hlp-topic"), nav = $(".hlp-nav"), backBtn = $("[data-h=back]");
    let topics = [], hist = [];
    const item = (t, icon) => { const b = doc.createElement("button"); b.type = "button"; b.dataset.i = t.i; b.className = "hlp-item"; b.innerHTML = `<img src="${ICONS}${icon}.png" alt="" width="16" height="16"><span></span>`; b.lastChild.textContent = t.title; return b; };
    function show(i, fromBack) {
      if (!fromBack) hist.push(i);
      backBtn.disabled = hist.length < 2;
      view.replaceChildren(...topics[i].nodes.map(n => n.cloneNode(true)));
      view.scrollTop = 0;
      body.querySelectorAll(".hlp-item").forEach(b => b.classList.toggle("is-sel", +b.dataset.i === i));
    }
    function build(nodes) {
      let cur = { title: "Bem-vindo", nodes: [] };
      const out = [];
      for (const n of nodes) {
        if (n.tagName === "H2") { out.push(cur); cur = { title: n.textContent.trim(), nodes: [] }; }
        cur.nodes.push(n);
      }
      out.push(cur);
      topics = out.filter(t => t.nodes.length).map((t, i) => Object.assign(t, { i }));
      const toc = $("[data-pane=toc]");
      const root = doc.createElement("div");
      root.innerHTML = `<button type="button" class="hlp-book" aria-expanded="true"><img src="${ICONS}help_book_small-0.png" alt="" width="16" height="16"><span>Sinal e Ruído</span></button><div class="hlp-kids"></div>`;
      root.querySelector(".hlp-kids").append(...topics.map(t => item(t, "help_question_mark-0")));
      toc.append(root);
      $("[data-pane=idx]").append(...[...topics].sort((a, b) => a.title.localeCompare(b.title, "pt")).map(t => item(t, "help_question_mark-0")));
      show(0);
    }
    fetch(BASE + "/sobre/")
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(html => {
        const pb = new DOMParser().parseFromString(html, "text/html").querySelector(".page-body");
        if (!pb) throw new Error("sem .page-body");
        build([...pb.children].filter(n => !n.matches("h1")).map(n => doc.adoptNode(n)));
      })
      .catch(() => { view.innerHTML = `<p>Não foi possível carregar a ajuda. <a href="${BASE}/sobre/">Abrir a página Sobre</a></p>`; });
    body.addEventListener("click", e => {
      const it = e.target.closest(".hlp-item"), tab = e.target.closest("[data-tab]"), h = e.target.closest("[data-h]");
      if (it) show(+it.dataset.i);
      else if (e.target.closest(".hlp-book")) { const b = e.target.closest(".hlp-book"); b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true")); }
      else if (tab) {
        body.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-selected", String(b === tab)));
        body.querySelectorAll("[data-pane]").forEach(p => { p.hidden = p.dataset.pane !== tab.dataset.tab; });
      } else if (h) {
        if (h.dataset.h === "hide") { nav.hidden = !nav.hidden; h.querySelector("span").textContent = nav.hidden ? "Mostrar" : "Ocultar"; }
        else if (h.dataset.h === "back" && hist.length > 1) { hist.pop(); show(hist[hist.length - 1], true); }
        else if (h.dataset.h === "opts") body.classList.toggle("hlp-big"); // Opções: só o tamanho do texto
      }
    });
    $("[data-pane=find] input").addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase(), res = $(".hlp-results");
      res.replaceChildren(...(q ? topics.filter(t => (t.title + " " + t.nodes.map(n => n.textContent).join(" ")).toLowerCase().includes(q)).map(t => item(t, "help_question_mark-0")) : []));
      if (q && !res.children.length) res.textContent = "Nenhum tópico encontrado.";
    });
  }

  // ---------- lançadores: ícones do desktop, menu Iniciar, data-open ----------
  // API mínima pros apps carregados sob demanda (mirc.js, mines.js).
  window.__snr = { makeWin, restore, ICONS, BASE, setLoading };
  function openApp(url, cb) {
    if (cb()) return;
    const s = doc.createElement("script");
    s.src = url.startsWith(BASE + "/") ? url + V : url; // ?v=<build>: navegador não serve o app antigo do cache
    s.onload = () => cb();
    doc.head.append(s);
  }
  function launch(el) {
    const open = el.dataset.open;
    if (el.href && !open) { location.href = el.href; return; }
    if (open === "run") openRun();
    else if (open === "logoff") logoff();
    else if (open === "help") openHelp();
    else if (open === "browser") restore(browser);
    else if (open === "reset-browser") resetBrowser();
    else if (open === "dos") openDos();
    else if (open === "notepad") openNotepad();
    else if (open === "shutdown") doc.getElementById("shutdown").hidden = false;
    else if (open === "mirc") openApp(BASE + "/assets/js/mirc.js", () => window.snrMirc?.());
    else if (open === "mines") openApp(BASE + "/assets/js/mines.js", () => window.snrMines?.());
    else if (open === "winamp") openWinamp();
    else if (open === "wordpad") openApp(BASE + "/assets/js/wordpad.js", () => window.snrWordpad?.());
    else if (open === "calc") openApp(BASE + "/assets/js/calc.js", () => window.snrCalc?.());
    else if (open === "sol") openApp(BASE + "/assets/js/sol.js", () => window.snrSol?.());
    // dados antes do app: scripts injetados rodam fora de ordem
    else if (open === "fortune") openApp(BASE + "/assets/js/fortunes-data.js", () => window.snrFortunesData && (openApp(BASE + "/assets/js/fortune.js", () => window.snrFortune?.()), true));
    else if (open === "paint") openAppWin("https://jspaint.app", "sem título - Paint", "mspaint_2-3", { w: 720, h: 500 });
    // canvas do jogo: 600x440 em (10,30) da página, medido no headless
    else if (open === "pinball") openAppWin("https://pinball.alula.me", "3D Pinball for Windows - Space Cadet", "pinball", { crop: { x: 10, y: 30, w: 600, h: 440 } });
    else if (open === "skifree") openAppWin("https://basicallydan.github.io/skifree.js/", "SkiFree", "skifree", { w: 640, h: 480 });
    else if (open?.startsWith("dlg:")) dialog(open.slice(4));
  }

  // Desktop: clique seleciona, duplo clique abre (toque: clique abre).
  const icons = doc.querySelector(".dicons");
  icons.addEventListener("click", e => {
    const ic = e.target.closest(".dicon");
    if (!ic) return;
    e.preventDefault();
    icons.querySelectorAll(".is-sel").forEach(x => x.classList.remove("is-sel"));
    ic.classList.add("is-sel");
    if (coarse.matches) launch(ic);
  });
  icons.addEventListener("dblclick", e => { const ic = e.target.closest(".dicon"); if (ic) launch(ic); });
  icons.addEventListener("keydown", e => { const ic = e.target.closest(".dicon"); if (ic && e.key === "Enter") { e.preventDefault(); launch(ic); } });

  // No toque o submenu abre por cima do menu: desloca pra caber entre o topo do menu e a taskbar.
  function placeSub(sub) {
    const ul = sub.querySelector(":scope > ul");
    ul.style.transform = "";
    const box = startMenu.getBoundingClientRect(), r = ul.getBoundingClientRect();
    const dy = r.bottom > box.bottom ? Math.max(box.top - r.top, box.bottom - r.bottom)
      : r.top < box.top ? box.top - r.top : 0;
    ul.style.transform = dy ? `translateY(${dy}px)` : "";
  }

  // painéis de submenu abertos por toque (is-open): fecha todos e reseta o aria
  function closeSubs() {
    startMenu.querySelectorAll(".sm-sub.is-open").forEach(li => {
      li.classList.remove("is-open");
      li.firstElementChild.setAttribute("aria-expanded", "false");
    });
  }

  startBtn.addEventListener("click", () => {
    const open = startMenu.hidden;
    if (!open) closeSubs(); // fechando: não deixa painel aberto cobrindo o menu na próxima abertura
    closeMenus(startMenu);
    startMenu.hidden = !open;
    startBtn.setAttribute("aria-expanded", String(open));
    startBtn.classList.toggle("is-down", open);
  });
  startMenu.addEventListener("click", e => {
    const it = e.target.closest(".dicon");
    if (!it) return;
    const sub = it.parentElement.classList.contains("sm-sub") ? it.parentElement : null;
    if (sub) { // "Programas ▸" só abre/fecha o submenu: no toque não existe hover
      const open = !sub.classList.contains("is-open");
      sub.parentElement.querySelectorAll(".sm-sub.is-open").forEach(s => {
        s.classList.remove("is-open");
        s.firstElementChild.setAttribute("aria-expanded", "false");
      });
      sub.classList.toggle("is-open", open);
      it.setAttribute("aria-expanded", String(open));
      if (open && narrow.matches) placeSub(sub);
      return;
    }
    closeMenus();
    if (it.dataset.open) launch(it); // links seguem normalmente
  });

  // data-open fora do desktop/menu (barra de menus, taskpane, status bar)
  doc.addEventListener("click", e => {
    const el = e.target.closest("[data-open]");
    if (el && !el.closest(".dicons, .startmenu")) { if (el.href) e.preventDefault(); launch(el); }
    if (!e.target.closest(".win-menu, .startmenu, #start-btn")) closeMenus();
  });
  doc.addEventListener("keydown", e => { if (e.key === "Escape") closeMenus(); });
  doc.getElementById("shutdown").addEventListener("click", e => { e.currentTarget.hidden = true; });

  // ---------- comandos da toolbar do Netscape ----------
  doc.addEventListener("click", e => {
    const cmd = e.target.closest("[data-cmd]")?.dataset.cmd;
    if (cmd === "back") history.back();
    else if (cmd === "forward") history.forward();
    else if (cmd === "reload") location.reload();
    else if (cmd === "print") print();
    else if (cmd === "stop") { stop(); setLoading(false, "Transferência interrompida."); }
  });

  // ---------- relógio ----------
  const clock = doc.getElementById("clock");
  (function tick() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    clock.title = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    setTimeout(tick, 60000 - (now % 60000));
  })();

  // ---------- contador de visitas (abacus: JSON + CORS, sem cookie) ----------
  // Conta uma vez por sessão do navegador; nas outras páginas só lê. Fora do GitHub Pages não conta.
  const odo = doc.querySelector("[data-counter] .odo");
  if (odo && location.hostname.endsWith(".github.io")) {
    let seen = false;
    try { seen = sessionStorage.getItem("sr.visit") === "1"; sessionStorage.setItem("sr.visit", "1"); } catch (_) {}
    fetch("https://abacus.jasoncameron.dev/" + (seen ? "get" : "hit") + "/" + location.hostname + "/sinal-e-ruido")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(j => { if (Number.isFinite(j.value)) odo.textContent = String(j.value).padStart(6, "0"); })
      .catch(() => {});
  }

  // ---------- boot ----------
  load(browser);
  addEventListener("resize", () => fit(browser));
  register(browser);
  focusWin(browser);
  window.SR = { openPost };
})();
