# 🔐 Environment Variables - Kompletní průvodce

Tento soubor vysvětluje všechny environment variables v `.env` souboru.

═══════════════════════════════════════════════════════════════════════
## 🗄️ DATABASE VARIABLES
═══════════════════════════════════════════════════════════════════════

DB_PASSWORD=VelmeSilneHeslo_2026_DB!
├─ Použití: PostgreSQL databáze
├─ Bezpečnost: ⚠️ KRITICKÉ - MUSÍ BÝT ZMĚNĚNO!
├─ Jak vygenerovat: openssl rand -base64 24
├─ Doporučení: Min 16 znaků, velká+malá písmena, čísla, speciální znaky
└─ Kde se používá:
   • postgres kontejner (POSTGRES_PASSWORD)
   • backend kontejner (DATABASE_URL)
   • keycloak kontejner (KC_DB_PASSWORD)

═══════════════════════════════════════════════════════════════════════
## 🔑 BACKEND SECURITY
═══════════════════════════════════════════════════════════════════════

SECRET_KEY=vase_nahodne_vygenerovane_tajne_heslo_pouzijte_openssl_rand_hex_32
├─ Použití: Podepisování JWT tokenů
├─ Bezpečnost: ⚠️ KRITICKÉ - MUSÍ BÝT ZMĚNĚNO!
├─ Jak vygenerovat: openssl rand -hex 32
├─ Doporučení: Přesně 64 znaků (hex)
├─ Co se stane když změníte: Všichni uživatelé budou odhlášeni
└─ Kde se používá: backend/app/auth.py (JWT signing)

JWT_ALGORITHM=HS256
├─ Použití: Algoritmus pro JWT tokeny
├─ Bezpečnost: ✅ Bezpečné (standardní)
├─ Možnosti: HS256, HS384, HS512, RS256
└─ Doporučení: Neměnit (HS256 je standard)

JWT_EXPIRATION=3600
├─ Použití: Doba platnosti JWT tokenu v sekundách
├─ Výchozí: 3600 sekund = 1 hodina
├─ Doporučení: 3600-7200 (1-2 hodiny)
└─ Co se stane když změníte: Uživatelé budou muset častěji přihlašovat

═══════════════════════════════════════════════════════════════════════
## 🔐 KEYCLOAK (IAM)
═══════════════════════════════════════════════════════════════════════

KEYCLOAK_ADMIN=admin
├─ Použití: Username pro Keycloak admin konzoli
├─ Bezpečnost: ⚠️ Můžete změnit (doporučeno v produkci)
├─ Přístup: http://IP:8080
└─ První přihlášení: Použijte tento username

KEYCLOAK_ADMIN_PASSWORD=VelmeSilneKeycloakAdminHeslo_2026!
├─ Použití: Heslo pro Keycloak admin konzoli
├─ Bezpečnost: ⚠️ KRITICKÉ - MUSÍ BÝT ZMĚNĚNO!
├─ Jak vygenerovat: openssl rand -base64 24
├─ Doporučení: Min 16 znaků, komplexní heslo
└─ Co se stane když zapomenete: Musíte resetnout přes databázi (složité!)

KEYCLOAK_URL=https://vase-domena.cz
├─ Použití: Veřejná URL Keycloak serveru
├─ Formát: https://domena nebo http://IP:8080
├─ Development: http://localhost:8080
├─ Production: https://vase-domena.cz
└─ Kde se používá:
   • Backend pro ověřování tokenů
   • Frontend pro přesměrování na login

