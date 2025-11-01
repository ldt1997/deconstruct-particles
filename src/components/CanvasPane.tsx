import { useEffect, useRef, useState } from "react";
import { useDotsStore } from "../store/useDotsStore";
import { v4 as uuid } from "uuid";

interface Props {
  imageUrl: string;
  layout: "vertical" | "horizontal";
  dotSize?: number;
  background?: string;
}

export default function CanvasPane({
  imageUrl,
  layout,
  dotSize = 50,
  background = "#9fadbc",
}: Props) {
  const photoRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  // TODO: dots history for undo
  const { dots, addDot } = useDotsStore();

  // 加载图像
  useEffect(() => {
    if (!imageUrl) return;
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.src = imageUrl;
  }, [imageUrl]);

  // 当图片加载完成，绘制到左侧 canvas
  useEffect(() => {
    if (!img || !photoRef.current || !artRef.current) return;
    const { width, height } = fitImageToCanvas(img, 35);
  setImgSize({ width, height });

  // 同步：两张画布的“内部尺寸”和“CSS 尺寸”
  [photoRef.current, artRef.current].forEach((c) => {
    c.width = width;      // 内部绘制宽高（像素坐标系）
    c.height = height;
    c.style.width = `${width}px`;   // CSS 尺寸（显示）
    c.style.height = `${height}px`;
  });

  // 先把原图画到左侧
  const pctx = photoRef.current.getContext("2d")!;
  pctx.clearRect(0, 0, width, height);
  pctx.drawImage(img, 0, 0, width, height);

  // 给右侧填背景
  const actx = artRef.current.getContext("2d")!;
  actx.clearRect(0, 0, width, height);
  actx.fillStyle = background;
  actx.fillRect(0, 0, width, height);
  }, [background, img]);

  // 处理点击事件
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  if (!photoRef.current || !artRef.current) return
  const rect = photoRef.current.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const r = dotSize

  const photoCtx = photoRef.current.getContext("2d")!
  const artCtx = artRef.current.getContext("2d")!

  // 🟢 1. 从左侧 canvas 拷贝圆形区域（而非 img）
  const circle = document.createElement("canvas")
  circle.width = r * 2
  circle.height = r * 2
  const cctx = circle.getContext("2d")!
  cctx.beginPath()
  cctx.arc(r, r, r, 0, Math.PI * 2)
  cctx.clip()
  cctx.drawImage(
    photoRef.current, // ✅ 注意这里
    x - r,
    y - r,
    r * 2,
    r * 2,
    0,
    0,
    r * 2,
    r * 2
  )

  // 🟢 2. 在右侧画布贴片（两个 canvas 尺寸相同，坐标可直接对应）
  artCtx.save()
  artCtx.beginPath()
  artCtx.arc(x, y, r, 0, Math.PI * 2)
  artCtx.clip()
  artCtx.drawImage(circle, x - r, y - r)
  artCtx.restore()

  // 🟢 3. 左侧挖空 + 背景填充
  photoCtx.save()
  photoCtx.globalCompositeOperation = "destination-out"
  photoCtx.beginPath()
  photoCtx.arc(x, y, r, 0, Math.PI * 2)
  photoCtx.fill()
  photoCtx.restore()

  photoCtx.save()
  photoCtx.globalCompositeOperation = "destination-over"
  photoCtx.fillStyle = background
  photoCtx.beginPath()
  photoCtx.arc(x, y, r, 0, Math.PI * 2)
  photoCtx.fill()
  photoCtx.restore()

  addDot({
    id: uuid(),
    x: x / photoRef.current.width,
    y: y / photoRef.current.height,
    radius: r / photoRef.current.width,
  })
}


  const containerStyle =
    layout === "vertical"
      ? { display: "flex", flexDirection: "row" }
      : { display: "flex", flexDirection: "column" };

  return (
    <div style={containerStyle} id="canvas-pane">
      {/* FIXME: background color didn't change in photoRef dots */}
      <canvas
        ref={photoRef}
        style={{
          height: imgSize.height,
          width: imgSize.width,
          cursor: "crosshair",
        }}
        onClick={handleClick}
      />
      <canvas
        ref={artRef}
        style={{
          height: imgSize.height,
          width: imgSize.width,
          background: background,
        }}
      />
    </div>
  );
}

// 让图片适配视窗，长边 <= 60vw
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
