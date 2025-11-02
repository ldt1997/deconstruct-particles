
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
