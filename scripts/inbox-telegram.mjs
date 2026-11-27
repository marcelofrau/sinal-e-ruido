#!/usr/bin/env node
// Sincroniza mensagens recebidas pelo bot do Telegram para inbox/*.md.
// Uso: setx TELEGRAM_BOT_TOKEN "..." (uma vez) e depois `node scripts/inbox-telegram.mjs`.
// Uma mensagem = um item: texto vira .md; foto é baixada ao lado. Vídeo/áudio/sticker
// viram item só com aviso (ver no chat do bot). Chat com bot não é e2e: nada sensível.
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN (bot criado no @BotFather: setx TELEGRAM_BOT_TOKEN "o-token").');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;
const INBOX = "inbox";
const STATE_FILE = path.join(INBOX, ".state.json");
const pad = (n) => String(n).padStart(2, "0");

let offset = 0;
try {
  offset = JSON.parse(await readFile(STATE_FILE, "utf8")).offset || 0;
} catch {}

const res = await fetch(`${API}/getUpdates?timeout=0&offset=${offset}`);
if (!res.ok) {
  console.error(`Telegram respondeu ${res.status} — token certo? (409 = outro processo já está lendo)`);
  process.exit(1);
}
const updates = (await res.json()).result || [];
if (updates.length === 0) {
  console.log("Nada novo na inbox.");
  process.exit(0);
}

await mkdir(INBOX, { recursive: true });

async function baixaFoto(foto, base) {
  const gp = await (await fetch(`${API}/getFile?file_id=${foto.file_id}`)).json();
  if (!gp.ok) return null;
  const r = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${gp.result.file_path}`);
  if (!r.ok) return null;
  const nome = `${base}.jpg`;
  await writeFile(nome, Buffer.from(await r.arrayBuffer()));
  return nome;
}

let n = 0;
for (const u of updates) {
  const m = u.message || u.edited_message;
  if (!m) continue; // my_chat_member e afins
  const texto = m.text || m.caption || "";
  const foto = m.photo ? m.photo[m.photo.length - 1] : null;
  if (!texto && !foto && !m.video && !m.voice && !m.sticker) continue;
  try {
    const d = new Date(m.date * 1000);
    const base = path.join(
      INBOX,
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${u.update_id}`
    );
    const extras = [];
    if (foto) extras.push(`foto: ${(await baixaFoto(foto, base)) || "(download falhou — ver no chat do bot)"}`);
    else if (m.video) extras.push("midia: video — ver no chat do bot");
    else if (m.voice) extras.push("midia: audio — ver no chat do bot");
    else if (m.sticker) extras.push("midia: sticker — ver no chat do bot");

    const hora = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const corpo = [
      `# Telegram — ${hora}`,
      "",
      texto || "(mensagem sem texto)",
      "",
      "---",
      `update_id: ${u.update_id}`,
      ...extras,
    ].join("\n");
    await writeFile(`${base}.md`, corpo + "\n");
    n++;
  } catch (e) {
    // offset avança mesmo se o item falhou; o chat do bot continua sendo o registro.
    console.error(`update ${u.update_id} falhou: ${e.message} — ver no chat do bot.`);
  }
  offset = Math.max(offset, u.update_id + 1);
}

await writeFile(STATE_FILE, JSON.stringify({ offset }));
console.log(`${n} item(ns) novos em ${INBOX}/.`);
