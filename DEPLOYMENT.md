# Deploy Chess Application Online

This guide shows you how to host your chess application online for free.

## Option 1: GitHub Pages (Recommended)

### Steps:

1. **Create a GitHub account** (if you don't have one)
   - Go to https://github.com
   - Sign up for free

2. **Create a new repository**
   - Click "New repository"
   - Name it: `chess-game`
   - Make it Public
   - Click "Create repository"

3. **Upload your files**
   - Click "uploading an existing file"
   - Drag and drop ALL these files:
     - index.html
     - quick-start.html
     - styles.css
     - chess-engine.js
     - chess-ai.js
     - chess-ui.js
     - app.js
     - README.md
   - Click "Commit changes"

4. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://YOUR-USERNAME.github.io/chess-game/`

## Option 2: Netlify (Easiest - Drag & Drop)

### Steps:

1. **Go to Netlify**
   - Visit https://www.netlify.com
   - Sign up for free

2. **Deploy**
   - Click "Add new site" → "Deploy manually"
   - Drag the entire `chess 2026` folder
   - Your site will be live instantly!
   - You'll get a URL like: `https://random-name-12345.netlify.app`

## Option 3: Vercel (Fast & Professional)

### Steps:

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up for free

2. **Deploy**
   - Click "Add New" → "Project"
   - Import from GitHub or drag folder
   - Click "Deploy"
   - Live at: `https://your-project.vercel.app`

## Option 4: Simple HTTP Server (Local Network)

If you just want to test locally with a proper server:

### Using Python:
```bash
cd "e:\web\chess 2026"
python -m http.server 8000
```
Then open: http://localhost:8000

### Using Node.js:
```bash
cd "e:\web\chess 2026"
npx http-server
```

## Which Option Should You Choose?

- **GitHub Pages**: Best for permanent hosting, free custom domain
- **Netlify**: Easiest (just drag & drop), instant deployment
- **Vercel**: Fastest performance, great for sharing
- **HTTP Server**: Just for local testing

## No Backend Needed!

This chess application is **100% frontend** - it runs entirely in the browser:
- ✅ No server-side code needed
- ✅ No database needed
- ✅ No API needed
- ✅ Just HTML, CSS, and JavaScript

All the chess logic and AI runs in your browser!
