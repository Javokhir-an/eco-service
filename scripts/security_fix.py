"""Firebase xavfsizligi: tekshirish, ro'yxatdan o'tishni yopish, Firestore qoidalarini joylash.

GitHub Actions'da ishlaydi (.github/workflows/firebase-security.yml), kalit:
  FIREBASE_SERVICE_ACCOUNT_JSON — xizmat hisobi JSON (repo secret).

MODE muhit o'zgaruvchisi:
  audit  — faqat ko'rsatadi: admin foydalanuvchilar, Auth sozlamalari, joriy qoidalar
  fix    — audit + mijozlar o'zi ro'yxatdan o'tishini o'chiradi, sozlamalardagi test telefonni tuzatadi
  rules  — firestore.rules faylini Firebase'ga joylaydi
"""
import json
import os
import sys

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

MODE = os.environ.get("MODE", "audit")
INFO = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
P = INFO["project_id"]
CREDS = service_account.Credentials.from_service_account_info(
    INFO, scopes=["https://www.googleapis.com/auth/cloud-platform"])
CREDS.refresh(Request())
H = {"Authorization": "Bearer " + CREDS.token, "Content-Type": "application/json"}
IDT = "https://identitytoolkit.googleapis.com"
RULES = "https://firebaserules.googleapis.com/v1/projects/" + P
FS = "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents" % P
failed = False


def call(method, url, **kw):
    global failed
    r = requests.request(method, url, headers=H, timeout=30, **kw)
    print("%-6s %s -> %s" % (method, url.split("googleapis.com")[-1].split("?")[0], r.status_code))
    if r.status_code >= 400:
        failed = True
        print("   ", r.text[:600])
    return r


def audit():
    print("\n== Auth foydalanuvchilari")
    r = call("POST", "%s/v1/projects/%s/accounts:query" % (IDT, P), json={"returnUserInfo": True, "limit": "100"})
    if r.ok:
        users = r.json().get("userInfo", [])
        print("   jami:", len(users))
        for u in users:
            prov = ",".join(p.get("providerId", "") for p in u.get("providerUserInfo", [])) or "anonymous?"
            print("   uid=%s email=%s provider=%s created=%s lastLogin=%s disabled=%s" % (
                u.get("localId"), u.get("email", "-"), prov, u.get("createdAt"), u.get("lastLoginAt"),
                u.get("disabled", False)))

    print("\n== Auth sozlamalari")
    r = call("GET", "%s/admin/v2/projects/%s/config" % (IDT, P))
    if r.ok:
        c = r.json()
        si = c.get("signIn", {})
        print("   email:", si.get("email"), "| anonymous:", si.get("anonymous"))
        print("   client.permissions:", c.get("client", {}).get("permissions"))
        print("   authorizedDomains:", c.get("authorizedDomains"))

    print("\n== Joriy Firestore qoidalari")
    r = call("GET", RULES + "/releases")
    for rel in (r.json().get("releases", []) if r.ok else []):
        print("   ", rel.get("name"), "->", rel.get("rulesetName"), rel.get("updateTime"))
        if rel["name"].endswith("/cloud.firestore"):
            rs = call("GET", "https://firebaserules.googleapis.com/v1/" + rel["rulesetName"])
            if rs.ok:
                src = rs.json()["source"]["files"][0]["content"]
                same = src.strip() == open("firestore.rules", encoding="utf-8").read().strip()
                print("    repo'dagi firestore.rules bilan bir xilmi:", same)


def fix():
    print("\n== Mijozlarning o'zi ro'yxatdan o'tishini o'chirish")
    body = {"client": {"permissions": {"disabledUserSignup": True, "disabledUserDeletion": True}},
            "signIn": {"anonymous": {"enabled": False}}}
    mask = "client.permissions.disabledUserSignup,client.permissions.disabledUserDeletion,signIn.anonymous.enabled"
    r = call("PATCH", "%s/admin/v2/projects/%s/config?updateMask=%s" % (IDT, P, mask), json=body)
    if r.ok:
        print("   endi:", r.json().get("client", {}).get("permissions"), "| anonymous:",
              r.json().get("signIn", {}).get("anonymous"))

    print("\n== settings/contact: test telefonni haqiqiysiga almashtirish")
    r = call("PATCH", FS + "/settings/contact?updateMask.fieldPaths=phone",
             json={"fields": {"phone": {"stringValue": "+998 20 004-88-86"}}})
    if r.ok:
        print("   phone =", r.json()["fields"]["phone"]["stringValue"])


def deploy_rules():
    print("\n== Avvalgi qoidalar (almashtirishdan oldin)")
    r = call("GET", RULES + "/releases/cloud.firestore")
    if r.ok:
        rs = call("GET", "https://firebaserules.googleapis.com/v1/" + r.json()["rulesetName"])
        if rs.ok:
            print(rs.json()["source"]["files"][0]["content"])

    print("\n== firestore.rules ni joylash")
    src = open("firestore.rules", encoding="utf-8").read()
    r = call("POST", RULES + "/rulesets", json={"source": {"files": [{"name": "firestore.rules", "content": src}]}})
    if not r.ok:
        return
    name = r.json()["name"]
    print("   ruleset:", name)
    rel = "projects/%s/releases/cloud.firestore" % P
    r = call("PATCH", "https://firebaserules.googleapis.com/v1/" + rel,
             json={"release": {"name": rel, "rulesetName": name}, "updateMask": "rulesetName"})
    if r.ok:
        print("   release ->", r.json().get("rulesetName"))


if MODE in ("audit", "fix"):
    audit()
if MODE == "fix":
    fix()
if MODE == "rules":
    deploy_rules()
    audit()
sys.exit(1 if failed else 0)
