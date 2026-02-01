# Caddy Konfigurace

Caddy je moderní web server s automatickými SSL certifikáty od Let's Encrypt.

## Výhody Caddy

- ✅ **Automatické HTTPS** - Automaticky získává a obnovuje Let's Encrypt certifikáty
- ✅ **Jednoduchá konfigurace** - Srozumitelný Caddyfile syntax
- ✅ **HTTP/3 podpora** - Moderní protokoly out-of-the-box
- ✅ **Automatické přesměrování** HTTP → HTTPS
- ✅ **Zero-downtime reloads** - Aktualizace konfigurace bez výpadku

## Režimy konfigurace

### 1. Lokální vývoj (výchozí)

Použijte `Caddyfile` - self-signed certifikát pro lokální síť.

```bash
# Spuštění
docker-compose up -d

# Přístup
https://localhost
https://192.168.1.XXX
https://mineralogy.local
```

Prohlížeč zobrazí varování o certifikátu - to je normální pro self-signed certifikáty.

### 2. Produkce s doménou

Použijte `Caddyfile.production`:

```bash
# 1. Upravte Caddyfile.production
nano caddy/Caddyfile.production
# Změňte:
# - mineralogy.yourdomain.com → vaše-domena.cz
# - your-email@example.com → váš email

# 2. Nahraďte výchozí Caddyfile
cp caddy/Caddyfile.production caddy/Caddyfile

# 3. Ujistěte se, že:
# - Doména směřuje na vaši IP (DNS A záznam)
# - Port 80 a 443 jsou otevřené (firewall, router)

# 4. Spusťte
docker-compose up -d

# 5. Sledujte získání certifikátu
docker-compose logs -f caddy
```

Caddy automaticky:
- Získá certifikát od Let's Encrypt
- Nastaví HTTPS
- Přesměruje HTTP → HTTPS
- Obnoví certifikát před vypršením

### 3. Lokální síť s vlastní CA (mkcert)

Pro validní certifikáty v lokální síti bez varování:

```bash
# 1. Instalace mkcert
# Linux:
wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert
sudo mv mkcert /usr/local/bin/

# macOS:
brew install mkcert

# 2. Instalace lokální CA
mkcert -install

# 3. Vygenerování certifikátu
cd caddy
mkcert mineralogy.local localhost 127.0.0.1 ::1 192.168.1.XXX

# 4. Vytvoření Caddyfile s custom certifikáty
cat > Caddyfile.custom <<EOF
mineralogy.local {
    tls mineralogy.local+4.pem mineralogy.local+4-key.pem
    
    handle /* {
        reverse_proxy frontend:3000
    }
    
    handle /api/* {
        reverse_proxy backend:8000
    }
    
    encode gzip
}
EOF

# 5. Použití
cp Caddyfile.custom Caddyfile
cd ..
docker-compose restart caddy
```

## Přizpůsobení konfigurace

### Přidání rate limitingu

Caddy má rate limiting v externím modulu. Pro základní rate limiting použijte firewall.

### Přidání basic auth

Pro ochranu API dokumentace:

```caddyfile
handle /docs* {
    basicauth {
        admin JDJhJDE0JExRdjNjMXlxQldWSHhrZDBMSEFrQ09ZejZUdHhNUUpxaE44L0xld1k1bEZqSmZYeTdySzlL
        # Vygenerujte hash: caddy hash-password --plaintext 'vase-heslo'
    }
    reverse_proxy backend:8000
}
```

### Vlastní security headers

Upravte sekci `header` v Caddyfile podle potřeby.

### Logging

Logy jsou ve volume `caddy_data`:

```bash
# Zobrazení logů
docker-compose exec caddy tail -f /var/log/caddy/access.log

# Nebo z hostu (pokud je namountováno)
tail -f /var/lib/docker/volumes/mineralogicky-denik_caddy_data/_data/log/access.log
```

## Reload konfigurace

Caddy podporuje zero-downtime reload:

```bash
# Po úpravě Caddyfile
docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Troubleshooting

### Certifikát se nezíská

```bash
# Zkontrolujte logy
docker-compose logs caddy

# Běžné problémy:
# - DNS neznamená na vaši IP
# - Port 80/443 není dostupný z internetu
# - Firewall blokuje
# - Rate limit Let's Encrypt (5 certifikátů/týden/doménu)
```

### Port už používán

```bash
# Zjistěte, co používá port
sudo lsof -i :80
sudo lsof -i :443

# Zastavte konfliktní službu nebo změňte porty v docker-compose.yml
```

### Problém s self-signed certifikátem

Pro důvěryhodný self-signed certifikát v prohlížeči:

1. Exportujte certifikát z Caddy
2. Importujte do systémových certifikátů
3. Nebo použijte mkcert (doporučeno)

## Srovnání s Nginx

| Vlastnost | Caddy | Nginx |
|-----------|-------|-------|
| Auto SSL | ✅ Ano | ❌ Manuální (certbot) |
| Konfigurace | ✅ Jednoduchá | ⚠️ Složitější |
| HTTP/3 | ✅ Ano | ⚠️ Experimentální |
| Performance | ✅ Velmi dobrý | ✅ Excelentní |
| Reload | ✅ Zero-downtime | ⚠️ Krátký výpadek |
| Moduly | ⚠️ Méně | ✅ Více |

## Reference

- [Caddy dokumentace](https://caddyserver.com/docs/)
- [Caddyfile syntax](https://caddyserver.com/docs/caddyfile)
- [Automatic HTTPS](https://caddyserver.com/docs/automatic-https)
