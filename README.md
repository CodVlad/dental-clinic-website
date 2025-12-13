# ApexCare - Site de Rezervări Dentare

Site web modern pentru clinică stomatologică, construit cu Next.js, React, TypeScript și TailwindCSS.

## 🚀 Caracteristici

- Design responsive și modern
- Sistem de rezervări online
- Integrare cu Supabase pentru gestionarea datelor
- Secțiune de administrare
- Optimizat pentru toate dispozitivele (mobile, tablet, desktop)

## 📋 Cerințe

- Node.js 18+ 
- npm sau yarn
- Cont Supabase (pentru baza de date)

## 🛠️ Instalare

1. Clonează repository-ul:
```bash
git clone <repository-url>
cd rezervari-site
```

2. Instalează dependențele:
```bash
npm install
# sau
yarn install
```

3. Creează fișierul `.env.local` în root-ul proiectului:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Rulează serverul de dezvoltare:
```bash
npm run dev
# sau
yarn dev
```

Deschide [http://localhost:3000](http://localhost:3000) în browser.

## 🏗️ Build pentru Production

1. Construiește aplicația:
```bash
npm run build
# sau
yarn build
```

2. Rulează versiunea de production:
```bash
npm start
# sau
yarn start
```

## 📦 Deployment

### Vercel (Recomandat)

1. Conectează repository-ul la Vercel
2. Adaugă variabilele de mediu în setările proiectului:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automat la fiecare push

### Alte platforme

Aplicația poate fi deployată pe orice platformă care suportă Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform
- etc.

## 🔧 Configurare Supabase

1. Creează un proiect nou pe [Supabase](https://supabase.com)
2. Obține URL-ul și cheia anonimă din setările proiectului
3. Creează următoarele tabele în Supabase:

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
```

## 📁 Structura Proiectului

```
rezervari-site/
├── pages/
│   ├── index.tsx          # Pagina principală
│   ├── _app.tsx           # Configurare globală
│   └── admin/             # Secțiunea de administrare
├── public/                 # Fișiere statice (imagini, logo)
├── utils/                  # Utilitare (Supabase client, auth)
├── next.config.mjs         # Configurare Next.js
├── package.json            # Dependențe
└── tsconfig.json          # Configurare TypeScript
```

## 🎨 Tehnologii Utilizate

- **Next.js 15** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipare statice
- **TailwindCSS 4** - Stilizare
- **Supabase** - Backend și baza de date
- **Font Awesome** - Icoane
- **Animate.css** - Animații

## 📝 Scripturi Disponibile

- `npm run dev` - Rulează serverul de dezvoltare
- `npm run build` - Construiește aplicația pentru production
- `npm start` - Rulează versiunea de production
- `npm run lint` - Verifică codul pentru erori

## 🔒 Securitate

- Variabilele de mediu nu trebuie să fie commitate în git
- Folosește `.env.local` pentru variabile locale
- Configurarea Supabase trebuie să fie securizată

## 📞 Support

Pentru întrebări sau probleme, contactează echipa de dezvoltare.

## 📄 Licență

Acest proiect este proprietate privată.
