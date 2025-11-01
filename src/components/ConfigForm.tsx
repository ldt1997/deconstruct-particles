import {
  Upload,
  Select,
  InputNumber,
  Slider,
  ColorPicker,
} from "@arco-design/web-react";
import { useState } from "react";

export default function ConfigForm({
  onChange,
}: {
  onChange: (config: unknown) => void;
}) {
  const [config, setConfig] = useState({
    layout: "vertical",
    colorFront: "#9fadbc",
    roughness: 0.4,
  });

  const update = (k: string, v: unknown) => {
    const newCfg = { ...config, [k]: v };
    console.log("config updated:", newCfg);
    setConfig(newCfg);
    onChange(newCfg);
  };

  return (
    // TODO: 使用 Form 和 FormItem
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Upload
        drag
        showUploadList={{ startIcon: null, progressRender: () => <></> }}
        accept="image/*"
        limit={1}
        autoUpload={false} // 禁用自动上传
        onChange={(files) => {
          // TODO: 如果图片是长的，设置layout为horizontal，宽的设置为vertical
          const file = files[0];
          if (file?.originFile) {
            const localUrl = URL.createObjectURL(file.originFile);
            update("imageUrl", localUrl);
          }
        }}
      >
        Upload Image
      </Upload>

      <Select
        value={config.layout}
        onChange={(v) => update("layout", v)}
        options={[
          { label: "Vertical", value: "vertical" },
          { label: "Horizontal", value: "horizontal" },
        ]}
      />

      <div>
        Background color:
        <ColorPicker
          value={config.colorFront}
          onChange={(v) => update("colorFront", v)}
        />
      </div>

      <div>
        Roughness:
        <Slider
          value={config.roughness}
          onChange={(v) => update("roughness", v)}
        />
      </div>

      <div>
        Dot size:
        <InputNumber
          defaultValue={5}
          min={1}
          max={20}
          onChange={(v) => update("dotSize", v)}
        />
      </div>
    </div>
  );
}
