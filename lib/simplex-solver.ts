// Simplex Algorithm Implementation
export interface SimplexTableau {
  table: number[][]
  basicVariables: string[]
  nonBasicVariables: string[]
  objectiveRow: number[]
  rhs: number[]
  iteration: number
  isOptimal: boolean
  pivotRow?: number
  pivotCol?: number
  explanation: string
}

export interface SimplexSolution {
  isOptimal: boolean
  isFeasible: boolean
  isUnbounded: boolean
  optimalValue: number
  variables: { [key: string]: number }
  tableaus: SimplexTableau[]
  finalTableau: SimplexTableau
  steps: string[]
}

export class SimplexSolver {
  private static instance: SimplexSolver

  private constructor() {}

  static getInstance(): SimplexSolver {
    if (!SimplexSolver.instance) {
      SimplexSolver.instance = new SimplexSolver()
    }
    return SimplexSolver.instance
  }

  solve(problem: any): SimplexSolution {
    console.log("[v0] Starting simplex solver with problem:", problem)

    try {
      // Convert to standard form
      const standardForm = this.convertToStandardForm(problem)
      console.log("[v0] Standard form:", standardForm)

      // Initialize tableau
      let tableau = this.initializeTableau(standardForm)
      const tableaus: SimplexTableau[] = [tableau]
      const steps: string[] = [`Iteración 0: Tableau inicial creado`]

      let iteration = 0
      const maxIterations = 100

      while (!tableau.isOptimal && iteration < maxIterations) {
        iteration++

        // Find pivot column (most negative in objective row for maximization)
        const pivotCol = this.findPivotColumn(tableau)
        if (pivotCol === -1) {
          tableau.isOptimal = true
          break
        }

        // Find pivot row (minimum ratio test)
        const pivotRow = this.findPivotRow(tableau, pivotCol)
        if (pivotRow === -1) {
          // Unbounded solution
          return {
            isOptimal: false,
            isFeasible: true,
            isUnbounded: true,
            optimalValue: problem.type === "maximize" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY,
            variables: {},
            tableaus,
            finalTableau: tableau,
            steps: [...steps, `Iteración ${iteration}: Solución no acotada detectada`],
          }
        }

        tableau.pivotRow = pivotRow
        tableau.pivotCol = pivotCol

        steps.push(`Iteración ${iteration}: Pivote en fila ${pivotRow + 1}, columna ${pivotCol + 1}`)

        // Perform pivot operation
        tableau = this.pivot(tableau, pivotRow, pivotCol, iteration)
        tableaus.push(tableau)

        steps.push(`Iteración ${iteration}: Operación de pivote completada`)
      }

      if (iteration >= maxIterations) {
        steps.push("Máximo número de iteraciones alcanzado")
      }

      // Extract solution
      const solution = this.extractSolution(tableau, standardForm)

      return {
        isOptimal: tableau.isOptimal,
        isFeasible: true,
        isUnbounded: false,
        optimalValue: solution.objectiveValue,
        variables: solution.variables,
        tableaus,
        finalTableau: tableau,
        steps,
      }
    } catch (error) {
      console.error("[v0] Simplex solver error:", error)
      return {
        isOptimal: false,
        isFeasible: false,
        isUnbounded: false,
        optimalValue: 0,
        variables: {},
        tableaus: [],
        finalTableau: {} as SimplexTableau,
        steps: [`Error: ${error instanceof Error ? error.message : "Error desconocido"}`],
      }
    }
  }

