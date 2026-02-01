# ✅ PRODUCTION DEPLOYMENT CHECKLIST

## 📋 Před nasazením

### 1. Bezpečnostní konfigurace
- [ ] Vygenerována bezpečná hesla (openssl rand -hex 32, atd.)
- [ ] Vytvořen a vyplněn .env soubor (zkopírován z .env.production)
- [ ] DB_PASSWORD změněno z výchozí hodnoty
- [ ] SECRET_KEY vygenerováno (64 znaků)
- [ ] KEYCLOAK_ADMIN_PASSWORD změněno z "admin"
- [ ] Portainer heslo vygenerováno a uloženo v secrets/portainer_password.txt
- [ ] .env soubor NENÍ v Gitu (kontrola .gitignore)

### 2. Doménová konfigurace
- [ ] Doména směřuje na veřejnou IP Raspberry Pi
- [ ] V .env změněno:
  - [ ] KEYCLOAK_URL na https://vase-domena.cz
  - [ ] KEYCLOAK_HOSTNAME na vase-domena.cz
  - [ ] REACT_APP_API_URL na https://vase-domena.cz/api
- [ ] V caddy/Caddyfile.production změněno:
  - [ ] email na váš email
  - [ ] doména na vase-domena.cz
  - [ ] frontend reverse_proxy na port 80 (ne 3000)

### 3. Raspberry Pi příprava
- [ ] RPI má nejméně 4GB RAM
- [ ] Použita kvalitní SD karta (64GB+) nebo SSD
- [ ] Aktivní chlazení nainstalováno (doporučeno)
- [ ] Stabilní napájení 5V/3A+
- [ ] Docker nainstalován
- [ ] Docker Compose nainstalován
- [ ] Git nainstalován
- [ ] Projekt naklonován

### 4. Firewall (UFW)
- [ ] UFW nainstalován
- [ ] Povolit SSH (22) - KRITICKÉ!
- [ ] Povolit HTTP (80)
- [ ] Povolit HTTPS (443)
- [ ] Povolit Portainer (9000, 9443)
- [ ] UFW aktivován
- [ ] Testován přístup přes SSH (nezamknout se!)

### 5. Filesystem
- [ ] Vytvořena složka secrets/
- [ ] secrets/portainer_password.txt existuje s správným hashem
- [ ] Dostatečný volný prostor (min 20GB)

## 🚀 Při nasazení

### 6. První spuštění
- [ ] Spuštěn ./deploy-production.sh nebo docker compose up
- [ ] Všechny kontejnery běží (7 kontejnerů)
- [ ] Zkontrolovány logy (žádné kritické chyby)
- [ ] Health checks prošly (docker compose ps)
- [ ] Frontend přístupný na https://vase-domena.cz
- [ ] Backend API přístupný na https://vase-domena.cz/api/docs
- [ ] SSL certifikát automaticky získán (Caddy)

### 7. Portainer setup
- [ ] Portainer přístupný na https://IP:9443
- [ ] Vytvořen admin účet při prvním přístupu
- [ ] Připojeno k local Docker
- [ ] Dashboard zobrazuje všech 7 kontejnerů
- [ ] Všechny kontejnery jsou "running"

### 8. Keycloak setup
- [ ] Keycloak přístupný na http://IP:8080 nebo https://domena.cz:8080
- [ ] Přihlášení jako admin (KEYCLOAK_ADMIN_PASSWORD)
- [ ] Vytvořen realm "mineralogy"
- [ ] Vytvořen client "mineralogy-app":
  - [ ] Client Protocol: openid-connect
  - [ ] Access Type: confidential
  - [ ] Valid Redirect URIs: https://vase-domena.cz/*
  - [ ] Web Origins: https://vase-domena.cz
- [ ] Client Secret zkopírován
- [ ] KEYCLOAK_CLIENT_SECRET přidán do .env
- [ ] Backend restartován (docker compose restart backend)
- [ ] Vytvořen admin uživatel v realmu mineralogy:
  - [ ] Username: admin
  - [ ] Email: admin@vase-domena.cz
  - [ ] Email Verified: ON
  - [ ] Heslo nastaveno (Temporary: OFF)

## ✅ Po nasazení

