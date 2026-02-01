# 🗺️ Mineralogický deník - Produkční setup pro Raspberry Pi

Kompletní aplikace pro správu mineralogických lokalit s geolokací, fotkami a bezpečnou správou uživatelů přes Keycloak.

## 📋 Obsah

- [Požadavky](#požadavky)
- [Rychlý start](#rychlý-start)
- [Bezpečnostní konfigurace](#bezpečnostní-konfigurace)
- [Služby a porty](#služby-a-porty)
- [Keycloak setup](#keycloak-setup)
- [Portainer](#portainer)
- [Údržba](#údržba)

## 🔧 Požadavky

### Hardware
- **Raspberry Pi 4** (doporučeno 4GB+ RAM)
- **MicroSD karta** 64GB+ (nebo SSD přes USB 3.0)
- **Aktivní chlazení** (doporučeno)
- **Stabilní napájení** 5V/3A+

### Software
- Raspberry Pi OS (64-bit)
- Docker + Docker Compose
- Git

## 🚀 Rychlý start

### 1. Příprava Raspberry Pi

```bash
# Aktualizace systému
sudo apt update && sudo apt upgrade -y

# Instalace Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Instalace Docker Compose
sudo apt install docker-compose-plugin -y

# Ověření instalace
docker --version
docker compose version
```

### 2. Klonování projektu

```bash
cd ~
git clone <your-repo-url> mineralogicky-denik
cd mineralogicky-denik
```

### 3. Vygenerování bezpečných hesel

```bash
# 1. SECRET_KEY pro backend (64 znaků)
echo "SECRET_KEY=$(openssl rand -hex 32)"

# 2. Heslo databáze
echo "DB_PASSWORD=$(openssl rand -base64 24)"

# 3. Keycloak admin heslo
echo "KEYCLOAK_ADMIN_PASSWORD=$(openssl rand -base64 24)"

# 4. Portainer heslo hash
docker run --rm httpd:2.4-alpine htpasswd -nbB admin "YourStrongPassword" | cut -d ":" -f 2
```

### 4. Konfigurace .env souboru

```bash
# Zkopírujte template
cp .env.production .env

# Upravte hodnoty (nahraďte výchozí hesla!)
nano .env
```

**Kritické hodnoty ke změně v `.env`:**

```bash
# Database - POUŽIJTE výstup z příkazu 2
DB_PASSWORD=your_generated_password_here

# Backend - POUŽIJTE výstup z příkazu 1
SECRET_KEY=your_generated_secret_key_here

# Keycloak - POUŽIJTE výstup z příkazu 3
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=your_generated_keycloak_password_here
KEYCLOAK_URL=https://vase-domena.cz  # nebo http://IP_ADRESA:8080 pro vývoj
KEYCLOAK_HOSTNAME=vase-domena.cz     # nebo IP adresa RPI

# Frontend
REACT_APP_API_URL=https://vase-domena.cz/api  # nebo http://IP_ADRESA/api
```

### 5. Portainer heslo

```bash
mkdir -p secrets
echo "hash_z_prikazu_4" > secrets/portainer_password.txt
chmod 600 secrets/portainer_password.txt
```

### 6. Spuštění aplikace

```bash
# Jednoduchý způsob - deployment script
./deploy-production.sh

# Nebo manuálně
docker compose -f docker-compose.production.yml up -d --build
```

### 7. Sledování spuštění

```bash
# Sledování všech logů
docker compose -f docker-compose.production.yml logs -f

# Pouze backend
docker logs -f mineralogy-backend

# Status služeb
docker compose -f docker-compose.production.yml ps
```

## 🔐 Bezpečnostní konfigurace

### Firewall (UFW)

```bash
# Instalace
sudo apt install ufw -y

# Konfigurace
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Povolit služby
sudo ufw allow 22/tcp      # SSH - NUTNÉ!
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 443/udp     # HTTP/3
sudo ufw allow 9000/tcp    # Portainer HTTP
sudo ufw allow 9443/tcp    # Portainer HTTPS

# Aktivace
sudo ufw enable
sudo ufw status verbose
```

### SSL Certifikáty (Caddy)

Caddy automaticky získá SSL certifikáty od Let's Encrypt. Pouze zajistěte:

1. Doména odkazuje na veřejnou IP vašeho RPI
2. Porty 80 a 443 jsou přístupné z internetu
3. V `caddy/Caddyfile.production` je správná doména

Pro lokální vývoj Caddy vytvoří self-signed certifikát.

## 🌐 Služby a porty

| Služba | Interní Port | Externí Port | URL |
|--------|--------------|--------------|-----|
| Frontend | 80 | 80, 443 | https://domena.cz |
| Backend API | 8000 | - | https://domena.cz/api |
| PostgreSQL | 5432 | - | Pouze interní |
| Keycloak | 8080 | 8080 | http://domena.cz:8080 |
| Portainer | 9000, 9443 | 9000, 9443 | https://domena.cz:9443 |
| Caddy | 80, 443 | 80, 443 | Reverse proxy |

**Poznámka:** Externí porty znamenají přístupné z hostitelského systému/internetu.

## 🔑 Keycloak Setup

### Prvotní konfigurace

1. **Přístup k admin konzoli**
   ```
   URL: http://IP_ADRESA:8080
   Username: admin
   Password: hodnota z KEYCLOAK_ADMIN_PASSWORD
   ```

2. **Vytvoření realmu**
   - Klikněte na dropdown "Master" vlevo nahoře
   - Create Realm
   - Name: `mineralogy`
   - Enabled: ON
   - Create

3. **Vytvoření clienta**
   - V realmu `mineralogy` -> Clients -> Create
   - Client ID: `mineralogy-app`
   - Client Protocol: `openid-connect`
   - Root URL: `https://vase-domena.cz` (nebo http://IP pro vývoj)
   - Valid redirect URIs: `https://vase-domena.cz/*`
   - Web Origins: `https://vase-domena.cz`
   - Access Type: `confidential`
   - Save

4. **Získání Client Secret**
   - V záložce Credentials zkopírujte Secret
   - Přidejte do `.env` jako `KEYCLOAK_CLIENT_SECRET`
   - Restartujte backend:
     ```bash
     docker compose -f docker-compose.production.yml restart backend
     ```

5. **Vytvoření admin uživatele**
   - Users -> Add user
   - Username: `admin`
   - Email: `admin@vase-domena.cz`
   - Email Verified: ON
   - Save
   - Credentials tab -> Set Password
   - Password: silné heslo
   - Temporary: OFF
   - Set password

6. **Přiřazení rolí (volitelné)**
   - Roles -> Add Role
   - Role Name: `admin`, `user`, atd.
   - Users -> najděte uživatele -> Role Mappings
   - Přiřaďte role

### Keycloak best practices

- ✅ Používejte silná hesla (min 16 znaků)
- ✅ Zapněte 2FA pro admin účet
- ✅ Pravidelně zálohujte Keycloak databázi
- ✅ Omezení přístupu k portu 8080 pouze z důvěryhodných IP
- ✅ Používejte HTTPS v produkci

## 🐳 Portainer

### První přihlášení

```
URL: https://IP_ADRESA:9443
```

1. Při prvním přístupu vytvoříte admin účet
2. Vyberte "Get Started" -> připojí se k lokálnímu Dockeru
3. Klikněte na "local" pro zobrazení kontejnerů

### Co můžete dělat v Portaineru

- 📊 **Dashboard**: Přehled všech kontejnerů, CPU, RAM
- 🔄 **Containers**: Start/Stop/Restart kontejnerů
- 📝 **Logs**: Real-time logy jednotlivých služeb
- 🖥️ **Console**: Přístup do kontejneru (bash)
- 📈 **Stats**: Grafy využití zdrojů
- 🔔 **Notifications**: Upozornění na problémy

### Užitečné akce v Portaineru

```
Containers -> mineralogy-backend -> Quick actions:
  - Logs: Zobrazení logů
  - Inspect: Detaily kontejneru
  - Stats: Využití CPU/RAM
  - Console: Přístup do kontejneru
  - Restart: Restart služby
```

## 🛠️ Údržba

### Aktualizace aplikace

```bash
cd ~/mineralogicky-denik
git pull
docker compose -f docker-compose.production.yml up -d --build
```

### Restart služeb

```bash
# Všechny služby
docker compose -f docker-compose.production.yml restart

# Konkrétní služba
docker compose -f docker-compose.production.yml restart backend
```

### Prohlížení logů

```bash
# Všechny služby
docker compose -f docker-compose.production.yml logs -f

# Konkrétní služba s časovými razítky
docker compose -f docker-compose.production.yml logs -f --timestamps backend

# Posledních 100 řádků
docker compose -f docker-compose.production.yml logs --tail=100 backend
```

### Zálohy

Automatické zálohy běží každý den ve 2:00.

```bash
# Manuální záloha databáze
docker exec mineralogy-db pg_dump -U mineralogy mineralogy_db > backup_$(date +%Y%m%d).sql

# Záloha uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Obnovení ze zálohy
docker exec -i mineralogy-db psql -U mineralogy mineralogy_db < backup_20260131.sql
```

### Monitoring zdrojů

```bash
# Real-time statistiky
docker stats

# Využití disku
df -h
du -sh ~/mineralogicky-denik/*

# Vyčištění nepoužívaných Docker dat
docker system prune -a --volumes
```

### Problémy a řešení

#### Kontejner se nerestartuje

```bash
docker logs mineralogy-backend
docker compose -f docker-compose.production.yml restart backend
```

#### Nedostatek místa na disku

```bash
# Vyčištění starých images
docker image prune -a

# Vyčištění logů
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

#### Backend nevidí databázi

```bash
# Kontrola, zda běží databáze
docker ps | grep postgres

# Test spojení
docker exec mineralogy-backend ping postgres
```

#### Keycloak nefunguje

```bash
# Restart Keycloak
docker compose -f docker-compose.production.yml restart keycloak

# Kontrola logů
docker logs mineralogy-keycloak

# Ověření, že databáze keycloak_db existuje
docker exec -it mineralogy-db psql -U mineralogy -l
```

## 📊 Výkon na Raspberry Pi

### Doporučená optimalizace

**config.txt** optimalizace (volitelné):
```bash
sudo nano /boot/config.txt

# Přidejte:
gpu_mem=256
arm_freq=1800  # Pouze s aktivním chlazením!
over_voltage=2
```

**Swap pro stabilitu:**
```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Očekávaný výkon

- **Využití RAM**: 2-3 GB (s 8 kontejnery)
- **CPU**: 20-40% za běžného provozu
- **Disk I/O**: Nízké (SSD výrazně zrychlí)
- **Network**: Minimální latence v LAN

## 🎯 Doporučené další kroky

1. ✅ Nastavit pravidelné automatické aktualizace
2. ✅ Nakonfigurovat external monitoring (UptimeRobot, Healthchecks.io)
3. ✅ Nastavit offsite zálohy (rsync na NAS/cloud)
4. ✅ Připojit UPS pro RPI
5. ✅ Nastavit notifikace v Portaineru
6. ✅ Implementovat fail2ban pro SSH

## 📞 Užitečné odkazy

- **API Dokumentace**: https://vase-domena.cz/api/docs
- **Portainer Docs**: https://docs.portainer.io/
- **Keycloak Docs**: https://www.keycloak.org/documentation
- **Docker Compose Docs**: https://docs.docker.com/compose/

## 🏷️ Docker Images

Všechny použité images jsou oficiální a ověřené:

- `postgis/postgis:15-3.3-alpine` - PostgreSQL s GIS
- `caddy:2-alpine` - Reverse proxy
- `quay.io/keycloak/keycloak:23.0` - IAM
- `portainer/portainer-ce:2.19.4-alpine` - Container management
- `nginx:alpine` - Web server

Vlastní images jsou postavené lokálně z Dockerfile v projektu.

## ⚠️ Důležité bezpečnostní poznámky

1. **Nikdy necommitujte `.env` soubory do Gitu!**
2. **Změňte všechna výchozí hesla před spuštěním!**
3. **Používejte firewall (UFW)!**
4. **Pravidelně aktualizujte systém a Docker images!**
5. **Zálohujte pravidelně databázi a uploads!**
6. **Používejte HTTPS v produkci (Caddy to zajistí automaticky)!**
7. **Omezení přístupu k Portaineru z důvěryhodných IP!**

---

**Vytvořeno pro Raspberry Pi 4 s podporou ARM64**  
**Verze: 1.0.0 - Leden 2026**
