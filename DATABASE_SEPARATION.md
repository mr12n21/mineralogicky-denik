# Separace databází - Mineralogický deník

## Přehled

Tento dokument popisuje možnosti oddělení hlavní aplikační databáze a Keycloak databáze pro lepší organizaci, bezpečnost a škálovatelnost.

## Současná konfigurace

Aktuálně aplikace používá:
- **PostgreSQL** pro hlavní aplikační data (lokality, fotky, nálezy, blog posty)
- **Keycloak** má vlastní vestavěnou H2 databázi (pro development) nebo může používat samostatnou PostgreSQL databázi

## Doporučená konfigurace pro produkci

### Varianta 1: Oddělené PostgreSQL instance (Doporučeno)

**Výhody:**
- Úplná izolace dat
- Nezávislé škálování
- Lepší bezpečnost
- Možnost různých backup strategií
- Nezávislé upgrade databází

**Konfigurace:**

#### 1. Upravit `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Hlavní aplikační databáze
  db:
    image: postgres:15-alpine
    container_name: mineralogy-db
    environment:
      POSTGRES_DB: mineralogy
      POSTGRES_USER: mineralogy_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - mineralogy-net
    restart: unless-stopped

  # Keycloak databáze (oddělená instance)
  keycloak-db:
    image: postgres:15-alpine
    container_name: mineralogy-keycloak-db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak_user
      POSTGRES_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
    volumes:
      - keycloak_postgres_data:/var/lib/postgresql/data
    networks:
      - mineralogy-net
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: mineralogy-keycloak
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak-db:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    command: start-dev
    depends_on:
      - keycloak-db
    networks:
      - mineralogy-net
    restart: unless-stopped

  backend:
    build: ./backend
    container_name: mineralogy-backend
    environment:
      DATABASE_URL: postgresql://mineralogy_user:${DB_PASSWORD}@db:5432/mineralogy
      SECRET_KEY: ${SECRET_KEY}
      KEYCLOAK_URL: http://keycloak:8080
    depends_on:
      - db
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - mineralogy-net
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  keycloak_postgres_data:
    driver: local

networks:
  mineralogy-net:
    driver: bridge
```

#### 2. Vytvořit `.env` soubor

```bash
# Hlavní databáze
DB_PASSWORD=strong_password_here

# Keycloak databáze
KEYCLOAK_DB_PASSWORD=another_strong_password

# Keycloak admin
KEYCLOAK_ADMIN_PASSWORD=admin_password

# Backend
SECRET_KEY=your_secret_key_here
```

### Varianta 2: Sdílená PostgreSQL instance, oddělené databáze

**Výhody:**
- Jednodušší správa
- Menší resource requirements
- Stále dobrá izolace na úrovni databází

**Konfigurace:**

```yaml
  db:
    image: postgres:15-alpine
    container_name: mineralogy-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init-multi.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - mineralogy-net

  keycloak:
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://db:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
    depends_on:
      - db
```

**Vytvořit `database/init-multi.sql`:**

```sql
-- Vytvoření databáze a uživatele pro hlavní aplikaci
CREATE DATABASE mineralogy;
CREATE USER mineralogy_user WITH ENCRYPTED PASSWORD 'mineralogy_password';
GRANT ALL PRIVILEGES ON DATABASE mineralogy TO mineralogy_user;

-- Vytvoření databáze a uživatele pro Keycloak
CREATE DATABASE keycloak;
CREATE USER keycloak_user WITH ENCRYPTED PASSWORD 'keycloak_password';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;

-- Přepnout na mineralogy databázi a vytvořit schéma
\c mineralogy;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ... další tabulky
```

### Varianta 3: Cloudové řešení

Pro produkční nasazení zvažte:

1. **AWS:**
   - RDS PostgreSQL pro hlavní databázi
   - Samostatná RDS instance pro Keycloak
   - ECS/EKS pro kontejnery

2. **Azure:**
   - Azure Database for PostgreSQL
   - Azure Container Instances/AKS

3. **Google Cloud:**
   - Cloud SQL for PostgreSQL
   - Cloud Run/GKE

## Backup strategie

### Pro oddělenou konfiguraci

**Hlavní databáze:**
```bash
#!/bin/bash
# backup-main-db.sh
docker exec mineralogy-db pg_dump -U mineralogy_user mineralogy | gzip > backup-main-$(date +%Y%m%d-%H%M%S).sql.gz
```

**Keycloak databáze:**
```bash
#!/bin/bash
# backup-keycloak-db.sh
docker exec mineralogy-keycloak-db pg_dump -U keycloak_user keycloak | gzip > backup-keycloak-$(date +%Y%m%d-%H%M%S).sql.gz
```

**Automatický backup pomocí cron:**
```cron
# Denní backup v 2:00 ráno
0 2 * * * /path/to/backup-main-db.sh
0 3 * * * /path/to/backup-keycloak-db.sh

# Týdenní full backup v neděli
0 4 * * 0 /path/to/full-backup.sh
```

## Migrace z jedné databáze na dvě

### Krok 1: Backup současných dat
```bash
docker exec mineralogy-db pg_dump -U postgres mineralogy > backup-before-migration.sql
```

### Krok 2: Zastavit služby
```bash
docker compose down
```

### Krok 3: Upravit docker-compose.yml (podle Varianty 1)

### Krok 4: Spustit novou konfiguraci
```bash
docker compose up -d
```

### Krok 5: Obnovit data
```bash
cat backup-before-migration.sql | docker exec -i mineralogy-db psql -U mineralogy_user -d mineralogy
```

## Monitoring a údržba

### Kontrola velikosti databází

```sql
-- Připojit k PostgreSQL
SELECT 
    datname as database_name,
    pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname IN ('mineralogy', 'keycloak');
```

### Kontrola spojení

```bash
# Hlavní databáze
docker exec mineralogy-db psql -U mineralogy_user -d mineralogy -c "SELECT version();"

# Keycloak databáze
docker exec mineralogy-keycloak-db psql -U keycloak_user -d keycloak -c "SELECT version();"
```

## Bezpečnostní doporučení

1. **Používat silná hesla** - minimálně 20 znaků, kombinace písmen, čísel a speciálních znaků
2. **Pravidelné backupy** - automatizovat denní a týdenní backupy
3. **Šifrování** - použít šifrování pro backup soubory
4. **Omezit přístup** - databáze by měly být přístupné pouze z aplikační sítě
5. **Monitoring** - sledovat velikost databází a výkon
6. **Update** - pravidelně aktualizovat PostgreSQL a Keycloak

## Testování konfigurace

```bash
# Spustit v test režimu
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d

# Kontrola logů
docker compose logs -f db
docker compose logs -f keycloak-db
docker compose logs -f backend
docker compose logs -f keycloak

# Kontrola health endpointů
curl http://localhost:8000/health
curl http://localhost:8080/health
```

## Řešení problémů

### Keycloak nemůže připojit k databázi

```bash
# Zkontrolovat logy
docker compose logs keycloak

# Ověřit, že databáze běží
docker compose ps keycloak-db

# Testovat spojení
docker exec keycloak-db psql -U keycloak_user -d keycloak -c "SELECT 1;"
```

### Hlavní aplikace nemůže připojit k databázi

```bash
# Zkontrolovat connection string
docker compose exec backend env | grep DATABASE_URL

# Testovat spojení
docker exec mineralogy-db psql -U mineralogy_user -d mineralogy -c "SELECT COUNT(*) FROM users;"
```

## Reference

- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [Keycloak Database Setup](https://www.keycloak.org/server/db)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
