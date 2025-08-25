// OCR Service for extracting text from images
export class OCRService {
  private static instance: OCRService
  private worker: any = null

  private constructor() {}

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService()
    }
    return OCRService.instance
  }

  async initializeWorker() {
    if (this.worker) return this.worker

    // Using Tesseract.js for OCR in the browser
    const { createWorker } = await import("tesseract.js")

    this.worker = await createWorker("spa", 1, {
      logger: (m) => console.log("[OCR]", m),
    })

    await this.worker.setParameters({
      tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-=≤≥<>()[]{}.,;: \n\t",
      tessedit_pageseg_mode: "6", // Uniform block of text
    })

    return this.worker
  }

  async extractTextFromImage(imageData: string): Promise<string> {
    try {
      const worker = await this.initializeWorker()
      const {
        data: { text },
      } = await worker.recognize(imageData)
      return text.trim()
    } catch (error) {
      console.error("OCR Error:", error)
      throw new Error("Error al procesar la imagen con OCR")
    }
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}
