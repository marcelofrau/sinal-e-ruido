// mIRC 5.x fake: tab offline scriptada #sinal-e-ruido + IRC real via WebSocket.
// Carregado sob demanda pelo desktop.js (data-open="mirc"). Sem backend, sem deps.
(() => {
  "use strict";
  const { makeWin, restore, ICONS } = window.__snr;
  const doc = document;

  let splashed = false;

  // Splash "Sobre o mIRC" só na primeira abertura da sessão; a janela principal abre ao fechá-la.
  window.snrMirc = () => {
    const old = doc.querySelector(".win-mirc, .win-mirc-splash");
    if (old) return restore(old);
    if (splashed) return openMirc();
    splashed = true;
    const body = doc.createElement("div");
    body.className = "dlg mirc-splash";
    body.innerHTML = '<div class="dlg-msg"><img src="' + ICONS + 'mirc.png" width="32" height="32" alt=""><div>' +
      "<b>mIRC v5.91 32bit</b><br>Internet Relay Chat client<br>Copyright © 1995-2001 mIRC Co. Ltd.<br>Khaled Mardam-Bey<br><br>" +
      "Esta é uma cópia não registrada. Você está usando o mIRC há 30 dias.</div></div>" +
      '<div class="dlg-btns"><button class="btn" type="button" data-act="close">Continuar</button></div>';
    const sp = makeWin({ title: "Sobre o mIRC", icon: "mirc", cls: "win-dialog win-mirc-splash", body, w: 360, center: true });
    sp._onclose = openMirc;
    const ok = body.querySelector("button");
    sp.addEventListener("keydown", e => { if (e.key === "Escape") ok.click(); });
    ok.focus();
    return sp;
  };

  function openMirc() {
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
    menubar.innerHTML = "<span><u>F</u>ile</span><span><u>T</u>ools</span><span><u>D</u>CC</span><span><u>C</u>ommands</span><span><u>W</u>indow</span><span><u>H</u>elp</span>";
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

    const win = makeWin({ title: "mIRC", icon: "mirc", cls: "win-mirc", body, w: 560, h: 420 });
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
      if (ch === active) render();
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

    // -- modo offline: conversas scriptadas (só nicks de NICKS; convidados entram/saem à parte) --
    const [SF, VO, ZZ, DP, WG, WK] = NICKS;
    const THREADS = [
      [[VO, "alguém aí lembra do ICQ? meu número era de 6 dígitos"], [WG, "o meu tinha 7, " + VO + ", e o barulhinho de uh-oh me dava infarto"], [VO, "kkkk o uh-oh de mensagem nova no meio da aula de informática"], [DP, "/me ainda tem o ICQ aberto minimizado, só por nostalgia"], [WG, DP + " vc é de outro século"]],
      [[WK, "baixando um mp3 no Kazaa faz 3 horas, tá em 94%"], [ZZ, WK + " aí cai a conexão e volta pra 0%, clássico"], [WK, "não fala isso, a minha mãe tá com a mão no telefone"], [SF, "dica: eMule com crédito baixa mais rápido que Kazaa, mas é fila de banco"], [WK, "/me anota e reza pro modem não cair"]],
      [[DP, "gente, achei uma skin do Winamp de samurai, ficou linda"], [WG, DP + " passa o link! a minha ainda é aquela verde padrão"], [DP, "tá no winamp.com, tem 1,2 MB, vai levar uns 8 minutos"], [VO, "/me já tem 40 skins e usa só a original"], [WG, VO + " traidor"], [DP, "kkkk"]],
      [[ZZ, "alguém empresta um CD-R? o meu queimou de novo no 40%"], [SF, ZZ + " tem que gravar em 4x, 16x só dá coaster"], [ZZ, "mas eu tenho pressa, é a coletânea da formatura"], [VO, "/me coloca o CD-R estragado no relógio de parede"], [ZZ, VO + " rindo de mim e eu aqui com 12 reais perdidos"]],
      [[WK, "Counter-Strike 1.6 hoje na lan house, quem vai?"], [VO, "eu! mas só se for de_dust2 de novo"], [WK, VO + " vc sempre pega AWP e morre no spawn"], [DP, "/me vai de faca e dignidade"], [SF, "a lan house cobra por hora, não esquece o troco"], [VO, "tá bom, hoje eu juro que acerto um"]],
      [[SF, "o provedor discado hoje tá lento ou sou eu?"], [ZZ, "é a hora, " + SF + ". depois da meia-noite a internet fica rápida"], [WK, "pulso em dobro até as 6h, fecha o telefone da vizinha"], [SF, "/me liga o despertador pras 00:01"], [ZZ, "o jeito é esperar a tarifa reduzida"]],
      [[WG, "vcs viram o trailer novo do Matrix? tô sem sono"], [VO, WG + " eu baixei, 14 MB, levou a noite toda"], [DP, "e valeu a pena? o Quicktime travou aqui"], [VO, "o Quicktime sempre trava, é sagrado"], [WG, "/me pede pra um amigo gravar em VHS"]],
      [[DP, "alguém sabe de um emulador de SNES que rode no meu 486?"], [SF, DP + " no 486 só se for Pong"], [ZZ, "tenta o ZSNES, mas com 8 MB de RAM nem sonhe"], [DP, "/me suspira e abre o Paint"], [WK, "pelo menos o Paint abre rápido"]],
      [[VO, "minha placa de vídeo é uma Voodoo2 de 12 MB e eu tenho orgulho disso"], [WK, VO + " o nick denuncia"], [ZZ, "a minha é uma S3 Trio, joga só Paciência"], [VO, "Paciência roda lindo em 3dfx"], [WG, "/me manda um beijo pra Voodoo2"]],
      [[ZZ, "recebi uma corrente de e-mail dizendo que o Bill Gates vai me dar 500 dólares"], [SF, ZZ + " não repassa, já caí 15 vezes nessa"], [WG, "e se for verdade? kkkk"], [WK, "/me repassa pra 20 pessoas só por garantia"], [ZZ, "ok, deleto. e o pop-up de 'você ganhou'?"], [SF, "fecha e finge que não viu"]],
      [[WG, "gente, brb, vou baixar o Napster antes que fechem"], [DP, WG + " já fechou, vai de Audiogalaxy"], [WK, "tem tudo no WinMX também"], [WG, "/me abre os três e reza"], [SF, "tudo no mesmo discado? boa sorte"]],
    ];
    const GUESTS = ["gatinha_13", "Tiozao_PC", "xX_Neo_Xx", "CS_Pro_SP", "lamer_br"], guests = [];
    const HELP = [
      "pra falar com gente de verdade: digita /connect (liga por WebSocket em irc.swiftirc.net:4443)",
      "depois /nick SeuNick, /join #sinal-e-ruido (ou #retro) e pronto. /disconnect pra sair",
      "redes grandes tipo o Libera não aceitam WebSocket de navegador aqui, então não adianta /connect pra elas",
      "pro Libera usa o link \"Libera ↗\" no canto direito de cima: abre o web.libera.chat numa aba nova",
      "e se quiser o negócio de verdade: mIRC original ou HexChat, servidor irc.libera.chat porta 6697 com SSL",
    ];
    const HELLO = ["e aí", "oi", "olá", "salve", "bom dia", "boa noite", "boa tarde"];
    let bag = [], helped = false, helping = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = a => a[Math.floor(Math.random() * a.length)];

    function say(nick, text, meAct) {
      const parts = meAct
        ? [["* " + nick, "#9c009c"], [" " + text, "#000"]]
        : [["<" + nick + ">", nickColor(nick)], [" " + text, "#000"]];
      line("#sinal-e-ruido", parts);
    }

    // toca [[nick, texto]...] com ritmo de digitação; devolve a duração total
    function play(lines) {
      let t = 0;
      for (const [n, x] of lines) {
        const act = x.startsWith("/me ");
        later(() => say(n, act ? x.slice(4) : x, act), t += rnd(2000, 6000));
      }
      return t;
    }

    function thread(delay) {
      later(() => {
        if (!bag.length) bag = THREADS.map((_, i) => i).sort(() => Math.random() - .5);
        thread(play(THREADS[bag.pop()]) + rnd(15000, 40000));
      }, delay);
    }

    function help() {
      helped = helping = true;
      later(() => helping = false, play(HELP.map(x => [SF, x])) + 1000);
    }

    // convidados entram/saem/mudam de nick; a lista fica entre 6 e 9 nicks
    function chanEvent() {
      later(() => {
        const list = chans["#sinal-e-ruido"].nicks, free = GUESTS.filter(g => !guests.includes(g));
        const r = Math.random(), g = guests.length ? pick(guests) : "";
        const mask = n => "* " + n + " (~" + n.toLowerCase() + "@" + (Math.random() * 255 | 0) + "-" + (Math.random() * 255 | 0) + ".dialup.br)";
        if (free.length && guests.length < 3 && (!g || r < .45)) {
          const n = pick(free);
          guests.push(n); list.push(n);
          line("#sinal-e-ruido", [[mask(n) + " entrou em #sinal-e-ruido", "#009300"]]);
        } else if (g && r < .8) {
          guests.splice(guests.indexOf(g), 1);
          list.splice(list.indexOf(g), 1);
          line("#sinal-e-ruido", [[mask(g) + (Math.random() < .5 ? " saiu (Ping timeout)" : " saiu de #sinal-e-ruido"), "#7f7f7f"]]);
        } else if (g) {
          const n = g + "|away";
          guests[guests.indexOf(g)] = n; list[list.indexOf(g)] = n;
          line("#sinal-e-ruido", [["* " + g + " mudou o nick para " + n, "#7f7f7f"]]);
        }
        chanEvent();
      }, rnd(25000, 60000));
    }

    function userLine(text) {
      const m = text.match(/^\/me (.+)/i);
      if (m) say(me, m[1], true);
      else say(me, text);
      if (!helping && (!helped || /ajuda|help|conectar|servidor|real/i.test(text))) return later(help, rnd(2500, 4500));
      // respostas scriptadas
      const low = text.toLowerCase();
      if (HELLO.some(h => low.includes(h))) {
        later(() => say(ZZ, "e aí, " + me + ", senta aí"), rnd(1500, 3500));
      } else if (low.includes("?")) {
        later(() => say(VO, "boa pergunta, deve ter no Cadê?"), rnd(2500, 5500));
      } else if (Math.random() < .4) {
        later(() => say(WG, pick(["kkkk verdade", "concordo", "anotado"])), rnd(3000, 7000));
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
          const [, ch, list = ""] = rest.match(/(\S+)\s*:(.*)/) || [];
          if (ch && chans[ch]) chans[ch].nicks = list.split(" ").filter(Boolean);
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
        const t = (text || "").replace(/\x03\d{0,2}(,\d{1,2})?|[\x02\x0f\x16\x1d\x1f]/g, "");
        const act = t.match(/^\x01ACTION (.*?)\x01?$/);
        line(ch, act ? [["* " + nick, "#9c009c"], [" " + act[1], "#000"]] : [["<" + nick + ">", nickColor(nick)], [" " + t, "#000"]]);
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
        if (cmd === "me") {
          if (active === "Status" || !rest) return;
          if (online) ws.send("PRIVMSG " + active + " :\x01ACTION " + rest + "\x01\r\n");
          return line(active, [["* " + (online ? myNick : me), "#9c009c"], [" " + rest, "#000"]]);
        }
        if (cmd === "clear") { (active === "Status" ? statusBuf : chans[active].buffer).length = 0; return render(); }
        if (cmd === "quit") { try { ws?.close(); } catch {} return; }
        return line("Status", [["* Comando desconhecido: " + cmd, "#ff0000"]]);
      }
      if (active === "Status") return line("Status", [["* Voc\u00ea est\u00e1 no Status. Entre num canal: /join #canal", "#7f7f7f"]]);
      if (online) {
        ws.send("PRIVMSG " + active + " :" + text + "\r\n");
        line(active, [["<" + myNick + ">", nickColor(myNick)], [" " + text, "#000"]]);
      } else userLine(text);
    }

    inp.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    conn.addEventListener("click", () => { online ? ws?.close() : connect(); });

    // -- abertura --
    line("#sinal-e-ruido", [["* Agora falando em #sinal-e-ruido", "#000"]]);
    line("#sinal-e-ruido", [["* Este canal \u00e9 uma simula\u00e7\u00e3o offline do mIRC. Conex\u00e3o real: /connect", "#7f7f7f"]]);
    render();
    inp.focus();
    later(() => {
      line("#sinal-e-ruido", [["* T\u00f3pico de #sinal-e-ruido: sinal e ru\u00eddo \u00b7 papo de quem lembra do modem 56k \u00b7 !help pra ajuda", "#7f7f7f"]]);
      line("#sinal-e-ruido", [["* T\u00f3pico definido por superfoco", "#7f7f7f"]]);
    }, 1200);
    thread(4000);
    chanEvent();
    later(() => !helped && say(SF, "dica: digite !help pra saber como entrar num servidor de verdade"), rnd(60000, 90000));
    return win;
  }
})();
