"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, BarChart3, TrendingUp } from "lucide-react"
import { ProblemInput } from "@/components/problem-input"
import { ResultsPanel } from "@/components/results-panel"
import { ExamplesPanel } from "@/components/examples-panel"
import { NLPService } from "@/lib/nlp-service"
import { SimplexSolver } from "@/lib/simplex-solver"
import { GraphicalSolver } from "@/lib/graphical-solver"
import { SensitivityAnalyzer } from "@/lib/sensitivity-analyzer"
import { InterpretationService } from "@/lib/interpretation-service"

// === Tipos inline (sin archivo externo) ===
type ResultsState =
  | {
      simplex: any
      graphical: any
      sensitivity: any
      interpretation: any
      report: any
      reportText?: string
      parsedProblem?: any
      error?: string
    }
  | null

export default function LinearProgrammingApp() {
  const [problem, setProblem] = useState<string>("")
  const [results, setResults] = useState<ResultsState>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const handleSolve = async () => {
    if (!problem.trim()) return

    setIsProcessing(true)

    try {
      console.log("[v0] Starting problem solving process")

      // Parse the problem using NLP
      const nlpService = NLPService.getInstance()
      const parsedProblem = nlpService.parseLinearProgrammingProblem(problem)

      console.log("[v0] Parsed problem:", parsedProblem)

      // Solve using Simplex method
      const simplexSolver = SimplexSolver.getInstance()
      const simplexSolution = simplexSolver.solve(parsedProblem)

      console.log("[v0] Simplex solution:", simplexSolution)

      // Solve using Graphical method
      const graphicalSolver = GraphicalSolver.getInstance()
      const graphicalSolution = graphicalSolver.solve(parsedProblem)

      console.log("[v0] Graphical solution:", graphicalSolution)

      // Perform Sensitivity Analysis
      const sensitivityAnalyzer = SensitivityAnalyzer.getInstance()
      const sensitivityAnalysis = sensitivityAnalyzer.analyze(simplexSolution, parsedProblem)

      console.log("[v0] Sensitivity analysis:", sensitivityAnalysis)

      // Generate Interpretation and Report
      const interpretationService = InterpretationService.getInstance()
      const interpretation = interpretationService.generateInterpretation(
        parsedProblem,
        simplexSolution,
        graphicalSolution,
        sensitivityAnalysis,
      )

      const report = interpretationService.generateDetailedReport(
        parsedProblem,
        simplexSolution,
        graphicalSolution,
        sensitivityAnalysis,
        interpretation,
      )

      const reportText = interpretationService.exportReportAsText(report)

      console.log("[v0] Interpretation generated:", interpretation)
      console.log("[v0] Report generated:", report)

      setResults({
        simplex: simplexSolution,
        graphical: graphicalSolution,
        sensitivity: sensitivityAnalysis,
        interpretation,
        report,
        reportText,
        parsedProblem,
      })
    } catch (error: unknown) {
      console.error("[v0] Error solving problem:", error)
      setResults({
        error: error instanceof Error ? error.message : "Error desconocido",
        simplex: null,
        graphical: null,
        sensitivity: null,
        interpretation: null,
        report: null,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSelectExample = (exampleText: string) => {
    setProblem(exampleText)
    setResults(null) // Clear previous results when loading new example
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Solucionador de Programación Lineal</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Resuelve problemas de programación lineal usando métodos simplex y gráfico con análisis completo de
            sensibilidad
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-slate-800 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Entrada del Problema
                </CardTitle>
                <CardDescription className="text-slate-200">Ingresa tu problema de programación lineal</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ProblemInput
                  problem={problem}
                  setProblem={setProblem}
                  onSolve={handleSolve}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>

            <ExamplesPanel onSelectExample={handleSelectExample} />
          </div>

          {/* Results Section */}
          <div>
            <Card className="border-slate-200 shadow-lg h-full">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resultados y Análisis
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Solución completa con análisis de sensibilidad
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResultsPanel results={results} isProcessing={isProcessing} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center border-slate-200">
            <CardContent className="p-6">
              <Calculator className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Método Simplex</h3>
              <p className="text-sm text-slate-600">
                Solución paso a paso con todas las iteraciones del algoritmo simplex
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-slate-200">
            <CardContent className="p-6">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Método Gráfico</h3>
              <p className="text-sm text-slate-600">Visualización gráfica de la región factible y punto óptimo</p>
            </CardContent>
          </Card>

          <Card className="text-center border-slate-200">
            <CardContent className="p-6">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2">Análisis de Sensibilidad</h3>
              <p className="text-sm text-slate-600">Análisis completo de cambios en coeficientes y restricciones</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
