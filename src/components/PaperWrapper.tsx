import { PaperTexture } from '@paper-design/shaders-react'

export default function PaperWrapper({
  children,
  colorFront,
  roughness,
}: {
  children?: React.ReactNode
  colorFront: string
  roughness: number
}) {
  return (
    <PaperTexture colorFront={colorFront} roughness={roughness}>
      {children}
    </PaperTexture>
  )
}
