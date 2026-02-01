# 🕐 Oprava systémového času na Raspberry Pi

## Problém
```
Error: x509: certificate has expired or is not yet valid: 
current time 2025-11-25T19:37:07+01:00 is before 2025-11-26T00:00:00Z
```

Systémový čas je nastavený špatně a Docker nemůže stáhnout images kvůli SSL certifikátům.

## Řešení na RPi

### 1. Zkontroluj aktuální čas
```bash
date
# Měl by ukázat 31. ledna 2026, ale ukazuje 25. listopadu 2025
```

### 2. Nastav správný čas (dočasně)
```bash
# Nastav aktuální datum a čas ručně (formát: MMDDhhmmYYYY)
sudo date 013120002026  # 31. ledna 2026, 20:00

# Nebo s přesným časem (např. 20:45):
sudo date 013120452026
```

### 3. Nainstaluj NTP pro automatickou synchronizaci
```bash
# Nainstaluj systemd-timesyncd (měl by být defaultně)
sudo apt update
sudo apt install -y systemd-timesyncd

# Nebo timedatectl
sudo timedatectl set-ntp true
```

### 4. Zkontroluj a povol NTP synchronizaci
```bash
# Zobraz status času
timedatectl

# Mělo by být:
# System clock synchronized: yes
# NTP service: active

# Pokud ne, povol NTP:
sudo timedatectl set-ntp true

# Restart timesyncd
sudo systemctl restart systemd-timesyncd
sudo systemctl enable systemd-timesyncd
```

### 5. Manuální synchronizace (pokud NTP nefunguje)
```bash
# Zastavy timesyncd
sudo systemctl stop systemd-timesyncd

# Nainstaluj ntpdate
sudo apt install -y ntpdate

# Synchronizuj čas
sudo ntpdate -u ntp.ubuntu.com
# nebo
sudo ntpdate -u pool.ntp.org

# Restart timesyncd
sudo systemctl start systemd-timesyncd
```

### 6. Nastav timezone (pokud je potřeba)
```bash
# Zobraz aktuální timezone
timedatectl

# Nastav na Prahu/CET
sudo timedatectl set-timezone Europe/Prague

# Ověř
date
```

### 7. Po opravě času spusť Docker znovu
```bash
cd /srv/docker/mineralogicky-denik

# Zkontroluj čas ještě jednou
date

# Mělo by ukázat: Fri Jan 31 20:xx:xx CET 2026

# Teď zkus Docker znovu
sudo docker compose -f docker-compose.production.yml up -d --build
```

## Rychlé řešení (1 řádek)
```bash
# Nastav čas a spusť Docker:
sudo date 013120002026 && sudo docker compose -f docker-compose.production.yml up -d --build
```

## Trvalé řešení - RTC hodiny

Raspberry Pi nemá real-time clock (RTC), takže ztrácí čas při vypnutí. Řešení:

### Varianta A: NTP při každém startu (doporučeno)
```bash
# NTP se automaticky synchronizuje při připojení k internetu
sudo systemctl enable systemd-timesyncd
```

### Varianta B: Přidat RTC modul (hardware)
Koupit DS3231 RTC modul (~50-100 Kč) a připojit k GPIO pinům.

## Troubleshooting

### Problém: NTP nefunguje
```bash
# Zkontroluj, zda máš připojení k internetu
ping -c 3 8.8.8.8

# Zkontroluj NTP servery
cat /etc/systemd/timesyncd.conf

# Zkontroluj status
systemctl status systemd-timesyncd

# Restart
sudo systemctl restart systemd-timesyncd
```

### Problém: Čas se vrací zpět po restartu
```bash
# RPi nemá RTC hodiny, musí synchronizovat při startu
# Ujisti se, že NTP je povolený:
sudo systemctl enable systemd-timesyncd

# Zkontroluj, zda RPi má přístup k internetu při startu
```

### Problém: Docker stále hlásí certifikát error
```bash
# Po opravě času restart Docker daemon
sudo systemctl restart docker

# Smaž cached images
sudo docker system prune -a

# Zkus znovu
sudo docker compose -f docker-compose.production.yml pull
sudo docker compose -f docker-compose.production.yml up -d --build
```

## Poznámky
- Raspberry Pi **NEMÁ** hardware RTC hodiny
- Čas se nastavuje z NTP serveru při připojení k internetu
- Pokud je RPi vypnutý, ztratí čas
- NTP synchronizace může trvat několik minut po startu
- Ověř, že máš správnou timezone (Europe/Prague)
