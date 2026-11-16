"""itexnika.uz ni GitHub Pages'ga chiqarish.

Saytning ochiq fayllari (firebase.json'dagi "ignore" ro'yxatidan tashqari, git kuzatadigan
fayllar) alohida ochiq repo — github.com/Javokhir-an/itexnika — ga nusxalanadi va push qilinadi.
Ichki fayllar (scripts/, *.md, firestore.rules, .github/ ...) u yerga tushmaydi.

Ishlatish:  python scripts/deploy_pages.py ["commit xabari"]
"""
import fnmatch
import json
import os
import shutil
import subprocess
import sys

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(os.path.dirname(SRC), "itexnika-pages")
REMOTE = "https://github.com/Javokhir-an/itexnika.git"
DOMAIN = "itexnika.uz"
KEEP = {".git", "CNAME", ".nojekyll"}


def git(*args, cwd):
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True).stdout


def ignored(path, patterns):
    for pat in patterns:
        if fnmatch.fnmatch(path, pat) or fnmatch.fnmatch("/" + path, pat):
            return True
        if pat.endswith("/**") and path.startswith(pat[:-3].lstrip("*/") + "/"):
            return True
    return any(part.startswith(".") for part in path.split("/"))


def main():
    patterns = json.load(open(os.path.join(SRC, "firebase.json"), encoding="utf-8"))["hosting"]["ignore"]
    files = [f for f in git("ls-files", cwd=SRC).splitlines() if not ignored(f, patterns)]

    if not os.path.isdir(os.path.join(DST, ".git")):
        os.makedirs(DST, exist_ok=True)
        git("init", "-b", "main", cwd=DST)
        git("remote", "add", "origin", REMOTE, cwd=DST)

    # eski fayllarni tozalash
    for root, dirs, names in os.walk(DST, topdown=True):
        dirs[:] = [d for d in dirs if d != ".git"]
        for n in names:
            rel = os.path.relpath(os.path.join(root, n), DST).replace(os.sep, "/")
            if rel not in KEEP and rel not in files:
                os.remove(os.path.join(root, n))
    for f in files:
        os.makedirs(os.path.dirname(os.path.join(DST, f)) or DST, exist_ok=True)
        shutil.copy2(os.path.join(SRC, f), os.path.join(DST, f))
    with open(os.path.join(DST, "CNAME"), "w", encoding="ascii", newline="\n") as fh:
        fh.write(DOMAIN + "\n")
    open(os.path.join(DST, ".nojekyll"), "w").close()

    git("add", "-A", cwd=DST)
    if not git("status", "--porcelain", cwd=DST).strip():
        print("o'zgarish yo'q")
        return
    src_head = git("rev-parse", "--short", "HEAD", cwd=SRC).strip()
    msg = sys.argv[1] if len(sys.argv) > 1 else "deploy: eco-service@" + src_head
    git("commit", "-q", "-m", msg, cwd=DST)
    git("push", "-q", "-u", "origin", "main", cwd=DST)
    print("chiqarildi:", len(files), "fayl,", msg)


if __name__ == "__main__":
    main()
