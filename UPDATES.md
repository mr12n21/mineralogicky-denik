# Aktualizace aplikace - Mineralogický deník

**Datum:** 30. ledna 2026

## Přehled změn

Byly provedeny následující vylepšení aplikace:

### 1. ✅ Oprava validace emailů (.local domény)

**Problém:** Backend vrací chybu 500 při přihlášení uživatele s emailem končícím na `.local` (např. `admin@mineralogy.local`)

**Řešení:** 
- Upravena validace emailů v `backend/app/schemas.py`
- Nahrazena striktní `EmailStr` za vlastní validátor, který povoluje .local domény
- Validátor stále kontroluje základní formát emailu (@, části před a po @)

**Soubory:**
- `backend/app/schemas.py` - nová `validate_email` metoda v `UserBase` schématu

**Test:**
```bash
# Po restartu aplikace by měl fungovat login s:
admin@mineralogy.local
user@example.local
```

---

### 2. ✅ Vylepšení výběru souřadnic na mapě

**Funkce:**
- Kliknutím na mapu se automaticky nastaví souřadnice nové lokality
- Animovaný marker zobrazuje vybranou pozici
- Snackbar notifikace s aktuálními souřadnicemi
- Tooltip na FAB tlačítku s návodem
- Souřadnice jsou editovatelné v dialogu

**Vylepšení:**
- Přidán vizuální feedback při výběru bodu
- Animace bounce efekt na novém markeru
- Gradient barva pro rozlišení od existujících markerů
- Zobrazení souřadnic v popup okně

**Soubory:**
- `frontend/src/pages/MapPage.tsx` - vylepšený marker, tooltip, snackbar
- `frontend/src/components/LocationFormDialog.tsx` - helper text pro souřadnice

---

### 3. ✅ Responzivní design

Aplikace je nyní plně funkční na mobilních zařízeních, tabletech i desktop PC.

#### Header & Navigation
- Responzivní toolbar (56px na mobilu, 64px na desktop)
- Uživatelské jméno skryto na malých obrazovkách
- Přizpůsobená velikost fontu nadpisu

#### Mapa (MapPage)
- Plná výška minus header
- FAB tlačítko přizpůsobené pozici (8px na mobilu, 16px na desktop)
- Zoomcontrol optimalizován pro dotykové obrazovky

#### Seznam lokalit (LocationsPage)
- Responzivní layout tlačítek a filtrů
- Horizontální scroll tabulky na malých obrazovkách
- Flex layout pro nadpis a tlačítko "Přidat"
- Přizpůsobené padding kontejneru

#### Detail lokality (LocationDetailPage)
- Responzivní padding a spacing
- Grid layout přizpůsobený velikosti obrazovky

#### Dialogy
- Fullscreen dialog na mobilech (< 600px)
- Standardní dialog na větších obrazovkách

#### Export stránka
- Responzivní padding a fonty
- Přizpůsobené formulářové prvky

**Breakpointy:**
- xs: 0-600px (mobil)
- sm: 600-960px (tablet)
- md: 960px+ (desktop)

