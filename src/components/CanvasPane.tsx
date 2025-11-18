import { useEffect, useRef, useState, useCallback } from "react";
import { useDotsStore } from "../store/useDotsStore";
import { v4 as uuid } from "uuid";
import { PaperTexture } from "@paper-design/shaders-react";

interface CanvasConfig {
  imageUrl?: string;
  layout?: "vertical" | "horizontal";
  dotSize?: number;
  roughness?: number;
  background?: string;
  contrast?: number;
  fiber?: number;
  folds?: number;
}

export default function CanvasPane({ config, zoom = 1 }: { config: CanvasConfig; zoom?: number }) {
  const {
    imageUrl = "",
    layout = "vertical",
    dotSize = 16,
    roughness = 0.4,
    background = "#F8F3EF",
    contrast = 0.3,
    fiber = 0.3,
    folds = 0.5,
  } = config;

  const photoRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement>(null);
  const srcRef = useRef<HTMLCanvasElement | null>(null);

  const { dots, addDot } = useDotsStore();

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const [artUrl, setArtUrl] = useState<string>();
  const artUrlRef = useRef<string | null>(null);
  const encodingRef = useRef(false);

  // ----------------------
  // Helpers
  // ----------------------
  const updatePaperTextureURL = () => {
    const art = artRef.current;
    if (!art || encodingRef.current) return;

    encodingRef.current = true;

    art.toBlob((blob) => {
      encodingRef.current = false;
      if (!blob) return;

      const url = URL.createObjectURL(blob);

      if (artUrlRef.current) URL.revokeObjectURL(artUrlRef.current);
      artUrlRef.current = url;

      setArtUrl(url);
    }, "image/png");
  };

  const drawDotsCutout = (ctx: CanvasRenderingContext2D, src: HTMLCanvasElement) => {
    const { width, height } = src;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(src, 0, 0, width, height);

    dots.forEach(({ x, y, radius }) => {
      const px = x * width;
      const py = y * height;
      const r = radius * width;

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = background;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawDotsArt = (ctx: CanvasRenderingContext2D, src: HTMLCanvasElement) => {
    const { width, height } = src;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    dots.forEach(({ x, y, radius }) => {
      const px = x * width;
      const py = y * height;
      const r = radius * width;

      const circle = document.createElement("canvas");
      circle.width = r * 2;
      circle.height = r * 2;

      const cctx = circle.getContext("2d")!;
      cctx.beginPath();
      cctx.arc(r, r, r, 0, Math.PI * 2);
      cctx.clip();
      cctx.drawImage(src, px - r, py - r, r * 2, r * 2, 0, 0, r * 2, r * 2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(circle, px - r, py - r, r * 2, r * 2);
      ctx.restore();
    });
  };

  // ----------------------
  // Rendering pipeline
  // ----------------------
  const renderAll = useCallback(() => {
    if (!srcRef.current || !photoRef.current || !artRef.current) return;

    const src = srcRef.current;

    drawDotsCutout(photoRef.current.getContext("2d")!, src);
    drawDotsArt(artRef.current.getContext("2d")!, src);

    updatePaperTextureURL();
  }, [dots, background]);

  // ----------------------
  // Image loading
  // ----------------------
  useEffect(() => {
    if (!imageUrl) return;

    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.src = imageUrl;
  }, [imageUrl]);

  // ----------------------
  // Init canvas + first render
  // ----------------------
  useEffect(() => {
    if (!img || !photoRef.current || !artRef.current) return;

    const { width, height } = fitImageToCanvas(img);
    setImgSize({ width, height });

    // prepare src
    const src = document.createElement("canvas");
    src.width = width;
    src.height = height;
    src.getContext("2d")!.drawImage(img, 0, 0, width, height);
    srcRef.current = src;

    // sync visible canvas size
    [photoRef.current, artRef.current].forEach((c) => {
      c.width = width;
      c.height = height;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
    });

    renderAll();
  }, [img, renderAll]);

  // ----------------------
  // Rerender on dots changes
  // ----------------------
  useEffect(() => renderAll(), [renderAll]);

  // ----------------------
  // Click to add dot
  // ----------------------
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const target = photoRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();

    const xCss = (e.clientX - rect.left) / zoom;
    const yCss = (e.clientY - rect.top) / zoom;

    const nx = xCss / target.clientWidth;
    const ny = yCss / target.clientHeight;

    const rNorm = dotSize / target.width;

    addDot({ id: uuid(), x: nx, y: ny, radius: rNorm });
  };

  // cleanup object URLs
  useEffect(() => {
    return () => {
      if (artUrlRef.current) URL.revokeObjectURL(artUrlRef.current);
    };
  }, []);

  // ----------------------
  // Layout styles
  // ----------------------
  const containerStyle: React.CSSProperties =
    layout === "vertical"
      ? { display: "flex", flexDirection: "column-reverse", width: "max-content", alignItems: "center" }
      : { display: "flex", width: "max-content", flexDirection: "row", alignItems: "center" };

  return (
    <div style={{ overflow: "auto" }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", display: "inline-block" }}>
        <div style={containerStyle}>
          <canvas
            ref={photoRef}
            id="photo-canvas"
            onClick={handleClick}
            style={{ width: imgSize.width, height: imgSize.height, cursor: "crosshair" }}
          />

          <div style={{ position: "relative", width: imgSize.width, height: imgSize.height }}>
            <canvas ref={artRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

            <PaperTexture
              style={{ position: "absolute", inset: 0 }}
              width={imgSize.width}
              height={imgSize.height}
              image={artUrl}
              scale={1}
              colorFront={background}
              contrast={contrast}
              fiber={fiber}
              folds={folds}
              colorBack="#fff"
              roughness={roughness}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function fitImageToCanvas(img: HTMLImageElement) {
  const maxPixel = 3000;
  const ratio = img.width / img.height;

  let width = img.width;
  let height = img.height;

  if (width > height && width > maxPixel) {
    width = maxPixel;
    height = maxPixel / ratio;
  } else if (height >= width && height > maxPixel) {
    height = maxPixel;
    width = maxPixel * ratio;
  }

  return { width, height };
}
