# Mineralogický deník

Webová aplikace pro správu mineralogických lokalit s podporou GPS souřadnic, fotografií, blogových záznamů a exportu dat.

## 🚀 Quick Start

### Pro vývoj:
```bash
docker compose up --build
```

### Pro produkci (Raspberry Pi):
```bash
./deploy-production.sh
```

**📖 Kompletní dokumentace:** [FINAL_SUMMARY_CZ.md](FINAL_SUMMARY_CZ.md)

---

## 📋 Přehled funkcí

- 🗺️ **Interaktivní mapa** - Leaflet.js s OpenStreetMap, výchozí zoom na Českou republiku
- 📍 **Správa lokalit** - Přidávání, editace a mazání lokalit s GPS souřadnicemi
- 📸 **Fotografie** - Nahrávání fotografií s automatickou miniaturizací
- 📝 **Mini-blog** - Poznámky a záznamy k jednotlivým lokalitám
- 🔍 **Filtrování** - Podle stavu (navštíveno/plánováno/archivováno), data, klíčových slov
- 📊 **Export dat** - GeoJSON, KML, CSV, ZIP archiv fotografií
- 🎨 **Tagy** - Flexibilní systém štítků pro kategorizaci lokalit
- 🔐 **Keycloak IAM** - Enterprise autentizace a správa uživatelů
- 🐳 **Portainer** - GUI pro správu Docker kontejnerů
- 💾 **Automatické zálohy** - Denní zálohy databáze a souborů
- 🔒 **HTTPS** - Automatické SSL certifikáty (Let's Encrypt)

## 🏗️ Technologie

### Backend
- **FastAPI** - Moderní Python web framework
- **PostgreSQL + PostGIS** - Databáze s podporou geospatiálních dat
- **SQLAlchemy + GeoAlchemy2** - ORM s geospatiálními rozšířeními
- **Pillow** - Zpracování obrázků
- **JWT** - Autentizace

### Frontend
- **React 18** - Moderní UI framework
- **TypeScript** - Typová bezpečnost
- **Material-UI** - Komponenty designu
- **Leaflet.js** - Interaktivní mapy
- **React Router** - Navigace
- **Axios** - HTTP klient

### Infrastruktura
- **Docker & Docker Compose** - Kontejnerizace
- **Caddy** - Reverse proxy s automatickým HTTPS
- **Keycloak** - Enterprise IAM
- **Portainer** - Container management GUI
- **Nginx** - Production web server (frontend)
- **Automatické zálohy** - Denní zálohy na NAS

---

## 📚 Dokumentace

### 🎯 Začněte zde:
- **[FINAL_SUMMARY_CZ.md](FINAL_SUMMARY_CZ.md)** ⭐ - Kompletní přehled a průvodce
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Kontrolní seznam před nasazením

### 📖 Produkční nasazení:
- **[README.production.md](README.production.md)** - Hlavní produkční dokumentace
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Detailní setup krok za krokem
- **[ADMIN_CHEATSHEET.txt](ADMIN_CHEATSHEET.txt)** - Quick reference příkazy

### 🔧 Konfigurace:
- **[ENV_VARIABLES_GUIDE.md](ENV_VARIABLES_GUIDE.md)** - Vysvětlení všech ENV proměnných
- **[ARCHITECTURE.txt](ARCHITECTURE.txt)** - Architektura systému (diagram)
- **[KEYCLOAK_SETUP.md](KEYCLOAK_SETUP.md)** - Nastavení Keycloak

### 🔒 Bezpečnost:
- **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** - Bezpečnostní audit a best practices

### 📝 Historie změn:
- **[SUMMARY_PRODUCTION.md](SUMMARY_PRODUCTION.md)** - Shrnutí produkční verze
- **[CHANGES.md](CHANGES.md)** - Historie změn
- **[UPDATES.md](UPDATES.md)** - Poslední aktualizace

---

## 🖥️ Služby a přístupy

### Development (docker-compose.yml):
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
- Keycloak: http://localhost:8080

### Production (docker-compose.production.yml):
- Frontend: https://vase-domena.cz
- Backend API: https://vase-domena.cz/api
- API Docs: https://vase-domena.cz/api/docs
- Keycloak: http://IP:8080
- Portainer: https://IP:9443

---

## 🛠️ Vývoj

### Požadavky

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 16GB+ volného místa

### Instalace

```bash
# 1. Přejděte do složky projektu
cd mineralogicky-denik

# 2. Konfigurace prostředí
cp .env.example .env
nano .env  # Upravte hesla a nastavení

# 3. Spuštění aplikace (Caddy vytvoří SSL automaticky!)
docker-compose up -d

# 4. Sledování logů
docker-compose logs -f
```

### První přístup

1. Otevřete prohlížeč: `https://localhost` nebo `https://IP-vaseho-serveru`
2. Přijměte self-signed certifikát
3. Zaregistrujte se nebo použijte výchozí účet:
   - **Username:** admin
   - **Password:** admin123 (⚠️ změňte po prvním přihlášení!)

## Struktura projektu

```
mineralogicky-denik/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpointy
│   │   ├── models.py       # Database modely
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # Autentizace
│   │   └── main.py         # Hlavní aplikace
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/           # API klient
│   │   ├── components/    # React komponenty
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Stránky aplikace
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── database/              # Database inicializace
│   └── init.sql
├── caddy/                 # Caddy konfigurace
│   ├── Caddyfile
│   └── Caddyfile.production
├── backup/                # Backup skripty
│   ├── backup.sh
│   └── Dockerfile
├── docker-compose.yml     # Docker orchestrace
├── .env.example           # Příklad konfigurace
├── DEPLOYMENT.md          # Detailní návod nasazení
└── README.md             # Tento soubor
```

## Použití

### Přidání lokality

1. Klikněte na mapu nebo použijte tlačítko "Přidat lokalitu"
2. Vyplňte název a souřadnice
3. Vyberte stav (navštíveno/plánováno/archivováno)
4. Volitelně přidejte popis a datum návštěvy

### Nahrání fotografií

1. Otevřete detail lokality
2. Klikněte "Nahrát foto"
3. Vyberte obrázek (max 5MB, JPG/PNG)
4. Fotografie se automaticky zmenší a vytvoří miniatura

### Export dat

1. Přejděte na stránku "Export"
2. Vyberte formát (GeoJSON/KML/CSV/ZIP)
3. Volitelně filtrujte podle stavu nebo data
4. Stáhněte soubor

## API Dokumentace

Po spuštění aplikace je dostupná automatická dokumentace:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Konfigurace

### Environmentální proměnné

Upravte soubor `.env`:

```bash
# Databáze
DB_PASSWORD=silne-heslo

# Backend
SECRET_KEY=generovany-tajny-klic
JWT_EXPIRATION=3600

# Keycloak (volitelné)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=mineralogy

# Zálohy
NAS_PATH=/mnt/nas/backups
```

### Lokální DNS

Přidejte do `/etc/hosts`:

```
192.168.1.XXX   mineralogy.local
```

## Údržba

### Zálohy

Automatické zálohy běží každý den ve 2:00. Manuální spuštění:

```bash
docker-compose exec backup /usr/local/bin/backup.sh
```

### Aktualizace

```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

### Logy

```bash
# Všechny služby
docker-compose logs -f

# Konkrétní služba
docker-compose logs -f backend
```

## Detailní dokumentace

Pro kompletní návod nasazení na Raspberry Pi včetně VPN konfigurace viz [DEPLOYMENT.md](DEPLOYMENT.md).

## Výkon na Raspberry Pi

Aplikace je optimalizovaná pro Raspberry Pi 4:

- Alpine Linux base images (menší velikost)
- Lazy loading komponent
- Optimalizace obrázků
- Clustering markers na mapě
- Async operace na backendu

## Bezpečnost

- **Automatické HTTPS** - Caddy získává Let's Encrypt certifikáty automaticky
- **JWT autentizace** - Bezpečné API
- **Hashování hesel** - bcrypt
- **Validace vstupů** - Pydantic schemas
- **Security headers** - XSS, CSP, HSTS
- **Automatické zálohy** - Denní zálohy na NAS
 aplikace pro kemenarske cucaky pro ukladadni lokalit :)
