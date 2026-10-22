# VINCI STARS

A static birthday tribute site for Comedian Davinci cfrn. HTML, CSS and vanilla JS. No backend, no database, nothing stored.

## 1. Add the photos

Put your images in `assets/` using these exact names (JPG). Until a file exists, the site shows a neutral labelled placeholder.

| File | Where it appears | Suggested photo |
|---|---|---|
| `davinci-hero.jpg` | Hero cover (large, portrait) | Rose portrait, pink backdrop |
| `davinci-stage.jpg` | Tribute section (square-ish, black and white) | Stage photo with the crowd lights |
| `davinci-secondary.jpg` | "He's listening" wish section (4:5) | Hand-to-ear photo |
| `davinci-portrait.jpg` | Closing section (3:2, landscape) | Landscape shot looking down at his watch |

Tips
- Aim for 1600px on the long edge and keep each file under about 500 KB.
- Image crops are controlled in `styles.css` with the `--pos` variable on each photo (e.g. `.hero-photo{--pos:50% 28%}`). The first value is horizontal, the second vertical. Lower the second value to show more of the top of the photo.
- If you use the hand-to-ear photo, crop out the photographer's watermark or keep their permission in mind.
- Change names or paths in `index.html` (each `<img src="...">`).

## 2. Edit the money, account and copy

Open `script.js`. Everything editable is in the `CONFIG` block at the top: Star price, PalmPay account number and name, WhatsApp number, quick options, character limit, and `birthdayLabel`.

`birthdayLabel` is empty on purpose. Set it (for example `'12 March'`) once the real date is confirmed and it replaces "Birthday edition" in the hero and navigation.

Headline and section copy are plain text in `index.html`.

## 3. Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000. (Copy-to-clipboard works on `localhost` and on https sites; if it cannot copy, the number is selected for manual copying.)

## 4. Deploy

It is a static site, so any static host works.
- **Vercel / Netlify:** drag the `vinci-stars` folder into the dashboard, or connect a repo. No build command, publish directory is the project root.
- **GitHub Pages / Cloudflare Pages:** publish the root of the folder.

After deploying, update the `og:image` tag in `index.html` to the full address, for example `https://your-site.example/assets/davinci-hero.jpg`, so WhatsApp and social previews show the photo. Previews need an absolute https URL.

## How it behaves

- Stars total = Stars × the configured price, in whole naira.
- Choosing Stars never sends money. The visitor transfers it themselves in their own bank app.
- The confirmation form only builds a `wa.me` link. The visitor must press send in WhatsApp.
- If the amount typed differs from the Stars total, the visitor is asked to correct it or confirm it. The typed amount is never silently overwritten.
- The site never claims a payment is verified. Transfers are checked manually by a person.
- The birthday-wish form is separate and needs no payment details.
