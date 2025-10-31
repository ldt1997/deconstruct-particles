import { Layout, Message } from '@arco-design/web-react'
import { useEffect } from 'react'
const { Sider, Content } = Layout

export default function App() {
  useEffect(() => {
    Message.info('Deconstruct Particles – workspace ready')
  }, [])

  return (
    <Layout style={{ height: '100vh' }}>
      <Content style={{ flex: 1, padding: 12 }}>
        {/* 左侧：操作栏 + 画布区（70%） */}
        <div style={{ height: '100%', borderRadius: 12, border: '1px solid #eee' }}>
          {/* TODO: Toolbar + Canvas */}
        </div>
      </Content>
      <Sider style={{ width: '30%', minWidth: 320, padding: 12, borderLeft: '1px solid #eee' }}>
        {/* 右侧：配置表单 */}
        {/* TODO: Config Form */}
      </Sider>
    </Layout>
  )
}
