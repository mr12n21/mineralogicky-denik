# Produkční nasazení na Raspberry Pi

## 🔐 Bezpečnostní kontroly před nasazením

### 1. Vygenerování bezpečných hesel a klíčů

```bash
# 1. Vygenerujte SECRET_KEY pro backend
openssl rand -hex 32

# 2. Vygenerujte silné heslo pro databázi (min 16 znaků)
openssl rand -base64 24

# 3. Vygenerujte Keycloak admin heslo (min 16 znaků)
openssl rand -base64 24

# 4. Vygenerujte Portainer heslo hash
docker run --rm httpd:2.4-alpine htpasswd -nbB admin "vaše_heslo" | cut -d ":" -f 2
```

### 2. Konfigurace produkčních souborů

#### A. Vytvořte `.env.production`

```bash
cd /home/marek/Documents/GitHub/mineralogicky-denik
cp .env.production .env
nano .env
```

**DŮLEŽITÉ položky ke změně:**
- `DB_PASSWORD` - heslo databáze (výstup z příkazu 2)
- `SECRET_KEY` - tajný klíč backendu (výstup z příkazu 1)
- `KEYCLOAK_ADMIN_PASSWORD` - admin heslo Keycloak (výstup z příkazu 3)
- `KEYCLOAK_URL` - vaše doména (např. https://mineralogy.vase-domena.cz)
- `KEYCLOAK_HOSTNAME` - vaše doména (např. mineralogy.vase-domena.cz)
- `REACT_APP_API_URL` - vaše API URL (např. https://mineralogy.vase-domena.cz/api)

#### B. Vytvořte Portainer heslo

```bash
mkdir -p secrets
echo "výstup_z_příkazu_4" > secrets/portainer_password.txt
chmod 600 secrets/portainer_password.txt
```

#### C. Aktualizujte Caddyfile.production

```bash
nano caddy/Caddyfile.production
```

Změňte `localhost` na vaši skutečnou doménu.

### 3. Příprava Raspberry Pi

```bash
# Aktualizace systému
sudo apt update && sudo apt upgrade -y

# Instalace Docker (pokud ještě není)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Instalace Docker Compose
sudo apt install docker-compose-plugin -y

# Test instalace
docker --version
docker compose version
```

### 4. Nastavení firewallu (UFW)

```bash
# Instalace UFW
sudo apt install ufw -y

# Základní konfigurace
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Povolit SSH (DŮLEŽITÉ - jinak ztratíte přístup!)
sudo ufw allow 22/tcp

# Povolit HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp

# Povolit Portainer
sudo ufw allow 9000/tcp
sudo ufw allow 9443/tcp

# Aktivace
sudo ufw enable
sudo ufw status
```

### 5. Nasazení aplikace

```bash
# Přejděte do složky projektu
cd /home/marek/Documents/GitHub/mineralogicky-denik

# Build a spuštění produkční verze
docker compose -f docker-compose.production.yml up -d --build

# Sledování logů
docker compose -f docker-compose.production.yml logs -f
```

### 6. Nastavení Keycloak admina

1. Otevřete v prohlížeči: `https://vase-domena.cz:8080` nebo `http://rpi-ip:8080`
2. Přihlaste se jako admin (použijte `KEYCLOAK_ADMIN_PASSWORD` z `.env`)
3. Vytvořte realm `mineralogy` (pokud neexistuje)
4. Vytvořte client `mineralogy-app`:
   - Client ID: `mineralogy-app`
   - Access Type: confidential
   - Valid Redirect URIs: `https://vase-domena.cz/*`
   - Web Origins: `https://vase-domena.cz`
5. Zkopírujte Client Secret a přidejte do `.env` jako `KEYCLOAK_CLIENT_SECRET`
6. Vytvořte admin uživatele v realmu mineralogy

### 7. Přístup k Portaineru

1. Otevřete: `http://rpi-ip:9000` nebo `https://vase-domena.cz:9443`
2. Při prvním přístupu vytvoříte admin účet
3. Připojte se k lokálnímu Docker prostředí
4. Nyní můžete spravovat všechny kontejnery přes GUI

### 8. Kontrola běžících služeb

```bash
# Status všech kontejnerů
docker compose -f docker-compose.production.yml ps

# Kontrola zdrojů
docker stats

# Logy specifického kontejneru
docker logs mineralogy-backend
docker logs mineralogy-keycloak
docker logs mineralogy-portainer
```

## 📊 Portainer - Správa kontejnerů

Portainer poskytuje:
- 📈 Monitoring kontejnerů (CPU, RAM, network)
- 🔄 Restart/Start/Stop kontejnerů jedním kliknutím
- 📝 Prohlížení logů v reálném čase
- 🖥️ Konzole pro přístup do kontejnerů
- 📊 Statistiky a grafy využití zdrojů
- 🔔 Notifikace při problémech

## 🔒 Bezpečnostní best practices

1. **Nikdy nepoužívejte výchozí hesla v produkci**
2. **Pravidelně aktualizujte Docker images:**
   ```bash
   docker compose -f docker-compose.production.yml pull
   docker compose -f docker-compose.production.yml up -d
   ```
3. **Zálohujte pravidelně databázi** (automatické zálohy jsou nakonfigurovány)
4. **Sledujte logy v Portaineru** na podezřelou aktivitu
5. **Používejte HTTPS** pro všechny služby (Caddy to zajistí automaticky)
6. **Omezete přístup k Portaineru** pouze z důvěryhodných IP

## 🔄 Aktualizace aplikace

```bash
cd /home/marek/Documents/GitHub/mineralogicky-denik
git pull
docker compose -f docker-compose.production.yml up -d --build
```

## 🚨 Troubleshooting

### Kontejner se nerestartuje
```bash
docker logs [container-name]
docker compose -f docker-compose.production.yml restart [service-name]
```

### Databáze se nekonektuje
```bash
docker exec -it mineralogy-db psql -U mineralogy -d mineralogy_db
```

### Portainer nefunguje
```bash
docker logs mineralogy-portainer
docker restart mineralogy-portainer
```

## 📦 Použité Docker Images

### Oficiální a ověřené images:
- `postgis/postgis:15-3.3-alpine` - PostgreSQL s GIS rozšířením
- `caddy:2-alpine` - Reverse proxy s automatickým HTTPS
- `quay.io/keycloak/keycloak:23.0` - Identity management
- `portainer/portainer-ce:2.19.4-alpine` - Container management
- `nginx:alpine` - Web server pro frontend

### Vlastní images:
- `mineralogy-backend:production` - FastAPI backend
- `mineralogy-frontend:production` - React frontend

Všechny images jsou optimalizovány pro ARM64 (Raspberry Pi).

## 🎯 Výkon na Raspberry Pi

**Doporučené specifikace:**
- Raspberry Pi 4 (4GB RAM nebo více)
- MicroSD karta (64GB+) nebo SSD přes USB 3.0
- Aktivní chlazení doporučeno

**Optimalizace:**
- Backend běží s 2 workers (nastavitelné v docker-compose.production.yml)
- Logy omezeny na 10MB x 3 soubory per kontejner
- Gzip komprese v nginx
- Build cache pro rychlejší rebuildy

## 📞 Důležité URL po nasazení

- **Frontend:** https://vase-domena.cz
- **Backend API:** https://vase-domena.cz/api
- **Keycloak Admin:** https://vase-domena.cz:8080 (nebo přes Caddy)
- **Portainer:** https://vase-domena.cz:9443
- **API Dokumentace:** https://vase-domena.cz/api/docs
