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
}: {
  onChange: (config: Record<string, unknown>) => void;
}) {
  const [config, setConfig] = useState({
    layout: "vertical",
    background: "#9fadbc",
    roughness: 0.4,
    dotSize: 10,
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
        gap: 16,
        padding: 8,
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

      <Form.Item label="Background color">
        <ColorPicker
          value={config.background}
          showText
          disabledAlpha
          onChange={(v) => update("background", v)}
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

      <Form.Item label="Dot size">
        <Slider
          min={5}
          max={15}
          value={config.dotSize}
          onChange={(v) => update("dotSize", v)}
          step={1}
        />
      </Form.Item>
    </Form>
  );
}
