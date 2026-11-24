// Botão "Aleatório": sorteia um post do índice estático /index.json.
(function () {
  "use strict";
  var btn = document.getElementById("btn-random");
  if (!btn) return;
  var base = document.documentElement.getAttribute("data-baseurl") || "";
  btn.addEventListener("click", function () {
    fetch(base + "/index.json")
      .then(function (r) { return r.json(); })
      .then(function (list) {
        if (list && list.length) {
          window.location.href = list[Math.floor(Math.random() * list.length)].url;
        }
      })
      .catch(function (err) { console.error("random: falha ao carregar índice", err); });
  });
})();
