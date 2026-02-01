# 🚀 Rychlá instalace na Raspberry Pi

## Příprava Raspberry Pi

### 1. Instalace operačního systému
```bash
# Použij Raspberry Pi Imager a nainstaluj:
# - Raspberry Pi OS Lite (64-bit) - doporučeno pro server
# nebo
# - Raspberry Pi OS (64-bit) - s desktopem

# Při instalaci nastav:
# - Hostname: kameny.lan (nebo jiný dle .env)
# - Povol SSH
# - Nastav uživatele a heslo
```

### 2. Připojení k RPi
```bash
# Z tvého počítače:
ssh uzivatel@kameny.lan
# nebo
ssh uzivatel@IP_ADRESA_RPI
```

### 3. Aktualizace systému
```bash
sudo apt update && sudo apt upgrade -y
```

## Instalace Dockeru

### Automatická instalace (doporučeno)
```bash
# Stáhni a spusť oficiální instalační skript
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Přidej uživatele do docker skupiny (aby nebylo nutné sudo)
sudo usermod -aG docker $USER

# Odhlásit a přihlásit se znovu, aby se aplikovaly změny skupiny
exit
# Připoj se znovu přes SSH
```

### Instalace Docker Compose
```bash
# Docker Compose v2 je součástí Docker CLI
sudo apt install -y docker-compose-plugin

# Nebo použij starší verzi:
sudo apt install -y docker-compose
```

### Ověření instalace
```bash
# Zkontroluj verzi Dockeru
docker --version

# Zkontroluj Docker Compose
docker compose version

# Test Dockeru
docker run hello-world
```

### Automatické spuštění Dockeru při startu
```bash
sudo systemctl enable docker
sudo systemctl start docker
```

## Příprava aplikace

### 1. Přenos souborů na RPi

**Varianta A: Git (doporučeno)**
```bash
# Na RPi nainstaluj git
sudo apt install -y git

# Naklonuj repozitář
cd ~
git clone https://github.com/USERNAME/mineralogicky-denik.git
cd mineralogicky-denik
```

**Varianta B: SCP přenos**
```bash
# Z tvého počítače (ne na RPi):
cd /home/marek/Documents/GitHub/mineralogicky-denik
scp -r . uzivatel@kameny.lan:~/mineralogicky-denik/
```

### 2. Konfigurace .env
```bash
cd ~/mineralogicky-denik

# Zkopíruj .env soubor
cp .env.production .env

# Uprav .env soubor
nano .env
```

**Důležité změny v .env:**
```bash
# Database
DB_PASSWORD=SILNE_HESLO_123

# JWT Secret (vygeneruj nový)
SECRET_KEY=TVUJ_64_ZNAKOVY_HEXADECIMALNI_KLIC

# Keycloak
KEYCLOAK_ADMIN_PASSWORD=ADMIN_HESLO_456

# URLs (pokud máš doménu, jinak použij IP)
KEYCLOAK_URL=https://kameny.lan
REACT_APP_API_URL=https://kameny.lan/api
# nebo
KEYCLOAK_URL=https://192.168.1.100
REACT_APP_API_URL=https://192.168.1.100/api
```

**Generování SECRET_KEY:**
```bash
# Na RPi:
openssl rand -hex 32
# Zkopíruj výstup do .env jako SECRET_KEY
```

### 3. Příprava adresářů
```bash
cd ~/mineralogicky-denik

# Vytvoř adresáře pro data
mkdir -p pgdata backups secrets
chmod 700 secrets
```

## Spuštění aplikace

### Produkční nasazení
```bash
cd ~/mineralogicky-denik

# Stáhni images a spusť kontejnery
docker compose -f docker-compose.production.yml up -d --build

# Sleduj logy
docker compose -f docker-compose.production.yml logs -f

# Pro zastavení sledování logů: Ctrl+C
```

### Kontrola běžících kontejnerů
```bash
# Zobraz běžící kontejnery
docker ps

# Měly by běžet:
# - mineralogy-db (PostgreSQL)
# - mineralogy-backend (FastAPI)
# - mineralogy-frontend (React + Nginx)
# - mineralogy-caddy (Reverse Proxy)
# - mineralogy-keycloak (Auth)
# - mineralogy-portainer (GUI správa)
# - mineralogy-backup (Automatické zálohy)
```

### Přístup k aplikaci

#### Z lokální sítě:
- **Frontend**: https://kameny.lan nebo https://IP_ADRESA_RPI
- **Portainer GUI**: https://kameny.lan:9443 nebo https://IP_ADRESA_RPI:9443
- **Keycloak Admin**: https://kameny.lan:8080

#### První přihlášení do Portaineru:
1. Otevři https://kameny.lan:9443
2. Vytvoř admin účet (při prvním spuštění)
3. Připoj se k local Docker environment

## Konfigurace Keycloaku

Po prvním spuštění je nutné nakonfigurovat Keycloak:

