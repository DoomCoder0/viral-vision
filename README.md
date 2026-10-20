# Viral Vision — FULL-STACK izdanje

**Frontend:** HTML5, CSS3, JavaScript, HTML Canvas (animirane točkice, iscrtavaju se uživo — nije video!).
**Backend:** Node.js ugrađeni HTTP server.
**Baza:** SQLite putem ugrađenog `node:sqlite` modula. Nema `npm install`, nema vanjskih ovisnosti.

## Pokretanje (Windows/Mac/Linux)

1. Instaliraj **Node.js 22.13 ili noviji** s https://nodejs.org/.
2. Raspakiraj cijeli ZIP.
3. U direktoriju projekta otvori Terminal / PowerShell.
4. Pokreni `npm start` ili `node server.mjs`.
5. Otvori **http://localhost:3000** u Chromeu.

**Važno:** Nemoj dvoklikom otvarati `index.html` kao `file://` jer se tada ne pokreće server ni baza. Pokreni `npm start`.

## Što stvarno radi

- Hero animacija: proceduralna mreža valova od tisuća točkica, svaka se crta u `<canvas>` elementu. Teče u stvarnom vremenu, reagira diskretno na pokazivač. Nije isječak videa.
- Navigacija, dropdown, mobilni izbornik, FAQ, fade-in skrolanje, tamna/svijetla tema.
- **Kontaktna forma** → `POST /api/inquiries` → validacija i osnovni anti-spam → **SQLite** baza `data/inquiries.sqlite` → prikaz potvrde i šifre upita.
- `GET /api/health` za provjeru radi li server.
- Zaštićen pregled poruka na `/admin` + `GET /api/inquiries`, **samo kada je zadana `ADMIN_PASSWORD`**.
- `npm run inquiries` ispisuje zaprimljene poruke iz baze u terminalu.

## Admin pristup (opcionalno)

**PowerShell:**
```powershell
$env:ADMIN_USER="admin"
$env:ADMIN_PASSWORD="odaberi-dugu-jaku-lozinku"
npm start
```

**Windows CMD:**
```bat
set ADMIN_USER=admin
set ADMIN_PASSWORD=odaberi-dugu-jaku-lozinku
npm start
```

**macOS/Linux:**
```bash
ADMIN_USER=admin ADMIN_PASSWORD='odaberi-dugu-jaku-lozinku' npm start
```

U pregledniku otvori `http://localhost:3000/admin` i upiši svoj username/password.

## Testiranje

`npm test` — testira REST API i spremanje u SQLite.

## Prije stvarne objave

- Zamijeni demo tekstove, pravne podatke i kontaktne informacije provjerenim podacima tvrtke.
- Postavi `ADMIN_PASSWORD` kao sigurnu tajnu na hostingu; koristi HTTPS.
- Treba ti hosting na kojem **SQLite datoteka trajno ostaje spremljena** (persistent storage / volume). Serverless bez trajnog diska, npr. obični Vercel Functions, **neće pouzdano čuvati upite**. Za Vercel bi trebala vanjska baza.
- Ova verzija **sprema** upite u bazu, ali **ne šalje email obavijesti**; moguće ih je dodati preko e-mail API-ja.
- Originalna stranica služi kao vizualna inspiracija. Logotip i tekst su Viral Vision, bez preuzimanja izvornog koda.
