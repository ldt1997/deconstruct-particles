import { useDotsStore } from '../store/useDotsStore'
import { v4 as uuid } from 'uuid'

interface Props {
  imageUrl: string
  layout: 'vertical' | 'horizontal'
}

export default function CanvasPane({ imageUrl, layout }: Props) {
  const { dots, addDot } = useDotsStore()
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    addDot({ id: uuid(), x, y, radius: 0.05 })
  }

  const containerStyle =
    layout === 'vertical'
      ? { display: 'flex', flexDirection: 'row', gap: 8 }
      : { display: 'flex', flexDirection: 'column', gap: 8 }

  return (
    <div style={{ ...containerStyle, height: '100%', minHeight: 400 }} id="canvas-pane">
      <div
        style={{
          flex: 1,
          minHeight: 400,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          cursor: 'crosshair',
        }}
        onClick={handleClick}
      />
      <div
        style={{
          flex: 1,
          backgroundColor: '#ccc',
          position: 'relative',
        }}
      >
        {dots.map((dot) => (
          <div
            key={dot.id}
            style={{
              position: 'absolute',
              width: `${dot.radius * 100}%`,
              height: `${dot.radius * 100}%`,
              borderRadius: '50%',
              left: `${dot.x * 100}%`,
              top: `${dot.y * 100}%`,
              background: '#fff3',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
