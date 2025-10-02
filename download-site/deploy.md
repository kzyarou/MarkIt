# Deployment Options for MarkIt Download Site

## Option 1: GitHub Pages (Recommended - Free)

1. Create a new repository on GitHub (e.g., `markit-download`)
2. Upload all files from the `download-site` folder to the repository
3. Go to repository Settings > Pages
4. Select "Deploy from a branch" and choose "main"
5. Your site will be available at `https://username.github.io/markit-download`

## Option 2: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Connect your repository or drag & drop the `download-site` folder
5. Deploy automatically

## Option 3: Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your repository or upload the `download-site` folder
5. Deploy with one click

## Option 4: Firebase Hosting (Free)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase init hosting` in the `download-site` folder
3. Configure as a static site
4. Run `firebase deploy`

## Option 5: Any Web Host

Upload all files from `download-site` folder to any web hosting service:
- Shared hosting (cPanel, etc.)
- VPS/Cloud servers
- CDN services

## Custom Domain (Optional)

After deployment, you can add a custom domain:
- `download.markit.app`
- `get.markit.com`
- `apk.markit.io`

## Testing Locally

To test the site locally:

```bash
# Using Python
cd download-site
python -m http.server 8000

# Using Node.js
npx serve download-site

# Using PHP
php -S localhost:8000 -t download-site
```

Then visit `http://localhost:8000`