**Soubory:**
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/LocationFormDialog.tsx`
- `frontend/src/pages/MapPage.tsx`
- `frontend/src/pages/LocationsPage.tsx`
- `frontend/src/pages/LocationDetailPage.tsx`
- `frontend/src/pages/ExportsPage.tsx`

---

### 4. ✅ Oprava Caddy varování

**Problém:** Caddy loguje varování o nadbytečných header_up direktivách

```
{"level":"warn","msg":"Unnecessary header_up X-Forwarded-For: the reverse proxy's default behavior is to pass headers to the upstream"}
{"level":"warn","msg":"Unnecessary header_up X-Forwarded-Proto: the reverse proxy's default behavior is to pass headers to the upstream"}
```

**Řešení:**
- Odstraněny nadbytečné `X-Forwarded-For` a `X-Forwarded-Proto` hlavičky
- Ponechány jen nezbytné hlavičky: `Host` a `X-Real-IP`
- Caddy automaticky přidává forwarding hlavičky

**Soubory:**
- `caddy/Caddyfile` - aktualizované reverse_proxy bloky

---

### 5. ✅ Dokumentace separace databází

Vytvořena kompletní dokumentace pro oddělení hlavní aplikační databáze a Keycloak databáze.

**Obsah dokumentace:**
- 3 varianty konfigurace (oddělené instance, sdílená instance, cloudové řešení)
- Kompletní docker-compose.yml příklady
- Backup strategie
- Migrace z jedné databáze na dvě
- Monitoring a údržba
- Bezpečnostní doporučení
- Řešení problémů

**Výhody separace:**
- Lepší bezpečnost
- Nezávislé škálování
- Oddělené backup strategie
- Snadnější údržba

**Soubory:**
- `DATABASE_SEPARATION.md` - kompletní návod

---

## Jak použít změny

### 1. Restartovat backend
```bash
docker compose down
docker compose up --build -d
```

### 2. Testovat email validaci
```bash
# Login s .local doménou by měl fungovat
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### 3. Otestovat responzivní design
- Otevřít aplikaci v prohlížeči
- Stisknout F12 (DevTools)
- Přepnout do mobilního zobrazení (Ctrl+Shift+M)
- Vyzkoušet všechny stránky

### 4. Otestovat výběr souřadnic
- Přejít na mapu
- Kliknout kamkoliv na mapu
- Měl by se objevit animovaný marker a snackbar s souřadnicemi
- V dialogu by měly být souřadnice předvyplněné

---

## Poznámky pro produkci

### Email validace
Pro produkci zvažte použití služby jako:
- AWS SES
- SendGrid
- Mailgun

### Database separace
Pro produkci doporučujeme:
- Variantu 1 (oddělené PostgreSQL instance)
- Pravidelné automatické backupy
- Monitoring velikosti databází
- Šifrování backup souborů

### Bezpečnost
- Změnit všechna výchozí hesla
- Používat strong passwords (min. 20 znaků)
- Povolit HTTPS (Let's Encrypt)
- Nastavit rate limiting
- Implementovat proper CORS policy

---

## Testování změn

```bash
# 1. Zkontrolovat běžící kontejnery
docker compose ps

# 2. Sledovat logy
docker compose logs -f backend
docker compose logs -f caddy

# 3. Testovat API
curl http://localhost:8000/health
curl http://localhost:8000/docs

# 4. Testovat frontend
open http://localhost:3000
```

---

## Známé problémy a omezení

### 1. Keycloak integrace
Aktuálně je Keycloak služba spuštěna, ale není plně integrována s aplikací. Pro plnou integraci je potřeba:
- Nakonfigurovat Keycloak realm
- Vytvořit klienta pro aplikaci
- Implementovat OAuth2/OIDC flow v backendu
- Aktualizovat frontend pro redirect flow

### 2. Photo upload
Fotky jsou ukládány do lokálního filesystem. Pro produkci zvažte:
- S3 nebo objektové úložiště
- CDN pro rychlejší načítání
- Image optimization (thumbnails, compression)

### 3. Offline podpora
Aplikace vyžaduje internetové připojení. Pro offline režim by bylo potřeba:
- Service Worker
- IndexedDB pro lokální cache
- Sync mechanismus

---

## Další možná vylepšení

1. **Autentizace:**
   - Integrace s Keycloak
   - Social login (Google, GitHub)
   - Two-factor authentication

2. **Mapy:**
   - Offline mapy
   - GPS tracking
   - Route planning
   - Více map providers (OpenTopo, Sentinel)

3. **Fotky:**
   - EXIF data extrakce
   - Automatické geo-tagging
   - Image gallery view
   - Lightbox preview

4. **Export:**
   - PDF reports
   - GPX format
   - Shapefile format
   - Email export

5. **Spolupráce:**
   - Sdílení lokalit mezi uživateli
   - Komentáře
   - Team management
   - Activity feed

6. **Performance:**
   - Redis cache
   - Database indexes
   - Query optimization
   - Frontend lazy loading

---

## Kontakt a podpora

Pro otázky nebo problémy:
- Vytvořte issue v GitHub repository
- Kontaktujte vývojový tým
- Konzultujte dokumentaci v README.md
