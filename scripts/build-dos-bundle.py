# Monta assets/dos/shareware.jsdos (bundle js-dos v8) a partir dos zips shareware ja instalados.
# Uso: python -I scripts/build-dos-bundle.py <pasta-com-os-zips> assets/dos/shareware.jsdos
# Fontes e licencas: assets/dos/FONTES.md
import sys, zipfile, os
src, out = sys.argv[1], sys.argv[2]
GAMES = [  # (zip, pasta em C:\, launcher, comando dentro da pasta, linha do menu)
    ("DOSBOX_DOOM.ZIP",    "DOOM",    "DOOM",    "DOOM.EXE",        "DOOM     - Doom (id Software, 1993)"),
    ("DOSBOX_DUKE3D.ZIP",  "DUKE3D",  "DUKE",    "DUKE3D.EXE",      "DUKE     - Duke Nukem 3D (3D Realms, 1996)"),
    ("DOSBOX_DESCENT.ZIP", "DESCENT", "DESCENT", "call DESCENT.BAT", "DESCENT  - Descent (Parallax, 1994)"),
    ("jill1.zip",          "JILL",    "JILL",    "JILL.EXE",        "JILL     - Jill of the Jungle (Epic, 1992)"),
]
def dos(text):  # CRLF + ASCII
    return "\r\n".join(text.strip("\n").split("\n")).encode("ascii") + b"\r\n"
CONF = """[sdl]
autolock=false
[dosbox]
machine=svga_s3
memsize=32
[cpu]
core=auto
cputype=auto
cycles=max
[mixer]
rate=44100
[sblaster]
sbtype=sb16
[autoexec]
@echo off
mount c .
c:
cls
call MENU.BAT
"""
LEIAME = """SINAL E RUIDO 98 - C:\\LEIAME.TXT

Este PC roda DOSBox dentro do navegador (js-dos).
Os jogos aqui sao as versoes shareware originais,
distribuidas livremente pelos autores na epoca.

Digite o nome do jogo e tecle ENTER.
Para sair de um jogo: ESC ou F10 (depende do jogo).
Para fechar o PC: feche a janela.

Desde o tempo em que nao existiam abas...
"""
bar = "echo " + "=" * 54   # sem | < > : viram redirecionamento no DOS
menu = ["@echo off", "cls", bar, "echo   SINAL E RUIDO 98 - C:\\", bar]
menu += ["echo   " + line for *_, line in GAMES]
menu += ["echo.", "echo   TYPE LEIAME.TXT - sobre este PC", "echo   MENU     - mostra este menu de novo", bar, "echo."]
assert not any(c in "".join(menu) for c in "|<>"), "caractere de redirecionamento no menu"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    z.writestr(".jsdos/dosbox.conf", CONF.replace("\n", "\r\n"))
    z.writestr("LEIAME.TXT", dos(LEIAME))
    z.writestr("MENU.BAT", dos("\n".join(menu)))
    for zipname, folder, launcher, cmd, _ in GAMES:
        z.writestr(launcher + ".BAT", dos(f"@echo off\ncd \\{folder}\n{cmd}\ncd \\\ncall \\MENU.BAT"))
        with zipfile.ZipFile(os.path.join(src, zipname)) as g:
            for i in g.infolist():
                if i.is_dir(): continue
                z.writestr(folder + "/" + i.filename.upper(), g.read(i))
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    names = z.namelist()
    for need in ["DOOM/DOOM1.WAD", "DUKE3D/DUKE3D.GRP", "DESCENT/DESCENT.HOG", "JILL/JILL.EXE", ".jsdos/dosbox.conf"]:
        assert need in names, need
print(f"ok: {len(names)} arquivos, {os.path.getsize(out)/1e6:.1f} MB -> {out}")
print(z.read("MENU.BAT").decode() if False else "")


