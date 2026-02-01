# Keycloak Setup Guide - Mineralogický deník

Tento návod vás provede nastavením Keycloak pro správu uživatelů aplikace Mineralogický deník.

## 1. Spuštění Keycloak

Keycloak se spustí automaticky s ostatními službami:

```bash
docker compose up -d
```

Keycloak bude dostupný na: **http://localhost:8080**

## 2. Přihlášení do Admin Console

1. Otevřete prohlížeč a přejděte na: http://localhost:8080
2. Klikněte na "Administration Console"
3. Přihlaste se s výchozími přihlašovacími údaji:
   - **Username**: `admin`
   - **Password**: `admin`

⚠️ **Důležité**: V produkci změňte heslo admina!

## 3. Vytvoření Realm

Realm je izolované prostředí pro uživatele a aplikace.

1. V levém horním rohu klikněte na dropdown "master"
2. Klikněte na "Create Realm"
3. Vyplňte:
   - **Realm name**: `mineralogy`
4. Klikněte "Create"

## 4. Vytvoření Client (aplikace)

Client reprezentuje vaši aplikaci.

1. V levém menu vyberte **Clients**
2. Klikněte "Create client"
3. **General Settings**:
   - **Client type**: OpenID Connect
   - **Client ID**: `mineralogy-app`
   - Klikněte "Next"
4. **Capability config**:
   - **Client authentication**: ON (zapněte)
   - **Authorization**: OFF
   - **Authentication flow**: 
     - ✅ Standard flow
     - ✅ Direct access grants
   - Klikněte "Next"
5. **Login settings**:
   - **Root URL**: `http://localhost:3000`
   - **Home URL**: `http://localhost:3000`
   - **Valid redirect URIs**: 
     - `http://localhost:3000/*`
     - `http://localhost/*`
   - **Valid post logout redirect URIs**: `http://localhost:3000/*`
   - **Web origins**: `*`
6. Klikněte "Save"

## 5. Získání Client Secret

1. V **Clients** najděte `mineralogy-app` a klikněte na něj
2. Přejděte na záložku **Credentials**
3. Zkopírujte hodnotu **Client secret**
4. Uložte ji do `.env` souboru:

```env
KEYCLOAK_CLIENT_SECRET=váš-client-secret-zde
```

## 6. Vytvoření Rolí

Role definují oprávnění uživatelů.

1. V levém menu vyberte **Realm roles**
2. Klikněte "Create role"
3. Vytvořte postupně tyto role:

### Role: user
- **Role name**: `user`
- **Description**: `Běžný uživatel s přístupem k základním funkcím`
- Klikněte "Save"

### Role: manager
- **Role name**: `manager`
- **Description**: `Manažer s možností správy tagů`
- Klikněte "Save"

### Role: administrator
- **Role name**: `administrator`
- **Description**: `Administrátor s plným přístupem`
- Klikněte "Save"

## 7. Vytvoření Prvního Admin Uživatele

1. V levém menu vyberte **Users**
2. Klikněte "Add user"
3. Vyplňte:
   - **Username**: `admin`
   - **Email**: `admin@mineralogy.local`
   - **First name**: `Admin`
   - **Last name**: `User`
   - **Email verified**: ON (zapněte)
4. Klikněte "Create"

### Nastavení hesla:

1. Zůstaňte na stránce právě vytvořeného uživatele
2. Přejděte na záložku **Credentials**
3. Klikněte "Set password"
4. Vyplňte:
   - **Password**: `admin123` (nebo jiné silné heslo)
   - **Password confirmation**: `admin123`
   - **Temporary**: OFF (vypněte, aby nemusel měnit heslo při prvním přihlášení)
5. Klikněte "Save"
6. Potvrďte v dialogu

### Přiřazení role administrator:

1. Zůstaňte na stránce uživatele admin
2. Přejděte na záložku **Role mapping**
3. Klikněte "Assign role"
4. V seznamu najděte a zaškrtněte roli **administrator**
5. Klikněte "Assign"

## 8. Vytvoření Dalších Uživatelů

Pro každého dalšího uživatele:

1. **Users** → "Add user"
2. Vyplňte username, email, jméno
3. "Create"
4. **Credentials** → "Set password" → nastavte heslo
5. **Role mapping** → "Assign role" → přiřaďte příslušnou roli (user, manager, nebo administrator)

## 9. Konfigurace aplikace

Ujistěte se, že máte správně nastavené environment variables:

### Backend (.env nebo docker-compose.yml):
```env
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=mineralogy
KEYCLOAK_CLIENT_ID=mineralogy-app
KEYCLOAK_CLIENT_SECRET=váš-client-secret
```

### Frontend (.env):
```env
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=mineralogy
REACT_APP_KEYCLOAK_CLIENT_ID=mineralogy-app
```

## 10. Test přihlášení

1. Restartujte aplikaci: `docker compose restart`
2. Otevřete frontend: http://localhost:3000
3. Zkuste se přihlásit s:
   - Username: `admin`
   - Password: `admin123`

## Přehled rolí a oprávnění

| Role | Oprávnění |
|------|-----------|
| **user** | Základní přístup - prohlížení a vytváření lokalit a nálezů |
| **manager** | Vše co user + správa tagů (vytváření, editace, mazání štítků) |
| **administrator** | Plný přístup - vše co manager + správa uživatelů |

## Časté problémy

### Keycloak není dostupný na localhost:8080
- Zkontrolujte, zda kontejner běží: `docker compose ps`
- Zkontrolujte logy: `docker compose logs keycloak`

### Nelze se přihlásit
- Zkontrolujte, že je heslo správně nastavené (záložka Credentials)
- Zkontrolujte, že "Email verified" je ON
- Zkontrolujte, že Client má správné redirect URIs

### 403 Forbidden po přihlášení
- Zkontrolujte, že uživatel má přiřazenou roli
- Ujistěte se, že role jsou správně nakonfigurovány v Realm roles

## Další kroky

Po úspěšném nastavení Keycloak můžete:
- Vytvořit více uživatelů s různými rolemi
- Nakonfigurovat email server pro potvrzení emailů
- Nastavit vlastní login theme
- Integrovat social login (Google, Facebook, atd.)
