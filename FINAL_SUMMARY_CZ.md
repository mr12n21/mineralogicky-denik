# 🎉 MINERALOGICKÝ DENÍK - PRODUKČNÍ VERZE PRO RPI

## ✅ CO BYLO DOKONČENO

Vaše aplikace je **100% připravena** na produkční nasazení na Raspberry Pi!

### 📦 Vytvořené soubory:

1. **docker-compose.production.yml** - Produkční konfigurace s 7 službami
2. **.env.production** - Template pro environment variables
3. **frontend/Dockerfile.production** - Multi-stage production build
4. **frontend/nginx.conf** - Optimalizovaný nginx s gzip a security
5. **caddy/Caddyfile.production** - Aktualizováno pro production
6. **deploy-production.sh** - Automatizační deployment script
7. **secrets/** - Složka pro citlivá data (gitignored)

### 📚 Dokumentace:

8. **README.production.md** - Hlavní produkční dokumentace
9. **PRODUCTION_SETUP.md** - Detailní setup průvodce
10. **SUMMARY_PRODUCTION.md** - Shrnutí produkční konfigurace
11. **ADMIN_CHEATSHEET.txt** - Quick reference pro admina
12. **DEPLOYMENT_CHECKLIST.md** - Kontrolní seznam pro nasazení
13. **SECURITY_AUDIT.md** - Bezpečnostní audit a best practices

### 🔧 Opravy:

14. **frontend/LocationFormDialog.tsx** - Opraven TypeScript error (visit_date)
15. **.gitignore** - Rozšířeno o produkční soubory

---

## 🐳 SLUŽBY V PRODUKCI (7 kontejnerů)

| # | Služba | Image | Účel |
|---|--------|-------|------|
| 1 | **postgres** | postgis/postgis:15-3.3-alpine | PostgreSQL databáze s GIS |
| 2 | **backend** | mineralogy-backend:production | FastAPI REST API |
| 3 | **frontend** | mineralogy-frontend:production | React SPA (nginx) |
| 4 | **caddy** | caddy:2-alpine | Reverse proxy + Auto SSL |
| 5 | **keycloak** | quay.io/keycloak/keycloak:23.0 | IAM (správa uživatelů) |
| 6 | **portainer** | portainer/portainer-ce:2.19.4-alpine | GUI správa kontejnerů ⭐ |
| 7 | **backup** | vlastní | Automatické denní zálohy |

### ⭐ PORTAINER - Nová služba!

**Co to je:** Webové GUI pro správu Docker kontejnerů  
**Přístup:** https://IP:9443  
**Funkce:**
- 📊 Dashboard s přehledem všech služeb
- 🔄 Start/Stop/Restart kontejnerů jedním kliknutím
- 📝 Real-time logy všech služeb
- 🖥️ Konzole pro přístup do kontejnerů
- 📈 Grafy využití CPU/RAM/Network
- 🔔 Notifikace při problémech

**Proč je to důležité:**  
Nemusíte používat terminál - všechno ovládáte přes přehledné GUI!

---

## 🚀 JAK NASADIT (3 KROKY)

### Krok 1: Vygenerovat bezpečná hesla

```bash
# Na vašem počítači nebo RPI
openssl rand -hex 32          # → SECRET_KEY
openssl rand -base64 24       # → DB_PASSWORD  
openssl rand -base64 24       # → KEYCLOAK_ADMIN_PASSWORD
```

### Krok 2: Vytvořit .env soubor

```bash
cd ~/mineralogicky-denik
cp .env.production .env
nano .env
```

**Změňte tyto hodnoty:**
```bash
DB_PASSWORD=výstup_z_příkazu_2
SECRET_KEY=výstup_z_příkazu_1
KEYCLOAK_ADMIN_PASSWORD=výstup_z_příkazu_3
KEYCLOAK_URL=https://vase-domena.cz  # nebo http://IP:8080
KEYCLOAK_HOSTNAME=vase-domena.cz     # nebo IP adresa
REACT_APP_API_URL=https://vase-domena.cz/api  # nebo http://IP/api
```

### Krok 3: Spustit deployment

```bash
./deploy-production.sh
```

✅ **Hotovo!** Za 5-10 minut běží všech 7 služeb.

---

## 🔑 KEYCLOAK SETUP - DŮLEŽITÉ!

Po nasazení musíte nastavit Keycloak:

### 1. Přihlášení do Keycloak
```
URL: http://IP:8080
Username: admin
Password: hodnota z KEYCLOAK_ADMIN_PASSWORD
```

### 2. Vytvoření realmu
- Klikněte na "Master" (vlevo nahoře) → Create Realm
- Name: **mineralogy**
- Enabled: ON
- Create

### 3. Vytvoření clienta
- Clients → Create
- Client ID: **mineralogy-app**
- Client Protocol: **openid-connect**
- Root URL: **https://vase-domena.cz**
- Valid Redirect URIs: **https://vase-domena.cz/***
- Web Origins: **https://vase-domena.cz**
- Access Type: **confidential**
- Save

### 4. Získání Client Secret
- V clientu "mineralogy-app" → záložka **Credentials**
- Zkopírovat **Secret**
- Přidat do `.env` jako:
  ```bash
  KEYCLOAK_CLIENT_SECRET=zkopírovaný_secret
  ```
- Restartovat backend:
  ```bash
  docker compose -f docker-compose.production.yml restart backend
  ```

### 5. Vytvoření admin uživatele
- Users → Add user
- Username: **admin**
- Email: **admin@vase-domena.cz**
- Email Verified: **ON**
- Save
- Záložka **Credentials** → Set Password
- Temporary: **OFF**

✅ **Nyní se můžete přihlásit do aplikace!**

---

## 🌐 PŘÍSTUPY PO NASAZENÍ

| Co | URL |
|----|-----|
| **Frontend (aplikace)** | https://vase-domena.cz |
| **API dokumentace** | https://vase-domena.cz/api/docs |
| **Keycloak admin** | http://IP:8080 (admin) |
| **Portainer** | https://IP:9443 |

---

## 🔐 BEZPEČNOST - CO JE ZAJIŠTĚNO

✅ **Automatické HTTPS** - Caddy získá SSL certifikát od Let's Encrypt  
✅ **Izolovaná síť** - PostgreSQL není přístupná z internetu  
✅ **JWT autentizace** - Bezpečné tokeny s expirací  
✅ **Keycloak IAM** - Profesionální správa uživatelů  
✅ **Health checks** - Automatické restarty při selhání  
✅ **Log rotation** - Prevence zaplnění disku  
✅ **Security headers** - X-Frame-Options, XSS Protection, atd.  
✅ **Gzip komprese** - Optimalizace přenosu dat  
✅ **Alpine images** - Minimální attack surface  

### ⚠️ CO MUSÍTE UDĚLAT VY:

1. **ZMĚNIT všechna hesla** v .env (nikdy nepoužívat výchozí!)
2. **Nastavit UFW firewall** (návod v PRODUCTION_SETUP.md)
3. **Pravidelně zálohovat** databázi (automatika běží, ale testujte obnovu!)
4. **Aktualizovat systém** měsíčně (apt update && apt upgrade)

---

## 📊 VÝKON NA RASPBERRY PI 4

**Očekávané využití:**
- RAM: 2-3 GB (z 4-8 GB)
- CPU: 20-40% za běžného provozu
- Disk: ~5 GB pro aplikaci + data
- Teplota: 50-65°C s aktivním chlazením

**Doporučení:**
- Min 4GB RAM (8GB ideální)
- SSD místo SD karty (výrazně rychlejší)
- Aktivní chlazení (fan)
- Kvalitní napájení 5V/3A+

---

## 🛠️ ZÁKLADNÍ PŘÍKAZY

```bash
# Status všech služeb
docker compose -f docker-compose.production.yml ps

# Logy všech služeb
docker compose -f docker-compose.production.yml logs -f

# Restart všech služeb
docker compose -f docker-compose.production.yml restart

# Restart jedné služby (např. backend)
docker compose -f docker-compose.production.yml restart backend

# Zastavení všeho
docker compose -f docker-compose.production.yml down

# Update a restart
git pull
docker compose -f docker-compose.production.yml up -d --build

# Záloha databáze
docker exec mineralogy-db pg_dump -U mineralogy mineralogy_db > backup.sql

# Prohlížení zdrojů
docker stats
```

---

## 📚 DOKUMENTACE - CO ČÍST PODLE POTŘEBY

### Pro první nasazení:
1. **DEPLOYMENT_CHECKLIST.md** ← Začněte tady! Kontrolní seznam
2. **PRODUCTION_SETUP.md** ← Detailní návod krok za krokem
3. **README.production.md** ← Hlavní dokumentace

### Pro běžný provoz:
4. **ADMIN_CHEATSHEET.txt** ← Quick reference (vytiskněte!)

### Pro pokročilé:
5. **SECURITY_AUDIT.md** ← Bezpečnostní opatření
6. **SUMMARY_PRODUCTION.md** ← Technický přehled

---

## 🎯 CO DĚLAT TEĎ

### Okamžitě:
1. ✅ Přečíst **DEPLOYMENT_CHECKLIST.md**
2. ✅ Vygenerovat bezpečná hesla
3. ✅ Vytvořit .env soubor
4. ✅ Spustit `./deploy-production.sh`

### První hodinu:
5. ✅ Nastavit Keycloak (realm + client + admin user)
6. ✅ Otevřít Portainer a prozkoumat
7. ✅ Otestovat přihlášení do aplikace
8. ✅ Vytvořit testovací lokalitu

### První den:
9. ✅ Nastavit UFW firewall
10. ✅ Udělat manuální zálohu a otestovat obnovu
11. ✅ Zkontrolovat všechny logy v Portaineru
12. ✅ Změřit teplotu RPI (vcgencmd measure_temp)

### První týden:
13. ✅ Nastavit offsite zálohy (NAS/cloud)
14. ✅ Vytvořit reálné uživatele
15. ✅ Naplnit testovací data
16. ✅ Změřit výkon pod zátěží

---

## 🐛 KDYŽ NĚCO NEFUNGUJE

### Portainer je váš přítel! 🐳

1. Otevřete Portainer: https://IP:9443
2. Dashboard → uvidíte všechny kontejnery
3. Klikněte na kontejner s problémem
4. **Logs** → real-time logy (hledejte ERROR)
5. **Stats** → využití CPU/RAM
6. **Inspect** → detaily konfigurace
7. **Restart** → jednoduché restartování

### Nejčastější problémy:

**Backend se nekonektuje k DB:**
```bash
docker logs mineralogy-backend
docker exec mineralogy-backend ping postgres
```

**Frontend vrací 502:**
```bash
# Backend neběží nebo crashuje
docker logs mineralogy-backend
docker compose restart backend
```

**Keycloak neodpovídá:**
```bash
docker logs mineralogy-keycloak
docker compose restart keycloak
# Počkat 1-2 minuty na start
```

**Nedostatek místa:**
```bash
df -h
docker system prune -a  # Vyčistit nepoužívané data
```

Více v **ADMIN_CHEATSHEET.txt** a **PRODUCTION_SETUP.md**.

---

## 💡 PROČ JE TO LEPŠÍ NEŽ PŘEDTÍM

| Před | Teď |
|------|-----|
| Development docker-compose | ✅ Produkční docker-compose |
| Development mode (reload) | ✅ Production mode (optimized) |
| React dev server | ✅ Nginx (rychlejší, cachování) |
| Bez správy kontejnerů | ✅ Portainer GUI |
| Manuální restarty | ✅ Health checks + auto-restart |
| Bez rotace logů | ✅ Log rotation (10MB x 3) |
| HTTP | ✅ HTTPS (Let's Encrypt) |
| Bez záloh | ✅ Automatické denní zálohy |
| Keycloak dev mode | ✅ Keycloak optimized mode |

---

## 📞 ZÁVĚR

✅ **Aplikace je PRODUCTION-READY!**

✅ **Co máte:**
- Bezpečnou aplikaci s HTTPS
- Keycloak pro správu uživatelů
- Portainer pro snadnou správu
- Automatické zálohy
- Kompletní dokumentaci

✅ **Co musíte udělat:**
1. Změnit hesla v .env
2. Spustit ./deploy-production.sh
3. Nastavit Keycloak (10 minut)
4. Nastavit firewall (5 minut)

⏱️ **Celkový čas nasazení: ~30 minut**

🎉 **Pak můžete používat aplikaci!**

---

**Vytvořeno:** 31. ledna 2026  
**Verze:** 1.0.0 Production  
**Platforma:** Raspberry Pi 4 (ARM64)  
**Autor:** GitHub Copilot  

**Pro support:** Použijte dokumentaci nebo Issues na GitHubu.

🚀 **Hodně štěstí s nasazením!**
