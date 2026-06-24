// Helpers to export a venue layout (the drag-and-drop floor plan) as a real
// downloadable PNG image or PDF file (user journey: "export the layout design
// as a picture or PDF file"). The layout is rebuilt as an SVG from the elements
// array so the export is crisp and resolution-independent.
//
// NOTE: jsPDF is imported dynamically (only when a PDF is actually exported) so
// the ~370 KB library never loads on initial page load / app startup.

// Colours must match the on-screen element styles in index.css (.layout-el.*)
const COLORS = {
  table: "#c2683f", // --accent
  booth: "#b07d27", // --amber
  stage: "#7a5ea0", // --purple
  door: "#2f8f5b", // --green
  chair: "#44403c", // --ink-2
};

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Measure the live designer canvas so exported coordinates line up 1:1 with
// what the user sees. Falls back to a sensible default size.
function measureCanvas() {
  const el = document.getElementById("layout-canvas");
  if (el && el.clientWidth) {
    return { width: Math.round(el.clientWidth), height: Math.round(el.clientHeight) };
  }
  return { width: 900, height: 440 };
}

// Build an SVG string representing the layout (grid background + elements).
export function buildLayoutSVG(elements = [], width = 900, height = 440) {
  const grid = 24;
  let lines = "";
  for (let x = grid; x < width; x += grid)
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#f1ebe2" stroke-width="1"/>`;
  for (let y = grid; y < height; y += grid)
    lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#f1ebe2" stroke-width="1"/>`;

  const els = (elements || [])
    .map((el) => {
      const color = COLORS[el.type] || "#44403c";
      const w = el.w || 0;
      const h = el.h || 0;
      const cx = (el.x || 0) + w / 2;
      const cy = (el.y || 0) + h / 2;
      return `<g>
        <rect x="${el.x || 0}" y="${el.y || 0}" width="${w}" height="${h}" rx="8" fill="${color}"/>
        <text x="${cx}" y="${cy}" fill="#ffffff" font-size="12" font-weight="700" font-family="Inter, system-ui, sans-serif" text-anchor="middle" dominant-baseline="central">${esc(el.label || el.type)}</text>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#fdfbf8"/>
    ${lines}
    ${els}
  </svg>`;
}

// Render the SVG onto a (high-DPI) canvas element.
function svgToCanvas(svg, width, height, scale = 2) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Export the layout as a PNG picture.
export async function exportLayoutPNG(elements, filename = "venue-layout.png") {
  const { width, height } = measureCanvas();
  const svg = buildLayoutSVG(elements, width, height);
  const canvas = await svgToCanvas(svg, width, height, 2);
  await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      triggerDownload(url, filename);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

// Export the layout as a PDF (title + the rendered floor plan image).
export async function exportLayoutPDF(elements, filename = "venue-layout.pdf", title = "Venue Layout") {
  const { jsPDF } = await import("jspdf"); // loaded on demand, not at app startup
  const { width, height } = measureCanvas();
  const svg = buildLayoutSVG(elements, width, height);
  const canvas = await svgToCanvas(svg, width, height, 2);
  const dataUrl = canvas.toDataURL("image/png");

  const margin = 24;
  const pageW = width + margin * 2;
  const pageH = height + margin * 2 + 28;
  const pdf = new jsPDF({
    orientation: pageW >= pageH ? "landscape" : "portrait",
    unit: "px",
    format: [pageW, pageH],
  });
  pdf.setFontSize(16);
  pdf.text(title, margin, margin + 6);
  pdf.addImage(dataUrl, "PNG", margin, margin + 20, width, height);
  pdf.save(filename);
}
