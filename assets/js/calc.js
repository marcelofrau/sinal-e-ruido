// Calculadora (clone do Win98, modo padrão). Carregado sob demanda pelo desktop.js (data-open="calc").
(() => {
  "use strict";
  const { makeWin, restore } = window.__snr;
  const doc = document;

  window.snrCalc = () => {
    const old = doc.querySelector(".win-calc");
    if (old) return restore(old);

    const body = doc.createElement("div");
    body.className = "calc";
    body.innerHTML = `<div class="calc-disp"><span class="calc-mem" hidden>M</span><span class="calc-val">0</span></div><div class="calc-grid"></div>`;
    const val = body.querySelector(".calc-val"), memInd = body.querySelector(".calc-mem"), grid = body.querySelector(".calc-grid");

    // [label, handler, extra class] — linha 1 do 98: ←, CE, C; coluna esquerda: memória
    let cur = "0", acc = null, op = null, fresh = true, mem = 0, locked = false;
    const show = t => { val.textContent = t; };
    const num = () => parseFloat(cur) || 0;

    function digit(d) {
      if (locked) return;
      if (fresh) { cur = d; fresh = false; }
      else if (cur.replace("-", "").replace(".", "").length < 16) cur = cur === "0" ? d : cur === "-0" ? "-" + d : cur + d;
      show(cur);
    }
    function dot() {
      if (locked) return;
      if (fresh) { cur = "0."; fresh = false; }
      else if (!cur.includes(".")) cur += ".";
      show(cur);
    }
    function apply() {
      const b = parseFloat(cur);
      let r;
      if (op === "+") r = acc + b;
      else if (op === "-") r = acc - b;
      else if (op === "*") r = acc * b;
      else if (op === "/") {
        if (!b) { fail("Não é possível dividir por zero."); return null; }
        r = acc / b;
      }
      return r;
    }
    function fail(msg) { locked = true; acc = op = null; fresh = true; show(msg); }
    function setOp(o) {
      if (locked) return;
      if (op && !fresh) {
        const r = apply();
        if (r === null) return;
        cur = String(+r.toPrecision(14));
        acc = r;
      } else acc = num();
      op = o;
      fresh = true;
      show(cur);
    }
    function eq() {
      if (locked || !op) return;
      const r = apply();
      if (r === null) return;
      cur = String(+r.toPrecision(14));
      acc = op = null;
      fresh = true;
      show(cur);
    }

    const K = {
      MC: () => { mem = 0; memInd.hidden = true; },
      MR: () => { if (!locked) { cur = String(+mem.toPrecision(14)); fresh = false; show(cur); } },
      MS: () => { mem = num(); memInd.hidden = false; },
      "M+": () => { mem += num(); memInd.hidden = false; },
      "←": () => { if (locked) return; cur = cur.length > 1 ? cur.slice(0, -1) : "0"; if (cur === "-") cur = "0"; show(cur); },
      CE: () => { locked = false; cur = "0"; fresh = true; show(cur); },
      C: () => { locked = false; cur = "0"; acc = op = null; fresh = true; show(cur); },
      "±": () => { if (locked) return; cur = cur.startsWith("-") ? cur.slice(1) : cur === "0" ? cur : "-" + cur; show(cur); },
      "√": () => { if (locked) return; if (num() < 0) return fail("Função inválida."); cur = String(+Math.sqrt(num()).toPrecision(14)); fresh = true; show(cur); },
      "%": () => { if (locked) return; const p = acc !== null ? acc * num() / 100 : num() / 100; cur = String(+p.toPrecision(14)); fresh = true; show(cur); },
      "1/x": () => { if (locked) return; if (!num()) return fail("Não é possível dividir por zero."); cur = String(+(1 / num()).toPrecision(14)); fresh = true; show(cur); },
      "=": eq,
    };
    const LAYOUT = [
      [null, "←", "CE", "C", null, null],
      ["MC", "7", "8", "9", "/", "√"],
      ["MR", "4", "5", "6", "*", "%"],
      ["MS", "1", "2", "3", "-", "1/x"],
      ["M+", "0", "±", ".", "+", "="],
    ];
    const OPS = { "+": "+", "-": "-", "*": "*", "/": "/" };
    for (const row of LAYOUT) for (const k of row) {
      if (!k) { grid.append(doc.createElement("i")); continue; }
      const b = doc.createElement("button");
      b.type = "button";
      b.textContent = k;
      if (K[k]) b.addEventListener("click", K[k]);
      else if (k === ".") b.addEventListener("click", dot);
      else if (OPS[k]) b.addEventListener("click", () => setOp(k));
      else b.addEventListener("click", () => digit(k));
      if (/\d|\./.test(k)) b.className = "calc-num";
      if (K[k] && ["MC", "MR", "MS", "M+"].includes(k)) b.className = "calc-m";
      grid.append(b);
    }

    // teclado físico: dígitos (inclui o numérico), operadores, Enter, Backspace, Esc, Delete, vírgula
    const KEYMAP = { Enter: "=", "=": "=", Backspace: "←", Escape: "C", Delete: "CE", "%": "%", "+": "+", "-": "-", "*": "*", "/": "/", ",": "." };
    const onKey = e => {
      if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
      const k = /^\d$/.test(e.key) ? e.key : e.key === "." ? "." : KEYMAP[e.key];
      if (k === undefined) return;
      e.preventDefault();
      const b = [...grid.querySelectorAll("button")].find(b => b.textContent === k);
      if (K[k]) K[k]();
      else if (k === ".") dot();
      else if (OPS[k]) setOp(k);
      else digit(k);
      if (b) { b.classList.add("is-press"); setTimeout(() => b.classList.remove("is-press"), 90); }
    };
    doc.addEventListener("keydown", onKey);

    const win = makeWin({ title: "Calculadora", icon: "calculator-0", cls: "win-calc", body, w: 260 });
    win._onclose = () => doc.removeEventListener("keydown", onKey);
    return win;
  };
})();
