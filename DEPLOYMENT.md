# Ghid de Deployment

## 📋 Pregătire pentru Deployment

### 1. Variabile de Mediu

Creează un fișier `.env.local` în root-ul proiectului cu următoarele variabile:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Cum obții aceste valori:**
1. Mergi pe [Supabase Dashboard](https://app.supabase.com)
2. Selectează proiectul tău
3. Mergi la Settings > API
4. Copiază:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configurare Supabase

Creează următoarele tabele în Supabase SQL Editor:

```sql
-- Tabel pentru rezervări
CREATE TABLE reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nume TEXT NOT NULL,
  telefon TEXT NOT NULL,
  email TEXT,
  medic TEXT NOT NULL,
  data DATE NOT NULL,
  ora TIME NOT NULL,
  serviciu TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel pentru utilizatori admin
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexuri pentru performanță
CREATE INDEX idx_reservations_data ON reservations(data);
CREATE INDEX idx_reservations_medic ON reservations(medic);
```

### 3. Testare Locală

Înainte de deployment, testează build-ul local:

```bash
# Instalează dependențele
npm install

# Construiește aplicația
npm run build

# Testează versiunea de production
npm start
```

## 🚀 Deployment pe Vercel (Recomandat)

### Pasul 1: Pregătire
1. Asigură-te că ai un cont GitHub/GitLab/Bitbucket
2. Push codul pe repository

### Pasul 2: Conectare Vercel
1. Mergi pe [Vercel](https://vercel.com)
2. Sign in cu GitHub/GitLab/Bitbucket
3. Click pe "Add New Project"
4. Selectează repository-ul tău

### Pasul 3: Configurare
1. **Framework Preset**: Next.js (detectat automat)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### Pasul 4: Variabile de Mediu
În secțiunea "Environment Variables", adaugă:
- `NEXT_PUBLIC_SUPABASE_URL` = URL-ul proiectului Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Cheia anonimă Supabase

### Pasul 5: Deploy
1. Click "Deploy"
2. Așteaptă finalizarea build-ului
3. Site-ul va fi disponibil la URL-ul generat de Vercel

## 🌐 Deployment pe Alte Platforme

### Netlify
1. Conectează repository-ul
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Adaugă variabilele de mediu în Netlify Dashboard

### Railway
1. Conectează repository-ul
2. Railway detectează automat Next.js
3. Adaugă variabilele de mediu în Settings > Variables

### DigitalOcean App Platform
1. Conectează repository-ul
2. Selectează "Next.js" ca tip de app
3. Adaugă variabilele de mediu în Settings > App-Level Environment Variables

## ✅ Checklist Pre-Deployment

- [ ] Toate dependențele sunt instalate (`npm install`)
- [ ] Build-ul funcționează fără erori (`npm run build`)
- [ ] Variabilele de mediu sunt configurate
- [ ] Tabelele Supabase sunt create
- [ ] Imagini și assets sunt în folderul `public/`
- [ ] Nu există erori de linter (`npm run lint`)
- [ ] Testat local cu `npm start`

## 🔧 Troubleshooting

### Build Errors
- Verifică că toate dependențele sunt în `package.json`
- Rulează `npm install` din nou
- Verifică erorile în consolă

### Variabile de Mediu
- Asigură-te că variabilele încep cu `NEXT_PUBLIC_` pentru a fi accesibile în browser
- Verifică că nu există spații în jurul valorilor
- Rebuild aplicația după modificarea variabilelor

### Supabase Connection
- Verifică că URL-ul și cheia sunt corecte
- Verifică că tabelele există în Supabase
- Verifică că RLS (Row Level Security) este configurat corect

## 📞 Support

Pentru probleme de deployment, verifică:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

