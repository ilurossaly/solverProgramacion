"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, BarChart, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { SensitivityAnalysis } from "@/lib/sensitivity-analyzer"

interface SensitivityResultsProps {
  analysis: SensitivityAnalysis
}

export function SensitivityResults({ analysis }: SensitivityResultsProps) {
  if (!analysis.isValid) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Análisis de Sensibilidad No Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <p key={index} className="text-red-600">
                  {rec}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TrendingUp className="h-5 w-5" />
            Resumen del Análisis de Sensibilidad
          </CardTitle>
          <CardDescription>Información clave sobre la estabilidad de la solución</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Variable Más Sensible</div>
              <div className="font-semibold text-blue-800">{analysis.summary.mostSensitiveVariable || "N/A"}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Recurso Más Limitante</div>
              <div className="font-semibold text-green-800">{analysis.summary.mostConstrainingResource || "N/A"}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Holgura Total</div>
              <div className="font-semibold text-purple-800">{analysis.summary.totalSlack.toFixed(3)}</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {analysis.optimalBasisStability.isStable ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="font-medium">
                {analysis.optimalBasisStability.isStable ? "Base Óptima Estable" : "Base Óptima Sensible"}
              </span>
            </div>
            {!analysis.optimalBasisStability.isStable && (
              <div className="text-sm text-slate-600">
                <p>Rangos críticos detectados:</p>
                <ul className="list-disc list-inside mt-1">
                  {analysis.optimalBasisStability.criticalRanges.map((range, index) => (
                    <li key={index}>{range}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shadow-prices" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shadow-prices">Precios Sombra</TabsTrigger>
              <TabsTrigger value="objective-ranges">Coeficientes Objetivo</TabsTrigger>
              <TabsTrigger value="rhs-ranges">Lado Derecho</TabsTrigger>
            </TabsList>

            <TabsContent value="shadow-prices" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Precios Sombra de las Restricciones</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-3 text-left text-sm font-medium">Restricción</th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">Precio Sombra</th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">
                          Aumento Permitido
                        </th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">
                          Disminución Permitida
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.shadowPrices.map((sp, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-3 text-sm">{sp.constraint}</td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            <Badge variant={sp.shadowPrice > 0 ? "default" : "secondary"}>
                              {sp.shadowPrice.toFixed(4)}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {sp.allowableIncrease === Number.POSITIVE_INFINITY ? "∞" : sp.allowableIncrease.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {sp.allowableDecrease === Number.POSITIVE_INFINITY ? "∞" : sp.allowableDecrease.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  {analysis.shadowPrices.map((sp, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800 mb-1">{sp.constraint}</div>
                      <div className="text-sm text-blue-700">{sp.interpretation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="objective-ranges" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Rangos de Coeficientes de la Función Objetivo</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-3 text-left text-sm font-medium">Variable</th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">Valor Actual</th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">
                          Aumento Permitido
                        </th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">
                          Disminución Permitida
                        </th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">Costo Reducido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.objectiveCoefficients.map((oc, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-3 text-sm font-medium">{oc.variable}</td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {oc.currentValue.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {oc.allowableIncrease === Number.POSITIVE_INFINITY ? "∞" : oc.allowableIncrease.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {oc.allowableDecrease === Number.POSITIVE_INFINITY ? "∞" : oc.allowableDecrease.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            <Badge variant={oc.reducedCost === 0 ? "default" : "outline"}>
                              {oc.reducedCost.toFixed(4)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Interpretación de Costos Reducidos</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Costo reducido = 0: La variable está en la base óptima</li>
                    <li>
                      • Costo reducido ≠ 0: La variable no está en la base, cambiar su coeficiente puede afectar la
                      optimalidad
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rhs-ranges" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Rangos del Lado Derecho (RHS)</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-3 text-left text-sm font-medium">Restricción</th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">Valor Actual</th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">
                          Aumento Permitido
                        </th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">
                          Disminución Permitida
                        </th>
                        <th className="border border-slate-300 p-3 text-center text-sm font-medium">Precio Sombra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.rhsRanges.map((rhs, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-3 text-sm">{rhs.constraint}</td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {rhs.currentValue.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {rhs.allowableIncrease === Number.POSITIVE_INFINITY
                              ? "∞"
                              : rhs.allowableIncrease.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            {rhs.allowableDecrease === Number.POSITIVE_INFINITY
                              ? "∞"
                              : rhs.allowableDecrease.toFixed(3)}
                          </td>
                          <td className="border border-slate-300 p-3 text-sm text-center font-mono">
                            <Badge variant={rhs.shadowPrice > 0 ? "default" : "secondary"}>
                              {rhs.shadowPrice.toFixed(4)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Interpretación de Rangos RHS</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Estos rangos indican cuánto puede cambiar el lado derecho de cada restricción sin que cambie la base
                    óptima. Fuera de estos rangos, la solución óptima puede cambiar.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Recomendaciones
          </CardTitle>
          <CardDescription>Sugerencias basadas en el análisis de sensibilidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  {index + 1}
                </Badge>
                <p className="text-sm text-green-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
