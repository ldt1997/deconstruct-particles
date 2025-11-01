import { Layout } from "@arco-design/web-react";
import { useEffect, useState } from "react";
import Toolbar from "./components/Toolbar";
import CanvasPane from "./components/CanvasPane";
import ConfigForm from "./components/ConfigForm";
import PaperWrapper from "./components/PaperWrapper";
import { useDotsStore } from "./store/useDotsStore";

const { Sider, Content } = Layout;

export default function App() {
  const { reset } = useDotsStore();
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    reset();
  }, [config.imageUrl]);

  return (
    <Layout style={{ height: "100vh" }}>
      <Content style={{ flex: 1, padding: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <Toolbar />
        </div>
        {/* FIXME: PaperWrapper not working properly */}
        {/* <PaperWrapper
          colorFront={config.colorFront || "#9fadbc"}
          roughness={config.roughness || 0.4}
        > */}
          {config.imageUrl && (
            <CanvasPane
              imageUrl={config.imageUrl}
              layout={config.layout || "vertical"}
              dotSize={(config.dotSize || 5) * 5}
              background={config.colorFront || "#9fadbc"}
            />
          )}
        {/* </PaperWrapper> */}
      </Content>
      <Sider
        style={{
          width: "30%",
          minWidth: 320,
          padding: 12,
          borderLeft: "1px solid #eee",
        }}
      >
        <ConfigForm onChange={setConfig} />
      </Sider>
    </Layout>
  );
}
