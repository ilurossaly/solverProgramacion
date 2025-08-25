// Graphical Method Implementation for 2-variable Linear Programming
export interface Point {
  x: number
  y: number
  label?: string
}

export interface Line {
  a: number // coefficient of x
  b: number // coefficient of y
  c: number // constant (ax + by = c)
  label: string
  isActive: boolean
}

export interface GraphicalSolution {
  isValid: boolean
  isFeasible: boolean
  isUnbounded: boolean
  optimalPoint: Point | null
  optimalValue: number
  feasibleRegion: Point[]
  constraintLines: Line[]
  objectiveLine: Line
  cornerPoints: Point[]
  steps: string[]
  errorMessage?: string
}

export class GraphicalSolver {
  private static instance: GraphicalSolver

  private constructor() {}

  static getInstance(): GraphicalSolver {
    if (!GraphicalSolver.instance) {
      GraphicalSolver.instance = new GraphicalSolver()
    }
    return GraphicalSolver.instance
  }

  solve(problem: any): GraphicalSolution {
    console.log("[v0] Starting graphical solver with problem:", problem)

    try {
      // Check if problem has exactly 2 variables
      if (problem.variables.length !== 2) {
        return {
          isValid: false,
          isFeasible: false,
          isUnbounded: false,
          optimalPoint: null,
          optimalValue: 0,
          feasibleRegion: [],
          constraintLines: [],
          objectiveLine: { a: 0, b: 0, c: 0, label: "", isActive: false },
          cornerPoints: [],
          steps: [],
          errorMessage: `El método gráfico solo funciona con exactamente 2 variables. Este problema tiene ${problem.variables.length} variables.`,
        }
      }

      const steps: string[] = []
      steps.push("Iniciando método gráfico para problema de 2 variables")

      // Convert constraints to lines
      const constraintLines = this.convertConstraintsToLines(problem.constraints, steps)

      // Create objective line
      const objectiveLine = this.createObjectiveLine(problem.objective)
      steps.push(`Función objetivo: ${objectiveLine.label}`)

      // Find feasible region
      const feasibleRegion = this.findFeasibleRegion(constraintLines, steps)

      if (feasibleRegion.length === 0) {
        return {
          isValid: true,
          isFeasible: false,
          isUnbounded: false,
          optimalPoint: null,
          optimalValue: 0,
          feasibleRegion: [],
          constraintLines,
          objectiveLine,
          cornerPoints: [],
          steps: [...steps, "No se encontró región factible - problema no factible"],
        }
      }

      // Find corner points
      const cornerPoints = this.findCornerPoints(constraintLines, steps)
      steps.push(`Puntos esquina encontrados: ${cornerPoints.length}`)

      // Evaluate objective function at corner points
      const { optimalPoint, optimalValue, isUnbounded } = this.findOptimalPoint(
        cornerPoints,
        problem.objective,
        problem.type,
        steps,
      )

      if (isUnbounded) {
        return {
          isValid: true,
          isFeasible: true,
          isUnbounded: true,
          optimalPoint: null,
          optimalValue: problem.type === "maximize" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY,
          feasibleRegion,
          constraintLines,
          objectiveLine,
          cornerPoints,
          steps: [...steps, "Solución no acotada detectada"],
        }
      }

      steps.push(
        `Solución óptima encontrada en (${optimalPoint?.x.toFixed(3)}, ${optimalPoint?.y.toFixed(3)}) con valor ${optimalValue.toFixed(3)}`,
      )

      return {
        isValid: true,
        isFeasible: true,
        isUnbounded: false,
        optimalPoint,
        optimalValue,
        feasibleRegion,
        constraintLines,
        objectiveLine,
        cornerPoints,
        steps,
      }
    } catch (error) {
      console.error("[v0] Graphical solver error:", error)
      return {
        isValid: false,
        isFeasible: false,
        isUnbounded: false,
        optimalPoint: null,
        optimalValue: 0,
        feasibleRegion: [],
        constraintLines: [],
        objectiveLine: { a: 0, b: 0, c: 0, label: "", isActive: false },
        cornerPoints: [],
        steps: [],
        errorMessage: error instanceof Error ? error.message : "Error desconocido en método gráfico",
      }
    }
  }

  private convertConstraintsToLines(constraints: any[], steps: string[]): Line[] {
    const lines: Line[] = []

    for (let i = 0; i < constraints.length; i++) {
      const constraint = constraints[i]
      const a = constraint.coefficients[0] || 0
      const b = constraint.coefficients[1] || 0
      const c = constraint.rhs

      const line: Line = {
        a,
        b,
        c,
        label: `${constraint.expression} ${constraint.operator} ${c}`,
        isActive: true,
      }

      lines.push(line)
      steps.push(`Restricción ${i + 1}: ${line.label}`)
    }

    // Add non-negativity constraints
    lines.push({ a: 1, b: 0, c: 0, label: "x₁ ≥ 0", isActive: true })
    lines.push({ a: 0, b: 1, c: 0, label: "x₂ ≥ 0", isActive: true })

    return lines
  }

