// Paciência (Klondike, como o Solitário do 98): sem deps, cliques em vez de arrastar.
// Clique na carta pra selecionar, clique no destino pra mover; duplo clique manda pra base.
// Carregado sob demanda pelo desktop.js (data-open="sol").
(() => {
  "use strict";
  const { makeWin, restore } = window.__snr;
  const doc = document;
  const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"]; // ♠ ♥ ♦ ♣
  const RED = [false, true, true, false];
  const RANK = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  window.snrSol = () => {
    const old = doc.querySelector(".win-sol");
    if (old) return restore(old);

    const body = doc.createElement("div");
    body.className = "sol";
    body.innerHTML = `<div class="sol-menu"></div><div class="sol-top"></div><div class="sol-tab"></div><div class="sol-hint">Clique numa carta e no destino. Duplo clique: manda pra base.</div>`;
    const menu = body.querySelector(".sol-menu"), topRow = body.querySelector(".sol-top"), tabRow = body.querySelector(".sol-tab");

    let stock = [], waste = [], found = [[], [], [], []], tab = [[], [], [], [], [], [], []];
    let sel = null, moves = 0, won = false;

    const mkMenu = (label, items) => {
      const wrap = doc.createElement("span");
      wrap.className = "mines-mi";
      const btn = doc.createElement("button");
      btn.type = "button";
      btn.innerHTML = label;
      const m = doc.createElement("div");
      m.className = "win-menu";
      m.hidden = true;
      for (const [t, fn] of items) {
        const b = doc.createElement("button");
        b.type = "button";
        b.innerHTML = t;
        b.addEventListener("click", () => { m.hidden = true; fn(); });
        m.append(b);
      }
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const open = m.hidden;
        doc.querySelectorAll(".win-menu:not([hidden])").forEach(x => { x.hidden = true; });
        m.hidden = !open;
      });
      wrap.append(btn, m);
      menu.append(wrap);
    };

    const newGame = () => {
      const deck = [];
      for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) deck.push({ s, r, up: false });
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [deck[i], deck[j]] = [deck[j], deck[i]]; }
      tab = [[], [], [], [], [], [], []];
      found = [[], [], [], []];
      waste = [];
      stock = deck;
      for (let p = 0; p < 7; p++) for (let k = 0; k <= p; k++) {
        const c = stock.pop();
        c.up = k === p;
        tab[p].push(c);
      }
      sel = null; moves = 0; won = false;
      render();
    };

    // seleção válida: carta virada que abre um run decrescente alternado até o fim da pilha
    const runOk = (pile, idx) => {
      for (let k = idx; k < pile.length - 1; k++) {
        const a = pile[k], b = pile[k + 1];
        if (!a.up || !b.up || b.r !== a.r - 1 || RED[a.s] === RED[b.s]) return false;
      }
      return pile[idx].up;
    };
    const selCards = () => {
      if (!sel) return [];
      if (sel.from === "waste") return waste.length && sel.idx === waste.length - 1 ? [waste[sel.idx]] : [];
      if (sel.from === "found") return found[sel.pile].length && sel.idx === found[sel.pile].length - 1 ? [found[sel.pile][sel.idx]] : [];
      return runOk(tab[sel.pile], sel.idx) ? tab[sel.pile].slice(sel.idx) : [];
    };
    const foundSlot = c => found.findIndex(f => !f.length ? c.r === 1 : f[f.length - 1].s === c.s && f[f.length - 1].r === c.r - 1);
    const canTab = (c, pile) => {
      if (!pile.length) return c.r === 13;
      const t = pile[pile.length - 1];
      return t.up && RED[t.s] !== RED[c.s] && t.r === c.r + 1;
    };

    const takeSel = () => {
      if (sel.from === "waste") return waste.pop();
      if (sel.from === "found") return found[sel.pile].pop();
      return tab[sel.pile].splice(sel.idx).shift();
    };
    function moveSel(dest) {
      const cards = selCards();
      if (!cards.length) return false;
      const from = sel;
      let ok = false;
      if (dest === "found" && cards.length === 1) {
        const f = foundSlot(cards[0]);
        if (f >= 0) { found[f].push(takeSel()); ok = true; }
      } else if (dest.startsWith("tab")) {
        const p = +dest.slice(3);
        if (canTab(cards[0], tab[p])) { tab[p].push(...(from.from === "tab" ? tab[from.pile].splice(from.idx) : [takeSel()])); ok = true; }
      }
      if (!ok) return false;
      if (from.from === "tab") {
        const p = tab[from.pile];
        if (p.length && !p[p.length - 1].up) p[p.length - 1].up = true;
      }
      sel = null; moves++;
      won = found.every(f => f.length === 13);
      render();
      return true;
    }

    function draw() {
      if (stock.length) {
        const c = stock.pop();
        c.up = true;
        waste.push(c);
      } else if (waste.length) {
        stock = waste.reverse().map(c => (c.up = false, c));
        waste = [];
      }
      sel = null;
      render();
    }

    function render() {
      topRow.replaceChildren();
      const slot = (zone, cls) => {
        const d = doc.createElement("div");
        d.className = "sol-slot " + cls;
        d.dataset.zone = zone;
        return d;
      };
      const st = slot("stock", "sol-back" + (stock.length ? "" : " sol-empty"));
      st.dataset.zone = "stock";
      st.ariaLabel = stock.length ? "Compra" : "Reembaralhar";
      topRow.append(st);
      const wa = slot("waste", "sol-waste");
      const wc = waste[waste.length - 1];
      if (wc) wa.append(cardEl(wc, { from: "waste", idx: waste.length - 1 }));
      topRow.append(wa);
      const gap = doc.createElement("div");
      gap.className = "sol-gap";
      topRow.append(gap);
      found.forEach((f, i) => {
        const d = slot("found", "sol-f" + (f.length ? "" : " sol-empty"));
        const c = f[f.length - 1];
        if (c) d.append(cardEl(c, { from: "found", pile: i, idx: f.length - 1 }));
        topRow.append(d);
      });

      tabRow.replaceChildren();
      tab.forEach((p, i) => {
        const d = doc.createElement("div");
        d.className = "sol-pile" + (p.length ? "" : " sol-empty");
        d.dataset.zone = "tab" + i;
        if (!p.length) d.append(Object.assign(slot("", ""), { className: "sol-slot" }));
        let y = 0;
        p.forEach((c, k) => {
          const el = cardEl(c, { from: "tab", pile: i, idx: k });
          el.style.top = y + "px";
          y += c.up ? 20 : 7;
          d.append(el);
        });
        d.style.minHeight = Math.max(88, y + 81) + "px";
        tabRow.append(d);
      });

      if (won) {
        const w = doc.createElement("div");
        w.className = "sol-win";
        w.textContent = "Você ganhou em " + moves + " movimentos!";
        body.append(w);
      } else body.querySelector(".sol-win")?.remove();
    }

    function cardEl(c, at) {
      const d = doc.createElement("div");
      d.className = "sol-card" + (c.up ? "" : " sol-down") + (RED[c.s] ? " red" : "");
      d.dataset.from = at.from;
      if (at.pile !== undefined) d.dataset.pile = at.pile;
      d.dataset.idx = at.idx;
      d.textContent = c.up ? RANK[c.r] + SUITS[c.s] : "";
      d.ariaLabel = c.up ? RANK[c.r] + " de " + ["espadas", "copas", "ouros", "paus"][c.s] : "carta virada";
      if (sel && sel.from === at.from && sel.pile === at.pile && sel.idx === at.idx) d.classList.add("is-sel");
      return d;
    }

    const selectable = at => {
      if (!at) return false;
      if (at.from === "waste") return at.idx === waste.length - 1;
      if (at.from === "found") return at.idx === found[at.pile].length - 1;
      return runOk(tab[at.pile], at.idx);
    };

    body.addEventListener("click", e => {
      if (e.target.closest(".sol-menu")) return;
      const card = e.target.closest(".sol-card");
      const zoneEl = e.target.closest("[data-zone]");
      if (!card && !zoneEl) return;
      if (!card && zoneEl.dataset.zone === "stock") return draw();
      const at = card ? { from: card.dataset.from, pile: card.dataset.pile === undefined ? undefined : +card.dataset.pile, idx: +card.dataset.idx } : null;
      const same = at && sel && sel.from === at.from && sel.pile === at.pile && sel.idx === at.idx;
      const zone = card ? (card.dataset.from === "waste" ? "waste" : card.dataset.from === "found" ? "found" : "tab" + card.dataset.pile) : zoneEl.dataset.zone;
      const dest = zone === "waste" ? null : zone.startsWith("tab") ? zone : zone === "found" ? "found" : null;
      if (sel && dest && !same && moveSel(dest)) return; // clique no destino move a seleção
      if (selectable(at)) {
        sel = same ? null : at;
        render();
      } else if (sel) { sel = null; render(); }
    });

    body.addEventListener("dblclick", e => {
      const card = e.target.closest(".sol-card");
      if (!card || card.classList.contains("sol-down")) return;
      const at = { from: card.dataset.from, pile: +card.dataset.pile, idx: +card.dataset.idx };
      if (at.from === "found" || (at.from === "tab" && at.idx !== tab[at.pile].length - 1)) return;
      sel = at;
      if (!moveSel("found")) sel = null;
      render();
    });

    mkMenu("<u>J</u>ogo", [["Novo", newGame], ["Sair", () => win.querySelector("[data-act=close]").click()]]);
    const win = makeWin({ title: "Paciência", icon: "game_solitaire-0", cls: "win-sol", body, w: 620 });
    win.style.width = "";
    newGame();
    return win;
  };
})();
