// Filtro do arquivo: filtra os <li data-text> conforme o campo de busca.
(function () {
  "use strict";
  var input = document.getElementById("site-search");
  if (!input) return;
  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var items = document.querySelectorAll(".archive-list li[data-text]");
    items.forEach(function (li) {
      var visible = !q || li.getAttribute("data-text").indexOf(q) !== -1;
      li.style.display = visible ? "" : "none";
    });
  });
})();