  private createObjectiveLine(objective: any): Line {
    const a = objective.coefficients[0] || 0
    const b = objective.coefficients[1] || 0

    return {
      a,
      b,
      c: 0, // Will be adjusted based on optimal value
      label: `Z = ${a}x₁ + ${b}x₂`,
      isActive: true,
    }
  }

  private findFeasibleRegion(constraintLines: Line[], steps: string[]): Point[] {
    // For simplicity, we'll create a bounding box and test points
    const maxCoord = 20
    const step = 0.5
    const feasiblePoints: Point[] = []

    for (let x = 0; x <= maxCoord; x += step) {
      for (let y = 0; y <= maxCoord; y += step) {
        if (this.isPointFeasible({ x, y }, constraintLines)) {
          feasiblePoints.push({ x, y })
        }
      }
    }

    steps.push(`Región factible calculada con ${feasiblePoints.length} puntos`)
    return feasiblePoints
  }

  private isPointFeasible(point: Point, constraintLines: Line[]): boolean {
    for (const line of constraintLines) {
      const value = line.a * point.x + line.b * point.y

      // For constraints like ax + by ≤ c, check if ax + by ≤ c
      // For non-negativity constraints, check if x ≥ 0 and y ≥ 0
      if (line.label.includes("≤")) {
        if (value > line.c + 1e-10) return false
      } else if (line.label.includes("≥")) {
        if (value < line.c - 1e-10) return false
      } else if (line.label.includes("=")) {
        if (Math.abs(value - line.c) > 1e-10) return false
      }
    }
    return true
  }

  private findCornerPoints(constraintLines: Line[], steps: string[]): Point[] {
    const cornerPoints: Point[] = []

    // Find intersections of all pairs of constraint lines
    for (let i = 0; i < constraintLines.length; i++) {
      for (let j = i + 1; j < constraintLines.length; j++) {
        const intersection = this.findLineIntersection(constraintLines[i], constraintLines[j])

        if (intersection && this.isPointFeasible(intersection, constraintLines)) {
          // Check if this point is not already in the list
          const exists = cornerPoints.some(
            (p) => Math.abs(p.x - intersection.x) < 1e-6 && Math.abs(p.y - intersection.y) < 1e-6,
          )

          if (!exists) {
            intersection.label = `(${intersection.x.toFixed(3)}, ${intersection.y.toFixed(3)})`
            cornerPoints.push(intersection)
          }
        }
      }
    }

    steps.push(`Puntos esquina calculados: ${cornerPoints.map((p) => p.label).join(", ")}`)
    return cornerPoints
  }

  private findLineIntersection(line1: Line, line2: Line): Point | null {
    const { a: a1, b: b1, c: c1 } = line1
    const { a: a2, b: b2, c: c2 } = line2

    const denominator = a1 * b2 - a2 * b1

    if (Math.abs(denominator) < 1e-10) {
      // Lines are parallel
      return null
    }

    const x = (c1 * b2 - c2 * b1) / denominator
    const y = (a1 * c2 - a2 * c1) / denominator

    return { x, y }
  }

  private findOptimalPoint(
    cornerPoints: Point[],
    objective: any,
    type: string,
    steps: string[],
  ): { optimalPoint: Point | null; optimalValue: number; isUnbounded: boolean } {
    if (cornerPoints.length === 0) {
      return { optimalPoint: null, optimalValue: 0, isUnbounded: true }
    }

    let optimalPoint = cornerPoints[0]
    let optimalValue = this.evaluateObjective(cornerPoints[0], objective)

    steps.push("Evaluando función objetivo en puntos esquina:")
    steps.push(`  ${cornerPoints[0].label}: Z = ${optimalValue.toFixed(3)}`)

    for (let i = 1; i < cornerPoints.length; i++) {
      const point = cornerPoints[i]
      const value = this.evaluateObjective(point, objective)

      steps.push(`  ${point.label}: Z = ${value.toFixed(3)}`)

      if (type === "maximize" && value > optimalValue) {
        optimalValue = value
        optimalPoint = point
      } else if (type === "minimize" && value < optimalValue) {
        optimalValue = value
        optimalPoint = point
      }
    }

    return { optimalPoint, optimalValue, isUnbounded: false }
  }

  private evaluateObjective(point: Point, objective: any): number {
    const a = objective.coefficients[0] || 0
    const b = objective.coefficients[1] || 0
    return a * point.x + b * point.y
  }
}
