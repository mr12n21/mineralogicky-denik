# Mineralogický deník - Deployment Guide

Kompletní návod na nasazení aplikace na Raspberry Pi 4.

## Požadavky

- Raspberry Pi 4 (doporučeno 4GB+ RAM)
- Raspbian OS (64-bit doporučeno)
- Docker a Docker Compose nainstalováno
- Minimum 16GB volného místa
- Síťové připojení

## 1. Příprava Raspberry Pi

### Instalace Docker

```bash
# Update systému
sudo apt-get update && sudo apt-get upgrade -y

# Instalace Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Přidání uživatele do docker skupiny
sudo usermod -aG docker $USER

# Instalace Docker Compose
sudo apt-get install docker-compose -y

# Restart pro aplikaci změn
sudo reboot
```

### Kontrola instalace

```bash
docker --version
docker-compose --version
```

## 2. Stažení a konfigurace aplikace

```bash
# Klonování repozitáře (nebo zkopírování souborů)
cd ~
git clone <repository-url> mineralogy-diary
cd mineralogy-diary

# Vytvoření .env souboru
cp .env.example .env

# Úprava konfigurace
nano .env
```

### Důležité proměnné v .env:

```bash
# Změňte heslo k databázi!
DB_PASSWORD=vase-silne-heslo-zde

# Generujte nový SECRET_KEY
SECRET_KEY=$(openssl rand -hex 32)

# Nastavte cestu k NAS pro zálohy
NAS_PATH=/mnt/nas/backups

# Pro produkci změňte NODE_ENV
NODE_ENV=production
```

## 3. Konfigurace Caddy (automatické SSL)

Caddy automaticky získává SSL certifikáty od Let's Encrypt!

### Pro lokální síť (self-signed - výchozí):

Není potřeba nic nastavovat! Caddy automaticky vytvoří self-signed certifikát.

```bash
# Caddyfile je už připravený
# Stačí spustit aplikaci
```

### Pro produkci s doménou (Let's Encrypt - automatické):

```bash
# 1. Upravte Caddyfile pro produkci
cp caddy/Caddyfile.production caddy/Caddyfile
nano caddy/Caddyfile

# 2. Změňte v Caddyfile:
# - mineralogy.yourdomain.com → vaše skutečná doména
# - your-email@example.com → váš email

# 3. Ujistěte se, že:
# - DNS A záznam domény směřuje na vaši veřejnou IP
# - Port 80 a 443 jsou otevřené v firewallu a routeru
# - Doména je dostupná z internetu

# 4. Spusťte aplikaci
docker-compose up -d

# 5. Sledujte automatické získání certifikátu
docker-compose logs -f caddy
```

Caddy **automaticky**:
- Získá certifikát od Let's Encrypt
- Obnoví certifikát před vypršením
- Přesměruje HTTP → HTTPS
- Žádné manuální kroky!

## 4. Konfigurace NAS pro zálohy

```bash
# Vytvoření mount pointu
sudo mkdir -p /mnt/nas/backups

# Pro SMB/CIFS share
sudo apt-get install cifs-utils -y

# Připojení NAS (příklad)
sudo mount -t cifs //nas-ip/backup /mnt/nas/backups \
  -o username=user,password=pass,uid=1000,gid=1000

# Pro trvalé připojení přidejte do /etc/fstab
echo "//nas-ip/backup /mnt/nas/backups cifs username=user,password=pass,uid=1000,gid=1000 0 0" | sudo tee -a /etc/fstab
```

## 5. Lokální DNS konfigurace

### Metoda 1: /etc/hosts (jednoduchá)

Na všech zařízeních v síti přidejte:

```bash
# Linux/Mac
sudo nano /etc/hosts

# Windows (jako admin)
notepad C:\Windows\System32\drivers\etc\hosts

# Přidejte řádek:
192.168.1.XXX   mineralogy.local
```

### Metoda 2: Pi-hole (doporučeno)

Pokud máte Pi-hole:

1. Přejděte do Admin → Local DNS → DNS Records
2. Přidejte záznam: `mineralogy.local` → IP vašeho RPi

## 6. Spuštění aplikace

```bash
# Build a spuštění všech služeb
docker-compose up -d

# Sledování logů
docker-compose logs -f

# Kontrola stavu
docker-compose ps
```

