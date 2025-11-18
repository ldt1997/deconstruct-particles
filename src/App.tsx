import { Layout } from "@arco-design/web-react";
import { useEffect, useState } from "react";
import Toolbar from "./components/Toolbar";
import CanvasPane from "./components/CanvasPane";
import ConfigForm from "./components/ConfigForm";
import { useDotsStore } from "./store/useDotsStore";

const { Sider, Content } = Layout;

export default function App() {
  const { reset } = useDotsStore();
  const [zoom, setZoom] = useState(1);
  const [config, setConfig] = useState<any>({});

  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.1));
  const zoomOut = () => setZoom((z) => Math.max(0.2, z - 0.1));
  const resetZoom = () => setZoom(1);

  useEffect(() => {
    reset();
  }, [config.imageUrl]);

  return (
    <Layout style={{ height: "100vh" }}>
      <Content style={{ flex: 1, padding: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <Toolbar layout={config.layout} onZoomIn={zoomIn} onZoomOut={zoomOut} onResetZoom={resetZoom}/>
        </div>
        {config.imageUrl && <CanvasPane config={config} zoom={zoom}/>}
      </Content>
      <Sider
        style={{
          width: "30%",
          minWidth: 320,
          padding: 12,
          borderLeft: "1px solid #eee",
        }}
      >
        <ConfigForm onChange={setConfig} zoom={zoom}/>
      </Sider>
    </Layout>
  );
}
