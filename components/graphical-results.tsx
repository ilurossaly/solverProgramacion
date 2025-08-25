"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import type { GraphicalSolution } from "@/lib/graphical-solver"

interface GraphicalResultsProps {
  solution: GraphicalSolution
}

export function GraphicalResults({ solution }: GraphicalResultsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && solution.isValid && solution.isFeasible) {
      drawGraph()
    }
  }, [solution])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up coordinate system
    const padding = 40
    const width = canvas.width - 2 * padding
    const height = canvas.height - 2 * padding

    // Find bounds for the graph
    const maxX = Math.max(10, ...solution.cornerPoints.map((p) => p.x)) + 2
    const maxY = Math.max(10, ...solution.cornerPoints.map((p) => p.y)) + 2

    const scaleX = width / maxX
    const scaleY = height / maxY

    // Transform coordinates
    const transform = (x: number, y: number) => ({
      x: padding + x * scaleX,
      y: canvas.height - padding - y * scaleY,
    })

    // Draw axes
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.beginPath()
    // X-axis
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    // Y-axis
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = "#374151"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("x₁", canvas.width - 20, canvas.height - 10)
    ctx.save()
    ctx.translate(15, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("x₂", 0, 0)
    ctx.restore()

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    for (let i = 1; i <= maxX; i++) {
      const pos = transform(i, 0)
      ctx.beginPath()
      ctx.moveTo(pos.x, padding)
      ctx.lineTo(pos.x, canvas.height - padding)
      ctx.stroke()

      // Grid labels
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(i.toString(), pos.x, canvas.height - padding + 15)
    }

    for (let i = 1; i <= maxY; i++) {
      const pos = transform(0, i)
      ctx.beginPath()
      ctx.moveTo(padding, pos.y)
      ctx.lineTo(canvas.width - padding, pos.y)
      ctx.stroke()

      // Grid labels
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(i.toString(), padding - 5, pos.y + 4)
    }

    // Draw constraint lines
    ctx.lineWidth = 2
    solution.constraintLines.forEach((line, index) => {
      if (line.label.includes("≥ 0")) return // Skip non-negativity constraints

      ctx.strokeStyle = `hsl(${(index * 60) % 360}, 70%, 50%)`
      ctx.beginPath()

      // Find two points on the line ax + by = c
      const points = []
      if (Math.abs(line.b) > 1e-10) {
        // Line is not vertical
        points.push({ x: 0, y: line.c / line.b })
        points.push({ x: maxX, y: (line.c - line.a * maxX) / line.b })
      } else {
        // Line is vertical
        points.push({ x: line.c / line.a, y: 0 })
        points.push({ x: line.c / line.a, y: maxY })
      }

      const p1 = transform(points[0].x, points[0].y)
      const p2 = transform(points[1].x, points[1].y)

      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()

      // Label the line
      const midX = (p1.x + p2.x) / 2
      const midY = (p1.y + p2.y) / 2
      ctx.fillStyle = `hsl(${(index * 60) % 360}, 70%, 40%)`
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`C${index + 1}`, midX, midY - 5)
    })

    // Draw feasible region (simplified as convex hull of corner points)
    if (solution.cornerPoints.length > 0) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)"
      ctx.lineWidth = 2

      ctx.beginPath()
      const firstPoint = transform(solution.cornerPoints[0].x, solution.cornerPoints[0].y)
      ctx.moveTo(firstPoint.x, firstPoint.y)

      // Sort points by angle for proper polygon drawing
      const sortedPoints = [...solution.cornerPoints].sort((a, b) => {
        const angleA = Math.atan2(a.y, a.x)
        const angleB = Math.atan2(b.y, b.x)
        return angleA - angleB
      })

      sortedPoints.forEach((point) => {
        const pos = transform(point.x, point.y)
        ctx.lineTo(pos.x, pos.y)
      })

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    // Draw corner points
    solution.cornerPoints.forEach((point, index) => {
      const pos = transform(point.x, point.y)

      // Point circle
      ctx.fillStyle = "#1f2937"
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Point label
      ctx.fillStyle = "#1f2937"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(point.label || `P${index + 1}`, pos.x, pos.y - 10)
    })

    // Highlight optimal point
    if (solution.optimalPoint) {
      const pos = transform(solution.optimalPoint.x, solution.optimalPoint.y)

      ctx.fillStyle = "#dc2626"
      ctx.strokeStyle = "#dc2626"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Optimal point label
      ctx.fillStyle = "#dc2626"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("ÓPTIMO", pos.x, pos.y - 15)
    }
  }

  if (!solution.isValid) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Método Gráfico No Aplicable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{solution.errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!solution.isFeasible) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Problema No Factible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">El problema no tiene solución factible en el método gráfico.</p>
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

  return (
    <div className="space-y-6">
      {/* Solution Summary */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Solución Óptima (Método Gráfico)
          </CardTitle>
          <CardDescription>
            Punto óptimo: ({solution.optimalPoint?.x.toFixed(3)}, {solution.optimalPoint?.y.toFixed(3)}) | Valor óptimo:{" "}
            {solution.optimalValue.toFixed(4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="font-mono text-lg font-semibold text-green-800">x₁</div>
              <div className="text-green-600">{solution.optimalPoint?.x.toFixed(4)}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="font-mono text-lg font-semibold text-green-800">x₂</div>
              <div className="text-green-600">{solution.optimalPoint?.y.toFixed(4)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphical Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visualización Gráfica
          </CardTitle>
          <CardDescription>Región factible y punto óptimo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <canvas ref={canvasRef} width={500} height={400} className="border border-slate-200 rounded-lg" />
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Región factible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                <span>Puntos esquina</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span>Punto óptimo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span>Restricciones</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corner Points Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Puntos Esquina</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-sm font-medium">Punto</th>
                  <th className="border border-slate-300 p-2 text-sm font-medium">x₁</th>
                  <th className="border border-slate-300 p-2 text-sm font-medium">x₂</th>
                  <th className="border border-slate-300 p-2 text-sm font-medium">Valor Z</th>
                  <th className="border border-slate-300 p-2 text-sm font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {solution.cornerPoints.map((point, index) => {
                  const isOptimal =
                    solution.optimalPoint &&
                    Math.abs(point.x - solution.optimalPoint.x) < 1e-6 &&
                    Math.abs(point.y - solution.optimalPoint.y) < 1e-6

                  const objectiveValue = solution.objectiveLine.a * point.x + solution.objectiveLine.b * point.y

                  return (
                    <tr key={index} className={isOptimal ? "bg-green-50" : "hover:bg-slate-50"}>
                      <td className="border border-slate-300 p-2 text-sm font-medium">P{index + 1}</td>
                      <td className="border border-slate-300 p-2 text-sm text-center font-mono">
                        {point.x.toFixed(3)}
                      </td>
                      <td className="border border-slate-300 p-2 text-sm text-center font-mono">
                        {point.y.toFixed(3)}
                      </td>
                      <td className="border border-slate-300 p-2 text-sm text-center font-mono">
                        {objectiveValue.toFixed(3)}
                      </td>
                      <td className="border border-slate-300 p-2 text-sm text-center">
                        {isOptimal ? (
                          <Badge className="bg-green-100 text-green-800">Óptimo</Badge>
                        ) : (
                          <Badge variant="outline">Factible</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Steps Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos del Método Gráfico</CardTitle>
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
