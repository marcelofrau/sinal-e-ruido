// mIRC 5.x fake: tab offline scriptada #sinal-e-ruido + IRC real via WebSocket.
// Carregado sob demanda pelo desktop.js (data-open="mirc"). Sem backend, sem deps.
(() => {
  "use strict";
  const { makeWin, restore, ICONS } = window.__snr;
  const doc = document;

  window.snrMirc = () => {
    const old = doc.querySelector(".win-mirc");
    if (old) return restore(old);

    // -- estado --
    const NICKS = ["superfoco", "Voodoo2_12mb", "ZazMail_BR", "Doida_Pelo_Retro", "winamp_girl", "56k_Warrior"];
    const me = "visitante";
    let online = false, ws = null, myNick = me;
    const chans = { "#sinal-e-ruido": { nicks: ["@" + NICKS[0], ...NICKS.slice(1)], buffer: [] } };
    const statusBuf = [];
    let active = "#sinal-e-ruido";
    let timers = [];

    // -- markup --
    const body = doc.createElement("div");
    body.className = "mirc";
    const menubar = doc.createElement("div");
    menubar.className = "mirc-menu";
    menubar.innerHTML = "<span><u>F</u>ile</span><span><u>T</u>ools</span><span><u>H</u>elp</span>";
    const libera = doc.createElement("a");
    Object.assign(libera, { href: "https://web.libera.chat/#sinal-e-ruido", target: "_blank", rel: "noopener", title: "O webchat do Libera bloqueia frames: abre numa aba real" });
    libera.textContent = "Libera \u2197";
    menubar.append(libera);
    const main = doc.createElement("div");
    main.className = "mirc-main";
    const buf = doc.createElement("div");
    buf.className = "mirc-buf";
    buf.setAttribute("role", "log");
    const nicks = doc.createElement("ul");
    nicks.className = "mirc-nicks";
    main.append(buf, nicks);
    const sw = doc.createElement("div");
    sw.className = "mirc-sw";
    const tabs = {};
    for (const ch of ["#sinal-e-ruido", "Status"]) {
      const b = doc.createElement("button");
      b.type = "button";
      b.textContent = ch;
      b.addEventListener("click", () => showTab(ch === "Status" ? "Status" : ch));
      tabs[ch] = { btn: b };
      sw.append(b);
    }
    const row = doc.createElement("div");
    row.className = "mirc-input";
    const inp = doc.createElement("input");
    inp.type = "text";
    inp.setAttribute("aria-label", "Mensagem");
    const conn = doc.createElement("button");
    conn.type = "button";
    conn.textContent = "Conectar";
    row.append(inp, conn);
    body.append(menubar, main, sw, row);

    const win = makeWin({ title: "mIRC", icon: "cchat_128-0", cls: "win-mirc", body, w: 560, h: 420 });
    win._onclose = () => { timers.forEach(clearTimeout); timers = []; try { ws?.close(); } catch {} };

    // -- cores mIRC (aproximação da paleta 16) --
    const C = ["#fff", "#000", "#00007f", "#009300", "#ff0000", "#7f0000", "#9c009c", "#fc7f00", "#ff0", "#00fc00", "#009393", "#0ff", "#0000fc", "#ff00ff", "#7f7f7f", "#d2d2d2"];
    const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 7);
    const nickColor = n => C[[2, 3, 4, 5, 6, 7, 10, 12, 13][hash(n) % 9]];

    function stamp() {
      const d = new Date();
      return "[" + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + "]";
    }

    function line(ch, parts) {
      const store = ch === "Status" ? statusBuf : chans[ch]?.buffer || (chans[ch] = { nicks: [], buffer: [] }).buffer;
      store.push({ t: stamp(), parts });
      if (store.length > 300) store.shift();
      if (ch === (ch === "Status" ? "Status" : active)) render();
    }

    function render() {
      const store = active === "Status" ? statusBuf : chans[active].buffer;
      buf.replaceChildren(...store.map(e => {
        const p = doc.createElement("p");
        p.append(Object.assign(doc.createElement("span"), { className: "m14", textContent: e.t + " " }));
        for (const [txt, col] of e.parts) p.append(Object.assign(doc.createElement("span"), { style: "color:" + col, textContent: txt }));
        return p;
      }));
      buf.scrollTop = buf.scrollHeight;
      nicks.replaceChildren(...(active === "Status" ? [] : chans[active].nicks).map(n => {
        const li = doc.createElement("li");
        li.textContent = n;
        li.style.color = nickColor(n.replace(/^[@+]/, ""));
        return li;
      }));
      for (const k in tabs) tabs[k].btn.classList.toggle("is-on", k === active);
    }

    function showTab(ch) { active = ch; render(); inp.focus(); }

    // -- modo offline: conversa scriptada --
    const AMBIENT = [
      ["algu\u00e9m a\u00ed lembra do ICQ? melhor \u00e9poca", 0],
      ["esse blog abre mais r\u00e1pido que meu provedor discado", 0],
      ["/me coloca um CD pra gravar enquanto espera o modem parar de chiando", 0],
      ["algu\u00e9m tem o serial do winzip? t\u00f3 pedindo pra um amigo", 0],
      ["baixando mp3 a 4kb/s, a noite \u00e9 uma crian\u00e7a", 0],
      ["brb, minha m\u00e3e precisa usar o telefone", 0],
      ["quem manja de overclock? meu K6-2 t\u00e1 pedindo", 0],
      ["vi no Emulatronia que saiu emulador novo, vou testar", 0],
      ["7 em 1 do camel\u00f3 \u00e9 golpe, mas o CD-ROM valia", 0],
      ["esse banner de pop-up j\u00e1 me persegue em tr\u00eas sites", 0],
    ];
    const HELLO = ["e a\u00ed", "oi", "ol\u00e1", "salve", "bom dia", "boa noite", "boa tarde"];

    function say(nick, text, meAct) {
      const parts = meAct
        ? [["* " + nick, "#9c009c"], [" " + text, "#000"]]
        : [["<" + nick + ">", nickColor(nick)], [" " + text, "#000"]];
      line("#sinal-e-ruido", parts);
    }

    function offlineTick() {
      const n = NICKS[Math.floor(Math.random() * NICKS.length)];
      const [msg] = AMBIENT[Math.floor(Math.random() * AMBIENT.length)];
      const delay = 18000 + Math.random() * 40000;
      timers.push(setTimeout(() => {
        say(n, msg, msg.startsWith("/me"));
        offlineTick();
      }, delay));
    }

    function userLine(text) {
      const m = text.match(/^\/me (.+)/i);
      if (m) say(me, m[1], true);
      else say(me, text);
      // respostas scriptadas
      const low = text.toLowerCase();
      if (HELLO.some(h => low.includes(h))) {
        timers.push(setTimeout(() => say(NICKS[2], "e a\u00ed, " + me + ", senta a\u00ed"), 1500 + Math.random() * 2000));
      } else if (low.includes("?")) {
        timers.push(setTimeout(() => say(NICKS[1], "boa pergunta, deve ter no Cad\u00ea?"), 2500 + Math.random() * 3000));
      } else if (Math.random() < .4) {
        timers.push(setTimeout(() => say(NICKS[4], ["kkkk verdade", " concordo", " anotado"][Math.floor(Math.random() * 3)].trim()), 3000 + Math.random() * 4000));
      }
    }

    // -- comandos --
    function connect() {
      if (online) return;
      line("Status", [["* Conectando a irc.swiftirc.net (WebSocket)...", "#7f7f7f"]]);
      showTab("Status");
      try { ws = new WebSocket("wss://irc.swiftirc.net:4443"); }
      catch { line("Status", [["* Sem conex\u00e3o. S\u00f3 o modo offline funciona aqui.", "#ff0000"]]); return; }
      conn.textContent = "Desconectar";
      ws.onopen = () => {
        online = true;
        myNick = "snr" + (Math.random() * 1e4 | 0);
        ws.send("NICK " + myNick + "\r\nUSER " + myNick + " 0 * :sinal e ruido\r\n");
      };
      ws.onclose = () => { online = false; conn.textContent = "Conectar"; line("Status", [["* Desconectado.", "#7f7f7f"]]); };
      ws.onmessage = e => String(e.data).split(/\r?\n/).forEach(l => l && ircLine(l));
    }

    function ircLine(l) {
      if (l.startsWith("PING")) { ws.send("PONG" + l.slice(4) + "\r\n"); return; }
      const m = l.match(/:(\S+) (\d+) (\S+) (.*)/);
      if (m) {
        const [, from, num, , rest] = m;
        if (num === "001") line("Status", [["* Conectado como " + myNick + ". Use /join #canal", "#009300"]]);
        else if (num === "353") {
          const ch = (rest.match(/(\S+)\s*:(.*)/) || [])[1];
          if (ch && chans[ch]) chans[ch].nicks = (RegExp.$2 || "").split(" ").filter(Boolean);
          render();
        } else if (num === "433") { myNick += "_"; ws.send("NICK " + myNick + "\r\n"); }
        else if (num !== "002" && num !== "003" && num !== "004" && num !== "005" && num !== "251" && num !== "252" && num !== "253" && num !== "254" && num !== "255" && num !== "265" && num !== "266" && num !== "372" && num !== "375" && num !== "376" && num !== "422")
          line("Status", [["* " + from + " " + rest, "#7f7f7f"]]);
        return;
      }
      const u = l.match(/:(\S+) (\w+) (\S+)(?: :(.*))?/);
      if (!u) return line("Status", [["* " + l, "#7f7f7f"]]);
      const [, from, cmd, target, text] = u;
      const nick = from.split("!")[0];
      if (cmd === "PRIVMSG") {
        const ch = target.startsWith("#") ? target : nick;
        if (!chans[ch]) { chans[ch] = { nicks: [], buffer: [] }; addTab(ch); }
        line(ch, [["<" + nick + ">", nickColor(nick)], [" " + text, "#000"]]);
      } else if (cmd === "JOIN" && !chans[target]) { chans[target] = { nicks: [], buffer: [] }; addTab(target); }
      else if (cmd === "QUIT") line("Status", [["* " + nick + " saiu", "#7f7f7f"]]);
    }

    function addTab(ch) {
      if (tabs[ch]) return;
      const b = doc.createElement("button");
      b.type = "button";
      b.textContent = ch;
      b.addEventListener("click", () => showTab(ch));
      tabs[ch] = { btn: b };
      sw.append(b);
    }

    function send() {
      const text = inp.value.trim();
      inp.value = "";
      if (!text) return;
      if (text.startsWith("/")) {
        const [cmd, ...args] = text.slice(1).split(" ");
        const rest = args.join(" ");
        if (cmd === "connect") return connect();
        if (cmd === "disconnect") { try { ws?.close(); } catch {} return; }
        if (cmd === "nick") { myNick = rest || myNick; return line("Status", [["* Seu nick agora \u00e9 " + myNick, "#7f7f7f"]]); }
        if (cmd === "join" && rest.startsWith("#")) {
          if (!online) return line(active, [["* Sem conex\u00e3o: use /connect primeiro", "#ff0000"]]);
          if (!chans[rest]) { chans[rest] = { nicks: [], buffer: [] }; addTab(rest); }
          ws.send("JOIN " + rest + "\r\n");
          return showTab(rest);
        }
        if (cmd === "me") return active === "Status" ? null : line(active, [["* " + me, "#9c009c"], [" " + rest, "#000"]]);
        if (cmd === "clear") { (active === "Status" ? statusBuf : chans[active].buffer).length = 0; return render(); }
        if (cmd === "quit") { try { ws?.close(); } catch {} return; }
        return line("Status", [["* Comando desconhecido: " + cmd, "#ff0000"]]);
      }
      if (active === "Status") return line("Status", [["* Voc\u00ea est\u00e1 no Status. Entre num canal: /join #canal", "#7f7f7f"]]);
      if (online) ws.send("PRIVMSG " + active + " :" + text + "\r\n");
      else userLine(text);
    }

    inp.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    conn.addEventListener("click", () => { online ? ws?.close() : connect(); });

    // -- abertura --
    line("#sinal-e-ruido", [["* Agora falando em #sinal-e-ruido", "#000"]]);
    line("#sinal-e-ruido", [["* Este canal \u00e9 uma simula\u00e7\u00e3o offline do mIRC. Conex\u00e3o real: /connect", "#7f7f7f"]]);
    render();
    inp.focus();
    offlineTick();
    return win;
  };
})();
