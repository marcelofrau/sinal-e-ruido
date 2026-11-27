// Fortune Cookie: o Claudino (mascote animado extraído do app Orca, assets/img/claudino.webp) lê uma fortuna.
// Fortunes: assets/js/fortunes-data.js (fonte: repo Três por Dez, _data/quotes.yml).
// Carregado sob demanda pelo desktop.js (data-open="fortune").
(() => {
  "use strict";
  const { makeWin, restore, BASE } = window.__snr;
  const doc = document;
  const IMG = BASE + "/assets/img/claudino";

  window.snrFortune = () => {
    const old = doc.querySelector(".win-fortune");
    if (old) { restore(old); return old; } // truthy: o openApp não recarrega o script

    const body = doc.createElement("div");
    body.className = "fortune";
    body.innerHTML = `
      <div class="ft-stage">
        <picture class="ft-mascot">
          <source srcset="${IMG}.png" media="(prefers-reduced-motion: reduce)">
          <img src="${IMG}.webp" alt="Claudino, um bonequinho laranja de pixel art com camisa florida" width="320" height="180">
        </picture>
        <figure class="ft-bubble" aria-live="polite">
          <blockquote class="ft-quote"></blockquote>
          <p class="ft-src"></p>
        </figure>
      </div>
      <div class="ft-bar">
        <span class="ft-count"></span>
        <button class="btn" type="button" data-ft="next">Outra fortuna</button>
        <button class="btn" type="button" data-act="close">Fechar</button>
      </div>`;
    const $ = s => body.querySelector(s);
    const bubble = $(".ft-bubble"), quote = $(".ft-quote"), src = $(".ft-src"), count = $(".ft-count");
    let last = -1;

    const roll = () => {
      const F = window.snrFortunesData || [];
      if (!F.length) {
        quote.textContent = "Sem fortunas hoje. Comi todas.";
        src.textContent = count.textContent = "";
        return;
      }
      let i;
      do i = Math.floor(Math.random() * F.length); while (F.length > 1 && i === last);
      last = i;
      quote.textContent = F[i].text;
      src.textContent = "— " + (F[i].source || "origem desconhecida");
      count.textContent = `fortuna nº ${i + 1} de ${F.length}`;
      bubble.classList.remove("is-new");
      void bubble.offsetWidth; // reflow pra animação recomeçar
      bubble.classList.add("is-new");
    };

    $("[data-ft=next]").addEventListener("click", roll);
    roll();
    const win = makeWin({ title: "Fortune Cookie", icon: "claudino", cls: "win-fortune", body, w: 500 });
    $("[data-ft=next]").focus();
    return win;
  };
})();
