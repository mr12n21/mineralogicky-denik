# 📝 Shrnutí produkční konfigurace

## ✅ Co bylo vytvořeno

### 1. **docker-compose.production.yml**
Produkční Docker Compose s:
- ✅ Portainer (správa kontejnerů) na portech 9000, 9443
- ✅ Health checks pro všechny služby
- ✅ Logování s rotací (max 10MB x 3 soubory)
- ✅ Restart policy: always
- ✅ Optimalizace pro Raspberry Pi (2 workers backend)
- ✅ Automatické zálohy
- ✅ Production build pro frontend (nginx)

### 2. **.env.production**
Template s bezpečnými výchozími hodnotami:
- ⚠️ **MUSÍTE ZMĚNIT všechna hesla před nasazením!**
- DB_PASSWORD
- SECRET_KEY (vygenerovat: `openssl rand -hex 32`)
- KEYCLOAK_ADMIN_PASSWORD
- Portainer heslo

### 3. **frontend/Dockerfile.production**
Multi-stage build:
- Build stage s npm install
- Production stage s nginx
- Gzip komprese
- Security headers
- Health check endpoint

### 4. **frontend/nginx.conf**
Optimalizovaná nginx konfigurace:
- Cache statických souborů (1 rok)
- Gzip komprese
- Security headers (X-Frame-Options, X-Content-Type-Options, atd.)
- React Router support (SPA)

### 5. **deploy-production.sh**
Automatizační skript pro deployment:
- ✅ Kontrola Raspberry Pi
- ✅ Validace Docker/Docker Compose
- ✅ Kontrola .env souboru
- ✅ Validace hesel (nezůstaly výchozí?)
- ✅ Build a spuštění všech služeb
- ✅ Health check po startu
- ✅ Výpis všech access pointů

### 6. **PRODUCTION_SETUP.md**
Kompletní krok-za-krokem průvodce obsahující:
- Instalace Dockeru na RPI
- Bezpečnostní konfigurace (UFW firewall)
- Vygenerování bezpečných hesel
- Keycloak setup (realm, client, admin user)
- Portainer usage
- Troubleshooting
- Maintenance (zálohy, aktualizace)

### 7. **README.production.md**
Hlavní dokumentace pro produkci:
- Quick start guide
- Hardware požadavky
- Všechny služby a porty
- Bezpečnostní best practices
- Monitoring a údržba

### 8. **secrets/.gitkeep**
Složka pro citlivá data (gitignore)

### 9. **.gitignore**
Aktualizováno pro:
- `.env.production`
- `secrets/*`
- `portainer_data/`
- `caddy_data/`, `caddy_config/`
- `postgres_data/`
- `uploads/*`

## 🎯 Služby v produkci

| Služba | Image | Port | Účel |
|--------|-------|------|------|
| **postgres** | postgis/postgis:15-3.3-alpine | 5432 (interní) | PostgreSQL databáze s GIS |
| **backend** | mineralogy-backend:production | 8000 (interní) | FastAPI REST API |
| **frontend** | mineralogy-frontend:production | 80 (interní) | React SPA s nginx |
| **caddy** | caddy:2-alpine | 80, 443 | Reverse proxy + SSL |
| **keycloak** | quay.io/keycloak/keycloak:23.0 | 8080 | Autentizace a IAM |
| **portainer** | portainer/portainer-ce:2.19.4-alpine | 9000, 9443 | Správa kontejnerů |
| **backup** | vlastní | - | Automatické zálohy |

## 🔐 Bezpečnostní features

✅ **Všechny služby**:
- Restart policy: always
- Health checks
- Log rotation (max 30MB per služba)
- Izolovaná síť (mineralogy-network)

✅ **Database**:
- Pouze interní přístup
- Silné heslo (je třeba změnit!)

✅ **Backend**:
- SECRET_KEY pro JWT
- HTTPS only v produkci
- 2 workers (optimalizace pro RPI)

