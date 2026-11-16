import { createEpubSource, createFlipview, createPdfSource, type FlipviewHandle } from 'flipview'
import 'flipview/flipview.css'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

export { createEpubSource, createFlipview, createPdfSource, pdfWorkerUrl }
export type { FlipviewHandle }
