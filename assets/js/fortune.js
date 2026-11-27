// Fortune Cookie: biscoito da sorte com anfitrião (Clippy em SVG, placeholder do claudinho).
// Fortunes: assets/js/fortunes-data.js (fonte: repo Três por Dez, _data/quotes.yml).
// Carregado sob demanda pelo desktop.js (data-open="fortune").
(() => {
  "use strict";
  const { makeWin, restore } = window.__snr;
  const doc = document;

  const CLIPPY = `
<svg class="fc-clippy" viewBox="0 0 120 150" role="img" aria-label="Clippy">
  <defs>
    <linearGradient id="fcMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a9bcd3"/><stop offset=".5" stop-color="#eef3f9"/><stop offset="1" stop-color="#8fa5c1"/>
    </linearGradient>
  </defs>
  <path d="M45 18 v86 a19 19 0 0 0 38 0 V32 a14 14 0 0 0 -28 0 v74" fill="none" stroke="#7d90ab" stroke-width="15" stroke-linecap="round" opacity=".9"/>
  <path d="M45 18 v86 a19 19 0 0 0 38 0 V32 a14 14 0 0 0 -28 0 v74" fill="none" stroke="url(#fcMetal)" stroke-width="10" stroke-linecap="round"/>
  <circle cx="52" cy="50" r="11" fill="#fff" stroke="#4a5a72" stroke-width="1.6"/>
  <circle cx="78" cy="50" r="11" fill="#fff" stroke="#4a5a72" stroke-width="1.6"/>
  <circle cx="54.5" cy="51.5" r="4" fill="#20242c"/>
  <circle cx="80.5" cy="51.5" r="4" fill="#20242c"/>
  <path d="M58 67 q7 6 14 0" fill="none" stroke="#4a5a72" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

  const GREETINGS = [
    "Parece que você quer abrir uma fortuna!",
    "Já quebrou o seu biscoito hoje?",
    "Biscoito da sorte: 0% de bateria, 100% de sabedoria.",
    "Fortunas verificadas por especialistas (eu).",
    "Reservei o biscoito mais sábio pra você.",
    "Cuidado: fortuna demais pelo mesmo preço.",
  ];

  window.snrFortune = () => {
    const old = doc.querySelector(".win-fortune");
    if (old) return restore(old);

    const body = doc.createElement("div");
    body.className = "fortune";

    const head = doc.createElement("div");
    head.className = "fc-head";
    const clip = doc.createElement("div");
    clip.innerHTML = CLIPPY;
    const bubble = doc.createElement("div");
    bubble.className = "fc-bubble";
    head.append(clip.firstElementChild, bubble);

    const stage = doc.createElement("div");
    stage.className = "fc-stage";
    const cookie = doc.createElement("button");
    cookie.type = "button";
    cookie.className = "fc-cookie";
    cookie.setAttribute("aria-label", "Quebrar o biscoito da sorte");
    const halfL = doc.createElement("span");
    halfL.className = "fc-half fc-half-l";
    const halfR = doc.createElement("span");
    halfR.className = "fc-half fc-half-r";
    const paper = doc.createElement("span");
    paper.className = "fc-paper";
    const paperTxt = doc.createElement("span");
    paperTxt.className = "fc-paper-txt";
    const paperSrc = doc.createElement("span");
    paperSrc.className = "fc-paper-src";
    paper.append(paperTxt, paperSrc);
    cookie.append(paper, halfL, halfR);
    stage.append(cookie);

    const tip = doc.createElement("p");
    tip.className = "fc-tip";
    tip.textContent = "Clique no biscoito.";

    body.append(head, stage, tip);

    const roll = () => {
      const F = window.snrFortunesData || [];
      bubble.textContent = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      if (!F.length) {
        paperTxt.textContent = "Sem fortunas hoje — o anfitrião comeu todas.";
        paperSrc.textContent = "";
        return;
      }
      const f = F[Math.floor(Math.random() * F.length)];
      paperTxt.textContent = "\u201C" + f.text + "\u201D";
      paperSrc.textContent = "\u2014 " + (f.source || "origem desconhecida");
    };

    cookie.addEventListener("click", () => {
      if (body.classList.contains("is-open")) {
        body.classList.remove("is-open");
        setTimeout(roll, 430); // espera fechar pra re-quebrar com outra fortuna
      } else {
        roll();
        body.classList.add("is-open");
      }
    });

    roll(); // fala de abertura + fortuna pré-sorteada
    makeWin({ title: "Fortune Cookie", icon: "tip", cls: "win-fortune", body, w: 366 });
  };
})();
