// Campo Minado (Winmine 98): sem deps, skin Windows 98.
// Carregado sob demanda pelo desktop.js (data-open="mines").
(() => {
  "use strict";
  const { makeWin, restore } = window.__snr;
  const doc = document;
  const W = 9, H = 9, MINES = 10; // nível principiante, igual ao 98
  const F = ["", "0000ff", "008000", "ff0000", "00007f", "800000", "008080", "000000", "7f7f7f"];

  window.snrMines = () => {
    const old = doc.querySelector(".win-mines");
    if (old) return restore(old);

    const body = doc.createElement("div");
    body.className = "mines";
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
    face.textContent = "\u{1F603}";
    const timeLed = led("000");
    top.append(mineLed, face, timeLed);
    const grid = doc.createElement("div");
    grid.className = "mines-grid";
    grid.style.gridTemplateColumns = "repeat(" + W + ", 16px)";
    body.append(top, grid);

    const win = makeWin({ title: "Campo Minado", icon: "game_mine_1-0", cls: "win-mines", body, w: W * 16 + 24, h: H * 16 + 104 });
    win._onclose = () => {};

    let cells = [], opened = 0, flags = 0, over = false, t0 = null, tick = null;

    function reset() {
      cells = []; opened = 0; flags = 0; over = false;
      clearInterval(tick); t0 = null; timeLed.textContent = "000";
      face.textContent = "\u{1F603}";
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
      // sorteio das minas
      let placed = 0;
      while (placed < MINES) {
        const c = cells[Math.random() * cells.length | 0];
        if (!c.mine) { c.mine = true; placed++; }
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
      c.b.textContent = c.flag ? "\u{1F4A3}" : "";
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
      for (const k of cells) if (k.mine) { k.b.classList.add("is-open"); k.b.textContent = "\u{1F4A3}"; }
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
    reset();
    return win;
  };
})();
