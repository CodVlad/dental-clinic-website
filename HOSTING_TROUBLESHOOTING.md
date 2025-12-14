# 🔧 Ghid Complet de Troubleshooting pentru Hosting

## ✅ Verificări Pre-Deployment

### 1. Build Local
```bash
# Șterge cache-ul
rm -rf .next node_modules/.cache

# Reinstalează dependențele
npm install

# Build pentru production
npm run build

# Testează production build
npm start
```

### 2. Verificare Variabile de Mediu

**IMPORTANT:** Toate variabilele trebuie să înceapă cu `NEXT_PUBLIC_` pentru a fi accesibile în browser.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Verificare:**
- Nu există spații în jurul valorilor
- Nu există ghilimele în jurul valorilor
- URL-urile sunt complete (cu https://)

### 3. Verificare Assets

Toate imaginile locale trebuie să fie în `public/`:
- ✅ `public/logo.png`
- ✅ `public/doctor.png`
- ✅ `public/doctorI1.png`
- ✅ `public/doctorp.png`

## 🚨 Probleme Comune și Soluții

### Problema 1: "Module not found" sau "Cannot find module"

**Cauză:** Dependențe lipsă sau cache corupt

**Soluție:**
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Problema 2: "Environment variables not found"

**Cauză:** Variabilele de mediu nu sunt setate corect

**Soluție:**
1. Verifică că variabilele încep cu `NEXT_PUBLIC_`
2. Pe Vercel: Settings → Environment Variables
3. Rebuild după adăugarea variabilelor

### Problema 3: "Image optimization error"

**Cauză:** Domeniul imaginii nu este în `next.config.mjs`

**Soluție:**
Adaugă domeniul în `next.config.mjs` → `images.remotePatterns`

### Problema 4: "Supabase connection failed"

**Cauză:** URL sau cheie incorectă

**Soluție:**
1. Verifică în Supabase Dashboard → Settings → API
2. Copiază exact URL-ul și cheia
3. Verifică că nu există spații

### Problema 5: "Build timeout" sau "Build failed"

**Cauză:** Build prea lent sau erori de compilare

**Soluție:**
1. Verifică erorile în build logs
2. Reduce dimensiunea assets-urilor
3. Verifică că nu există erori de TypeScript

### Problema 6: "404 Not Found" pentru pagini

**Cauză:** Routing incorect sau fișiere lipsă

**Soluție:**
1. Verifică că toate paginile sunt în `pages/`
2. Verifică că `_app.tsx` există
3. Verifică că nu există conflicte între App Router și Pages Router

### Problema 7: "Styles not loading"

**Cauză:** CSS-ul nu este importat corect

**Soluție:**
1. Verifică că `styles/globals.css` există
2. Verifică importul în `pages/_app.tsx`
3. Verifică că TailwindCSS este configurat corect

## 🔍 Checklist Complet Pre-Deployment

### Configurare
- [ ] `package.json` are toate dependențele
- [ ] `next.config.mjs` este configurat corect
- [ ] `tsconfig.json` este valid
- [ ] `.gitignore` exclude fișierele corecte

### Variabile de Mediu
- [ ] `NEXT_PUBLIC_SUPABASE_URL` este setat
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` este setat
- [ ] Variabilele sunt corecte (fără spații, ghilimele)

### Build
- [ ] `npm run build` funcționează fără erori
- [ ] `npm start` funcționează local
- [ ] Nu există warning-uri critice

### Assets
- [ ] Toate imaginile locale sunt în `public/`
- [ ] Toate domeniile externe sunt în `next.config.mjs`
- [ ] Logo-ul și imaginile doctorilor există

### Funcționalitate
- [ ] Site-ul se încarcă corect
- [ ] Meniul mobil funcționează
- [ ] Formularele funcționează
- [ ] Conexiunea cu Supabase funcționează

## 🌐 Configurare pe Platforme Specifice

### Vercel

1. **Environment Variables:**
   - Mergi la Project Settings → Environment Variables
   - Adaugă `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Selectează "Production", "Preview", și "Development"

2. **Build Settings:**
   - Framework Preset: Next.js (auto-detectat)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Deploy:**
   - Push pe branch-ul `main` → Deploy automat
   - Sau manual: Deployments → Deploy

### Netlify

1. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables:**
   - Site settings → Environment variables
   - Adaugă variabilele cu prefix `NEXT_PUBLIC_`

### Railway

1. **Deploy:**
   - Conectează repository-ul
   - Railway detectează automat Next.js

2. **Environment Variables:**
   - Settings → Variables
   - Adaugă variabilele

## 📊 Verificare Post-Deployment

După deployment, verifică:

1. **Site-ul se încarcă:**
   - Accesează URL-ul de deployment
   - Verifică că nu există erori în consolă

2. **Toate paginile funcționează:**
   - Homepage
   - Toate secțiunile (scroll smooth)
   - Paginile admin

3. **Funcționalități:**
   - Formularul de rezervare
   - Conexiunea cu Supabase
   - Meniul mobil

4. **Responsive:**
   - Mobile
   - Tablet
   - Desktop

## 🆘 Contact și Suport

Dacă întâmpini probleme:
1. Verifică logs-urile de build
2. Verifică console-ul browser-ului pentru erori
3. Verifică Network tab pentru request-uri eșuate
4. Consultă documentația Next.js: https://nextjs.org/docs

## 📝 Note Importante

- **Nu commită `.env.local`** - este în `.gitignore`
- **Rebuild după modificarea variabilelor** de mediu
- **Verifică logs-urile** pentru detalii despre erori
- **Testează local** înainte de deployment

