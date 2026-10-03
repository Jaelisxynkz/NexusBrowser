import re

# Read the file
with open('electron/main.cjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the broken createPage section
# The file has a duplicate function definition that needs to be cleaned up
pattern = r'const createPage = \(id, url\) => \{[^}]*?if \(pages\.has\(id\)\) return pages\.get\(id\);[^}]*?const view = new BrowserView\(\{'

# Simpler approach: find the first occurrence of the function and replace the entire block
# Let's find the line numbers
lines = content.split('\n')
start_idx = None
end_idx = None
brace_count = 0

for i, line in enumerate(lines):
    if 'const createPage = (id, url) => {' in line and start_idx is None:
        start_idx = i
        brace_count = 0
    if start_idx is not None:
        brace_count += line.count('{') - line.count('}')
        if brace_count <= 0 and i > start_idx:
            end_idx = i
            break

if start_idx is not None and end_idx is not None:
    # Replace the entire function
    new_function = '''const createPage = (id, url) => {
    // BROWSERVIEW DISABLED: using <webview> DOM element in renderer.
    // The native BrowserView always paints above HTML content, making the
    // shell chrome (tabs, toolbar, sidebar) invisible behind websites.
    if (pages.has(id)) return pages.get(id);
    pages.set(id, { id, url, view: null });
    return pages.get(id);
  };'''
    
    lines[start_idx:end_idx+1] = [new_function]
    content = '\n'.join(lines)

# Also fix attachPage
pattern = r'const attachPage = \(id\) => \{.*?clampViewBounds\(\);\s*\};'
new_attach = '''const attachPage = (id) => {
    // BROWSERVIEW DISABLED: no-op. Renderer handles webview.
    const page = pages.get(id);
    if (!page) return;
    activePageId = id;
  };'''
content = re.sub(pattern, new_attach, content, flags=re.DOTALL)

# Also fix clampViewBounds
pattern = r'const clampViewBounds = \(\) => \{.*?page\.view\.setBounds.*?;\s*\};'
new_clamp = '''const clampViewBounds = () => {
    // BROWSERVIEW DISABLED: no-op. Renderer handles webview bounds.
  };'''
content = re.sub(pattern, new_clamp, content, flags=re.DOTALL)

# Write the file back
with open('electron/main.cjs', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed main.cjs - BrowserView disabled, using webview DOM element')
