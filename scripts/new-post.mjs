#!/usr/bin/env node
// Cria um post novo com frontmatter preenchido e data atual.
// Uso:
//   node scripts/new-post.mjs <secao> ["titulo do post"]
// Seções: abas-abertas, entre-margens, o-que-fica, fora-de-escopo, linha-de-comando, fragmentos, ruido-branco
// Em "fragmentos" e "ruido-branco" o título é opcional (slug automático).
import { writeFile } from "node:fs/promises";
import path from "node:path";

const SECTIONS = [
  "abas-abertas",
  "entre-margens",
  "o-que-fica",
  "fora-de-escopo",
  "linha-de-comando",
  "fragmentos",
  "ruido-branco",
];

// Título opcional apenas nestas seções; o slug automático usa o prefixo.
const AUTO_SLUG = {
  fragmentos: "fragmento",
  "ruido-branco": "ruido",
};

const [section, ...titleWords] = process.argv.slice(2);

if (!SECTIONS.includes(section)) {
  console.error(`Seção inválida: ${section || "(vazia)"}\nUse uma de: ${SECTIONS.join(", ")}`);
  process.exit(1);
}

const title = titleWords.join(" ").trim();

function pad(n) {
  return String(n).padStart(2, "0");
}

function localOffset(d) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

const now = new Date();
const dateStr =
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const timeStr =
  `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${localOffset(now)}`;

const slug = title
  ? slugify(title)
  : `${AUTO_SLUG[section]}-${pad(now.getDate())}${pad(now.getMonth() + 1)}-${pad(now.getHours())}${pad(now.getMinutes())}`;

const file = path.join("_posts", `${dateStr}-${slug}.md`);

const fm = [
  "---",
  ...(title ? [`title: "${title.replace(/"/g, '\\"')}"`] : []),
  `date: ${dateStr} ${timeStr}`,
  `categories: [${section}]`,
  "tags: []",
  ...(AUTO_SLUG[section] ? [] : ['description: ""']),
  "---",
  "",
  "",
].join("\n");

await writeFile(file, fm, { flag: "wx" });
console.log(`Criado: ${file}`);
