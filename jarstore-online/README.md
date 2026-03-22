# 📦 JarStore

> Repository online di programmi Java con sistema di ruoli, revisione admin e anti-spam.

**Live:** [tpsit-demo-lab.vercel.app](https://tpsit-demo-lab.vercel.app)  
**Repo:** [github.com/CosmoUniverso/TpsitDemoLab](https://github.com/CosmoUniverso/TpsitDemoLab)

---

## ✨ Funzionalità

- 🔐 **Login con GitHub OAuth**
- 📤 **Carica programmi `.jar`** — messi in coda per revisione admin
- ✅ **Admin panel** — approva/rifiuta programmi e nuovi utenti
- 🛡️ **Anti-spam** basato su GitHub (non sull'IP, non aggirabile con VPN):
  - Account GitHub deve avere ≥ 5 giorni
  - Almeno 1 repository pubblico
  - Max 1 progetto in attesa di revisione alla volta
- 📊 **Monitor storage** con avviso automatico al raggiungimento dei limiti
- 📱 **Responsive** — ottimizzato per mobile e desktop

---

## 👥 Sistema ruoli

| Ruolo | Come si ottiene | Progetti approvati | In attesa |
|---|---|---|---|
| `pending` | Al primo login | 0 | — |
| `active` | Approvato dall'admin | max 2 | max 1 |
| `whitelisted` | Promosso dall'admin | max 5 | illimitati |
| `admin` | Promosso dal superadmin | illimitati | illimitati |
| `superadmin` | CosmoUniverso (fisso) | illimitati | illimitati |
| `banned` | Bannato dall'admin | 0 | — |

> I nuovi account ricevono un popup di benvenuto che spiega che devono attendere l'approvazione admin prima di poter caricare.

---

## 🔒 Limiti e sicurezza

- **Max 40 utenti** totali (esclusi i bannati)
- **Storage:** blocco automatico con margine di sicurezza a 850MB su 1GB gratuito
- **Superadmin** (`CosmoUniverso`) non può essere modificato, degradato o bannato da nessuno
- Solo il superadmin può promuovere/degradare altri admin

---

## 🏗️ Stack — 100% gratuito

| Servizio | Cosa fa | Limite piano free |
|---|---|---|
| Vercel | Frontend + API serverless | Illimitato |
| Supabase | PostgreSQL + Storage .jar | 500MB DB · 1GB Storage |
| GitHub OAuth | Autenticazione | Illimitato |

**Costo totale: 0€**

---

## 🚀 Setup

### 1. Supabase
1. Crea progetto su **supabase.com**
2. **SQL Editor** → incolla `supabase-schema.sql` → Run
3. **Storage** → New bucket → nome `jars` → NON spuntare Public
4. Copia URL, `anon key` e `service_role key`

### 2. GitHub OAuth App
1. **github.com/settings/developers** → New OAuth App
2. Homepage URL: `https://tpsit-demo-lab.vercel.app`
3. Callback URL: `https://tpsit-demo-lab.vercel.app/api/auth/callback`
4. Copia Client ID e Client Secret

### 3. Vercel
```bash
npm i -g vercel
cd jarstore-online
vercel
```

Variabili d'ambiente da impostare su Vercel:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_SECRET=stringa_random_32_caratteri
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
APP_URL=https://tpsit-demo-lab.vercel.app
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://tpsit-demo-lab.vercel.app
```

---

## 📁 Struttura progetto

```
jarstore-online/
├── api/
│   ├── _utils.js              ← helpers condivisi
│   ├── me.js                  ← GET profilo utente
│   ├── upload-url.js          ← POST presigned URL upload
│   ├── auth/
│   │   ├── github.js          ← redirect OAuth
│   │   └── callback.js        ← callback → JWT + limite utenti
│   ├── programs/
│   │   ├── index.js           ← GET programmi approvati
│   │   ├── submit.js          ← POST submission con tutti i controlli
│   │   └── download.js        ← GET URL firmato download
│   └── admin/
│       ├── queue.js           ← GET coda programmi + utenti pending
│       ├── review.js          ← POST approva/rifiuta programma
│       ├── users.js           ← GET/PATCH gestione utenti
│       ├── stats.js           ← GET statistiche + storage
│       └── contributors.js   ← GET lista admin pubblica
└── src/
    ├── pages/
    │   ├── Login.jsx          ← login con messaggi errore dettagliati
    │   ├── Home.jsx           ← lista programmi + popup benvenuto
    │   ├── Submit.jsx         ← upload diretto a Supabase + campo collaboratori
    │   ├── Admin.jsx          ← coda unificata + utenti + stats storage
    │   ├── Contributors.jsx   ← contributori + admin live da DB
    │   └── AuthCallback.jsx
    └── components/
        ├── Navbar.jsx         ← responsive mobile
        └── ProgramCard.jsx    ← mostra uploader e collaboratori
```

---

## 👥 Contributori

| | Username | Ruolo |
|---|---|---|
| <img src="https://github.com/CosmoUniverso.png" width="20"/> | [@CosmoUniverso](https://github.com/CosmoUniverso) | Lead Developer & Superadmin |
| <img src="https://github.com/gabrielerada07.png" width="20"/> | [@gabrielerada07](https://github.com/gabrielerada07) | Collaboratore |
