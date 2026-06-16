/* Hue — harmonious palette generator
 * Palettes are built in HSL using simple color-theory relationships,
 * so results look intentional rather than random noise. */

const SWATCH_COUNT = 5;
const SCHEMES = ["analogous", "complementary", "triadic", "monochrome"];

const paletteEl = document.getElementById("palette");
const generateBtn = document.getElementById("generate-btn");
const schemeSelect = document.getElementById("scheme-select");
const toastEl = document.getElementById("toast");

let activeScheme = "auto";
// Each slot: { h, s, l, locked }
let palette = [];

/* ── Color helpers ─────────────────────── */
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const wrapHue = (h) => ((h % 360) + 360) % 360;

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

// Perceived luminance → pick readable text color over a swatch.
function readableText(h, s, l) {
  const hex = hslToHex(h, s, l).slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? "#111118" : "#ffffff";
}

/* ── Palette generation ────────────────── */
function buildScheme(scheme) {
  const baseHue = randInt(0, 359);
  const colors = [];

  switch (scheme) {
    case "analogous": {
      const step = randInt(18, 32);
      for (let i = 0; i < SWATCH_COUNT; i++) {
        colors.push({
          h: wrapHue(baseHue + (i - 2) * step),
          s: randInt(58, 82),
          l: randInt(45, 68),
        });
      }
      break;
    }
    case "complementary": {
      const comp = wrapHue(baseHue + 180);
      const hues = [baseHue, baseHue, comp, comp, baseHue];
      hues.forEach((h, i) => {
        colors.push({
          h: wrapHue(h + randInt(-8, 8)),
          s: randInt(55, 85),
          l: 30 + i * 12,
        });
      });
      break;
    }
    case "triadic": {
      const hues = [
        baseHue,
        wrapHue(baseHue + 120),
        wrapHue(baseHue + 240),
        baseHue,
        wrapHue(baseHue + 120),
      ];
      hues.forEach((h, i) => {
        colors.push({
          h: wrapHue(h + randInt(-6, 6)),
          s: randInt(60, 82),
          l: i < 3 ? randInt(50, 64) : randInt(70, 80),
        });
      });
      break;
    }
    case "monochrome":
    default: {
      const sat = randInt(45, 70);
      for (let i = 0; i < SWATCH_COUNT; i++) {
        colors.push({
          h: wrapHue(baseHue + randInt(-5, 5)),
          s: sat + randInt(-8, 8),
          l: 22 + i * 15,
        });
      }
      break;
    }
  }
  return colors;
}

function generate() {
  const scheme = activeScheme === "auto" ? pick(SCHEMES) : activeScheme;
  const fresh = buildScheme(scheme);

  palette = palette.length
    ? palette.map((slot, i) =>
        slot.locked ? slot : { ...fresh[i], locked: false }
      )
    : fresh.map((c) => ({ ...c, locked: false }));

  render();
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ── Rendering ─────────────────────────── */
function render() {
  paletteEl.innerHTML = "";

  palette.forEach((slot, i) => {
    const hex = hslToHex(slot.h, slot.s, slot.l);
    const fg = readableText(slot.h, slot.s, slot.l);

    const swatch = document.createElement("div");
    swatch.className = "swatch swatch--enter" + (slot.locked ? " swatch--locked" : "");
    swatch.style.background = hex;
    swatch.style.color = fg;
    swatch.style.animationDelay = `${i * 60}ms`;
    swatch.title = "Click to copy " + hex;

    swatch.innerHTML = `
      <button class="swatch__lock" aria-label="Lock color" title="Lock this color">
        ${slot.locked ? "🔒" : "🔓"}
      </button>
      <div class="swatch__inner">
        <span class="swatch__hex">${hex}</span>
        <span class="swatch__label">copy</span>
      </div>`;

    // Copy on swatch click
    swatch.addEventListener("click", () => copyColor(hex, slot));

    // Lock toggle (don't bubble into copy)
    swatch.querySelector(".swatch__lock").addEventListener("click", (e) => {
      e.stopPropagation();
      slot.locked = !slot.locked;
      render();
    });

    paletteEl.appendChild(swatch);
  });
}

/* ── Copy + toast ──────────────────────── */
async function copyColor(hex, slot) {
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    // Fallback for older / insecure contexts
    const ta = document.createElement("textarea");
    ta.value = hex;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast(hex, slot);
}

let toastTimer;
function showToast(hex, slot) {
  const chipColor = hslToHex(slot.h, slot.s, slot.l);
  toastEl.innerHTML = `<span class="toast__chip" style="background:${chipColor}"></span>Copied ${hex}`;
  toastEl.classList.add("toast--show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("toast--show"), 1600);
}

/* ── Controls ──────────────────────────── */
generateBtn.addEventListener("click", generate);

schemeSelect.addEventListener("click", (e) => {
  const btn = e.target.closest(".scheme-btn");
  if (!btn) return;
  activeScheme = btn.dataset.scheme;
  [...schemeSelect.children].forEach((b) => b.classList.toggle("active", b === btn));
  generate();
});

document.addEventListener("keydown", (e) => {
  // Spacebar shuffles (unless typing in a field)
  if (e.code === "Space" && e.target.tagName !== "BUTTON") {
    e.preventDefault();
    generate();
  }
});

/* ── Go ────────────────────────────────── */
/* (Password-gate logic lives inline in index.html so it's self-contained
 * and attached before any interaction.) */
generate();
