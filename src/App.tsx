import { Layout } from "@arco-design/web-react";
import { useEffect, useState } from "react";
import Toolbar from "./components/Toolbar";
import CanvasPane from "./components/CanvasPane";
import ConfigForm from "./components/ConfigForm";
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
      <Content style={{ flex: 1, padding: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <Toolbar />
        </div>
        {config.imageUrl && <CanvasPane config={config} />}
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
