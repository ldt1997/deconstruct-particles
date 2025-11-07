import { Button, Space, Tooltip } from "@arco-design/web-react";
import {
  IconUndo,
  IconRedo,
  IconRefresh,
  IconDownload,
  IconDice,
  IconZoomIn,
  IconZoomOut,
} from "@arco-design/web-react/icon";
import { useDotsStore } from "../store/useDotsStore";
import { downloadWithPaperTexture } from "../utils/downloadImage";

export default function Toolbar({
  layout,
  onZoomIn,
  onZoomOut,
}: {
  layout?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}) {
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
      <Tooltip content="Zoom Out">
        <Button icon={<IconZoomOut />} onClick={onZoomOut} />
      </Tooltip>
      <Tooltip content="Zoom In">
        <Button icon={<IconZoomIn />} onClick={onZoomIn} />
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
