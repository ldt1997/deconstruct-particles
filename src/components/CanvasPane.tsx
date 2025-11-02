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

export default function CanvasPane({ config }: { config: CanvasConfig }) {
  const {
    imageUrl = "",
    layout = "vertical",
    dotSize = 16,
    roughness = 0.4,
    background = "#F4ECE4",
    contrast = 0.3,
    fiber = 0.3,
    folds = 0.5,
  } = config;

  const photoRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement>(null);
  const srcRef = useRef<HTMLCanvasElement | null>(null); // 离屏：原图缩放后，不变

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [artUrl, setArtUrl] = useState<string>();
  const { dots, addDot } = useDotsStore();

  /** 加载图像 */
  useEffect(() => {
    if (!imageUrl) return;
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.src = imageUrl;
  }, [imageUrl]);

  /** 绘制初始图像 */
  useEffect(() => {
    if (!img || !photoRef.current || !artRef.current) return;

    const { width, height } = fitImageToCanvas(img);
    setImgSize({ width, height });

    // 初始化离屏源画布（只建一次或尺寸变化时重建）
    const src = document.createElement("canvas");
    src.width = width;
    src.height = height;
    const sctx = src.getContext("2d")!;
    sctx.clearRect(0, 0, width, height);
    sctx.drawImage(img, 0, 0, width, height);
    srcRef.current = src;

    // 同步可见画布尺寸
    [photoRef.current, artRef.current].forEach((c) => {
      c.width = width;
      c.height = height;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
    });

    // 首次完整渲染
    renderAll();
  }, [img]);

  /** 统一渲染：根据 src + dots 重绘两侧，并更新 PaperTexture  */
  const renderAll = useCallback(() => {
    if (!srcRef.current || !photoRef.current || !artRef.current) return;

    const src = srcRef.current;
    const pctx = photoRef.current.getContext("2d")!;
    const actx = artRef.current.getContext("2d")!;
    const { width, height } = src;

    // 左侧：从源图开始 → 按 dots 打洞并填底色
    pctx.globalCompositeOperation = "source-over";
    pctx.clearRect(0, 0, width, height);
    pctx.drawImage(src, 0, 0, width, height);

    dots.forEach((d) => {
      const x = d.x * width;
      const y = d.y * height;
      const r = d.radius * width;

      // 先挖空
      pctx.save();
      pctx.globalCompositeOperation = "destination-out";
      pctx.beginPath();
      pctx.arc(x, y, r, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();

      // 再填背景色
      pctx.save();
      pctx.globalCompositeOperation = "destination-over";
      pctx.fillStyle = background;
      pctx.beginPath();
      pctx.arc(x, y, r, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    });

    // 右侧：底色 → 逐个贴片（从 src 采样，永不从左侧采）
    actx.globalCompositeOperation = "source-over";
    actx.clearRect(0, 0, width, height);
    actx.fillStyle = background;
    actx.fillRect(0, 0, width, height);

    dots.forEach((d) => {
      const x = d.x * width;
      const y = d.y * height;
      const r = d.radius * width;

      // 建临时圆片
      const circle = document.createElement("canvas");
      circle.width = r * 2;
      circle.height = r * 2;
      const cctx = circle.getContext("2d")!;
      cctx.beginPath();
      cctx.arc(r, r, r, 0, Math.PI * 2);
      cctx.clip();
      cctx.drawImage(src, x - r, y - r, r * 2, r * 2, 0, 0, r * 2, r * 2);

      // 贴到 art
      actx.save();
      actx.beginPath();
      actx.arc(x, y, r, 0, Math.PI * 2);
      actx.clip();
      actx.drawImage(circle, x - r, y - r, r * 2, r * 2);
      actx.restore();
    });

    // 同步 PaperTexture 预览
    setArtUrl(artRef.current.toDataURL("image/png"));
  }, [dots, background]);

  /** dots 或 background 变化时，统一重绘 */
  useEffect(() => {
    renderAll();
  }, [renderAll]);

  // FIXME: 渲染不及时问题
  /** 点击：只负责入栈（统一渲染交给 useEffect） */
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!photoRef.current || !srcRef.current) return;
    const rect = photoRef.current.getBoundingClientRect();
    const xCss = e.clientX - rect.left;
    const yCss = e.clientY - rect.top;

    const { width } = photoRef.current; // 内部像素宽度
    const nx = xCss / photoRef.current.clientWidth;
    const ny = yCss / photoRef.current.clientHeight;
    const rNorm = dotSize / width; // 半径归一化到宽度

    addDot({ id: uuid(), x: nx, y: ny, radius: rNorm });
    // 不在这里直接画，等待 dots 改变后统一 renderAll()
  };

  /** 布局 */
  const containerStyle: React.CSSProperties =
    layout === "vertical"
      ? {
          display: "flex",
          flexDirection: "column-reverse",
          width: "max-content",
          alignItems: "center",
        }
      : {
          display: "flex",
          width: "max-content",
          flexDirection: "row",
          alignItems: "center",
        };

  return (
    <div style={{ overflow: "auto" }}>
      <div style={containerStyle} id="canvas-pane">
        <canvas
          ref={photoRef}
          onClick={handleClick}
          style={{
            width: imgSize.width,
            height: imgSize.height,
            cursor: "crosshair",
          }}
        />

        {/* 右侧叠加：artCanvas + PaperTexture */}
        <div
          style={{
            position: "relative",
            width: imgSize.width,
            height: imgSize.height,
          }}
        >
          <canvas
            ref={artRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <PaperTexture
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

// FIXME: 分辨率问题 可能会导致模糊
/** 自适配：竖图≤35vw，横图≤65vw（高自适应） */
function fitImageToCanvas(img: HTMLImageElement) {
  const vw = window.innerWidth;
  const isPortrait = img.height > img.width;
  const maxVW = isPortrait ? 30 : 45;
  const maxWidth = (vw * maxVW) / 100;
  const scale = maxWidth / img.width;
  return { width: img.width * scale, height: img.height * scale };
}
