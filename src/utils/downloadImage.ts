export function downloadImage(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  html2canvas(el as HTMLElement).then((canvas) => {
    const link = document.createElement('a')
    link.download = 'deconstruct-particles.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}
