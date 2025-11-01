import { useEffect, useRef, useState } from "react";
import { useDotsStore } from "../store/useDotsStore";
import { v4 as uuid } from "uuid";
import { PaperTexture } from "@paper-design/shaders-react";

interface CanvasConfig {
  imageUrl?: string;
  layout?: "vertical" | "horizontal";
  dotSize?: number;
  roughness?: number;
  background?: string;
}

export default function CanvasPane({ config }: { config: CanvasConfig }) {
  const {
    imageUrl = "",
    layout = "vertical",
    dotSize = 10,
    roughness = 0.4,
    background = "#9fadbc",
  } = config;

  const photoRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [artUrl, setArtUrl] = useState<string>();
  const { addDot } = useDotsStore();

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

    const { width, height } = fitImageToCanvas(img, 35);
    setImgSize({ width, height });

    // 同步画布尺寸
    [photoRef.current, artRef.current].forEach((c) => {
      c.width = width;
      c.height = height;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
    });

    const pctx = photoRef.current.getContext("2d")!;
    pctx.clearRect(0, 0, width, height);
    pctx.drawImage(img, 0, 0, width, height);

    const actx = artRef.current.getContext("2d")!;
    actx.clearRect(0, 0, width, height);
    actx.fillStyle = background;
    actx.fillRect(0, 0, width, height);

    updatePaperTexture(artRef.current.toDataURL("image/png"));
  }, [img, background]);

  const updatePaperTexture = (url?: string) => {
    const newUrl = url || artRef?.current?.toDataURL("image/png");
    if (newUrl) setArtUrl(newUrl);
  };

  /** 点击事件：裁剪圆形贴片 + 更新 PaperTexture */
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!photoRef.current || !artRef.current) return;
    const rect = photoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const r = dotSize;

    const pctx = photoRef.current.getContext("2d")!;
    const actx = artRef.current.getContext("2d")!;

    // 从左侧 canvas 拷贝圆形区域
    const circle = document.createElement("canvas");
    circle.width = r * 2;
    circle.height = r * 2;
    const cctx = circle.getContext("2d")!;
    cctx.beginPath();
    cctx.arc(r, r, r, 0, Math.PI * 2);
    cctx.clip();
    cctx.drawImage(
      photoRef.current,
      x - r,
      y - r,
      r * 2,
      r * 2,
      0,
      0,
      r * 2,
      r * 2
    );

    // 在右侧画布贴片
    actx.save();
    actx.beginPath();
    actx.arc(x, y, r, 0, Math.PI * 2);
    actx.clip();
    actx.drawImage(circle, x - r, y - r, r * 2, r * 2);
    actx.restore();

    // 更新 PaperTexture 预览
    updatePaperTexture(artRef.current.toDataURL("image/png"));

    // 左侧挖空 + 填充背景
    pctx.save();
    pctx.globalCompositeOperation = "destination-out";
    pctx.beginPath();
    pctx.arc(x, y, r, 0, Math.PI * 2);
    pctx.fill();
    pctx.restore();

    pctx.save();
    pctx.globalCompositeOperation = "destination-over";
    pctx.fillStyle = background;
    pctx.beginPath();
    pctx.arc(x, y, r, 0, Math.PI * 2);
    pctx.fill();
    pctx.restore();

    addDot({
      id: uuid(),
      x: x / photoRef.current.width,
      y: y / photoRef.current.height,
      radius: r / photoRef.current.width,
    });
  };

  /** 布局样式 */
  const containerStyle: React.CSSProperties =
    layout === "vertical"
      ? { display: "flex", flexDirection: "column-reverse" }
      : { display: "flex", flexDirection: "row" };

  return (
    <div style={containerStyle} id="canvas-pane">
      <canvas
        ref={photoRef}
        onClick={handleClick}
        style={{
          height: imgSize.height,
          width: imgSize.width,
          cursor: "crosshair",
        }}
      />

      {/* 🔧 重叠布局区：artCanvas + PaperTexture */}
      <div
        style={{
          position: "relative",
          width: imgSize.width,
          height: imgSize.height,
        }}
      >
        {/* 底层：纯 canvas 绘制 */}
        <canvas
          ref={artRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />

        {/* 顶层：纸纹理叠加 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none", // ✅ 避免遮挡交互
          }}
        >
          <PaperTexture
            width={imgSize.width}
            height={imgSize.height}
            image={artUrl}
            scale={1}
            colorFront={background}
            colorBack="#fff"
            roughness={roughness}
          />
        </div>
      </div>
    </div>
  );
}

/** 图片自适配（长边 <= maxVW） */
function fitImageToCanvas(img: HTMLImageElement, maxVW: number) {
  const vw = window.innerWidth;
  const maxWidth = (vw * maxVW) / 100;
  const scale =
    img.width > img.height ? maxWidth / img.width : maxWidth / img.height;
  return {
    width: img.width * scale,
    height: img.height * scale,
  };
}
