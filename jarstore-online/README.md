# 📦 JarStore Online

Repository di programmi Java con login GitHub, revisione admin, anti-spam.

**Stack — 100% gratuito:**
| Servizio  | Cosa fa                        | Piano gratuito |
|-----------|-------------------------------|----------------|
| Vercel    | Hosting frontend + API        | ∞ deploy       |
| Supabase  | PostgreSQL + Storage .jar     | 500MB DB, 1GB Storage |

---

## 🚀 Setup (15 minuti)

### 1. Supabase

1. Crea account su **supabase.com** → New project
2. **SQL Editor** → incolla tutto il contenuto di `supabase-schema.sql` → Run
3. **Storage** → New bucket → Nome: `jars` → NON spuntare "Public"
4. **Storage → Policies** → aggiungi policy per il bucket `jars`:

```sql
-- Permette upload autenticati (service_role bypassa le policies)
-- Le policies servono solo per l'anon key usata dal frontend
-- Poiché usiamo presigned URL con service_role, non servono policies extra
```

5. **Settings → API** → copia:
   - `URL` → `SUPABASE_URL` e `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

### 2. GitHub OAuth App

1. **github.com/settings/developers** → New OAuth App
2. Compila:
   - Homepage URL: `https://tuo-progetto.vercel.app`
   - Callback URL: `https://tuo-progetto.vercel.app/api/auth/callback`
3. Copia **Client ID** e **Client Secret**

---

### 3. Deploy su Vercel

```bash
# Installa Vercel CLI
npm i -g vercel

# Entra nella cartella del progetto
cd jarstore-online

# Deploy
vercel

# Imposta le variabili d'ambiente su Vercel Dashboard → Settings → Environment Variables:
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=stringa_random_32_caratteri
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
APP_URL=https://tuo-progetto.vercel.app
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://tuo-progetto.vercel.app

# Rideploy per applicare le variabili
vercel --prod
```

---

### 4. Aggiorna GitHub OAuth App

Vai su **github.com/settings/developers** → la tua app → aggiorna:
- **Authorization callback URL**: `https://tuo-progetto.vercel.app/api/auth/callback`

---

## 🛡️ Anti-spam

Il sistema blocca lo spam basandosi su GitHub (non sull'IP, aggirabile con VPN):

| Check                       | Valore         |
|-----------------------------|----------------|
| Età account GitHub          | ≥ 5 giorni     |
| Repository pubblici         | ≥ 1            |
| Max submission / 24h        | 2              |
| Max submission in pending   | 2              |
| Utenti in whitelist         | nessun limite  |

---

## 🔐 Permessi

| Azione                   | Utente | Verificato | Admin |
|--------------------------|--------|------------|-------|
| Vedere programmi         | ✅     | ✅         | ✅    |
| Scaricare .jar           | ✅     | ✅         | ✅    |
| Caricare programmi       | ✅*    | ✅         | ✅    |
| Revisione submission     | ❌     | ❌         | ✅    |
| Ban / whitelist utenti   | ❌     | ❌         | ✅    |
| Statistiche              | ❌     | ❌         | ✅    |

*Con limiti anti-spam

---

## 📁 Struttura

```
jarstore-online/
├── api/
│   ├── _utils.js            ← helpers condivisi
│   ├── me.js                ← GET /api/me
│   ├── upload-url.js        ← POST presigned URL per upload diretto
│   ├── auth/
│   │   ├── github.js        ← redirect GitHub OAuth
│   │   └── callback.js      ← callback OAuth → JWT
│   ├── programs/
│   │   ├── index.js         ← GET programmi approvati
│   │   ├── submit.js        ← POST nuova submission
│   │   └── download.js      ← GET URL firmato download
│   └── admin/
│       ├── queue.js         ← GET submission in attesa
│       ├── review.js        ← POST approva/rifiuta
│       ├── users.js         ← GET/PATCH gestione utenti
│       └── stats.js         ← GET statistiche
└── src/
    ├── pages/
    │   ├── Login.jsx
    │   ├── Home.jsx
    │   ├── Submit.jsx       ← upload diretto a Supabase
    │   ├── Admin.jsx        ← coda + utenti + stats
    │   ├── Contributors.jsx
    │   └── AuthCallback.jsx
    └── ...
```
