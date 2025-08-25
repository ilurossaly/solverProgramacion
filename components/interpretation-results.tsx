"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, BookOpen, Lightbulb, TrendingUp, CheckCircle } from "lucide-react"
import type { ProblemInterpretation, DetailedReport } from "@/lib/interpretation-service"

interface InterpretationResultsProps {
  interpretation: ProblemInterpretation
  report: DetailedReport
  onExportReport: () => void
}

export function InterpretationResults({ interpretation, report, onExportReport }: InterpretationResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <BookOpen className="h-5 w-5" />
                Interpretación y Análisis Completo
              </CardTitle>
              <CardDescription>Explicación detallada de los resultados en lenguaje natural</CardDescription>
            </div>
            <Button onClick={onExportReport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Interpretation Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
              <TabsTrigger value="implications">Implicaciones</TabsTrigger>
              <TabsTrigger value="report">Reporte</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Resumen del Problema
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">{interpretation.problemSummary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Análisis del Objetivo
                  </h3>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-purple-800">{interpretation.objectiveAnalysis}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Explicación de la Solución
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800">{interpretation.solutionExplanation}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Análisis de Restricciones</h3>
                  <div className="space-y-3">
                    {interpretation.constraintsAnalysis.map((analysis, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-400">
                        <p className="text-slate-700">{analysis}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Comparación de Métodos</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800">{interpretation.methodComparison}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implications" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-orange-600" />
                    Implicaciones Prácticas
                  </h3>
                  <div className="space-y-3">
                    {interpretation.practicalImplications.map((implication, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <Badge variant="outline" className="mt-0.5 text-xs">
                          {index + 1}
                        </Badge>
                        <p className="text-orange-800">{implication}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Recomendaciones
                  </h3>
                  <div className="space-y-3">
                    {interpretation.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Badge variant="outline" className="mt-0.5 text-xs">
                          {index + 1}
                        </Badge>
                        <p className="text-green-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="report" className="space-y-6">
              <div className="space-y-6">
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                  <p className="text-slate-600 mb-4">Reporte técnico completo con todos los detalles del análisis</p>
                  <Button onClick={onExportReport} size="lg" className="bg-slate-800 hover:bg-slate-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Reporte Completo
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Resumen Ejecutivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{report.executiveSummary}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Detalles Técnicos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Iteraciones:</span>
                          <span className="font-mono">{report.technicalDetails.iterations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tiempo:</span>
                          <span className="font-mono">{report.technicalDetails.computationTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Metodología Utilizada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.methodologyUsed.map((method, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className="mt-0.5 text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-slate-700">{method}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Conclusiones Principales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.conclusions.map((conclusion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{conclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
