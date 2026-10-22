import sharp from 'sharp'
const src = process.argv[2] || 'public/logo-source.jpg'
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }
// Beyaz kenarları kırp, kareye tamamla
const trimmed = await sharp(src).trim({ background: '#ffffff', threshold: 25 }).toBuffer()
const { width, height } = await sharp(trimmed).metadata()
const side = Math.max(width, height)
const square = await sharp(trimmed)
  .extend({ top: Math.floor((side - height) / 2), bottom: Math.ceil((side - height) / 2), left: Math.floor((side - width) / 2), right: Math.ceil((side - width) / 2), background: WHITE })
  .toBuffer()

async function make(name, size, ratio) {
  const inner = Math.round(size * ratio)
  const logo = await sharp(square).resize(inner, inner).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: logo, gravity: 'centre' }]).png().toFile(`public/${name}`)
  console.log('ok', name)
}
await make('pwa-192.png', 192, 0.92)
await make('pwa-512.png', 512, 0.92)
await make('maskable-512.png', 512, 0.68)
await make('apple-touch-icon.png', 180, 0.92)
await make('favicon.png', 64, 1)
await make('logo.png', 160, 1)