✅ **Frontend**:
- Production build (minifikace, optimalizace)
- Gzip komprese
- Security headers
- Cache statických souborů

✅ **Caddy**:
- Automatické SSL certifikáty (Let's Encrypt)
- HTTP/3 support
- HTTPS redirect

✅ **Keycloak**:
- Separate admin heslo
- Database isolation
- Optimized mode v produkci
- Health & metrics enabled

✅ **Portainer**:
- HTTPS (port 9443)
- Password hash v secrets
- Přístup k Docker socket (read-only možnost)

## 🚀 Jak nasadit na Raspberry Pi

### Rychlý start (3 kroky):

```bash
# 1. Vygenerujte bezpečná hesla
openssl rand -hex 32  # SECRET_KEY
openssl rand -base64 24  # DB_PASSWORD
openssl rand -base64 24  # KEYCLOAK_ADMIN_PASSWORD

# 2. Vyplňte .env soubor
cp .env.production .env
nano .env  # Změňte hesla!

# 3. Spusťte deployment
./deploy-production.sh
```

## 📊 Po nasazení

### Přístupy:
- **Frontend**: `https://vase-domena.cz/`
- **Backend API**: `https://vase-domena.cz/api`
- **API Docs**: `https://vase-domena.cz/api/docs`
- **Keycloak Admin**: `http://ip:8080` (admin/vaše_heslo)
- **Portainer**: `https://ip:9443`

### Keycloak setup (po nasazení):
1. Přihlásit se jako admin
2. Vytvořit realm "mineralogy"
3. Vytvořit client "mineralogy-app" (confidential)
4. Zkopírovat Client Secret do `.env`
5. Restart backend: `docker compose -f docker-compose.production.yml restart backend`
6. Vytvořit admin uživatele v realmu

### Portainer:
- První přihlášení: vytvoříte admin účet
- Connect to local Docker
- Dashboard pro monitoring všech kontejnerů

## ⚠️ DŮLEŽITÉ před spuštěním

1. ✅ **ZMĚŇTE všechna hesla v `.env`** - nikdy nepoužívejte výchozí!
2. ✅ **Nastavte UFW firewall** - ochraňte RPI
3. ✅ **Zkontrolujte doménu** v Caddyfile.production a .env
4. ✅ **Vytvořte secrets/portainer_password.txt**
5. ✅ **Zálohujte databázi** pravidelně

## 🎉 Výhody této konfigurace

✅ **Portainer** - Snadná správa kontejnerů (GUI)  
✅ **Automatické SSL** - Caddy zajistí HTTPS  
✅ **Health checks** - Automatické restarty při selhání  
✅ **Log rotation** - Úspora místa na disku  
✅ **Keycloak** - Profesionální správa uživatelů  
✅ **Automatic backups** - Denní zálohy databáze  
✅ **Optimized for RPI** - 2 workers, alpine images  
✅ **Production ready** - Nginx, gzip, caching  

## 📖 Další dokumentace

- **PRODUCTION_SETUP.md** - Detailní setup průvodce
- **README.production.md** - Hlavní dokumentace
- **KEYCLOAK_SETUP.md** - Keycloak konfigurace

## 🐛 Troubleshooting

```bash
# Kontrola stavu
docker compose -f docker-compose.production.yml ps

# Logy všech služeb
docker compose -f docker-compose.production.yml logs -f

# Logy konkrétní služby
docker logs mineralogy-backend -f

# Restart služby
docker compose -f docker-compose.production.yml restart backend

# Prohlížení využití zdrojů
docker stats
```

## 📞 Support

Veškeré problémy hlaste v issues. Pro urgent problémy použijte Portainer k diagnostice.

---

**🎯 Aplikace je production-ready pro Raspberry Pi!**  
**Stačí změnit hesla, spustit deploy-production.sh a nastavit Keycloak.**
