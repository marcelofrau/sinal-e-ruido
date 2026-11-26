---
layout: page
title: Favoritos
description: "Compilado de bookmarks: projetos, emulação e o resto da web que vale guardar."
---

<p>Os links que valem guardar, no melhor estilo <em>bookmark.htm</em> de navegador — grupos, sem pasta recolhível, sem cerimônia.</p>

{% for g in site.data.bookmarks %}
<h2>{{ g.group }}</h2>
<ul class="bm-list">
  {% for l in g.links %}
  <li><a href="{{ l.url }}">{{ l.title }}</a>{% if l.desc %}<span class="bm-desc">{{ l.desc }}</span>{% endif %}</li>
  {% endfor %}
</ul>
{% endfor %}
