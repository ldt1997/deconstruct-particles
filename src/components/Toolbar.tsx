import { Button, Space, Tooltip } from "@arco-design/web-react";
import {
  IconUndo,
  IconRedo,
  IconRefresh,
  IconDownload,
  IconDice,
} from "@arco-design/web-react/icon";
import { useDotsStore } from "../store/useDotsStore";
import { downloadWithPaperTexture } from "../utils/downloadImage";

export default function Toolbar({ layout }: { layout?: string }) {
  const { undo, redo, reset, randomize, history, future } = useDotsStore();
  return (
    <Space>
      <Tooltip content="Undo">
        <Button
          icon={<IconUndo />}
          onClick={undo}
          disabled={!history?.length}
        />
      </Tooltip>
      <Tooltip content="Redo">
        <Button icon={<IconRedo />} onClick={redo} disabled={!future?.length} />
      </Tooltip>
      <Tooltip content="Randomize">
        <Button icon={<IconDice />} onClick={randomize} />
      </Tooltip>
      <Tooltip content="Reset">
        <Button icon={<IconRefresh />} onClick={reset} />
      </Tooltip>
      {/* FIXME: don't work now */}
      <Tooltip content="Download">
        <Button
          icon={<IconDownload />}
          onClick={() => downloadWithPaperTexture(layout)}
        />
      </Tooltip>
    </Space>
  );
}
