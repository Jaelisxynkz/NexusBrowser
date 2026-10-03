// fix-main.js - Patches main.cjs to disable BrowserView and use webview DOM element
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'electron', 'main.cjs');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the createPage function with a no-op that doesn't create BrowserView
const oldCreatePage = `const createPage = (id, url) => {
    if (pages.has(id)) return pages.get(id);
    const view = new BrowserView({`;

const newCreatePage = `const createPage = (id, url) => {
    // BROWSERVIEW DISABLED: using <webview> DOM element in renderer instead.
    // The native BrowserView always paints above HTML content, so the shell
    // chrome (tabs, toolbar, sidebar) was invisible/behind websites.
    if (pages.has(id)) return pages.get(id);
    pages.set(id, { id, url, view: null });
    return pages.get(id);
    // Dead code below - commented out to prevent BrowserView creation
    /*
    const view = new BrowserView({`;

content = content.replace(oldCreatePage, newCreatePage);

// Comment out the attachPage function body (it calls window.setBrowserView)
const oldAttachPage = `const attachPage = (id) => {
    const page = pages.get(id);
    if (!page) return;
    activePageId = id;
    window.setBrowserView(page.view);
    // Immediately clamp to safe bounds so the freshly-attached site cannot
    // cover any shell chrome. The renderer then refines via page-bounds.
    clampViewBounds();
  };`;

const newAttachPage = `const attachPage = (id) => {
    // BROWSERVIEW DISABLED: no-op. The renderer handles webview attachment.
    const page = pages.get(id);
    if (!page) return;
    activePageId = id;
    // window.setBrowserView(page.view); // DISABLED
    // clampViewBounds(); // DISABLED
  };`;

content = content.replace(oldAttachPage, newAttachPage);

// Comment out the clampViewBounds function body
const oldClampViewBounds = `const clampViewBounds = () => {
    if (activePageId == null) return;
    const page = pages.get(activePageId);
    if (!page?.view) return;
    const { width, height } = window.getBounds();
    // The shell chrome (tabs + toolbar) occupies the top ~60px. We hardcode a
    // safe minimum because we do not yet know the live offset — the renderer
    // also sends exact bounds via "nexus:page-bounds", which this guard is a
    // backstop for. Never let the view overlap the top chrome.
    const chromeTop = 60;
    const safeW = Math.max(0, Math.floor(width));
    const safeH = Math.max(0, Math.floor(height) - chromeTop);
    page.view.setBounds({ x: 0, y: chromeTop, width: safeW, height: safeH });
  };`;

const newClampViewBounds = `const clampViewBounds = () => {
    // BROWSERVIEW DISABLED: no-op. The renderer handles webview bounds.
    // The native BrowserView always paints above HTML content, so clamping
    // bounds didn't help - the shell chrome was still behind the view.
  };`;

content = content.replace(oldClampViewBounds, newClampViewBounds);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched main.cjs - BrowserView disabled, using webview DOM element');
