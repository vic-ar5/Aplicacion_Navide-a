const canvas = document.getElementById("card");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

const FONTS = [
  ["Georgia", "Georgia"],
  ["Times New Roman", '"Times New Roman", serif'],
  ["Arial", "Arial, sans-serif"],
  ["Verdana", "Verdana, sans-serif"],
  ["Trebuchet MS", '"Trebuchet MS", sans-serif'],
  ["Comic Sans MS", '"Comic Sans MS", cursive'],
  ["Brush Script MT", '"Brush Script MT", cursive'],
  ["Impact", "Impact, fantasy"],
  ["Courier New", '"Courier New", monospace']
];

const els = {
  title: document.getElementById("txtTitle"),
  message: document.getElementById("txtMessage"),
  to: document.getElementById("txtTo"),
  from: document.getElementById("txtFrom"),
  titleFont: document.getElementById("selTitleFont"),
  msgFont: document.getElementById("selMsgFont"),
  text: document.getElementById("colorText"),
  accent: document.getElementById("colorAccent"),
  bg: document.getElementById("colorBg"),
  size: document.getElementById("txtSize"),
  templateList: document.getElementById("templateList"),
  randomMsg: document.getElementById("btnRandomMsg"),
  dlPng: document.getElementById("btnDownloadPng"),
  dlJpg: document.getElementById("btnDownloadJpg"),
  share: document.getElementById("btnShare"),
  install: document.getElementById("btnInstall"),
  addText: document.getElementById("btnAddText"),
  letterEditor: document.getElementById("letterEditor"),
  customText: document.getElementById("txtCustom"),
  customFont: document.getElementById("selCustomFont"),
  customColor: document.getElementById("colorCustom"),
  customSize: document.getElementById("customSize"),
  btnAlignLeft: document.getElementById("btnAlignLeft"),
  btnAlignCenter: document.getElementById("btnAlignCenter"),
  btnAlignRight: document.getElementById("btnAlignRight"),
  btnBold: document.getElementById("btnBold"),
  btnItalic: document.getElementById("btnItalic"),
  btnDelete: document.getElementById("btnDeleteText")
};

let state = {
  templateId: TEMPLATES[0].id,
  title: els.title.value,
  message: els.message.value,
  to: "",
  from: "",
  titleFont: FONTS[0][0],
  msgFont: "Arial",
  text: els.text.value,
  accent: els.accent.value,
  bg: els.bg.value,
  scale: 1,
  texts: []
};

let selected = -1;
let dragging = null;
let dragMoved = false;

function fillFontSelect(select, defaultName) {
  select.innerHTML = "";
  FONTS.forEach(([name, css]) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    opt.style.fontFamily = css;
    select.appendChild(opt);
  });
  select.value = defaultName;
}

fillFontSelect(els.titleFont, state.titleFont);
fillFontSelect(els.msgFont, state.msgFont);
fillFontSelect(els.customFont, FONTS[0][0]);

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

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
  });
});

