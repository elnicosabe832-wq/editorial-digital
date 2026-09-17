# ED/IA — Editorial Digital

SaaS de editorial digital con IA. Diseño Nothing Phone: fondo `#0a0a0a`, tipografía mono/dot-matrix, bordes de 1px y acento rojo `#d71921`.

Sprint 1: lienzo de escritura gratis (Tiptap), importación `.docx` / `.txt` / `.pdf`, login (email Premium o Google) y prueba de 14 días. IA editorial (Supervisor / Autopilot) con motor local ED/IA si no hay clave de modelo.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Lucide Icons + Framer Motion
- Supabase (PostgreSQL, Auth, RLS)
- Tiptap
- Vercel + GitHub

## Arranque local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El editor está en `/editor` y no exige cuenta.

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xakcrumjcpyrkxhkhhvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

Sin clave de Anthropic u OpenAI, la IA usa un **motor local** de claridad/estilo. Con `ANTHROPIC_API_KEY` (preferido) u `OPENAI_API_KEY` pasa a Claude o GPT.

Proyecto Supabase de este sprint: `Editorial Digital` (`xakcrumjcpyrkxhkhhvq`, `eu-west-1`). La migración `supabase/migrations/20260910180000_init_profiles_and_manuscripts.sql` ya está aplicada: perfiles con trial de 14 días y manuscritos con RLS.

Login de prueba (Premium): `premium@ed-ia.app` en `/login`. Escribir en `/editor` no exige cuenta. La IA sí.

## Google OAuth (opcional; el email ya entra)

1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web).
2. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://tu-dominio.vercel.app`
3. Authorized redirect URIs:
   - `https://xakcrumjcpyrkxhkhhvq.supabase.co/auth/v1/callback`
4. Supabase Dashboard → Authentication → Providers → Google → Enable, pega Client ID y Secret.
5. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (en producción, la URL de Vercel)
   - Redirect URLs: `http://localhost:3000/auth/callback` y `https://tu-dominio.vercel.app/auth/callback`

Al primer login se crea `profiles` con `plan = trial` y `trial_ends_at = now() + 14 days`. Escribir en el canvas sigue siendo gratis sin cuenta (borrador en `localStorage`).

## Primer push y deploy en Vercel

```bash
git add .
git commit -m "feat: sprint 1 editor, auth google y trial 14d"
git remote add origin https://github.com/TU_USER/editorial-digital.git
git push -u origin main
```

En Vercel: Import Git Repository, framework Next.js, y añade las mismas env vars. `NEXT_PUBLIC_SITE_URL` debe ser la URL de producción. Después actualiza Site URL y Redirect URLs en Supabase.

No subas `.env.local`.

## Rutas

| Ruta | Qué hace |
| --- | --- |
| `/` | Landing Nothing Tech |
| `/login` | Email Premium o Google OAuth |

| `/editor` | Lienzo + IA editorial |
| `/auth/callback` | Intercambio del code OAuth |
| `/api/import` | Parseo de .docx / .txt / .pdf |
| `/api/editorial` | Pasada Autopilot / Supervisor |
