
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

// FIXME: 分辨率问题
/**
 * 根据 layout 拼接 Photo + PaperTexture 两张画布导出 PNG
 * @param layout "vertical" | "horizontal"
 * @param filename 下载文件名
 */
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

  // 根据 layout 决定新画布尺寸
  const merged = document.createElement("canvas");
  const ctx = merged.getContext("2d")!;

  if (layout === "vertical") {
    merged.width = Math.max(pw, fw);
    merged.height = ph + fh;
    // 上：Paper，下：Photo
    ctx.drawImage(paperCanvas, 0, 0);
    ctx.drawImage(photoCanvas, 0, ph);
  } else {
    merged.width = pw + fw;
    merged.height = Math.max(ph, fh);
    // 左：Photo，右：Paper
    ctx.drawImage(photoCanvas, 0, 0);
    ctx.drawImage(paperCanvas, fw, 0);
  }

  // 导出 PNG
  const url = merged.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
}

