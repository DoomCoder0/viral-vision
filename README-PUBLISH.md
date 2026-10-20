# Viral Vision — objava na internetu

## Sadržaj projekta

- `public/index.html` — hrvatski (HR), početna verzija.
- `public/en.html` — English (EN).
- `public/de.html` — Deutsch (DE).
- `public/styles.css`, `script.js`, `particles.js` — stilovi, interaktivnost i generirana animacija točkica.
- `public/assets/viral-vision-mark.png` — novi originalni logotip Viral Vision.
- `server.mjs` — Node.js API; SQLite lokalna baza za kontaktne upite.
- `render.yaml` — konfiguracija za Render, uključujući disk za trajnu pohranu.

## Lokalni pregled

Instaliraj Node.js 22.13 ili noviji, otvori terminal u ovoj mapi i pokreni:

```shell
npm start
```

Otvori `http://localhost:3000`. Jezični izbornik HR/EN/DE nalazi se gore desno.

## Objavljivanje (Render)

1. Poveži svoj Render račun s ChatGPT-om ili u Renderu poveži GitHub repozitorij s ovim projektom.
2. Na Renderu izradi web servis iz projekta/Blueprinta `render.yaml`.
3. **PAŽNJA: konfiguracija koristi `starter` servis i trajni disk, koji mogu biti naplatni.** Provjeri aktualnu cijenu i odobri troškove prije objave.
4. Postavi snažnu tajnu `ADMIN_PASSWORD` u Render Environment postavkama (nikada u repozitorij).
5. Potvrdi URL nakon uspješne objave i provjeri obrasce te bazu.
6. Prije javnog prikupljanja upita unesi točne poslovne/kontaktne podatke i prilagodi obavijest o privatnosti važećim pravilima.

SQLite baza se po zadanim postavkama sprema u `data/`; za Render se koristi trajni disk `/var/data`. Bez trajne pohrane poslani bi se upiti mogli izgubiti pri restartu.

Stranica **nije objavljena samo zato što postoji ovaj ZIP**. Potreban je povezan hosting račun i stvarna objava.
