# 🚀 Quick Start - Deployment

## Pași Rapizi pentru Deployment

### 1. Variabile de Mediu (OBLIGATORIU)

Creează fișierul `.env.local` în root-ul proiectului:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Unde găsești aceste valori:**
- Supabase Dashboard → Settings → API
- Copiază "Project URL" și "anon public key"

### 2. Testare Locală

```bash
npm install
npm run build
npm start
```

### 3. Deployment pe Vercel

1. Push codul pe GitHub
2. Mergi pe [vercel.com](https://vercel.com)
3. "Add New Project" → Selectează repository-ul
4. Adaugă variabilele de mediu în Environment Variables
5. Click "Deploy"

**Gata!** Site-ul va fi live în câteva minute.

## 📚 Documentație Completă

- `README.md` - Documentație generală
- `DEPLOYMENT.md` - Ghid detaliat de deployment
- `CHECKLIST.md` - Checklist complet pre-deployment

## ⚡ Comenzi Utile

```bash
npm run dev      # Development server
npm run build    # Build pentru production
npm start        # Production server
npm run lint     # Verifică erori
```

## ✅ Verificare Finală

- [ ] Build funcționează (`npm run build`)
- [ ] Variabilele de mediu sunt setate
- [ ] Tabelele Supabase sunt create
- [ ] Toate imaginile sunt în `public/`

## 🆘 Ajutor

Vezi `DEPLOYMENT.md` pentru instrucțiuni detaliate și troubleshooting.

