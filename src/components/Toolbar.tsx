import { Button, Space, Tooltip } from '@arco-design/web-react'
import { IconUndo, IconRedo, IconRefresh, IconDownload, IconDice } from '@arco-design/web-react/icon'
import { useDotsStore } from '../store/useDotsStore'
import { downloadImage } from '../utils/downloadImage'

export default function Toolbar() {
  const { undo, redo, reset, randomize } = useDotsStore()
  return (
    <Space>
      <Tooltip content="Undo">
        <Button icon={<IconUndo />} onClick={undo} />
      </Tooltip>
      <Tooltip content="Redo">
        <Button icon={<IconRedo />} onClick={redo} />
      </Tooltip>
      <Tooltip content="Randomize">
        <Button icon={<IconDice />} onClick={randomize} />
      </Tooltip>
      <Tooltip content="Reset">
        <Button icon={<IconRefresh />} onClick={reset} />
      </Tooltip>
      <Tooltip content="Download">
        <Button icon={<IconDownload />} onClick={() => downloadImage('canvas-pane')} />
      </Tooltip>
    </Space>
  )
}