  private convertToStandardForm(problem: any) {
    const { type, objective, constraints, variables } = problem

    // For minimization, convert to maximization by negating coefficients
    const objCoeffs = type === "minimize" ? objective.coefficients.map((c: number) => -c) : objective.coefficients

    const standardConstraints = []
    let slackVarCount = 0
    let surplusVarCount = 0
    let artificialVarCount = 0

    for (const constraint of constraints) {
      const standardConstraint = {
        coefficients: [...constraint.coefficients],
        rhs: constraint.rhs,
        slackVar: null as string | null,
        surplusVar: null as string | null,
        artificialVar: null as string | null,
      }

      if (constraint.operator === "≤") {
        // Add slack variable
        standardConstraint.slackVar = `s${++slackVarCount}`
      } else if (constraint.operator === "≥") {
        // Add surplus and artificial variables
        standardConstraint.surplusVar = `s${++surplusVarCount}`
        standardConstraint.artificialVar = `a${++artificialVarCount}`
      } else if (constraint.operator === "=") {
        // Add artificial variable
        standardConstraint.artificialVar = `a${++artificialVarCount}`
      }

      standardConstraints.push(standardConstraint)
    }

    return {
      type,
      originalType: problem.type,
      objectiveCoefficients: objCoeffs,
      variables,
      constraints: standardConstraints,
      slackVarCount,
      surplusVarCount,
      artificialVarCount,
    }
  }

  private initializeTableau(standardForm: any): SimplexTableau {
    const { variables, constraints, objectiveCoefficients } = standardForm
    const numVars = variables.length
    const numConstraints = constraints.length

    // Calculate total variables (original + slack + surplus + artificial)
    const totalVars =
      numVars + standardForm.slackVarCount + standardForm.surplusVarCount + standardForm.artificialVarCount

    // Initialize tableau
    const table: number[][] = []
    const basicVariables: string[] = []
    const nonBasicVariables: string[] = [...variables]

    // Add constraint rows
    for (let i = 0; i < numConstraints; i++) {
      const constraint = constraints[i]
      const row = new Array(totalVars + 1).fill(0)

      // Original variables
      for (let j = 0; j < numVars; j++) {
        row[j] = constraint.coefficients[j] || 0
      }

      // Slack/surplus/artificial variables
      let varIndex = numVars
      for (let k = 0; k < constraints.length; k++) {
        if (constraints[k].slackVar) {
          if (k === i) row[varIndex] = 1
          varIndex++
        }
        if (constraints[k].surplusVar) {
          if (k === i) row[varIndex] = -1
          varIndex++
        }
        if (constraints[k].artificialVar) {
          if (k === i) row[varIndex] = 1
          varIndex++
        }
      }

      // RHS
      row[totalVars] = constraint.rhs

      table.push(row)

      // Determine basic variable for this row
      if (constraint.slackVar) {
        basicVariables.push(constraint.slackVar)
      } else if (constraint.artificialVar) {
        basicVariables.push(constraint.artificialVar)
      }
    }

    // Objective row
    const objectiveRow = new Array(totalVars + 1).fill(0)
    for (let j = 0; j < numVars; j++) {
      objectiveRow[j] = -objectiveCoefficients[j] // Negative for maximization form
    }

    table.push(objectiveRow)

    // Build variable names
    const allVariables = [...variables]
    const varIndex = 0
    for (const constraint of constraints) {
      if (constraint.slackVar) {
        allVariables.push(constraint.slackVar)
        if (!basicVariables.includes(constraint.slackVar)) {
          nonBasicVariables.push(constraint.slackVar)
        }
      }
      if (constraint.surplusVar) {
        allVariables.push(constraint.surplusVar)
        nonBasicVariables.push(constraint.surplusVar)
      }
      if (constraint.artificialVar) {
        allVariables.push(constraint.artificialVar)
        if (!basicVariables.includes(constraint.artificialVar)) {
          nonBasicVariables.push(constraint.artificialVar)
        }
      }
    }

    // Remove basic variables from non-basic list
    for (const basicVar of basicVariables) {
      const index = nonBasicVariables.indexOf(basicVar)
      if (index > -1) {
        nonBasicVariables.splice(index, 1)
      }
    }

    return {
      table,
      basicVariables,
      nonBasicVariables,
      objectiveRow: objectiveRow,
      rhs: table.map((row) => row[row.length - 1]),
      iteration: 0,
      isOptimal: this.checkOptimality(objectiveRow),
      explanation: "Tableau inicial con variables de holgura agregadas",
    }
  }

