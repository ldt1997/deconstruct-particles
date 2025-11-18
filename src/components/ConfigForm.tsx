import {
  Upload,
  Select,
  Slider,
  ColorPicker,
  Form,
} from "@arco-design/web-react";
import { useState } from "react";

export default function ConfigForm({
  onChange,
  zoom = 1
}: {
  onChange: (config: Record<string, unknown>) => void;
  zoom?: number;
}) {
  const [config, setConfig] = useState({
    layout: "vertical",
    background: "#F8F3EF",
    roughness: 0.4,
    dotSize: 16,
    contrast: 0.3,
    fiber: 0.3,
    folds: 0.5,
  });

  const update = (k: string, v: unknown) => {
    const newCfg = { ...config, [k]: v };
    setConfig(newCfg);
    onChange(newCfg);
  };

  // 🔧 上传图片并自动判断方向
  const handleUpload = (files: any[]) => {
    const file = files[0];
    if (!file?.originFile) return;

    const localUrl = URL.createObjectURL(file.originFile);

    // 加载图片判断宽高
    const img = new Image();
    img.onload = () => {
      const layout = img.width >= img.height ? "vertical" : "horizontal";
      console.log("Detected layout:", layout, img.width, img.height);
      const newConfig = { ...config, layout, imageUrl: localUrl };
      setConfig(newConfig);
      onChange(newConfig);
    };
    img.src = localUrl;
  };

  return (
    <Form
      layout="vertical"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 12,
      }}
    >
      <Form.Item label="Upload Image">
        <Upload
          drag
          showUploadList={{ startIcon: null, progressRender: () => <></> }}
          accept="image/*"
          limit={1}
          autoUpload={false}
          onChange={handleUpload}
        >
          Click or drag an image here
        </Upload>
      </Form.Item>

      <Form.Item label="Background color">
        <ColorPicker
          value={config.background}
          showText
          disabledAlpha
          onChange={(v) => update("background", v)}
        />
      </Form.Item>

      <Form.Item label="Layout">
        <Select
          value={config.layout}
          onChange={(v) => update("layout", v)}
          options={[
            { label: "Vertical (up-down)", value: "vertical" },
            { label: "Horizontal (side-by-side)", value: "horizontal" },
          ]}
        />
      </Form.Item>

      <Form.Item label="Dot size">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Slider
            min={10}
            max={50}
            value={config.dotSize}
            onChange={(v) => update("dotSize", v)}
            step={5}
            style={{ flex: 1 }}
          />

          {/* 🔵 圆点预览 */}
          {/* TODO: adjust size according to zoom level */}
          <div
            style={{
              width: 50,
              height: 50,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ddd",
              borderRadius: 6,
              background: "#fff",
            }}
          >
            <div
              style={{
                width: config.dotSize,
                height: config.dotSize,
                transform: `scale(${zoom})`,
                borderRadius: "50%",
                backgroundColor: config.background, // 可用config.colorFront更一致
                transition: "width 0.2s, height 0.2s",
              }}
            />
          </div>
        </div>
      </Form.Item>

      <Form.Item label="Contrast">
        <Slider
          value={config.contrast}
          onChange={(v) => update("contrast", v)}
          min={0}
          max={1}
          step={0.05}
        />
      </Form.Item>

      <Form.Item label="Roughness">
        <Slider
          value={config.roughness}
          onChange={(v) => update("roughness", v)}
          min={0}
          max={1}
          step={0.05}
        />
      </Form.Item>

      <Form.Item label="Fiber">
        <Slider
          value={config.fiber}
          onChange={(v) => update("fiber", v)}
          min={0}
          max={1}
          step={0.05}
        />
      </Form.Item>

      <Form.Item label="Folds">
        <Slider
          value={config.folds}
          onChange={(v) => update("folds", v)}
          min={0}
          max={1}
          step={0.05}
        />
      </Form.Item>
    </Form>
  );
}