function wrapText(text, maxWidth) {
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

function drawCenterLines(lines, centerX, startY, lineH) {
  lines.forEach((l, i) => ctx.fillText(l, centerX, startY + i * lineH));
}

function drawCustomTexts() {
  state.texts.forEach(t => {
    ctx.save();
    ctx.textAlign = t.align;
    ctx.textBaseline = "middle";
    ctx.font =
      (t.italic ? "italic " : "") + (t.bold ? "700 " : "400 ") +
      t.size + 'px "' + t.font + '", sans-serif';
    ctx.fillStyle = t.color;
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 4;
    ctx.fillText(t.text, t.x * W, t.y * H);
    ctx.restore();
  });
}

function render() {
  const tpl = TEMPLATES.find(t => t.id === state.templateId) || TEMPLATES[0];
  const s = state.scale;
  tpl.draw(ctx, W, H, { bg: state.bg, accent: state.accent });

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = state.text;
  ctx.shadowColor = "rgba(0,0,0,.4)";
  ctx.shadowBlur = 8;

  ctx.font = "700 " + (92 * s) + 'px "' + state.titleFont + '", serif';
  ctx.fillText(state.title || " ", W / 2, H * 0.16);

  if (state.to) {
    ctx.font = "italic 600 " + (54 * s) + 'px Georgia, serif';
    ctx.fillStyle = state.accent;
    ctx.fillText("Para: " + state.to, W / 2, H * 0.24);
  }

  ctx.fillStyle = state.text;
  ctx.font = (46 * s) + 'px "' + state.msgFont + '", sans-serif';
  const lines = wrapText(state.message, W * 0.74);
  drawCenterLines(lines, W / 2, H * 0.34, 64 * s);

  if (state.from) {
    ctx.font = "italic 500 " + (52 * s) + 'px Georgia, serif';
    ctx.fillStyle = state.accent;
    ctx.fillText("— " + state.from, W / 2, H * 0.88);
  }

  ctx.shadowBlur = 0;
  drawCustomTexts();
}

function activeText() {
  if (!state.texts.length) return null;
  if (selected < 0 || selected >= state.texts.length) selected = state.texts.length - 1;
  return state.texts[selected];
}

function syncEditor() {
  const t = activeText();
  if (!t) {
    els.letterEditor.classList.add("hidden");
    return;
  }
  els.letterEditor.classList.remove("hidden");
  if (document.activeElement !== els.customText) els.customText.value = t.text;
  els.customFont.value = t.font;
  els.customColor.value = t.color;
  els.customSize.value = t.size;
  els.btnBold.classList.toggle("on", !!t.bold);
  els.btnItalic.classList.toggle("on", !!t.italic);
  els.btnAlignLeft.classList.toggle("on", t.align === "left");
  els.btnAlignCenter.classList.toggle("on", t.align === "center");
  els.btnAlignRight.classList.toggle("on", t.align === "right");
}

function setAlign(align) {
  const t = activeText();
  if (!t) return;
  t.align = align;
  syncEditor();
  render();
}

els.btnAlignLeft.addEventListener("click", () => setAlign("left"));
els.btnAlignCenter.addEventListener("click", () => setAlign("center"));
els.btnAlignRight.addEventListener("click", () => setAlign("right"));

function selectText(i) {
  selected = i;
  syncEditor();
  render();
}

function addText(x, y) {
  const t = {
    text: "Texto nuevo",
    x: x / W,
    y: y / H,
    font: els.customFont.value,
    size: parseInt(els.customSize.value, 10),
    color: els.customColor.value,
    align: "center",
    bold: false,
    italic: false
  };
  state.texts.push(t);
  selected = state.texts.length - 1;
  syncEditor();
  render();
  els.customText.focus();
  els.customText.select();
}

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (W / r.width),
    y: (e.clientY - r.top) * (H / r.height)
  };
}

function textBounds(t) {
  ctx.font = (t.bold ? "700 " : "400 ") + t.size + 'px "' + t.font + '", sans-serif';
  const w = ctx.measureText(t.text).width;
  const cx = t.x * W;
  let x0;
  if (t.align === "left") x0 = cx;
  else if (t.align === "right") x0 = cx - w;
  else x0 = cx - w / 2;
  return { x0, x1: x0 + w, y0: t.y * H - t.size * 0.8, y1: t.y * H + t.size * 0.8 };
}

function hitTest(pos) {
  for (let i = state.texts.length - 1; i >= 0; i--) {
    const b = textBounds(state.texts[i]);
    if (pos.x >= b.x0 - 12 && pos.x <= b.x1 + 12 && pos.y >= b.y0 && pos.y <= b.y1) return i;
  }
  return -1;
}