### První spuštění - kontrola:

```bash
# Počkejte 30-60 sekund na inicializaci databáze

# Zkontrolujte, zda všechny služby běží
docker-compose ps

# Měli byste vidět:
# - mineralogy-db (healthy)
# - mineralogy-backend (running)
# - mineralogy-frontend (running)
# - mineralogy-nginx (running)
# - mineralogy-backup (running)
# - mineralogy-keycloak (running, optional)
```

## 7. První přihlášení

1. Otevřete prohlížeč a přejděte na: `https://mineralogy.local` nebo `https://IP-vaseho-RPi`
2. Přijměte self-signed certifikát (pokud používáte)
3. Klikněte na "Zaregistrovat se"
4. Vytvořte první uživatelský účet

### Výchozí admin účet v databázi:

- **Username:** admin
- **Password:** admin123
- ⚠️ **ZMĚŇTE HESLO PO PRVNÍM PŘIHLÁŠENÍ!**

## 8. Konfigurace VPN přístupu

### WireGuard na Raspberry Pi:

```bash
# Instalace WireGuard
sudo apt-get install wireguard -y

# Generování klíčů
wg genkey | tee privatekey | wg pubkey > publickey

# Konfigurace (příklad)
sudo nano /etc/wireguard/wg0.conf
```

Příklad wg0.conf:

```ini
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = <váš-private-key>

[Peer]
PublicKey = <client-public-key>
AllowedIPs = 10.0.0.2/32
```

```bash
# Spuštění WireGuard
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0

# Port forwarding na routeru
# Přesměrujte port 51820 UDP na vaše RPi
```

## 9. Údržba

### Aktualizace aplikace:

```bash
cd ~/mineralogy-diary
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Zálohy:

Zálohy běží automaticky každý den ve 2:00.

Manuální záloha:

```bash
docker-compose exec backup /usr/local/bin/backup.sh
```

Obnovení ze zálohy:

```bash
# Zastavení služeb
docker-compose down

# Obnovení databáze
docker-compose up -d postgres
docker-compose exec postgres pg_restore \
  -U mineralogy -d mineralogy_db \
  /path/to/db_backup_TIMESTAMP.dump

# Obnovení souborů
tar -xzf uploads_backup_TIMESTAMP.tar.gz -C /path/to/uploads

# Restart všech služeb
docker-compose up -d
```

### Sledování logů:

```bash
# Všechny služby
docker-compose logs -f

# Konkrétní služba
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Kontrola využití zdrojů:

```bash
# Docker stats
docker stats

# Systémové zdroje
htop
```

## 10. Bezpečnost

### Doporučení:

1. ✅ Změňte všechna výchozí hesla
2. ✅ Používejte silné SECRET_KEY
3. ✅ Pravidelně aktualizujte systém a Docker images
4. ✅ Používejte firewall (ufw)
5. ✅ Omezujte přístup pouze z důvěryhodných sítí
6. ✅ Pravidelně kontrolujte zálohy

### Nastavení firewall:

```bash
sudo apt-get install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 51820/udp  # WireGuard
sudo ufw enable
```

## 11. Troubleshooting

### Aplikace nejde spustit:

```bash
# Zkontrolujte logy
docker-compose logs

# Restart služeb
docker-compose restart

# Kompletní restart
docker-compose down
docker-compose up -d
```

### Databáze se nepřipojí:

```bash
# Zkontrolujte stav PostgreSQL
docker-compose exec postgres pg_isready -U mineralogy

# Zkontrolujte logy
docker-compose logs postgres
```

### Nedostatek místa:

```bash
# Vyčištění Docker cache
docker system prune -a

# Zkontrolujte volné místo
df -h
```

## 12. Monitoring (volitelné)

### Instalace Portainer pro správu:

```bash
docker volume create portainer_data

docker run -d \
  -p 9000:9000 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Přístup: `http://IP-vaseho-RPi:9000`

## Kontakty a podpora

Pro další informace a podporu:
- GitHub Issues: <repository-url>/issues
- Dokumentace: <repository-url>/wiki

---

**Poznámka:** Tato aplikace je navržena pro osobní použití v domácí síti. Pro produkční nasazení s veřejným přístupem doporučujeme dodatečné bezpečnostní opatření.
