# fluffyaiapps.com — Fluffy AI Apps website

A fast static website: plain HTML, CSS and JavaScript. No framework, no build step, no third-party scripts, fonts or trackers. About 87 KB over the wire for the whole home page (gzipped, fonts included).

```
index.html          Home: Hero, About, Expertise, Approach, Contact
privacy.html        Privacy Policy (covers the website and the contact form)
404.html            Not-found page
robots.txt, sitemap.xml, site.webmanifest, favicon.ico, CNAME
_headers            Security/cache headers for Netlify or Cloudflare Pages
vercel.json         The same headers for Vercel
assets/css/styles.css
assets/js/main.js
assets/fonts/       Fraunces (soft, subset) + Plus Jakarta Sans, self-hosted
assets/img/         Logo mark, favicons, app icons, social share image (og-image.png)
```

## Brand at a glance

| | Fluffy AI Apps | Beta AI Apps | MAK AI Apps |
|---|---|---|---|
| Base | Light porcelain `#FBF8F5`, one deep-plum chapter | Midnight `#05060A` | Ink `#0A0B0D` / paper |
| Accent | Pastel aurora: peach → rose → lilac → sky | Cobalt → aqua | Volt lime |
| Type | Fraunces (soft serif) + Plus Jakarta Sans | Manrope | Instrument Serif + Geist |
| Mark | Gradient cloud with an AI sparkle | Beta loop | MAK monogram |

All colours, radii and fonts are CSS variables at the top of `assets/css/styles.css`.

## Before going live — checklist

1. **Email.** Every address on the site is `afex@fluffyaiapps.com`. Make sure that mailbox exists. To use a different address, search-and-replace it in `index.html` and `privacy.html` (the form script reads it from the form's `data-email`).
2. **Contact form delivery.** In `index.html`, find `data-endpoint=""` on the `<form>` and paste a free [Formspree](https://formspree.io) form URL (`https://formspree.io/f/xxxxxxx`). Messages then arrive in your inbox directly.
   Until you do, the form still works: it validates and then opens the visitor's email app with the message filled in, addressed to `afex@fluffyaiapps.com`.
   The form has validation, length limits, a honeypot field, a minimum-time check and a 30-second resend throttle. The Content-Security-Policy only allows it to post to `formspree.io`.
3. **No invented content.** The site has no testimonials, statistics, client names or app portfolio. Add those only when they are real.
4. **Privacy Policy.** A general policy for a site with one contact form and no tracking. Ask a lawyer to review it for your jurisdiction.

## Deploying to fluffyaiapps.com

The domain's DNS is at Hostinger. Same setup as makaiapps.com (GitHub Pages):

1. Create a public repo (e.g. `mdgoaltech-web/fluffyaiapps.com`) and push the contents of this folder to `main`.
2. Repo → Settings → Pages → Deploy from branch `main` / root. The `CNAME` file sets the custom domain.
3. In Hostinger DNS for `fluffyaiapps.com`, remove the parking records and add:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www`: `mdgoaltech-web.github.io`
4. Once DNS resolves, GitHub issues the HTTPS certificate. Tick **Enforce HTTPS** in Pages settings.

Netlify, Cloudflare Pages or Vercel also work: upload this folder (no build command, output `/`), add the domain, follow the DNS records they show. They also apply `_headers` / `vercel.json`. On GitHub Pages the CSP comes from each page's `<meta>` tag.

## Previewing locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Links use root paths like `/assets/...`, so open the site through a server rather than double-clicking the file.
