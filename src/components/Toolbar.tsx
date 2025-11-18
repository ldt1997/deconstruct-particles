import { Button, Space, Tooltip } from "@arco-design/web-react";
import {
  IconUndo,
  IconRedo,
  IconRefresh,
  IconDownload,
  IconDice,
  IconZoomIn,
  IconZoomOut,
  IconFullscreen,
} from "@arco-design/web-react/icon";
import { useDotsStore } from "../store/useDotsStore";
import { downloadWithPaperTexture } from "../utils/downloadImage";

export default function Toolbar({
  layout,
  onZoomIn,
  onZoomOut,
  onResetZoom
}: {
  layout?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}) {
  const { undo, redo, reset, centerize, history, future } = useDotsStore();
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
      {/* <Tooltip content="Randomize">
        <Button icon={<IconDice />} onClick={randomize} />
      </Tooltip> */}
      <Tooltip content="Centerize">
        <Button icon={<IconDice />} onClick={centerize} />
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
      <Tooltip content="Reset Zoom">
        <Button icon={<IconFullscreen />} onClick={onResetZoom} />
      </Tooltip>
      {/* FIXME: don't work now */}
      <Tooltip content="Download (Not supported yet)">
        <Button
          icon={<IconDownload />}
          disabled
          onClick={() => downloadWithPaperTexture(layout)}
        />
      </Tooltip>
    </Space>
  );
}
