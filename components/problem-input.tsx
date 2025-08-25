"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, ImageIcon, Clipboard, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { OCRService } from "@/lib/ocr-service"
import { NLPService } from "@/lib/nlp-service"

interface ProblemInputProps {
  problem: string
  setProblem: (problem: string) => void
  onSolve: () => void
  isProcessing: boolean
}

export function ProblemInput({ problem, setProblem, onSolve, isProcessing }: ProblemInputProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [ocrError, setOcrError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setOcrStatus("idle")
        setOcrError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImageWithOCR = async () => {
    if (!uploadedImage) return

    setIsProcessingOCR(true)
    setOcrStatus("processing")
    setOcrError(null)

    try {
      const ocrService = OCRService.getInstance()
      const extractedText = await ocrService.extractTextFromImage(uploadedImage)

      if (!extractedText.trim()) {
        throw new Error("No se pudo extraer texto de la imagen")
      }

      const nlpService = NLPService.getInstance()
      const parsedProblem = nlpService.parseLinearProgrammingProblem(extractedText)
      const formattedText = nlpService.formatProblemAsText(parsedProblem)

      setProblem(formattedText)
      setOcrStatus("success")

      console.log("[v0] OCR extracted text:", extractedText)
      console.log("[v0] NLP parsed problem:", parsedProblem)
    } catch (error) {
      console.error("[v0] OCR/NLP Error:", error)
      setOcrError(error instanceof Error ? error.message : "Error procesando la imagen")
      setOcrStatus("error")
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type)
            const file = new File([blob], "clipboard-image.png", { type })
            handleFile(file)
            break
          }
        }
      }
    } catch (err) {
      console.error("Error accessing clipboard:", err)
    }
  }

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Texto
        </TabsTrigger>
        <TabsTrigger value="image" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Imagen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-4">
        <Textarea
          placeholder="Ingresa tu problema de programación lineal aquí...

Ejemplo:
Maximizar: Z = 3x₁ + 2x₂
Sujeto a:
x₁ + x₂ ≤ 4
2x₁ + x₂ ≤ 6
x₁, x₂ ≥ 0"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />

        <Button
          onClick={onSolve}
          disabled={!problem.trim() || isProcessing}
          className="w-full bg-slate-800 hover:bg-slate-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Resolver Problema"
          )}
        </Button>
      </TabsContent>

      <TabsContent value="image" className="space-y-4">
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded problem"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                {ocrStatus === "success" && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Texto extraído exitosamente</span>
                  </div>
                )}
                {ocrStatus === "error" && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{ocrError}</span>
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedImage(null)
                      setOcrStatus("idle")
                      setOcrError(null)
                    }}
                  >
                    Cambiar Imagen
                  </Button>
                  <Button
                    onClick={processImageWithOCR}
                    disabled={isProcessingOCR}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingOCR ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando OCR...
                      </>
                    ) : (
                      "Extraer Texto"
                    )}
                  </Button>
                  {ocrStatus === "success" && (
                    <Button onClick={onSolve} disabled={isProcessing} className="bg-slate-800 hover:bg-slate-700">
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resolviendo...
                        </>
                      ) : (
                        "Resolver Problema"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-slate-700 mb-2">Sube una imagen del problema</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Arrastra y suelta una imagen aquí, o usa los botones de abajo
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Archivo
                  </Button>
                  <Button variant="outline" onClick={handlePasteFromClipboard}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Pegar del Portapapeles
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
