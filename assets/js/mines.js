// Campo Minado (Winmine 98): sem deps, skin Windows 98.
// Carregado sob demanda pelo desktop.js (data-open="mines").
(() => {
  "use strict";
  const { makeWin, restore } = window.__snr;
  const doc = document;
  const LEVELS = [["Principiante", 9, 9, 10], ["Intermediário", 16, 16, 40], ["Avançado", 30, 16, 99]]; // igual ao 98
  const F = ["", "0000ff", "008000", "ff0000", "00007f", "800000", "008080", "000000", "7f7f7f"];

  window.snrMines = () => {
    const old = doc.querySelector(".win-mines");
    if (old) return restore(old);

    let lv = 0;
    try { lv = Math.min(2, Math.max(0, +localStorage.getItem("sr.mines.level") || 0)); } catch (e) {}
    let [, W, H, MINES] = LEVELS[lv];

    const body = doc.createElement("div");
    body.className = "mines";
    const bar = doc.createElement("div");
    bar.className = "mines-menu";
    const about = doc.createElement("div");
    about.className = "mines-about";
    about.hidden = true;
    about.textContent = "Campo Minado, clone do Winmine 98.";
    const mkMenu = (label, items) => {
      const wrap = doc.createElement("span");
      wrap.className = "mines-mi";
      const btn = doc.createElement("button");
      btn.type = "button";
      btn.innerHTML = label;
      const m = doc.createElement("div");
      m.className = "win-menu";
      m.hidden = true;
      for (const it of items) {
        if (!it) { m.append(doc.createElement("hr")); continue; }
        const b = doc.createElement("button");
        b.type = "button";
        b.className = "mines-opt";
        b.innerHTML = it[0];
        b.addEventListener("click", () => { m.hidden = true; it[1](); });
        b._chk = it[2];
        m.append(b);
      }
      btn.addEventListener("click", e => {
        e.stopPropagation(); // senão o handler global fecha o menu na hora
        const open = m.hidden;
        doc.querySelectorAll(".win-menu:not([hidden])").forEach(x => { x.hidden = true; });
        if (open) {
          m.querySelectorAll(".mines-opt").forEach(b => { if (b._chk) b.dataset.chk = b._chk() ? "✓" : ""; });
          m.hidden = false;
        }
      });
      wrap.append(btn, m);
      bar.append(wrap);
    };
    mkMenu("<u>J</u>ogo", [
      ["Novo<span>F2</span>", () => reset()],
      null,
      ...LEVELS.map(([n], i) => [n, () => setLevel(i), () => lv === i]),
      null,
      ["Sair", () => win.querySelector("[data-act=close]").click()],
    ]);
    mkMenu("<u>A</u>juda", [["Sobre o Campo Minado...", () => { about.hidden = !about.hidden; }]]);
    const top = doc.createElement("div");
    top.className = "mines-top";
    const led = t => {
      const d = doc.createElement("span");
      d.className = "mines-led";
      d.textContent = t;
      return d;
    };
    const mineLed = led(String(MINES).padStart(3, "0"));
    const face = doc.createElement("button");
    face.type = "button";
    face.className = "mines-face";
    face.setAttribute("aria-label", "Novo jogo");
    face.textContent = "\u{1F642}";
    const timeLed = led("000");
    top.append(mineLed, face, timeLed);
    const grid = doc.createElement("div");
    grid.className = "mines-grid";
    body.append(bar, about, top, grid);

    const win = makeWin({ title: "Campo Minado", icon: "game_mine_1-0", cls: "win-mines", body, w: 200 });
    win.style.width = ""; // encolhe até o tabuleiro
    win._onclose = () => clearInterval(tick);

    let cells = [], opened = 0, flags = 0, over = false, t0 = null, tick = null, placed = false;

    function setLevel(i) {
      lv = i;
      [, W, H, MINES] = LEVELS[i];
      try { localStorage.setItem("sr.mines.level", i); } catch (e) {}
      win.style.width = "";
      reset();
    }

    function reset() {
      cells = []; opened = 0; flags = 0; over = false; placed = false;
      grid.style.gridTemplateColumns = "repeat(" + W + ", 16px)";
      clearInterval(tick); t0 = null; timeLed.textContent = "000";
      face.textContent = "\u{1F642}";
      mineLed.textContent = String(MINES).padStart(3, "0");
      grid.replaceChildren();
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const b = doc.createElement("button");
        b.type = "button";
        b.className = "mc";
        b.setAttribute("aria-label", "casa " + (x + 1) + "," + (y + 1));
        b.addEventListener("click", () => openCell(x, y));
        b.addEventListener("contextmenu", e => { e.preventDefault(); flag(x, y); });
        b.addEventListener("dblclick", () => chord(x, y));
        cells.push({ b, x, y, mine: false, open: false, flag: false, n: 0 });
        grid.append(b);
      }
    }

    // sorteio das minas no primeiro clique, nunca na casa clicada
    function place(first) {
      placed = true;
      let k = 0;
      while (k < MINES) {
        const c = cells[Math.random() * cells.length | 0];
        if (!c.mine && c !== first) { c.mine = true; k++; }
      }
      for (const c of cells) c.n = neighbors(c).filter(n => n.mine).length;
    }

    const idx = (x, y) => y * W + x;
    const at = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? cells[idx(x, y)] : null;
    function neighbors(c) {
      const out = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) { const n = at(c.x + dx, c.y + dy); if (n) out.push(n); }
      }
      return out;
    }

    function startClock() {
      if (t0) return;
      t0 = Date.now();
      tick = setInterval(() => {
        timeLed.textContent = String(Math.min(999, (Date.now() - t0) / 1000 | 0)).padStart(3, "0");
      }, 500);
    }

    function openCell(x, y) {
      if (over) return;
      const c = at(x, y);
      if (!c || c.open || c.flag) return;
      if (!placed) place(c);
      startClock();
      if (c.mine) return boom(c);
      flood(c);
      checkWin();
    }

    function flood(c) {
      if (c.open || c.flag) return;
      c.open = true; opened++;
      c.b.classList.add("is-open");
      if (c.n) {
        c.b.textContent = c.n;
        c.b.style.color = "#" + F[c.n];
      } else neighbors(c).forEach(flood);
    }

    function flag(x, y) {
      if (over) return;
      const c = at(x, y);
      if (!c || c.open) return;
      c.flag = !c.flag;
      c.b.textContent = c.flag ? "\u{1F6A9}" : "";
      flags += c.flag ? 1 : -1;
      mineLed.textContent = String(Math.max(0, MINES - flags)).padStart(3, "0");
    }

    function chord(x, y) {
      const c = at(x, y);
      if (!c || !c.open || !c.n) return;
      if (neighbors(c).filter(n => n.flag).length !== c.n) return;
      neighbors(c).forEach(n => { if (!n.flag && !n.open) openCell(n.x, n.y); });
    }

    function boom(c) {
      over = true;
      clearInterval(tick);
      face.textContent = "\u{1F635}";
      for (const k of cells) {
        if (k.mine && !k.flag) { k.b.classList.add("is-open"); k.b.textContent = "\u{1F4A3}"; }
        else if (k.flag && !k.mine) { k.b.classList.add("is-open"); k.b.textContent = "❌"; }
      }
      c.b.style.background = "#ff0000";
    }

    function checkWin() {
      if (opened !== W * H - MINES) return;
      over = true;
      clearInterval(tick);
      face.textContent = "\u{1F60E}";
      for (const k of cells) if (k.mine) { k.flag = true; k.b.textContent = "\u{1F6A9}"; }
      mineLed.textContent = "000";
    }

    face.addEventListener("click", reset);
    const calm = () => { if (!over) face.textContent = "\u{1F642}"; };
    grid.addEventListener("pointerdown", e => { if (!over && e.button === 0) face.textContent = "\u{1F62E}"; });
    grid.addEventListener("pointerup", calm);
    grid.addEventListener("pointerleave", calm);
    win.addEventListener("keydown", e => { if (e.key === "F2") { e.preventDefault(); reset(); } });
    reset();
    return win;
  };
})();