### 9. Funkční testy
- [ ] Frontend se načítá bez chyb (https://vase-domena.cz)
- [ ] Registrace nového uživatele funguje
- [ ] Přihlášení funguje (testovací uživatel)
- [ ] Vytvoření lokality funguje
- [ ] Upload fotky funguje
- [ ] Mapa se zobrazuje správně
- [ ] Export dat funguje
- [ ] Admin má přístup ke všem funkcím

### 10. Monitoring setup
- [ ] Portainer dashboard kontrolován
- [ ] CPU využití < 50% za běžného provozu
- [ ] RAM využití < 3GB
- [ ] Disk využití zkontrolováno (df -h)
- [ ] Logy v Portaineru fungují
- [ ] Teplota RPI < 70°C (vcgencmd measure_temp)

### 11. Zálohy
- [ ] Manuální záloha databáze provedena a otestována
- [ ] Záloha uploads složky provedena
- [ ] Automatické zálohy běží (container mineralogy-backup)
- [ ] Nastavena externí záloha (NAS/cloud) - doporučeno
- [ ] Obnovení ze zálohy otestováno

### 12. Bezpečnost - finální kontrola
- [ ] Žádné výchozí hesla nepoužity
- [ ] UFW firewall aktivní a správně nakonfigurován
- [ ] SSL certifikát platný (Caddy Let's Encrypt)
- [ ] HTTPS funguje bez varování
- [ ] HTTP přesměrovává na HTTPS
- [ ] Keycloak není veřejně přístupný (pouze přes VPN/local network)
- [ ] Portainer není veřejně přístupný (pouze přes VPN/local network)
- [ ] PostgreSQL port 5432 NENÍ veřejně přístupný
- [ ] Backend port 8000 NENÍ veřejně přístupný

### 13. Dokumentace
- [ ] README.production.md přečteno
- [ ] PRODUCTION_SETUP.md použito pro setup
- [ ] ADMIN_CHEATSHEET.txt vytištěno/uloženo
- [ ] Keycloak admin credentials bezpečně uloženy
- [ ] Portainer admin credentials bezpečně uloženy
- [ ] Database credentials bezpečně uloženy
- [ ] Kontakty na support/admina zaznamenány

### 14. Údržba - naplánováno
- [ ] Pravidelné aktualizace systému (týdenní)
- [ ] Pravidelné aktualizace Docker images (měsíční)
- [ ] Monitoring logů (denní kontrola v Portaineru)
- [ ] Kontrola volného místa (týdenní)
- [ ] Kontrola teplot RPI (při problémech)
- [ ] Offsite zálohy (denní/týdenní)
- [ ] Test obnovy ze zálohy (měsíční)

## 🎯 Úspěšné nasazení znamená:

✅ Všechny kontejnery běží (7/7)  
✅ Frontend přístupný přes HTTPS  
✅ API funguje (testováno z frontendu)  
✅ Keycloak autentizace funguje  
✅ Admin uživatel může spravovat systém  
✅ Portainer zobrazuje všechny služby  
✅ Zálohy běží automaticky  
✅ Firewall ochraňuje RPI  
✅ SSL certifikáty platné  
✅ Dokumentace k dispozici  

## 🚨 Red Flags (varování)

⚠️ Kontejner se neustále restartuje → zkontrolovat logy  
⚠️ CPU > 80% → zkontrolovat docker stats  
⚠️ RAM plná → zvětšit swap nebo restart  
⚠️ Disk > 80% plný → vyčistit staré logy/images  
⚠️ Teplota > 80°C → zlepšit chlazení  
⚠️ SSL chyby → zkontrolovat Caddy logy  
⚠️ 502 Bad Gateway → backend nedostupný  
⚠️ Keycloak neodpovídá → restart kontejneru  

## 📞 V případě problémů

1. Zkontrolovat ADMIN_CHEATSHEET.txt
2. Logy v Portaineru
3. PRODUCTION_SETUP.md Troubleshooting sekce
4. Docker logs [container-name]
5. docker compose ps (status check)
6. docker stats (resource check)
7. GitHub Issues (projektu)

---

**Checklist verze:** 1.0.0  
**Datum vytvoření:** 2026-01-31  
**Pro platformu:** Raspberry Pi 4 (ARM64)  

Po dokončení všech kroků je aplikace production-ready! 🎉
