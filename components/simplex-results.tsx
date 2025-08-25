"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calculator, CheckCircle } from "lucide-react"
import { useState } from "react"
import type { SimplexSolution } from "@/lib/simplex-solver"

interface SimplexResultsProps {
  solution: SimplexSolution
}

export function SimplexResults({ solution }: SimplexResultsProps) {
  const [currentTableau, setCurrentTableau] = useState(0)

  if (!solution.isOptimal && !solution.isUnbounded) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Problema No Factible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">El problema no tiene solución factible.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (solution.isUnbounded) {
    return (
      <div className="space-y-4">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700">Solución No Acotada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600">El problema tiene una solución no acotada. El valor óptimo es infinito.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tableau = solution.tableaus[currentTableau]

  return (
    <div className="space-y-6">
      {/* Solution Summary */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Solución Óptima Encontrada
          </CardTitle>
          <CardDescription>Valor óptimo: {solution.optimalValue.toFixed(4)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(solution.variables).map(([variable, value]) => (
              <div key={variable} className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-mono text-lg font-semibold text-green-800">{variable}</div>
                <div className="text-green-600">{value.toFixed(4)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tableau Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tableaux del Método Simplex
          </CardTitle>
          <CardDescription>
            Iteración {tableau.iteration} de {solution.tableaus.length - 1}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTableau(Math.max(0, currentTableau - 1))}
              disabled={currentTableau === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <Badge variant="secondary">{tableau.isOptimal ? "Óptimo" : "En progreso"}</Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTableau(Math.min(solution.tableaus.length - 1, currentTableau + 1))}
              disabled={currentTableau === solution.tableaus.length - 1}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Tableau Explanation */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{tableau.explanation}</p>
            {tableau.pivotRow !== undefined && tableau.pivotCol !== undefined && (
              <p className="text-sm text-blue-600 mt-1">
                Elemento pivote: Fila {tableau.pivotRow + 1}, Columna {tableau.pivotCol + 1}
              </p>
            )}
          </div>

          {/* Tableau Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-sm font-medium">Variable Básica</th>
                  {tableau.table[0] &&
                    tableau.table[0].slice(0, -1).map((_, j) => (
                      <th key={j} className="border border-slate-300 p-2 text-sm font-medium">
                        x{j + 1}
                      </th>
                    ))}
                  <th className="border border-slate-300 p-2 text-sm font-medium">RHS</th>
                </tr>
              </thead>
              <tbody>
                {tableau.table.slice(0, -1).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-sm font-medium bg-slate-50">
                      {tableau.basicVariables[i]}
                    </td>
                    {row.slice(0, -1).map((cell, j) => (
                      <td
                        key={j}
                        className={`border border-slate-300 p-2 text-sm text-center font-mono ${
                          tableau.pivotRow === i && tableau.pivotCol === j ? "bg-yellow-200 font-bold" : ""
                        }`}
                      >
                        {cell.toFixed(3)}
                      </td>
                    ))}
                    <td className="border border-slate-300 p-2 text-sm text-center font-mono">
                      {row[row.length - 1].toFixed(3)}
                    </td>
                  </tr>
                ))}
                {/* Objective Row */}
                <tr className="bg-blue-50">
                  <td className="border border-slate-300 p-2 text-sm font-medium">Z</td>
                  {tableau.objectiveRow.slice(0, -1).map((cell, j) => (
                    <td
                      key={j}
                      className={`border border-slate-300 p-2 text-sm text-center font-mono ${
                        tableau.pivotCol === j ? "bg-yellow-200 font-bold" : ""
                      }`}
                    >
                      {cell.toFixed(3)}
                    </td>
                  ))}
                  <td className="border border-slate-300 p-2 text-sm text-center font-mono font-bold">
                    {tableau.objectiveRow[tableau.objectiveRow.length - 1].toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Steps Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {solution.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  {index + 1}
                </Badge>
                <p className="text-sm text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
