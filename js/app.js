const canvas = document.getElementById("card");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const els = {
  title: document.getElementById("txtTitle"),
  message: document.getElementById("txtMessage"),
  to: document.getElementById("txtTo"),
  from: document.getElementById("txtFrom"),
  text: document.getElementById("colorText"),
  accent: document.getElementById("colorAccent"),
  bg: document.getElementById("colorBg"),
  size: document.getElementById("txtSize"),
  templateList: document.getElementById("templateList"),
  randomMsg: document.getElementById("btnRandomMsg"),
  dlPng: document.getElementById("btnDownloadPng"),
  dlJpg: document.getElementById("btnDownloadJpg"),
  share: document.getElementById("btnShare"),
  install: document.getElementById("btnInstall")
};

let state = {
  templateId: TEMPLATES[0].id,
  title: els.title.value,
  message: els.message.value,
  to: "",
  from: "",
  text: els.text.value,
  accent: els.accent.value,
  bg: els.bg.value,
  scale: 1
};

function applyTemplateDefaults(tpl) {
  els.bg.value = tpl.defaults.bg;
  els.accent.value = tpl.defaults.accent;
  els.text.value = tpl.defaults.text;
  state.bg = tpl.defaults.bg;
  state.accent = tpl.defaults.accent;
  state.text = tpl.defaults.text;
}

function buildTemplateList() {
  TEMPLATES.forEach(tpl => {
    const btn = document.createElement("button");
    btn.className = "template-btn" + (tpl.id === state.templateId ? " active" : "");
    btn.innerHTML = '<span class="swatch" style="background:' + tpl.swatch + '"></span>' + tpl.name;
    btn.addEventListener("click", () => {
      state.templateId = tpl.id;
      applyTemplateDefaults(tpl);
      document.querySelectorAll(".template-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    els.templateList.appendChild(btn);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCenterLines(ctx, lines, centerX, startY, lineH) {
  lines.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineH));
}

function render() {
  const tpl = TEMPLATES.find(t => t.id === state.templateId) || TEMPLATES[0];
  const s = state.scale;
  tpl.draw(ctx, W, H, { bg: state.bg, accent: state.accent });

  ctx.textAlign = "center";
  ctx.fillStyle = state.text;

  ctx.font = "700 " + (92 * s) + 'px Georgia, "Times New Roman", serif';
  ctx.fillText(state.title || " ", W / 2, H * 0.16);

  if (state.to) {
    ctx.font = "italic 600 " + (54 * s) + 'px Georgia, serif';
    ctx.fillStyle = state.accent;
    ctx.fillText("Para: " + state.to, W / 2, H * 0.24);
  }

  ctx.fillStyle = state.text;
  ctx.font = (46 * s) + 'px "Segoe UI", system-ui, sans-serif';
  const lines = wrapText(ctx, state.message, W * 0.74);
  drawCenterLines(ctx, lines, W / 2, H * 0.34, 64 * s);

  if (state.from) {
    ctx.font = "italic 500 " + (52 * s) + 'px Georgia, serif';
    ctx.fillStyle = state.accent;
    ctx.fillText("— " + state.from, W / 2, H * 0.88);
  }
}

function renderStateFromInputs() {
  state.title = els.title.value;
  state.message = els.message.value;
  state.to = els.to.value;
  state.from = els.from.value;
  state.text = els.text.value;
  state.accent = els.accent.value;
  state.bg = els.bg.value;
  state.scale = parseFloat(els.size.value);
  render();
}

[els.title, els.message, els.to, els.from, els.text, els.accent, els.bg, els.size]
  .forEach(el => el.addEventListener("input", renderStateFromInputs));

els.randomMsg.addEventListener("click", () => {
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  els.message.value = msg;
  renderStateFromInputs();
});

function fileBaseName() {
  const t = (state.title || "tarjeta").replace(/[^\w\-]+/g, "_").slice(0, 30);
  return "tarjeta_" + t;
}

function download(format) {
  let url;
  if (format === "jpg") {
    const tmp = document.createElement("canvas");
    tmp.width = W;
    tmp.height = H;
    const tctx = tmp.getContext("2d");
    tctx.fillStyle = "#ffffff";
    tctx.fillRect(0, 0, W, H);
    tctx.drawImage(canvas, 0, 0);
    url = tmp.toDataURL("image/jpeg", 0.92);
  } else {
    url = canvas.toDataURL("image/png");
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = fileBaseName() + "." + format;
  a.click();
}

els.dlPng.addEventListener("click", () => download("png"));
els.dlJpg.addEventListener("click", () => download("jpg"));

els.share.addEventListener("click", async () => {
  const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
  const file = new File([blob], fileBaseName() + ".png", { type: "image/png" });
  const text = state.title + " - " + state.message;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: state.title, text }); } catch (e) {}
  } else {
    download("png");
  }
});

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  els.install.classList.remove("hidden");
});
els.install.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  els.install.classList.add("hidden");
});
window.addEventListener("appinstalled", () => els.install.classList.add("hidden"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

buildTemplateList();
render();