  private findPivotColumn(tableau: SimplexTableau): number {
    const objectiveRow = tableau.table[tableau.table.length - 1]
    let minValue = 0
    let pivotCol = -1

    for (let j = 0; j < objectiveRow.length - 1; j++) {
      if (objectiveRow[j] < minValue) {
        minValue = objectiveRow[j]
        pivotCol = j
      }
    }

    return pivotCol
  }

  private findPivotRow(tableau: SimplexTableau, pivotCol: number): number {
    let minRatio = Number.POSITIVE_INFINITY
    let pivotRow = -1

    for (let i = 0; i < tableau.table.length - 1; i++) {
      const element = tableau.table[i][pivotCol]
      const rhs = tableau.table[i][tableau.table[i].length - 1]

      if (element > 0) {
        const ratio = rhs / element
        if (ratio < minRatio) {
          minRatio = ratio
          pivotRow = i
        }
      }
    }

    return pivotRow
  }

  private pivot(tableau: SimplexTableau, pivotRow: number, pivotCol: number, iteration: number): SimplexTableau {
    const newTable = tableau.table.map((row) => [...row])
    const pivotElement = newTable[pivotRow][pivotCol]

    // Normalize pivot row
    for (let j = 0; j < newTable[pivotRow].length; j++) {
      newTable[pivotRow][j] /= pivotElement
    }

    // Eliminate other rows
    for (let i = 0; i < newTable.length; i++) {
      if (i !== pivotRow) {
        const multiplier = newTable[i][pivotCol]
        for (let j = 0; j < newTable[i].length; j++) {
          newTable[i][j] -= multiplier * newTable[pivotRow][j]
        }
      }
    }

    // Update basic variables
    const newBasicVariables = [...tableau.basicVariables]
    const enteringVar = tableau.nonBasicVariables[pivotCol] || `x${pivotCol + 1}`
    newBasicVariables[pivotRow] = enteringVar

    const newNonBasicVariables = [...tableau.nonBasicVariables]
    const leavingVar = tableau.basicVariables[pivotRow]
    const enteringIndex = newNonBasicVariables.indexOf(enteringVar)
    if (enteringIndex > -1) {
      newNonBasicVariables[enteringIndex] = leavingVar
    }

    const objectiveRow = newTable[newTable.length - 1]

    return {
      table: newTable,
      basicVariables: newBasicVariables,
      nonBasicVariables: newNonBasicVariables,
      objectiveRow,
      rhs: newTable.map((row) => row[row.length - 1]),
      iteration,
      isOptimal: this.checkOptimality(objectiveRow),
      explanation: `Pivote realizado en elemento (${pivotRow + 1}, ${pivotCol + 1})`,
    }
  }

  private checkOptimality(objectiveRow: number[]): boolean {
    // For maximization, optimal when all coefficients ≥ 0
    for (let j = 0; j < objectiveRow.length - 1; j++) {
      if (objectiveRow[j] < -1e-10) {
        // Small tolerance for floating point
        return false
      }
    }
    return true
  }

  private extractSolution(tableau: SimplexTableau, standardForm: any) {
    const variables: { [key: string]: number } = {}

    // Initialize all original variables to 0
    for (const variable of standardForm.variables) {
      variables[variable] = 0
    }

    // Set values for basic variables
    for (let i = 0; i < tableau.basicVariables.length; i++) {
      const varName = tableau.basicVariables[i]
      const value = tableau.rhs[i]

      if (standardForm.variables.includes(varName)) {
        variables[varName] = Math.max(0, value) // Ensure non-negative
      }
    }

    // Calculate objective value
    let objectiveValue = tableau.table[tableau.table.length - 1][tableau.table[0].length - 1]

    // If original problem was minimization, negate the result
    if (standardForm.originalType === "minimize") {
      objectiveValue = -objectiveValue
    }

    return {
      variables,
      objectiveValue,
    }
  }
}
