# Přehled změn v aplikaci Mineralogický deník

## Datum: 30. ledna 2026

### Nové funkce

#### 1. Systém rolí uživatelů
- **Administrator**: Plný přístup, správa uživatelů, přidělování rolí
- **Manager**: Může spravovat tagy (kategorie lokalit, minerálů, regionů)
- **User**: Běžný uživatel s přístupem k vlastním datům

#### 2. Systém tagů (štítků)
- Hierarchické tagy s podporou kategorií
- Kategorie:
  - `location_type`: Typ lokality (kamenolom, důl, spací místo, atd.)
  - `find_category`: Kategorie nálezů/minerálů
  - `region`: Geografická oblast (Krušné hory, Český les, Šumava, atd.)
- Tagy lze přiřadit k lokalitám i k nálezům
- Podpora hierarchických tagů (např. Krušné hory > konkrétní lokalita)

#### 3. Datum návštěvy - nepovinné
- Datum návštěvy již není povinné při vytváření lokality
- Lze vyplnit později v detailním pohledu
- Uživatelé mohou lokality mapovat předem (stav "planned") a datum vyplnit po návštěvě

#### 4. Přepínání mapových vrstev
- **Standardní mapa**: OpenStreetMap
- **Geologická mapa**: USGS geologická vrstva
- **Satelitní mapa**: ESRI World Imagery
- Přepínač vrstev v pravém horním rohu mapy

#### 5. Změna registrace
- **Veřejná registrace odstraněna**
- Pouze administrátor může vytvářet nové uživatelské účty
- Administrátor spravuje role uživatelů

### Backend změny

#### Modely (models.py)
- Přidán `UserRole` enum (user, manager, administrator)
- Přidán model `Tag` s podporou hierarchie
- Upraveno `User`: místo `is_admin` boolean nyní pole `role`
- Upraveno `Location`: přidána M:N vazba na tagy
- Upraveno `Find`: přidána M:N vazba na tagy

#### API endpointy

**Nové endpointy:**
- `POST /api/auth/users` - Vytvoření uživatele (pouze admin)
- `GET /api/auth/users` - Seznam uživatelů (pouze admin)
- `PATCH /api/auth/users/{id}` - Aktualizace uživatele (pouze admin)
- `DELETE /api/auth/users/{id}` - Smazání uživatele (pouze admin)
- `GET /api/tags` - Seznam tagů
- `POST /api/tags` - Vytvoření tagu (manager nebo admin)
- `GET /api/tags/{id}` - Detail tagu
- `PATCH /api/tags/{id}` - Aktualizace tagu (manager nebo admin)
- `DELETE /api/tags/{id}` - Smazání tagu (manager nebo admin)

**Odstraněné endpointy:**
- `POST /api/auth/register` - Veřejná registrace odstraněna

**Upravené endpointy:**
- Všechny location a find endpointy nyní podporují `tag_ids` pole

#### Databáze
- Nová tabulka `tags`
- Nové spojovací tabulky: `location_tags`, `find_tags`
- Změna v tabulce `users`: `is_admin` -> `role`
- Nový enum `user_role`
- Výchozí tagy v init.sql

### Frontend změny

#### Komponenty
- **TagSelector**: Nová komponenta pro výběr tagů s autocomplete
- **LocationFormDialog**: Přidána podpora tagů, datum nepovinné
- **MapPage**: Přidán přepínač mapových vrstev

#### Typy (types.ts)
- Přidán `UserRole` type
- Přidáno `Tag` interface
- Přidán `UserCreate` a `UserUpdate` interface
- Přidán `TagCreate` a `TagUpdate` interface
- Aktualizace `User`: `is_admin` -> `role`
- Aktualizace `Location`, `LocationCreate`, `Find`: přidány tagy

#### API klienti
- Nové `usersAPI` pro správu uživatelů
- Nové `tagsAPI` pro správu tagů
- Odstraněn `register` z `authAPI`

#### Stránky
- **LoginPage**: Odstraněn odkaz na registraci
- **RegisterPage**: Lze odstranit (již se nepoužívá)
- **MapPage**: Přepínač mapových vrstev

### Konfigurace

#### MAP_CONFIG
```typescript
LAYERS: {
  STANDARD: { ... },
  GEOLOGICAL: { ... },
  SATELLITE: { ... }
}
```

### Migrace

Pro migraci existující databáze:

1. **Zálohujte data**
2. **Restartujte databázi** s novým init.sql nebo proveďte manuální migrace:
   ```sql
   -- Přidat nový enum
   CREATE TYPE user_role AS ENUM ('user', 'manager', 'administrator');
   
   -- Přidat nový sloupec
   ALTER TABLE users ADD COLUMN role user_role DEFAULT 'user';
   
   -- Migrovat existující adminy
   UPDATE users SET role = 'administrator' WHERE is_admin = true;
   
   -- Odstranit starý sloupec
   ALTER TABLE users DROP COLUMN is_admin;
   
   -- Vytvořit tabulky pro tagy
   -- (viz database/init.sql)
   ```

### Testování

Pro otestování nových funkcí:
1. Přihlaste se jako admin (username: admin, password: admin123)
2. Vytvořte nové uživatele různých rolí
3. Vytvořte tagy různých kategorií
4. Vytvořte lokality s tagy
5. Vyzkoušejte přepínání mapových vrstev

### Bezpečnostní poznámky

⚠️ **DŮLEŽITÉ:**
- Změňte výchozí heslo admina v produkci
- Zabezpečte admin endpointy
- Ověřte, že role jsou správně kontrolovány na backendu

### Dokumentace pro uživatele

#### Pro administrátory:
1. Správa uživatelů přes `/api/auth/users`
2. Přidělování rolí při vytváření nebo úpravě uživatele
3. Možnost mazání uživatelů (kromě sebe sama)

#### Pro managery:
1. Přidávání a úprava tagů přes UI (bude třeba dodat)
2. Organizace tagů do hierarchií
3. Správa kategorií

#### Pro běžné uživatele:
1. Přidávání lokalit bez nutnosti vyplňovat datum
2. Přiřazování tagů k lokalitám při vytváření nebo úpravě
3. Přepínání mezi mapovými vrstvami
4. Vyplnění data návštěvy později v detailu lokality

### TODO (další vylepšení)

- [ ] UI stránka pro správu uživatelů (pro admina)
- [ ] UI stránka pro správu tagů (pro managera/admina)
- [ ] Filtrace lokalit podle tagů
- [ ] Zobrazení hierarchie tagů ve stromové struktuře
- [ ] Exporty včetně tagů
- [ ] Statistiky podle tagů
- [ ] Import tagů z CSV
