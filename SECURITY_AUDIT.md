# 🔒 Security Audit & Best Practices

## ✅ Implementované bezpečnostní opatření

### 1. **Authentication & Authorization**
- ✅ Keycloak pro centralizovanou správu uživatelů (IAM)
- ✅ JWT tokeny s expirací (1 hodina)
- ✅ Confidential client (Client Secret required)
- ✅ RBAC ready (role-based access control v Keycloak)
- ✅ Email verification support
- ✅ Password policies konfigurovatelné v Keycloak

### 2. **Network Security**
- ✅ Všechny služby v izolované Docker síti
- ✅ PostgreSQL NENÍ vystavena ven (pouze interní port)
- ✅ Backend NENÍ vystaven ven (pouze přes reverse proxy)
- ✅ UFW firewall konfigurace doporučena
- ✅ HTTPS automaticky (Let's Encrypt přes Caddy)
- ✅ HTTP/3 support
- ✅ Reverse proxy s bezpečnostními hlavičkami

### 3. **Data Protection**
- ✅ Databázové heslo v environment variables
- ✅ Secrets v separátní složce (gitignored)
- ✅ SECRET_KEY pro JWT signing (HS256)
- ✅ Hesla v DB zahashovaná (Keycloak + backend)
- ✅ SSL/TLS pro data v přenosu

### 4. **Container Security**
- ✅ Alpine images (minimální attack surface)
- ✅ Oficiální a ověřené Docker images
- ✅ Health checks (automatické restarty)
- ✅ Resource limits doporučeny
- ✅ Log rotation (prevence disk space issues)
- ✅ Read-only filesystémy kde možné
- ✅ Non-root users v kontejnerech (většina)

### 5. **Security Headers**
- ✅ X-Frame-Options: SAMEORIGIN (Caddy + nginx)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Server header odstraněn

### 6. **Input Validation**
- ✅ Pydantic schemas v backendu
- ✅ FastAPI automatická validace
- ✅ TypeScript typy ve frontendu
- ✅ File upload limits (10MB)
- ✅ Allowed file extensions kontrola

### 7. **Audit & Monitoring**
- ✅ Strukturované logy (JSON)
- ✅ Log rotation
- ✅ Health check endpoints
- ✅ Portainer pro monitoring
- ✅ Docker stats dostupné

## ⚠️ Doporučené další kroky

### Kritické (implementovat ASAP)

1. **Rate Limiting**
   ```
   Přidat do Caddy nebo backend middleware
   Ochrana proti brute-force útokům
   ```

2. **Fail2Ban**
   ```bash
   sudo apt install fail2ban
   # Konfigurace pro SSH a web porty
   ```

3. **Regular Security Updates**
   ```bash
   # Automatické aktualizace
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

4. **Backup Encryption**
   ```bash
   # Šifrované zálohy s GPG
   gpg --symmetric --cipher-algo AES256 backup.sql
   ```

### Důležité (implementovat během 30 dnů)

5. **CSP Headers (Content Security Policy)**
   ```
   Přidat do Caddy:
   Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'"
   ```

6. **HSTS (HTTP Strict Transport Security)**
   ```
   Přidat do Caddy:
   Strict-Transport-Security "max-age=31536000; includeSubDomains"
   ```

7. **Database Connection Encryption**
   ```
   Povolit SSL pro PostgreSQL připojení
   ```

8. **Secrets Management**
   ```
   Zvážit Docker Secrets nebo Vault
   Místo environment variables
   ```

### Nice to Have (implementovat později)

9. **Web Application Firewall (WAF)**
   ```
   ModSecurity s OWASP Core Rule Set
   ```

10. **Intrusion Detection (IDS)**
    ```bash
    sudo apt install aide  # Host-based IDS
    ```

11. **Log Aggregation**
    ```
    ELK stack nebo Loki pro centralizované logy
    ```

12. **Two-Factor Authentication**
    ```
    Povolit v Keycloak (OTP)
    ```

## 🔍 Security Audit Checklist

### Weekly
- [ ] Kontrola logů v Portaineru (podezřelá aktivita)
- [ ] Kontrola nepoužívaných Docker images/volumes
- [ ] Kontrola disk space (logy)
- [ ] Kontrola running processes (htop)

### Monthly
- [ ] Aktualizace Docker images
- [ ] Aktualizace OS (apt update && apt upgrade)
- [ ] Review uživatelů v Keycloak (deaktivovat neaktivní)
- [ ] Test obnovy ze zálohy
- [ ] Kontrola SSL certifikátu (platnost)
- [ ] Review firewall rules

### Quarterly
- [ ] Změna kritických hesel (databáze, admin)
- [ ] Rotace SECRET_KEY (vyžaduje re-login všech)
- [ ] Security audit logů (hledání vzorů)
- [ ] Penetration testing (pokud je veřejně přístupné)
- [ ] Review Keycloak security policies

## 🚨 Známá rizika a mitigace

### 1. **Self-hosted bez dedikovaného security týmu**
**Riziko:** Opožděné security patche  
**Mitigace:**
- Nastavit automatické aktualizace (unattended-upgrades)
- Subscribe k security mailing listům (Keycloak, FastAPI)
- Pravidelné kontroly CVE databází

### 2. **Raspberry Pi jako production server**
**Riziko:** Hardwarová selhání, omezený výkon  
**Mitigace:**
- UPS pro stabilní napájení
- Kvalitní SD karta nebo SSD
- Offsite zálohy (NAS, cloud)
- Monitoring teplot a performance

### 3. **Všechny služby na jednom stroji**
**Riziko:** Jeden bod selhání  
**Mitigace:**
- Pravidelné zálohy (automatizované)
- Dokumentace pro rychlé obnovení
- Možnost rychlého nasazení na záložní RPI

### 4. **Portainer má přístup k Docker socket**
**Riziko:** Plný přístup k host systému  
**Mitigace:**
- Portainer pouze v lokální síti (ne veřejně)
- Silné heslo pro Portainer
- Pravidelná kontrola Portainer audit logů
- RBAC v Portaineru (omezit uživatele)

### 5. **Self-signed certifikáty v dev módu**
**Riziko:** MITM útoky  
**Mitigace:**
- V produkci VŽDY používat Let's Encrypt (Caddy)
- Pinning certifikátů ve frontendu (optional)

## 📊 Security Compliance

### GDPR Considerations
- ✅ Uživatelé mohou smazat svůj účet (Keycloak + cascade delete)
- ✅ Data minimizace (pouze nutné údaje)
- ⚠️ Cookie consent banner (implementovat)
- ⚠️ Privacy policy (vytvořit)
- ⚠️ Data export funkce (implementovat v backendu)

### Backup & Recovery
- ✅ Automatické denní zálohy
- ✅ Retention policy (30 dní)
- ⚠️ Offsite zálohy (nakonfigurovat)
- ⚠️ Disaster recovery plán (zdokumentovat)

## 🛡️ Incident Response Plan

### Při detekci narušení:

1. **Okamžitě:**
   ```bash
   # Izolovat systém
   sudo ufw deny from any to any
   docker compose down
   ```

2. **Zachovat důkazy:**
   ```bash
   # Backup logů
   docker compose logs > incident_$(date +%Y%m%d_%H%M).log
   cp /var/log/auth.log incident_auth.log
   ```

3. **Analýza:**
   - Zkontrolovat auth logy
   - Zkontrolovat Keycloak audit
   - Zkontrolovat Docker logy
   - Zkontrolovat network connections

4. **Náprava:**
   - Změnit všechna hesla
   - Revokovat všechny JWT tokeny (restart backend)
   - Aktualizovat všechny komponenty
   - Obnovit ze známé dobré zálohy

5. **Post-incident:**
   - Dokumentovat incident
   - Updatovat security measures
   - Notify affected users (pokud GDPR povinnost)

## 🔐 Password Policies (Keycloak)

### Doporučené nastavení:
```
Minimum Length: 12
Require Uppercase: Yes
Require Lowercase: Yes
Require Digits: Yes
Require Special Characters: Yes
Not Email: Yes
Not Username: Yes
Password History: 5
Expire After: 90 days (optional)
```

### Nastavení v Keycloak:
```
Realm Settings → Security Defenses
- Brute Force Detection: ON
- Max Login Failures: 5
- Wait Increment: 60 seconds
- Max Wait: 15 minutes
```

## 📝 Security Documentation

### Musí být zdokumentováno:
- ✅ Všechna hesla v password manageru (1Password, Bitwarden)
- ✅ SSH klíče
- ✅ SSL certifikáty (Let's Encrypt)
- ✅ Backup strategie
- ⚠️ Network diagram
- ⚠️ Incident response kontakty
- ⚠️ Change management proces

## 🎓 Security Training

### Admin by měl znát:
- Základy Docker security
- UFW firewall management
- SSH key-based authentication
- Log analysis basics
- Backup & restore procedures
- Keycloak administration
- OWASP Top 10

---

**Security Audit verze:** 1.0.0  
**Poslední kontrola:** 2026-01-31  
**Příští audit:** 2026-02-28  

Pro otázky nebo nahlášení bezpečnostních problémů: security@vase-domena.cz
