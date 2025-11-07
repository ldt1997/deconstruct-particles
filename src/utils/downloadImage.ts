
// FIXME: 无法导出webGL层
export function downloadImage(elementId: string, filename = "artwork.png") {
  const el = document.getElementById(elementId);
  if (!el) return;

  import("html2canvas").then(({ default: html2canvas }) => {
    html2canvas(el as HTMLElement, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}

export function downloadPaperTexture(layout: string, filename = "artwork.png") {
  const photonCanvas = document.getElementById("photo-canvas");
  if (!photonCanvas) {
    console.warn("Photo canvas not found (missing photo-canvas id)");
    return;
  }
  const paperCanvas = document.querySelector<HTMLCanvasElement>("[data-paper-shader] canvas");
  if (!paperCanvas) {
    console.warn("PaperTexture WebGL canvas not found (missing data-paper-shader)");
    return;
  }
  import("html2canvas").then(({ default: html2canvas }) => {
    html2canvas(paperCanvas as HTMLElement, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}

export function downloadWithPaperTexture(
  layout?: string,
  filename = "artwork.png"
) {
  const photoCanvas = document.getElementById("photo-canvas") as HTMLCanvasElement | null;
  if (!photoCanvas) {
    console.warn("Photo canvas not found (missing #photo-canvas id)");
    return;
  }

  const paperCanvas = document.querySelector<HTMLCanvasElement>(
    "[data-paper-shader] canvas"
  );
  if (!paperCanvas) {
    console.warn("PaperTexture WebGL canvas not found (missing [data-paper-shader])");
    return;
  }

  // 获取宽高
  const pw = paperCanvas.width;
  const ph = paperCanvas.height;
  const fw = photoCanvas.width;
  const fh = photoCanvas.height;
  console.log("Paper", pw, ph, "Photo", fw, fh);

  // 缩放比（比例相同情况下取宽即可）
  const scale = fw / pw;
  const scaledWidth = fw;
  const scaledHeight = ph * scale; // 等比例缩放

  // 创建合并画布
  const merged = document.createElement("canvas");
  const ctx = merged.getContext("2d")!;

  if (layout === "vertical") {
    merged.width = fw;
    merged.height = scaledHeight + fh;

    // 上方缩放后的 Paper
    ctx.drawImage(paperCanvas, 0, 0, pw, ph, 0, 0, scaledWidth, scaledHeight);
    // 下方原始 Photo
    ctx.drawImage(photoCanvas, 0, scaledHeight, fw, fh);
  } else {
    merged.width = scaledWidth + fw;
    merged.height = Math.max(scaledHeight, fh);

    // 左：Photo
    ctx.drawImage(photoCanvas, 0, 0, fw, fh);
    // 右：Paper（缩放后）
    ctx.drawImage(paperCanvas, 0, 0, pw, ph, fw, 0, scaledWidth, scaledHeight);
  }

  // 导出 PNG
  const url = merged.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
}
