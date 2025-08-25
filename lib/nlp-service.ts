// NLP Service for parsing linear programming problems from text
export interface LinearProgrammingProblem {
  type: "maximize" | "minimize"
  objective: {
    coefficients: number[]
    variables: string[]
    expression: string
  }
  constraints: Array<{
    coefficients: number[]
    operator: "≤" | "≥" | "="
    rhs: number
    expression: string
  }>
  bounds: Array<{
    variable: string
    type: "≥" | "≤" | "="
    value: number
  }>
  variables: string[]
}

export class NLPService {
  private static instance: NLPService

  private constructor() {}

  static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService()
    }
    return NLPService.instance
  }

  parseLinearProgrammingProblem(text: string): LinearProgrammingProblem {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    let type: "maximize" | "minimize" = "maximize"
    let objective = { coefficients: [] as number[], variables: [] as string[], expression: "" }
    const constraints: Array<{
      coefficients: number[]
      operator: "≤" | "≥" | "="
      rhs: number
      expression: string
    }> = []
    const bounds: Array<{
      variable: string
      type: "≥" | "≤" | "="
      value: number
    }> = []
    let variables: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()

      // Parse objective function
      if (line.includes("maximizar") || line.includes("maximize") || line.includes("max")) {
        type = "maximize"
        objective = this.parseObjectiveFunction(lines[i])
      } else if (line.includes("minimizar") || line.includes("minimize") || line.includes("min")) {
        type = "minimize"
        objective = this.parseObjectiveFunction(lines[i])
      }

      // Parse constraints
      else if (line.includes("sujeto a") || line.includes("subject to") || line.includes("s.t.")) {
        // Skip this line, constraints follow
        continue
      }

      // Parse constraint lines
      else if (this.isConstraintLine(lines[i])) {
        const constraint = this.parseConstraint(lines[i])
        if (constraint) {
          constraints.push(constraint)
        }
      }

      // Parse bounds
      else if (this.isBoundLine(lines[i])) {
        const bound = this.parseBounds(lines[i])
        bounds.push(...bound)
      }
    }

    // Extract unique variables
    variables = [
      ...new Set([
        ...objective.variables,
        ...constraints.flatMap((c) => this.extractVariablesFromExpression(c.expression)),
        ...bounds.map((b) => b.variable),
      ]),
    ].sort()

    return {
      type,
      objective,
      constraints,
      bounds,
      variables,
    }
  }

  private parseObjectiveFunction(line: string): { coefficients: number[]; variables: string[]; expression: string } {
    // Extract the part after the colon or equals sign
    const match = line.match(/[:=]\s*(.+)/)
    if (!match) return { coefficients: [], variables: [], expression: "" }

    let expression = match[1].trim()

    // Handle cases like "Z = 3x₁ + 2x₂" or "f = 2x + 3y"
    const objectiveVarMatch = expression.match(/^[a-zA-Z]\w*\s*=\s*(.+)/)
    if (objectiveVarMatch) {
      expression = objectiveVarMatch[1].trim()
    }

    const terms = this.parseExpression(expression)

    return {
      coefficients: terms.map((t) => t.coefficient),
      variables: terms.map((t) => t.variable),
      expression,
    }
  }

  private parseConstraint(line: string): {
    coefficients: number[]
    operator: "≤" | "≥" | "="
    rhs: number
    expression: string
  } | null {
    // Find the operator
    let operator: "≤" | "≥" | "=" = "≤"
    let parts: string[] = []

    if (line.includes("≤") || line.includes("<=")) {
      operator = "≤"
      parts = line.split(/≤|<=/)
    } else if (line.includes("≥") || line.includes(">=")) {
      operator = "≥"
      parts = line.split(/≥|>=/)
    } else if (line.includes("=")) {
      operator = "="
      parts = line.split("=")
    } else {
      return null
    }

    if (parts.length !== 2) return null

    const leftSide = parts[0].trim()
    const rightSide = Number.parseFloat(parts[1].trim())

    if (isNaN(rightSide)) return null

    const terms = this.parseExpression(leftSide)

    return {
      coefficients: terms.map((t) => t.coefficient),
      operator,
      rhs: rightSide,
      expression: leftSide,
    }
  }

  private parseExpression(expression: string): Array<{ coefficient: number; variable: string }> {
    const terms: Array<{ coefficient: number; variable: string }> = []

    // Replace common symbols
    expression = expression.replace(/×/g, "*").replace(/·/g, "*")

    // Match terms like: 3x₁, -2x₂, x₃, +4x₁
    const termRegex = /([+-]?\s*\d*\.?\d*)\s*([a-zA-Z]\w*[₀-₉]*)/g
    let match

    while ((match = termRegex.exec(expression)) !== null) {
      let coefficient = match[1].replace(/\s/g, "")
      const variable = match[2]

      // Handle implicit coefficient of 1
      if (coefficient === "" || coefficient === "+") {
        coefficient = "1"
      } else if (coefficient === "-") {
        coefficient = "-1"
      }

      const coeff = Number.parseFloat(coefficient)
      if (!isNaN(coeff)) {
        terms.push({ coefficient: coeff, variable })
      }
    }

    return terms
  }

  private isConstraintLine(line: string): boolean {
    return (
      /[≤≥=<>]/.test(line) && !line.toLowerCase().includes("maximizar") && !line.toLowerCase().includes("minimizar")
    )
  }

  private isBoundLine(line: string): boolean {
    return line.includes("≥ 0") || line.includes(">= 0") || line.toLowerCase().includes("no negativ")
  }

  private parseBounds(line: string): Array<{ variable: string; type: "≥" | "≤" | "="; value: number }> {
    const bounds: Array<{ variable: string; type: "≥" | "≤" | "="; value: number }> = []

    // Handle cases like "x₁, x₂ ≥ 0"
    const variables = this.extractVariablesFromExpression(line)

    variables.forEach((variable) => {
      bounds.push({
        variable,
        type: "≥",
        value: 0,
      })
    })

    return bounds
  }

  private extractVariablesFromExpression(expression: string): string[] {
    const variables: string[] = []
    const variableRegex = /([a-zA-Z]\w*[₀-₉]*)/g
    let match

    while ((match = variableRegex.exec(expression)) !== null) {
      const variable = match[1]
      if (!variables.includes(variable)) {
        variables.push(variable)
      }
    }

    return variables
  }

  formatProblemAsText(problem: LinearProgrammingProblem): string {
    let text = ""

    // Objective function
    const objectiveType = problem.type === "maximize" ? "Maximizar" : "Minimizar"
    text += `${objectiveType}: Z = ${problem.objective.expression}\n\n`

    // Constraints
    text += "Sujeto a:\n"
    problem.constraints.forEach((constraint) => {
      text += `${constraint.expression} ${constraint.operator} ${constraint.rhs}\n`
    })

    // Bounds
    if (problem.bounds.length > 0) {
      text += "\n"
      const nonNegativeVars = problem.bounds.filter((b) => b.type === "≥" && b.value === 0).map((b) => b.variable)

      if (nonNegativeVars.length > 0) {
        text += `${nonNegativeVars.join(", ")} ≥ 0`
      }
    }

    return text
  }
}
