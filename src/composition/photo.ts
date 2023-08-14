import html2canvas from "html2canvas"
import { saveAs } from 'file-saver'

export async function takeScreenshot(
  selector = '#phone-case-inner',
  filename = `foto-rehearsal-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`,
) {
  return new Promise((resolve) => {
    html2canvas(
      document.querySelector(selector)!,
      { scale: 4 },
    )
      .then((canvas) => {
        canvas.toBlob((blob:any) => {
          saveAs(blob, filename)
          resolve()
        })
      })
  })
}

export const Serializers = {
  boolean: {
    read(v:any) { return v === 'true' },
    write(v:any) { return String(v) },
  },
  object: {
    read(v:any, d:any) { return v ? JSON.parse(v) : d },
    write(v:any) { return JSON.stringify(v) },
  },
  number: {
    read(v:any, d:any) { return v != null ? Number.parseFloat(v) : d },
    write(v:any) { return String(v) },
  },
  any: {
    read(v:any, d:any) { return v !== null && v !== undefined ? v : d },
    write(v:any) { return String(v) },
  },
  string: {
    read(v:any, d:any) { return v !== null && v !== undefined ? v : d },
    write(v:any) { return String(v) },
  },
}
