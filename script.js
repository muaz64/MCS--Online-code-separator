const inputArea = document.getElementById('inputArea');
const resultsArea = document.getElementById('resultsArea');
const processBtn = document.getElementById('processBtn');
const previewFrame = document.getElementById('preview-frame');

let data = { html: '', css: '', js: '' };

function performExtraction() {
    const raw = inputArea.value.trim();
    if(!raw) {
        showToast("Please enter some code first!", "error");
        return;
    }

    // Extract CSS
    const styleMatch = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    data.css = styleMatch.map(m => m[1].trim()).join('\n\n');

    // Extract JS
    const scriptMatch = [...raw.matchAll(/<script(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)];
    data.js = scriptMatch.map(m => m[1].trim()).join('\n\n');

    // Clean HTML
    let cleanHtml = raw;
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '<!-- Styles Extracted -->');
    cleanHtml = cleanHtml.replace(/<script(?![^>]*\ssrc\s*=)[^>]*>[\s\S]*?<\/script>/gi, '<!-- Scripts Extracted -->');
    data.html = cleanHtml.trim();

    updateDisplay();
    resultsArea.classList.remove('opacity-40', 'pointer-events-none');
    showToast("Code separated successfully!");
}

function updateDisplay() {
    document.getElementById('output-html').textContent = data.html || "No HTML found";
    document.getElementById('output-css').textContent = data.css || "No CSS found";
    document.getElementById('output-js').textContent = data.js || "No JavaScript found";

    document.getElementById('html-stats').innerText = `${data.html.split('\n').length} lines`;
    document.getElementById('css-stats').innerText = `${data.css.split('\n').length} lines`;
    document.getElementById('js-stats').innerText = `${data.js.split('\n').length} lines`;

    const previewDoc = `
        <!DOCTYPE html>
        <html>
        <head><style>${data.css}</style></head>
        <body>
            ${data.html}
            <script>${data.js}<\/script>
        </body>
        </html>
    `;
    previewFrame.srcdoc = previewDoc;
}

function switchTab(tabName) {
    document.querySelectorAll('.code-view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.remove('tab-active', 'text-slate-400'));
    
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('tab-active');
    
    ['html', 'css', 'js', 'preview'].forEach(t => {
        if(t !== tabName) document.getElementById(`tab-${t}`).classList.add('text-slate-400');
    });
}

function copyToClipboard(type) {
    const text = data[type];
    if(!text) return;
    
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    
    showToast(`${type.toUpperCase()} copied to clipboard!`);
}

function download(type) {
    const blob = new Blob([data[type]], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index.${type === 'js' ? 'js' : type}`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function downloadAll() {
    showToast("Downloading all files...");
    ['html', 'css', 'js'].forEach((t, i) => {
        if(data[t]) setTimeout(() => download(t), i * 500);
    });
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    toast.className = `fixed bottom-10 right-10 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 z-50 ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`;
    msgEl.innerText = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

processBtn.addEventListener('click', performExtraction);

document.getElementById('clearBtn').addEventListener('click', () => {
    inputArea.value = '';
    resultsArea.classList.add('opacity-40', 'pointer-events-none');
    showToast("Workspace cleared.", "info");
});

document.getElementById('sampleBtn').addEventListener('click', () => {
    inputArea.value = `<!DOCTYPE html>
<html>
<head>
<title>Animated Card</title>
<style>
body { 
    background: #0f172a; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 80vh; 
    color: #fff; 
    margin: 0;
}
.card { 
    padding: 40px; 
    border: 2px solid #334155; 
    border-radius: 24px; 
    text-align: center; 
    cursor: pointer; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(8px);
}
.card:hover { 
    border-color: #6366f1; 
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2);
}
h2 { color: #818cf8; margin-bottom: 8px; }
p { color: #94a3b8; }
</style>
</head>
<body>
<div class="card" id="btn">
<h1>Welcome to MCS--Online code separator</h1>
<h2>Click Me</h2>
<p>Watch the console or alert</p>
</div>
<script>
document.getElementById('btn').onclick = () => {
    alert('Hello! You are using MCS--Online code separator.');
    console.log('Action performed!');
}
<\/script>
</body>
</html>`;
    performExtraction();
});

inputArea.addEventListener('input', () => {
    document.getElementById('charCount').innerText = `${inputArea.value.length} characters`;
});
