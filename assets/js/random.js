// Botão "Aleatório": sorteia um post do índice estático /index.json e abre em popup (desktop.js) ou na página.
(function () {
  "use strict";
  var base = document.documentElement.getAttribute("data-baseurl") || "";
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-random]")) return;
    fetch(base + "/index.json")
      .then(function (r) { return r.json(); })
      .then(function (list) {
        if (!list || !list.length) return;
        var url = list[Math.floor(Math.random() * list.length)].url;
        if (window.SR) window.SR.openPost(url); else window.location.href = url;
      })
      .catch(function (err) { console.error("random: falha ao carregar índice", err); });
  });
})();