KEYCLOAK_HOSTNAME=vase-domena.cz
├─ Použití: Hostname pro Keycloak (routing)
├─ Formát: pouze doména (bez https://)
├─ Development: localhost nebo IP adresa
├─ Production: vase-domena.cz
└─ Důležité: Musí odpovídat KEYCLOAK_URL (bez https://)

KEYCLOAK_REALM=mineralogy
├─ Použití: Název Keycloak realmu
├─ Bezpečnost: ✅ Není citlivé
├─ Výchozí: mineralogy
├─ Co to je: Logická skupina uživatelů a clientů
└─ Důležité: Musíte vytvořit v Keycloak admin konzoli!

KEYCLOAK_CLIENT_ID=mineralogy-app
├─ Použití: ID clienta v Keycloak
├─ Bezpečnost: ✅ Není citlivé (veřejné)
├─ Výchozí: mineralogy-app
└─ Důležité: Musíte vytvořit v Keycloak admin konzoli!

KEYCLOAK_CLIENT_SECRET=vygenerujte_v_keycloak_admin_konzoli
├─ Použití: Secret pro confidential client
├─ Bezpečnost: ⚠️ CITLIVÉ - nesdílet!
├─ Jak získat:
│  1. Přihlásit se do Keycloak admin
│  2. Realm "mineralogy" → Clients → "mineralogy-app"
│  3. Záložka "Credentials" → zkopírovat Secret
├─ Co se stane když změníte: Backend nebude moci ověřovat uživatele
└─ Poznámka: Získáte až po vytvoření clienta v Keycloak

═══════════════════════════════════════════════════════════════════════
## 🌐 FRONTEND
═══════════════════════════════════════════════════════════════════════

REACT_APP_API_URL=https://vase-domena.cz/api
├─ Použití: URL backendu pro frontend API calls
├─ Formát: https://domena/api nebo http://IP/api
├─ Development: http://localhost:8000/api
├─ Production: https://vase-domena.cz/api
├─ Důležité: Musí končit na /api (bez trailing slash)
└─ Co se stane když je špatně: Frontend nebude moci volat API

REACT_APP_MAP_DEFAULT_LAT=49.8
├─ Použití: Výchozí latitude pro mapu (střed)
├─ Formát: Decimal degrees (např. 49.8)
├─ Výchozí: 49.8 (střed ČR)
└─ Použití: Při prvním otevření mapy

REACT_APP_MAP_DEFAULT_LON=15.5
├─ Použití: Výchozí longitude pro mapu (střed)
├─ Formát: Decimal degrees (např. 15.5)
├─ Výchozí: 15.5 (střed ČR)
└─ Použití: Při prvním otevření mapy

REACT_APP_MAP_DEFAULT_ZOOM=7
├─ Použití: Výchozí zoom level mapy
├─ Formát: Číslo 1-20
├─ Výchozí: 7 (zobrazí celou ČR)
└─ Doporučení: 7 pro ČR, 4 pro Evropu, 12 pro město

═══════════════════════════════════════════════════════════════════════
## 💾 BACKUP
═══════════════════════════════════════════════════════════════════════

NAS_PATH=/mnt/nas/backups
├─ Použití: Cesta k NAS storage pro offsite zálohy
├─ Formát: Absolutní cesta (např. /mnt/nas/backups)
├─ Výchozí: /backups (lokální složka)
├─ Setup: Musíte připojit NAS mount point na RPI
└─ Volitelné: Funguje i bez NAS (lokální zálohy)

BACKUP_SCHEDULE=0 2 * * *
├─ Použití: Cron schedule pro automatické zálohy
├─ Formát: Cron syntax (minute hour day month weekday)
├─ Výchozí: 0 2 * * * (každý den ve 2:00)
├─ Příklady:
│  • 0 2 * * *     → Každý den ve 2:00
│  • 0 */6 * * *   → Každých 6 hodin
│  • 0 2 * * 0     → Každou neděli ve 2:00
└─ Doporučení: Mimo provozní hodiny (noční čas)

BACKUP_RETENTION_DAYS=30
├─ Použití: Kolik dní uchovávat staré zálohy
├─ Formát: Číslo (počet dní)
├─ Výchozí: 30 dní
├─ Doporučení: 7-90 dní (podle důležitosti dat a místa na disku)
└─ Co se stane: Starší zálohy budou automaticky smazány

═══════════════════════════════════════════════════════════════════════
## 🔧 PRODUCTION SETTINGS
═══════════════════════════════════════════════════════════════════════

NODE_ENV=production
├─ Použití: Node.js environment
├─ Možnosti: development, production
├─ V produkci: production
└─ Efekt: Optimalizace, minifikace, bez debug logů

ENVIRONMENT=production
├─ Použití: Obecné nastavení prostředí
├─ Možnosti: development, staging, production
├─ V produkci: production
└─ Efekt: Backend chování (logging, error handling)

═══════════════════════════════════════════════════════════════════════
## 🐳 PORTAINER (volitelné)
═══════════════════════════════════════════════════════════════════════

PORTAINER_ADMIN_PASSWORD=
├─ Použití: Bcrypt hash hesla pro Portainer admin
├─ Bezpečnost: ⚠️ Vyžadováno při prvním spuštění
├─ Jak vygenerovat:
│  docker run --rm httpd:2.4-alpine htpasswd -nbB admin "YourPassword" | cut -d ":" -f 2
├─ Alternativa: Nechat prázdné a nastavit při prvním přístupu (GUI)
└─ Uložit do: secrets/portainer_password.txt

═══════════════════════════════════════════════════════════════════════
## ✅ KONTROLNÍ SEZNAM
═══════════════════════════════════════════════════════════════════════

Před nasazením zkontrolujte:

[ ] DB_PASSWORD změněno z výchozí hodnoty
[ ] SECRET_KEY vygenerováno (64 znaků hex)
[ ] KEYCLOAK_ADMIN_PASSWORD změněno z "admin"
[ ] KEYCLOAK_URL nastaveno na vaši doménu nebo IP
[ ] KEYCLOAK_HOSTNAME nastaveno (bez https://)
[ ] REACT_APP_API_URL nastaveno správně
[ ] KEYCLOAK_CLIENT_SECRET získáno z Keycloak (po vytvoření clienta)
[ ] Portainer heslo připraveno (secrets/portainer_password.txt)
[ ] NAS_PATH nakonfigurováno (pokud používáte NAS)
[ ] .env soubor NENÍ v Gitu (zkontrolovat .gitignore)

═══════════════════════════════════════════════════════════════════════
## 🔒 BEZPEČNOSTNÍ DOPORUČENÍ
═══════════════════════════════════════════════════════════════════════

1. NIKDY necommitujte .env do Gitu!
2. Používejte password manager pro uložení hesel
3. Pravidelně rotujte hesla (každé 3 měsíce)
4. Nikdy nesdílejte .env soubor (email, Slack, atd.)
5. Backup .env souboru mimo RPI (šifrovaný!)
6. Pro team: Použijte .env.example jako template
7. V produkci zvažte Docker Secrets nebo Vault

═══════════════════════════════════════════════════════════════════════
## 📝 PŘÍKLAD PRODUKČNÍHO .ENV
═══════════════════════════════════════════════════════════════════════

# Database
DB_PASSWORD=xK7n2mP9qR4sT6vY8wZ1aC3dE5fG7hJ9

# Backend
SECRET_KEY=a1b2c3d4e5f6789012345678901234567890abcdefghijklmnopqrstuvwxyz1234
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=qL9mN7pR5tS3vX1zB0cD2eF4gH6jK8
KEYCLOAK_URL=https://mineralogy.example.com
KEYCLOAK_HOSTNAME=mineralogy.example.com
KEYCLOAK_REALM=mineralogy
KEYCLOAK_CLIENT_ID=mineralogy-app
KEYCLOAK_CLIENT_SECRET=ab12cd34-ef56-gh78-ij90-kl12mn34op56

# Frontend
REACT_APP_API_URL=https://mineralogy.example.com/api
REACT_APP_MAP_DEFAULT_LAT=49.8
REACT_APP_MAP_DEFAULT_LON=15.5
REACT_APP_MAP_DEFAULT_ZOOM=7

# Backup
NAS_PATH=/mnt/nas/mineralogy_backups
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Production
NODE_ENV=production
ENVIRONMENT=production

═══════════════════════════════════════════════════════════════════════
## 🆘 TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════

Problém: Backend se nemůže připojit k databázi
Řešení: Zkontrolujte DB_PASSWORD v .env (musí být stejné všude)

Problém: Frontend nemůže volat API
Řešení: Zkontrolujte REACT_APP_API_URL (musí být přístupné)

Problém: Keycloak odmítá login
Řešení: Zkontrolujte KEYCLOAK_CLIENT_SECRET (musí odpovídat Keycloak)

Problém: SSL chyby
Řešení: Zkontrolujte KEYCLOAK_HOSTNAME a KEYCLOAK_URL

Problém: Portainer nefunguje
Řešení: Zkontrolujte secrets/portainer_password.txt

═══════════════════════════════════════════════════════════════════════

Vytvořeno: 31. ledna 2026
Verze: 1.0.0
Pro více informací: README.production.md, PRODUCTION_SETUP.md
