# Universitet Navigatsiya Tizimi - Frontend

Universitet binolari uchun zamonaviy navigatsiya tizimi. React, TypeScript va Vite asosida qurilgan.

## 🚀 Xususiyatlar

- 📍 Interaktiv xarita tahrirlash
- 🔍 Xona va manzil qidiruvi
- 🧭 Yo'nalish ko'rsatish
- 🖥️ Kiosk rejimi
- 📱 PWA qo'llab-quvvatlash
- 🌙 Dark/Light mavzular

## 📦 O'rnatish

```bash
# Bog'liqliklarni o'rnatish
npm install

# Development server
npm run dev

# Production build
npm run build

# Testlarni ishga tushirish
npm run test
```

## 🛠️ Texnologiyalar

- **React 18** - UI framework
- **TypeScript** - Statik tipizatsiya
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Fabric.js** - Canvas manipulation
- **React Router** - Routing
- **React Query** - Data fetching
- **Zod** - Validatsiya
- **Sentry** - Error monitoring

## 📁 Loyiha Strukturasi

```
src/
├── components/     # Qayta ishlatiladigan komponentlar
├── pages/          # Sahifa komponentlari
├── lib/            # Yordamchi funksiyalar
│   ├── api/        # API client
│   ├── validations/# Zod schemalar
│   └── ...
├── hooks/          # Custom React hooks
└── types/          # TypeScript tipalari
```

## 🔧 Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Universitet Navigatsiya
VITE_ENV=development

# .env.production
VITE_API_URL=https://map.ranch.university/api/
VITE_SENTRY_DSN=your-sentry-dsn
VITE_APP_VERSION=1.0.0
```

## 🌐 Netlify Deploy

- `netlify.toml` qo'shilgan (build: `npm run build`, publish: `dist`)
- SPA route redirect yoqilgan (`/* -> /index.html`)
- Production API URL: `https://map.ranch.university/api/`

## 📝 Sahifalar

| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Qavatlar | `/floors` | Qavatlarni boshqarish |
| Tahrirlash | `/floors/:id/edit` | Xarita tahrirlash |
| Nuqtalar | `/waypoints` | Yo'l nuqtalarini boshqarish |
| Xonalar | `/rooms` | Xonalarni boshqarish |
| Kiosklar | `/kiosks` | Kiosklarni boshqarish |
| Navigatsiya | `/navigation` | Test navigatsiya |
| Kiosk | `/kiosk` | Ommaviy kiosk interfeysi |
| Sozlamalar | `/settings` | Tizim sozlamalari |

## 🧪 Testlar

```bash
# Barcha testlarni ishga tushirish
npm run test

# Watch rejimida
npm run test:watch

# Coverage hisoboti
npm run test:coverage
```

## 📊 Build

```bash
# Production build
npm run build

# Build natijalarini ko'rish
npm run preview
```

## 🔒 Xavfsizlik

- Input sanitizatsiyasi (XSS himoyasi)
- Zod validatsiyasi
- Error boundary
- CORS sozlamalari

## 📈 Monitoring

- Sentry error tracking
- Web Vitals (LCP, CLS, INP)
- Performance metrics

## 📄 Litsenziya

MIT
