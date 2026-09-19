// ============================================================
// DRE MAY — by Mimin Andre
// Single-file: Server + HTML + Logic
// API Key dilindungi via ENV Vercel
// ============================================================

// ---------- KONFIGURASI LINK ASSET (bisa dipindah ke ENV kalo mau) ----------
const CONFIG = {
  CATBOX_VIDEO_URL:  "https://files.catbox.moe/pjktvq.mp4",
  CATBOX_AUDIO_URL:  "https://files.catbox.moe/g6urh8.mp3",
  WA_CHANNEL_URL:    "https://whatsapp.com/channel/0029Vb7n9z7IXnlvOrDT9l0L",
  PROFILE_IMAGE_URL: "https://files.catbox.moe/jo583l.jpg"
};
// ---------------------------------------------------------------------------

module.exports = async (req, res) => {

  // ==================== API ROUTE: /api/generate ====================
  if (req.url === '/api/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { image } = JSON.parse(body);
        if (!image) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Image required' }));
        }

        // API KEY DARI ENV — AMAN
        const HF_API_KEY = process.env.HF_API_KEY;
        if (!HF_API_KEY) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'API key not configured' }));
        }

        // Fetch ke Hugging Face
        const hfResponse = await fetch(
          "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${HF_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: image })
          }
        );

        if (!hfResponse.ok) {
          const errText = await hfResponse.text();
          res.statusCode = hfResponse.status;
          return res.end(JSON.stringify({ error: 'HF API error', detail: errText }));
        }

        const data = await hfResponse.json();
        const caption = Array.isArray(data) ? data[0].generated_text : data.generated_text;

        const prefix = "ultra realistic, 8k uhd, photorealistic, cinematic lighting, highly detailed, sharp focus, professional photography, ";
        const suffix = ", depth of field, hyperrealistic, intricate textures, masterpiece, award-winning shot, natural lighting, raw photo";

        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          prompt: prefix + caption + suffix,
          raw: caption
        }));

      } catch (err) {
        console.error('[DreMay]', err);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal error', message: err.message }));
      }
    });
    return;
  }

  // ==================== HTML PAGE ====================
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DRE MAY — by Mimin Andre</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
  html, body { min-height: 100vh; color: #fff; overflow-x: hidden; background: #05050a; }

  .bg-video { position: fixed; inset: 0; z-index: -2; overflow: hidden; }
  .bg-video video { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.45) saturate(1.2); }
  .bg-overlay {
    position: fixed; inset: 0; z-index: -1;
    background:
      radial-gradient(circle at 20% 20%, rgba(168,85,247,0.25), transparent 45%),
      radial-gradient(circle at 80% 80%, rgba(236,72,153,0.25), transparent 45%),
      linear-gradient(180deg, rgba(5,5,10,0.55), rgba(5,5,10,0.85));
    backdrop-filter: blur(2px);
  }

  .page { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 24px 16px; }
  .container {
    background: rgba(15,15,25,0.55);
    backdrop-filter: blur(28px) saturate(1.4);
    -webkit-backdrop-filter: blur(28px) saturate(1.4);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 26px; padding: 36px; max-width: 740px; width: 100%;
    box-shadow: 0 30px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08);
    animation: slideUp 0.7s cubic-bezier(0.2,0.9,0.3,1);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .avatar {
    width: 58px; height: 58px; aspect-ratio: 1/1; border-radius: 50%; object-fit: cover;
    border: 2px solid transparent;
    background: linear-gradient(#05050a,#05050a) padding-box, linear-gradient(135deg,#a855f7,#ec4899) border-box;
    padding: 2px; flex-shrink: 0; box-shadow: 0 0 25px rgba(168,85,247,0.6);
  }
  .header-text { flex: 1; min-width: 0; }
  .header-text h1 {
    font-size: 22px; font-weight: 800;
    background: linear-gradient(90deg,#a855f7,#ec4899,#a855f7);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shine 3s linear infinite;
  }
  @keyframes shine { to { background-position: 200% center; } }
  .header-text p { font-size: 11px; color: #999; margin-top: 3px; }
  .header-text p span { color: #ec4899; font-weight: 700; }

  .header-actions { display: flex; gap: 8px; align-items: center; }
  .icon-btn {
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: 0.3s;
  }
  .icon-btn:hover { background: rgba(168,85,247,0.25); border-color: #a855f7; transform: translateY(-2px); }
  .wa-link {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 14px; background: rgba(37,211,102,0.12);
    border: 1px solid rgba(37,211,102,0.4); color: #25D366;
    border-radius: 999px; font-size: 12px; font-weight: 600;
    text-decoration: none; transition: 0.3s; white-space: nowrap;
  }
  .wa-link:hover { background: rgba(37,211,102,0.25); box-shadow: 0 0 22px rgba(37,211,102,0.5); transform: translateY(-2px); }

  .hero-title { text-align: center; margin-bottom: 32px; }
  .hero-title h2 {
    font-size: clamp(52px, 11vw, 108px); font-weight: 900; letter-spacing: 6px; line-height: 1;
    background: linear-gradient(180deg,#fff 0%,#a855f7 55%,#ec4899 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    text-shadow: 0 0 70px rgba(168,85,247,0.5);
    animation: glow 3s ease-in-out infinite alternate;
  }
  @keyframes glow {
    from { filter: drop-shadow(0 0 22px rgba(168,85,247,0.5)); }
    to { filter: drop-shadow(0 0 45px rgba(236,72,153,0.85)); }
  }
  .hero-title .tagline { font-size: 12px; color: #aaa; letter-spacing: 8px; text-transform: uppercase; margin-top: 10px; }
  .hero-title .byline {
    display: inline-block; margin-top: 14px; padding: 5px 14px; border-radius: 999px;
    font-size: 11px; letter-spacing: 2px; color: #ec4899;
    background: rgba(236,72,153,0.1); border: 1px solid rgba(236,72,153,0.35);
    text-transform: uppercase;
  }

  .upload-box {
    border: 2px dashed rgba(168,85,247,0.4); border-radius: 18px;
    padding: 42px 20px; text-align: center; cursor: pointer;
    transition: 0.3s; margin-bottom: 20px; display: block;
    background: rgba(168,85,247,0.02);
  }
  .upload-box:hover { border-color: #a855f7; background: rgba(168,85,247,0.08); transform: translateY(-3px); box-shadow: 0 15px 40px rgba(168,85,247,0.2); }
  .upload-box input { display: none; }
  .upload-icon { font-size: 52px; margin-bottom: 12px; }
  .upload-box .title { font-size: 15px; font-weight: 600; color: #eee; }
  .upload-box .sub { font-size: 12px; color: #777; margin-top: 5px; }
  #preview { max-width: 100%; max-height: 260px; border-radius: 12px; margin-top: 16px; display: none; box-shadow: 0 12px 45px rgba(0,0,0,0.6); }

  .btn {
    width: 100%; padding: 17px; border: none; border-radius: 15px;
    background: linear-gradient(90deg,#a855f7,#ec4899);
    color: #fff; font-size: 15px; font-weight: 700; letter-spacing: 2px;
    cursor: pointer; transition: 0.3s; text-transform: uppercase;
  }
  .btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 18px 45px rgba(168,85,247,0.55); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .loader { display: none; text-align: center; margin-top: 24px; }
  .loader.active { display: block; }
  .spinner {
    width: 46px; height: 46px; border: 3px solid rgba(168,85,247,0.2);
    border-top-color: #a855f7; border-radius: 50%;
    animation: spin 0.9s linear infinite; margin: 0 auto 12px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader .status { font-size: 13px; color: #999; }

  .output {
    margin-top: 24px; background: rgba(0,0,0,0.55);
    border: 1px solid rgba(168,85,247,0.25); border-radius: 14px;
    padding: 20px; display: none; animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .output h3 { font-size: 12px; color: #a855f7; letter-spacing: 2px; margin-bottom: 12px; text-transform: uppercase; }
  .output pre {
    white-space: pre-wrap; word-break: break-word; font-size: 13px;
    line-height: 1.7; color: #ddd; font-family: 'Courier New', monospace;
    max-height: 300px; overflow-y: auto;
  }
  .copy-btn {
    margin-top: 14px; padding: 10px 18px;
    background: rgba(168,85,247,0.15);
    border: 1px solid #a855f7; color: #a855f7;
    border-radius: 10px; cursor: pointer;
    font-size: 13px; font-weight: 600; transition: 0.3s;
  }
  .copy-btn:hover { background: rgba(168,85,247,0.3); box-shadow: 0 0 22px rgba(168,85,247,0.45); }

  .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #666; letter-spacing: 1.5px; }
  .footer span { color: #a855f7; }
  .footer .mimin { color: #ec4899; font-weight: 700; }

  @media (max-width: 520px) {
    .container { padding: 24px 20px; border-radius: 22px; }
    .header { flex-wrap: wrap; }
    .header-actions { width: 100%; justify-content: flex-start; }
    .wa-link { font-size: 11px; padding: 7px 12px; }
    .avatar { width: 50px; height: 50px; }
    .hero-title h2 { letter-spacing: 3px; }
  }
</style>
</head>
<body>

<div class="bg-video">
  <video id="bgVideo" autoplay muted loop playsinline preload="auto">
    <source id="videoSource" src="${CONFIG.CATBOX_VIDEO_URL}" type="video/mp4">
  </video>
</div>
<div class="bg-overlay"></div>

<audio id="bgAudio" loop preload="auto">
  <source id="audioSource" src="${CONFIG.CATBOX_AUDIO_URL}" type="audio/mpeg">
</audio>

<div class="page">
  <div class="container">

    <div class="header">
      <img class="avatar" src="${CONFIG.PROFILE_IMAGE_URL}" alt="Profile">
      <div class="header-text">
        <h1>Dre May</h1>
        <p>Image → Prompt · by <span>Mimin Andre</span></p>
      </div>
      <div class="header-actions">
        <button class="icon-btn" id="muteBtn" title="Toggle Audio">🔊</button>
        <a class="wa-link" href="${CONFIG.WA_CHANNEL_URL}" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Saluran WA
        </a>
      </div>
    </div>

    <div class="hero-title">
      <h2>DRE MAY</h2>
      <div class="tagline">Image · To · Prompt</div>
      <div class="byline">by Mimin Andre</div>
    </div>

    <label class="upload-box" for="fileInput">
      <div class="upload-icon">🖼️</div>
      <div class="title">Klik atau Drop gambar di sini</div>
      <div class="sub">PNG · JPG · WEBP — max 10MB</div>
      <input type="file" id="fileInput" accept="image/*">
      <img id="preview" alt="preview">
    </label>

    <button class="btn" id="generateBtn" disabled>⚡ Generate Prompt</button>

    <div class="loader" id="loader">
      <div class="spinner"></div>
      <div class="status">Menganalisis gambar... sabar.</div>
    </div>

    <div class="output" id="output">
      <h3>📝 Generated Prompt</h3>
      <pre id="promptText"></pre>
      <button class="copy-btn" onclick="copyPrompt(event)">📋 Copy Prompt</button>
    </div>

    <div class="footer">Powered by <span>Jarfis AI</span> · Created by <span class="mimin">Mimin Andre</span></div>
  </div>
</div>

<script>
const bgVideo = document.getElementById('bgVideo');
const bgAudio = document.getElementById('bgAudio');
bgVideo.load();
bgAudio.load();

let audioPlaying = false;
const muteBtn = document.getElementById('muteBtn');

function tryPlayAudio() {
  bgAudio.volume = 0.35;
  bgAudio.play().then(() => {
    audioPlaying = true;
    muteBtn.textContent = '🔊';
  }).catch(() => {
    audioPlaying = false;
    muteBtn.textContent = '🔇';
  });
}

document.body.addEventListener('click', function initAudio() {
  tryPlayAudio();
  document.body.removeEventListener('click', initAudio);
}, { once: true });

muteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (audioPlaying) {
    bgAudio.pause();
    muteBtn.textContent = '🔇';
    audioPlaying = false;
  } else {
    tryPlayAudio();
  }
});

const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const generateBtn = document.getElementById('generateBtn');
const output = document.getElementById('output');
const promptText = document.getElementById('promptText');
const loader = document.getElementById('loader');

let imageBase64 = null;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    alert('Gambar kegedean, maks 10MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    imageBase64 = ev.target.result;
    preview.src = imageBase64;
    preview.style.display = 'block';
    generateBtn.disabled = false;
    output.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

generateBtn.addEventListener('click', async () => {
  if (!imageBase64) return;
  loader.classList.add('active');
  output.style.display = 'none';
  generateBtn.disabled = true;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64.split(',')[1] })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Gagal generate prompt');
    }

    const data = await response.json();
    promptText.textContent = data.prompt;
    output.style.display = 'block';
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    loader.classList.remove('active');
    generateBtn.disabled = false;
  }
});

function copyPrompt(e) {
  navigator.clipboard.writeText(promptText.textContent);
  const btn = e.target;
  btn.textContent = '✅ Copied!';
  setTimeout(() => btn.textContent = '📋 Copy Prompt', 1500);
}
</script>
</body>
</html>`);
};