```bash
# 1. Přihlas se do Keycloak Admin Console
# URL: https://kameny.lan:8080
# Username: admin
# Password: (hodnota z .env: KEYCLOAK_ADMIN_PASSWORD)

# 2. Vytvoř realm "mineralogy"
# 3. Vytvoř klienta "mineralogy-app"
#    - Client ID: mineralogy-app
#    - Client Protocol: openid-connect
#    - Access Type: confidential
#    - Valid Redirect URIs: https://kameny.lan/*
#    - Web Origins: https://kameny.lan

# 4. Zkopíruj Client Secret z Credentials tab
# 5. Přidej Client Secret do .env:
nano .env
# Přidej: KEYCLOAK_CLIENT_SECRET=tvuj-secret-zde

# 6. Restartuj backend
docker compose -f docker-compose.production.yml restart backend

# 7. Vytvoř uživatele v Keycloak mineralogy realm
```

## Správa a údržba

### Základní příkazy
```bash
# Zobraz logy
docker compose -f docker-compose.production.yml logs -f [service_name]

# Restart služby
docker compose -f docker-compose.production.yml restart [service_name]

# Stop všech služeb
docker compose -f docker-compose.production.yml down

# Start služeb
docker compose -f docker-compose.production.yml up -d

# Aktualizace aplikace (po git pull)
docker compose -f docker-compose.production.yml up -d --build
```

### Zálohy
Automatické zálohy běží každý den ve 2:00:
```bash
# Manuální záloha
docker compose -f docker-compose.production.yml exec backup /backup.sh

# Zálohy jsou uloženy v: ./backups/
```

### Monitoring
```bash
# Využití zdrojů
docker stats

# Disk space
df -h
docker system df
```

### Čištění
```bash
# Vymaž nepoužívané images
docker image prune -a

# Vymaž všechno nepoužívané
docker system prune -a --volumes
# ⚠️ POZOR: Smaže i volumes, které nejsou používány!
```

## Troubleshooting

### Kontejner se nerestartuje
```bash
# Zobraz logy
docker compose -f docker-compose.production.yml logs service_name

# Ověř .env konfiguraci
cat .env | grep ERROR
```

### Backend 500 chyby
```bash
# Zkontroluj email domény v DB (musí být platná, ne .local)
# Zkontroluj Keycloak konfiguraci
# Zkontroluj SECRET_KEY v .env
```

### Frontend TypeScript chyby
```bash
# Rebuild frontend
docker compose -f docker-compose.production.yml up -d --build frontend
```

### Portainer nefunguje
```bash
# Zkontroluj běh
docker ps | grep portainer

# Restart
docker compose -f docker-compose.production.yml restart portainer

# Přístup na: https://IP:9443
```

### Nedostatečná paměť na RPi
```bash
# Zkontroluj využití RAM
free -h

# Pokud je málo RAM, redukuj počet workerů v docker-compose:
# backend: WORKERS=1
# nebo použij swap
```

### Nelze se připojit k aplikaci
```bash
# Zkontroluj firewall
sudo ufw status

# Povol porty
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 9443/tcp

# Zkontroluj, že Caddy běží
docker logs mineralogy-caddy
```

## Výkon a optimalizace

### Pro Raspberry Pi 4 (4GB+)
```yaml
# V docker-compose.production.yml je již optimalizováno:
# - Backend: 2 workers (pro RPi4)
# - PostgreSQL: shared_buffers=256MB
# - Alpine images (minimální velikost)
```

### Pro Raspberry Pi 3 nebo méně RAM
```bash
# Redukuj workery v .env:
WORKERS=1

# Případně vypni Keycloak a použij jednoduché JWT auth
```

## Bezpečnost

### SSL/TLS certifikáty
Caddy automaticky získává Let's Encrypt certifikáty pokud:
1. Máš veřejnou doménu
2. Port 80 a 443 jsou přístupné z internetu

Pro lokální síť se používají self-signed certifikáty.

### Firewall
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 9443/tcp
sudo ufw enable
```

### Pravidelné aktualizace
```bash
# Systémové balíčky
sudo apt update && sudo apt upgrade -y

# Docker images
cd ~/mineralogicky-denik
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --build
```

---

## 📋 Checklist prvního spuštění

- [ ] RPi OS nainstalován a aktualizován
- [ ] Docker a Docker Compose nainstalován
- [ ] Repozitář naklonován / soubory přeneseny
- [ ] .env soubor nakonfigurován (hesla, SECRET_KEY)
- [ ] Adresáře vytvořeny (pgdata, backups, secrets)
- [ ] Docker kontejnery spuštěny
- [ ] Keycloak realm vytvořen
- [ ] Keycloak client nakonfigurován
- [ ] KEYCLOAK_CLIENT_SECRET přidán do .env
- [ ] Backend restartován
- [ ] Admin uživatel vytvořen v Keycloaku
- [ ] Aplikace přístupná na https://kameny.lan
- [ ] Portainer přístupný na https://kameny.lan:9443

🎉 **Hotovo! Aplikace běží na Raspberry Pi!**
