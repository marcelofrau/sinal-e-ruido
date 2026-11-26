// "Sistema operacional" do blog: janelas (arrastar, minimizar, maximizar, fechar), barra de tarefas,
// menu Iniciar, ícones do desktop, posts em popup (fetch + pushState), diálogos e o MS-DOS (js-dos).
(() => {
  "use strict";
  const doc = document, root = doc.documentElement;
  const BASE = root.dataset.baseurl || "";
  const ICONS = BASE + "/assets/icons/";
  const JSDOS = "https://v8.js-dos.com/latest/";
  const desk = doc.getElementById("desktop");
  const tasks = doc.getElementById("tasks");
  const startBtn = doc.getElementById("start-btn");
  const startMenu = doc.getElementById("startmenu");
  const status = doc.getElementById("ns-status");
  const browser = doc.getElementById("win-browser");
  const narrow = matchMedia("(max-width: 760px)");
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
    b.querySelector("span").textContent = caption(win).textContent;
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
    doc.querySelectorAll(".win.is-active").forEach(w => { w.classList.remove("is-active"); w._task?.classList.remove("is-active"); });
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
    if (except !== startMenu) { startMenu.hidden = true; startBtn.setAttribute("aria-expanded", "false"); startBtn.classList.remove("is-down"); }
  }

  desk.addEventListener("click", e => {
    const win = e.target.closest(".win");
    if (!win) return;
    const t = e.target;
    if (t.closest(".win-min")) return minimize(win);
    if (t.closest(".win-max")) return toggleMax(win);
    if (t.closest(".win-ctl")) {
      const m = win.querySelector(".win-menu");
      closeMenus(m);
      m.hidden = !m.hidden;
      return;
    }
    const act = t.closest("[data-act]")?.dataset.act;
    if (!act) return;
    win.querySelector(".win-menu").hidden = true;
    if (act === "close") closeWin(win);
    else if (act === "min") minimize(win);
    else if (act === "max") { if (!win.classList.contains("is-max")) toggleMax(win); }
    else if (act === "restore") { if (win.classList.contains("is-max")) toggleMax(win); }
  });
  desk.addEventListener("dblclick", e => {
    const win = e.target.closest(".win");
    if (!win) return;
    if (e.target.closest(".win-ctl")) closeWin(win); // como no 3.11
    else if (e.target.closest(".win-title") && !e.target.closest("button") && !win.classList.contains("win-dialog")) toggleMax(win);
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
  }

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

  // ---------- sites externos "dentro do Netscape" (Favoritos) ----------
  const webs = new Map(); // url -> janela

  function openWeb(url, title) {
    if (webs.has(url)) return restore(webs.get(url));
    const body = doc.createElement("div");
    body.className = "web";
    const bar = doc.createElement("div");
    bar.className = "web-url";
    const label = doc.createElement("b");
    label.textContent = "Endere\u00e7o:";
    const loc = doc.createElement("span");
    loc.textContent = url;
    bar.append(label, loc);
    const frame = doc.createElement("iframe");
    Object.assign(frame, { src: url, className: "web-frame", referrerPolicy: "no-referrer", title: title });
    const hint = doc.createElement("div");
    hint.className = "web-hint";
    hint.append(doc.createTextNode("N\u00e3o carregou? O site pode bloquear frames: "));
    const out = doc.createElement("a");
    Object.assign(out, { href: url, target: "_blank", rel: "noopener" });
    out.textContent = "abrir numa aba real";
    hint.append(out);
    body.append(bar, frame, hint);
    const win = makeWin({ title: title + " - Netscape", icon: "world-3", cls: "win-web", body, w: Math.max(640, Math.min(1040, desk.clientWidth * 0.78)), h: desk.clientHeight - 24 });
    setLoading(true, "Contatando o host: " + new URL(url).host + "...");
    frame.addEventListener("load", () => setLoading(false));
    webs.set(url, win);
    win._onclose = () => webs.delete(url);
    return win;
  }

  doc.addEventListener("click", e => {
    const a = e.target.closest("a[data-frame]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openWeb(a.href, a.dataset.frame || a.textContent.trim());
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

  // ---------- lançadores: ícones do desktop, menu Iniciar, data-open ----------
  // API mínima pros apps carregados sob demanda (mirc.js, mines.js).
  window.__snr = { makeWin, restore, ICONS, BASE, setLoading };
  function openApp(url, cb) {
    if (cb()) return;
    const s = doc.createElement("script");
    s.src = url;
    s.onload = () => cb();
    doc.head.append(s);
  }
  function launch(el) {
    const open = el.dataset.open;
    if (el.href) { location.href = el.href; return; }
    if (open === "browser") restore(browser);
    else if (open === "dos") openDos();
    else if (open === "notepad") openNotepad();
    else if (open === "shutdown") doc.getElementById("shutdown").hidden = false;
    else if (open === "mirc") openApp(BASE + "/assets/js/mirc.js", () => window.snrMirc?.());
    else if (open === "mines") openApp(BASE + "/assets/js/mines.js", () => window.snrMines?.());
    else if (open === "winamp") openWeb(new URL(BASE + "/winamp/", location.href).href, "Winamp");
    else if (open === "paint") openWeb("https://jspaint.app", "Paint");
    else if (open === "pinball") openWeb("https://pinball.alula.me", "3D Pinball");
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

  startBtn.addEventListener("click", () => {
    const open = startMenu.hidden;
    closeMenus(startMenu);
    startMenu.hidden = !open;
    startBtn.setAttribute("aria-expanded", String(open));
    startBtn.classList.toggle("is-down", open);
  });
  startMenu.addEventListener("click", e => {
    const it = e.target.closest(".dicon");
    if (!it) return;
    closeMenus();
    if (it.dataset.open) launch(it); // links seguem normalmente
  });

  // data-open fora do desktop/menu (barra de menus, taskpane, status bar)
  doc.addEventListener("click", e => {
    const el = e.target.closest("[data-open]");
    if (el && !el.closest(".dicons, .startmenu")) launch(el);
    if (!e.target.closest(".win-menu, .win-ctl, .startmenu, #start-btn")) closeMenus();
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

  // ---------- boot ----------
  load(browser);
  register(browser);
  focusWin(browser);
  window.SR = { openPost };
})();
