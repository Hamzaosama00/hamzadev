# Hamza — Cinematic Developer Portfolio

An immersive, scroll-driven 3D developer portfolio built with Next.js, React Three Fiber, GSAP, and Lenis. Features a cinematic camera that flies through 6 scenes, post-processing bloom, adaptive performance tiers, a full case study modal, and a working contact form that delivers messages to your inbox via Resend.

---

## 📧 Contact Form Setup (IMPORTANT — read before deploying)

The contact form sends emails to **hamzaa77005@gmail.com** using [Resend](https://resend.com). You need to add ONE environment variable for it to work:

### Get your free Resend API key
1. Go to https://resend.com → sign up (free, no credit card)
2. Dashboard → **API Keys** → **Create API Key** → copy the `re_...` key
3. That's it — you get 100 emails/day free

### Add the key to Vercel
- Vercel dashboard → your project → **Settings** → **Environment Variables**
- Add: `RESEND_API_KEY = re_your_key_here`
- **Redeploy** (env vars don't take effect until next deploy)

### Optional env vars
- `CONTACT_EMAIL` (default: `hamzaa77005@gmail.com`) — where messages are delivered
- `RESEND_FROM_EMAIL` (default: `Portfolio <onboarding@resend.dev>`) — sender address

---

## 🚀 Deploy to Vercel

### Option A — Drag & Drop (fastest)
1. Unzip this folder
2. Go to https://vercel.com/new
3. Drag the unzipped folder onto the page
4. Click **Deploy**
5. Add `RESEND_API_KEY` in Settings → Environment Variables → Redeploy

### Option B — GitHub (recommended for updates)
1. Unzip, then push to a GitHub repo
2. Go to https://vercel.com/new → Import Git Repository
3. Add `RESEND_API_KEY` env var → Deploy
4. Every future `git push` auto-deploys

### Option C — Vercel CLI
```bash
npm i -g vercel
cd hamza-portfolio
vercel
```

---

## 💻 Run Locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your RESEND_API_KEY
npm run dev
```
Open http://localhost:3000 — requires Node.js 18.18+

---

## 🎨 Customization

### Update contact info
Edit `src/components/portfolio/scenes/ContactSection.tsx`:
```ts
const EMAIL = "hamzaa77005@gmail.com";
const WHATSAPP_NUMBER = "03182772524";
const WHATSAPP_INTL = "923182772524";
```

### Update content
All text lives in `src/components/portfolio/scenes/` — one file per section.

### Update colors
Edit `src/app/globals.css` → `:root` variables.

---

## 📝 Notes

- Contact form: messages go to hamzaa77005@gmail.com via Resend (requires RESEND_API_KEY)
- WhatsApp: links to https://wa.me/923182772524
- Davaam demo: links to https://davaam.vercel.app
- LinkedIn: update with your profile URL in ContactSection.tsx

## 📄 License
MIT — free to use and modify.