canvas.addEventListener("pointerdown", e => {
  const pos = canvasPos(e);
  const hit = hitTest(pos);
  if (hit >= 0) {
    const t = state.texts[hit];
    dragging = { index: hit, dx: pos.x - t.x * W, dy: pos.y - t.y * H };
    dragMoved = false;
    canvas.classList.add("picking");
    canvas.setPointerCapture(e.pointerId);
    selectText(hit);
  } else {
    selectText(-1);
  }
});

canvas.addEventListener("pointermove", e => {
  if (!dragging) {
    canvas.classList.toggle("picking", hitTest(canvasPos(e)) >= 0);
    return;
  }
  dragMoved = true;
  const pos = canvasPos(e);
  const t = state.texts[dragging.index];
  t.x = Math.min(1, Math.max(0, (pos.x - dragging.dx) / W));
  t.y = Math.min(1, Math.max(0, (pos.y - dragging.dy) / H));
  render();
});

canvas.addEventListener("pointerup", e => {
  if (!dragging) {
    canvas.classList.remove("picking");
    return;
  }
  const wasDrag = dragMoved;
  const idx = dragging.index;
  dragging = null;
  canvas.classList.remove("picking");
  if (!wasDrag) selectText(idx);
});

canvas.addEventListener("dblclick", e => {
  const pos = canvasPos(e);
  const hit = hitTest(pos);
  if (hit < 0) {
    addText(pos.x, pos.y);
  } else {
    selectText(hit);
    els.customText.focus();
  }
});

els.addText.addEventListener("click", () => {
  addText(W / 2, H / 2);
});

els.customText.addEventListener("input", () => {
  const t = activeText();
  if (!t) return;
  t.text = els.customText.value;
  render();
});

els.customFont.addEventListener("change", () => {
  const t = activeText();
  if (!t) return;
  t.font = els.customFont.value;
  render();
});

els.customColor.addEventListener("input", () => {
  const t = activeText();
  if (!t) return;
  t.color = els.customColor.value;
  render();
});

els.customSize.addEventListener("input", () => {
  const t = activeText();
  if (!t) return;
  t.size = parseInt(els.customSize.value, 10);
  render();
});

els.btnBold.addEventListener("click", () => {
  const t = activeText();
  if (!t) return;
  t.bold = !t.bold;
  syncEditor();
  render();
});

els.btnItalic.addEventListener("click", () => {
  const t = activeText();
  if (!t) return;
  t.italic = !t.italic;
  syncEditor();
  render();
});

els.btnDelete.addEventListener("click", () => {
  const t = activeText();
  if (!t) return;
  state.texts.splice(selected, 1);
  selected = -1;
  syncEditor();
  render();
});

function renderStateFromInputs() {
  state.title = els.title.value;
  state.message = els.message.value;
  state.to = els.to.value;
  state.from = els.from.value;
  state.titleFont = els.titleFont.value;
  state.msgFont = els.msgFont.value;
  state.text = els.text.value;
  state.accent = els.accent.value;
  state.bg = els.bg.value;
  state.scale = parseFloat(els.size.value);
  render();
}

[els.title, els.message, els.to, els.from, els.text, els.accent, els.bg, els.size]
  .forEach(el => el.addEventListener("input", renderStateFromInputs));

els.titleFont.addEventListener("change", renderStateFromInputs);
els.msgFont.addEventListener("change", renderStateFromInputs);

els.randomMsg.addEventListener("click", () => {
  els.message.value = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
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
    try { await navigator.share({ files: [file], title: state.title, text }); } catch (err) {}
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

(function makeSnow() {
  const wrap = document.getElementById("snowfall");
  for (let i = 0; i < 30; i++) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.textContent = "❄";
    flake.style.left = Math.random() * 100 + "%";
    flake.style.fontSize = 10 + Math.random() * 18 + "px";
    flake.style.opacity = 0.3 + Math.random() * 0.6;
    flake.style.animationDuration = 6 + Math.random() * 10 + "s";
    flake.style.animationDelay = -Math.random() * 12 + "s";
    wrap.appendChild(flake);
  }
})();

buildTemplateList();
render();
syncEditor();
