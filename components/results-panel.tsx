"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, BarChart3, TrendingUp, FileText, Loader2 } from "lucide-react"
import { SimplexResults } from "./simplex-results"
import { GraphicalResults } from "./graphical-results"
import { SensitivityResults } from "./sensitivity-results"
import { InterpretationResults } from "./interpretation-results"

interface ResultsPanelProps {
  results: any
  isProcessing: boolean
}

export function ResultsPanel({ results, isProcessing }: ResultsPanelProps) {
  const handleExportReport = () => {
    if (results?.report) {
      const reportText = results.reportText || "Reporte no disponible"
      const blob = new Blob([reportText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "reporte-programacion-lineal.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-600">Procesando problema...</p>
        <p className="text-sm text-slate-500">Esto puede tomar unos momentos</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <div className="p-4 bg-slate-100 rounded-full">
          <Calculator className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="text-slate-600 font-medium">Listo para resolver</p>
          <p className="text-sm text-slate-500">Ingresa un problema de programación lineal para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="simplex" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="simplex" className="flex items-center gap-1">
          <Calculator className="h-3 w-3" />
          <span className="hidden sm:inline">Simplex</span>
        </TabsTrigger>
        <TabsTrigger value="graphical" className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          <span className="hidden sm:inline">Gráfico</span>
        </TabsTrigger>
        <TabsTrigger value="sensitivity" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span className="hidden sm:inline">Sensibilidad</span>
        </TabsTrigger>
        <TabsTrigger value="interpretation" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span className="hidden sm:inline">Interpretación</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="simplex" className="space-y-4">
        {results.simplex ? (
          <SimplexResults solution={results.simplex} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Método Simplex
              </CardTitle>
              <CardDescription>Solución paso a paso del algoritmo simplex</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="secondary">En desarrollo</Badge>
                <p className="text-slate-600">Implementación pendiente del método simplex</p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="graphical" className="space-y-4">
        {results.graphical ? (
          <GraphicalResults solution={results.graphical} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Método Gráfico
              </CardTitle>
              <CardDescription>Visualización de la región factible y solución óptima</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="secondary">En desarrollo</Badge>
                <p className="text-slate-600">Implementación pendiente del método gráfico</p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="sensitivity" className="space-y-4">
        {results.sensitivity ? (
          <SensitivityResults analysis={results.sensitivity} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análisis de Sensibilidad
              </CardTitle>
              <CardDescription>Análisis de cambios en coeficientes y restricciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="secondary">En desarrollo</Badge>
                <p className="text-slate-600">Implementación pendiente del análisis de sensibilidad</p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="interpretation" className="space-y-4">
        {results.interpretation && results.report ? (
          <InterpretationResults
            interpretation={results.interpretation}
            report={results.report}
            onExportReport={handleExportReport}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interpretación
              </CardTitle>
              <CardDescription>Explicación detallada de los resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="secondary">En desarrollo</Badge>
                <p className="text-slate-600">Interpretación automática de los resultados en lenguaje natural</p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
