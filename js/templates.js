const TEMPLATES = [
  {
    id: "roja",
    name: "Roja Clásica",
    swatch: "linear-gradient(160deg, #a31d1d, #5e0d0d)",
    defaults: { bg: "#8f1d1d", accent: "#ffd54a", text: "#ffffff" },
    draw(ctx, w, h, d) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, shade(d.bg, 30));
      g.addColorStop(1, shade(d.bg, -30));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      baubles(ctx, w, h, d.accent, 7);
      border(ctx, w, h, d.accent);
      snowdrift(ctx, w, h, "rgba(255,255,255,.9)");
    }
  },
  {
    id: "nieve",
    name: "Nieve Azul",
    swatch: "linear-gradient(160deg, #1d3a8f, #0d1f4d)",
    defaults: { bg: "#1d3a8f", accent: "#cfe8ff", text: "#ffffff" },
    draw(ctx, w, h, d) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, shade(d.bg, 20));
      g.addColorStop(1, shade(d.bg, -35));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        snowflake(ctx, Math.random() * w, Math.random() * h * 0.75, 8 + Math.random() * 22, "rgba(255,255,255,.75)");
      }
      snowdrift(ctx, w, h, "#ffffff");
      border(ctx, w, h, d.accent);
    }
  },
  {
    id: "bosque",
    name: "Bosque Verde",
    swatch: "linear-gradient(160deg, #0d472f, #06241a)",
    defaults: { bg: "#0d472f", accent: "#ffd54a", text: "#ffffff" },
    draw(ctx, w, h, d) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, shade(d.bg, 15));
      g.addColorStop(1, shade(d.bg, -30));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) {
        const x = (w / 6) * (i + 0.5) + (i % 2 ? 40 : -40);
        tree(ctx, x, h * 0.82, 130 - i * 8, "rgba(2,40,26,.85)");
      }
      for (let i = 0; i < 25; i++) snowflake(ctx, Math.random() * w, Math.random() * h, 6 + Math.random() * 14, "rgba(255,255,255,.5)");
      snowdrift(ctx, w, h, "rgba(255,255,255,.95)");
      border(ctx, w, h, d.accent);
    }
  },
  {
    id: "dorada",
    name: "Dorada Elegante",
    swatch: "linear-gradient(160deg, #241a08, #0e0a04)",
    defaults: { bg: "#241a08", accent: "#ffd54a", text: "#f6e7c1" },
    draw(ctx, w, h, d) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w);
      g.addColorStop(0, shade(d.bg, 25));
      g.addColorStop(1, shade(d.bg, -25));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = "rgba(255,213,74," + (0.05 + Math.random() * 0.2) + ")";
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 4 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      border(ctx, w, h, d.accent, 10);
      holly(ctx, w * 0.16, h * 0.14, 46, d.accent);
      holly(ctx, w * 0.84, h * 0.14, 46, d.accent);
    }
  }
];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (n & 255) + amt));
  return "rgb(" + r + "," + g + "," + b + ")";
}

function border(ctx, w, h, color, lw = 6) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.strokeRect(lw * 2, lw * 2, w - lw * 4, h - lw * 4);
}

function snowdrift(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(w * 0.25, h - 90, w * 0.5, h - 50);
  ctx.quadraticCurveTo(w * 0.75, h - 10, w, h - 80);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

function baubles(ctx, w, h, accent, count) {
  for (let i = 0; i < count; i++) {
    const x = 60 + Math.random() * (w - 120);
    const y = 60 + Math.random() * (h * 0.3);
    const r = 18 + Math.random() * 26;
    ctx.fillStyle = i % 2 ? accent : "rgba(255,255,255,.85)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();
  }
}

function snowflake(ctx, x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
    ctx.lineTo(x + Math.cos(a - 0.5) * r * 0.7, y + Math.sin(a - 0.5) * r * 0.7);
    ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
    ctx.lineTo(x + Math.cos(a + 0.5) * r * 0.7, y + Math.sin(a + 0.5) * r * 0.7);
    ctx.stroke();
  }
}

function tree(ctx, x, baseY, size, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const yTop = baseY - size * (0.45 + i * 0.2);
    const half = size * (0.42 - i * 0.09);
    ctx.beginPath();
    ctx.moveTo(x, yTop);
    ctx.lineTo(x - half, baseY - i * size * 0.28);
    ctx.lineTo(x + half, baseY - i * size * 0.28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#6b4a2b";
  ctx.fillRect(x - size * 0.05, baseY - size * 0.05, size * 0.1, size * 0.12);
}

function holly(ctx, x, y, s, accent) {
  ctx.fillStyle = "#1e7a34";
  [[-1, -0.5], [1, -0.5]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dx * s * 0.7, y + dy * s, x + dx * s * 1.2, y + s * 0.2);
    ctx.quadraticCurveTo(x + dx * s * 0.6, y + s * 0.45, x, y);
    ctx.fill();
  });
  ctx.fillStyle = accent;
  [[-0.25], [0.25]].forEach(([dx]) => {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + s * 0.35, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  });
}
