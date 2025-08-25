// Interpretation Service for generating natural language explanations
export interface ProblemInterpretation {
  problemSummary: string
  objectiveAnalysis: string
  constraintsAnalysis: string[]
  solutionExplanation: string
  methodComparison: string
  practicalImplications: string[]
  recommendations: string[]
}

export interface DetailedReport {
  title: string
  executiveSummary: string
  problemDescription: string
  methodologyUsed: string[]
  resultsAnalysis: {
    simplex: string
    graphical: string
    sensitivity: string
  }
  conclusions: string[]
  recommendations: string[]
  technicalDetails: {
    iterations: number
    computationTime: string
    convergenceCriteria: string
  }
  appendices: {
    tableaux: string
    calculations: string
  }
}

export class InterpretationService {
  private static instance: InterpretationService

  private constructor() {}

  static getInstance(): InterpretationService {
    if (!InterpretationService.instance) {
      InterpretationService.instance = new InterpretationService()
    }
    return InterpretationService.instance
  }

  generateInterpretation(
    parsedProblem: any,
    simplexSolution: any,
    graphicalSolution: any,
    sensitivityAnalysis: any,
  ): ProblemInterpretation {
    console.log("[v0] Generating problem interpretation")

    try {
      const problemSummary = this.generateProblemSummary(parsedProblem)
      const objectiveAnalysis = this.generateObjectiveAnalysis(parsedProblem, simplexSolution)
      const constraintsAnalysis = this.generateConstraintsAnalysis(parsedProblem, sensitivityAnalysis)
      const solutionExplanation = this.generateSolutionExplanation(simplexSolution, graphicalSolution)
      const methodComparison = this.generateMethodComparison(simplexSolution, graphicalSolution)
      const practicalImplications = this.generatePracticalImplications(simplexSolution, sensitivityAnalysis)
      const recommendations = this.generateRecommendations(sensitivityAnalysis, simplexSolution)

      return {
        problemSummary,
        objectiveAnalysis,
        constraintsAnalysis,
        solutionExplanation,
        methodComparison,
        practicalImplications,
        recommendations,
      }
    } catch (error) {
      console.error("[v0] Error generating interpretation:", error)
      return {
        problemSummary: "Error al generar interpretación del problema",
        objectiveAnalysis: "No disponible",
        constraintsAnalysis: [],
        solutionExplanation: "No disponible",
        methodComparison: "No disponible",
        practicalImplications: [],
        recommendations: [],
      }
    }
  }

  generateDetailedReport(
    parsedProblem: any,
    simplexSolution: any,
    graphicalSolution: any,
    sensitivityAnalysis: any,
    interpretation: ProblemInterpretation,
  ): DetailedReport {
    console.log("[v0] Generating detailed report")

    const title = `Reporte de Análisis: Problema de ${parsedProblem.type === "maximize" ? "Maximización" : "Minimización"}`

    const executiveSummary = this.generateExecutiveSummary(simplexSolution, sensitivityAnalysis)

    const problemDescription = `${interpretation.problemSummary}\n\n${interpretation.objectiveAnalysis}`

    const methodologyUsed = [
      "Método Simplex: Algoritmo iterativo para encontrar la solución óptima",
      graphicalSolution.isValid
        ? "Método Gráfico: Visualización geométrica de la región factible"
        : "Método Gráfico: No aplicable (más de 2 variables)",
      "Análisis de Sensibilidad: Evaluación de la estabilidad de la solución",
    ]

    const resultsAnalysis = {
      simplex: this.generateSimplexAnalysis(simplexSolution),
      graphical: this.generateGraphicalAnalysis(graphicalSolution),
      sensitivity: this.generateSensitivitySummary(sensitivityAnalysis),
    }

    const conclusions = this.generateConclusions(simplexSolution, sensitivityAnalysis)

    const technicalDetails = {
      iterations: simplexSolution.tableaus?.length || 0,
      computationTime: "< 1 segundo",
      convergenceCriteria: "Optimalidad alcanzada cuando todos los coeficientes de la fila objetivo son no negativos",
    }

    const appendices = {
      tableaux: "Tableaux del método simplex disponibles en la sección correspondiente",
      calculations: "Cálculos detallados disponibles en cada método",
    }

    return {
      title,
      executiveSummary,
      problemDescription,
      methodologyUsed,
      resultsAnalysis,
      conclusions,
      recommendations: interpretation.recommendations,
      technicalDetails,
      appendices,
    }
  }

  private generateProblemSummary(parsedProblem: any): string {
    const type = parsedProblem.type === "maximize" ? "maximización" : "minimización"
    const numVars = parsedProblem.variables.length
    const numConstraints = parsedProblem.constraints.length

    return `Este es un problema de programación lineal de ${type} con ${numVars} variable${numVars > 1 ? "s" : ""} de decisión (${parsedProblem.variables.join(", ")}) y ${numConstraints} restricción${numConstraints > 1 ? "es" : ""} funcional${numConstraints > 1 ? "es" : ""}. El objetivo es ${type === "maximización" ? "maximizar" : "minimizar"} la función objetivo sujeta a las restricciones dadas.`
  }

  private generateObjectiveAnalysis(parsedProblem: any, simplexSolution: any): string {
    const type = parsedProblem.type === "maximize" ? "maximizar" : "minimizar"
    const objExpression = parsedProblem.objective.expression

    if (simplexSolution.isOptimal) {
      return `La función objetivo busca ${type} ${objExpression}. La solución óptima encontrada tiene un valor de ${simplexSolution.optimalValue.toFixed(4)} unidades. Este valor representa el mejor resultado posible dado las restricciones del problema.`
    } else if (simplexSolution.isUnbounded) {
      return `La función objetivo busca ${type} ${objExpression}. El problema tiene una solución no acotada, lo que significa que el valor objetivo puede crecer indefinidamente sin violar las restricciones.`
    } else {
      return `La función objetivo busca ${type} ${objExpression}. No se pudo encontrar una solución factible para este problema.`
    }
  }

  private generateConstraintsAnalysis(parsedProblem: any, sensitivityAnalysis: any): string[] {
    const analysis: string[] = []

    parsedProblem.constraints.forEach((constraint: any, index: number) => {
      const shadowPrice = sensitivityAnalysis.shadowPrices?.[index]

      if (shadowPrice) {
        if (shadowPrice.shadowPrice > 0) {
          analysis.push(
            `Restricción "${constraint.expression}": Esta restricción está activa (se cumple con igualdad) en la solución óptima. Su precio sombra es ${shadowPrice.shadowPrice.toFixed(4)}, indicando que relajar esta restricción en una unidad mejoraría el valor objetivo en esa cantidad.`,
          )
        } else {
          analysis.push(
            `Restricción "${constraint.expression}": Esta restricción no está activa en la solución óptima, lo que significa que hay holgura disponible. No limita el valor de la función objetivo.`,
          )
        }
      } else {
        analysis.push(
          `Restricción "${constraint.expression}": Restricción funcional que define el espacio de soluciones factibles.`,
        )
      }
    })

    return analysis
  }

  private generateSolutionExplanation(simplexSolution: any, graphicalSolution: any): string {
    if (!simplexSolution.isOptimal) {
      if (simplexSolution.isUnbounded) {
        return "El problema tiene una solución no acotada. Esto significa que es posible mejorar indefinidamente el valor de la función objetivo sin violar ninguna restricción."
      } else {
        return "El problema no tiene solución factible. Las restricciones son inconsistentes y no existe ningún punto que las satisfaga todas simultáneamente."
      }
    }

    let explanation = `La solución óptima se encuentra en el punto (${Object.values(simplexSolution.variables)
      .map((v: any) => v.toFixed(3))
      .join(", ")}). `

    if (graphicalSolution.isValid && graphicalSolution.isFeasible) {
      explanation += `Este punto corresponde a un vértice de la región factible, lo cual confirma el teorema fundamental de la programación lineal que establece que la solución óptima siempre se encuentra en un punto extremo del poliedro de restricciones.`
    } else {
      explanation += `Esta solución fue encontrada mediante el método simplex, que garantiza la optimalidad al evaluar sistemáticamente los vértices de la región factible.`
    }

    return explanation
  }

  private generateMethodComparison(simplexSolution: any, graphicalSolution: any): string {
    if (!graphicalSolution.isValid) {
      return `El método gráfico no es aplicable para este problema ya que tiene más de 2 variables. El método simplex es la herramienta apropiada para resolver problemas de programación lineal con cualquier número de variables, proporcionando una solución sistemática y eficiente.`
    }

    if (simplexSolution.isOptimal && graphicalSolution.isOptimal) {
      const simplexValue = simplexSolution.optimalValue.toFixed(4)
      const graphicalValue = graphicalSolution.optimalValue.toFixed(4)

      if (Math.abs(simplexSolution.optimalValue - graphicalSolution.optimalValue) < 1e-6) {
        return `Ambos métodos (simplex y gráfico) convergen a la misma solución óptima con valor ${simplexValue}, lo que valida la correctitud de ambos enfoques. El método gráfico proporciona una visualización intuitiva, mientras que el simplex ofrece un procedimiento algorítmico sistemático.`
      } else {
        return `Se detectó una discrepancia entre los métodos: simplex encontró valor ${simplexValue} mientras que el gráfico encontró ${graphicalValue}. Esto puede deberse a diferencias en la precisión numérica o en la implementación de los algoritmos.`
      }
    }

    return `Los métodos simplex y gráfico son complementarios: el gráfico ofrece intuición visual para problemas de 2 variables, mientras que el simplex proporciona una solución general para cualquier dimensión.`
  }

  private generatePracticalImplications(simplexSolution: any, sensitivityAnalysis: any): string[] {
    const implications: string[] = []

    if (simplexSolution.isOptimal) {
      implications.push(
        `La solución óptima indica cómo asignar los recursos de manera más eficiente para ${simplexSolution.optimalValue > 0 ? "maximizar" : "minimizar"} el objetivo.`,
      )

      // Analyze variable values
      Object.entries(simplexSolution.variables).forEach(([variable, value]: [string, any]) => {
        if (value > 0) {
          implications.push(`${variable} debe tomar el valor ${value.toFixed(3)} en la implementación óptima.`)
        } else {
          implications.push(`${variable} debe ser igual a cero en la solución óptima.`)
        }
      })

      // Analyze shadow prices
      if (sensitivityAnalysis.shadowPrices) {
        const activeConstraints = sensitivityAnalysis.shadowPrices.filter((sp: any) => sp.shadowPrice > 0)
        if (activeConstraints.length > 0) {
          implications.push(
            `Los recursos más valiosos son aquellos asociados con las restricciones: ${activeConstraints
              .map((sp: any) => sp.constraint)
              .join(", ")}.`,
          )
        }
      }
    }

    return implications
  }

  private generateRecommendations(sensitivityAnalysis: any, simplexSolution: any): string[] {
    const recommendations: string[] = []

    if (sensitivityAnalysis.recommendations) {
      recommendations.push(...sensitivityAnalysis.recommendations)
    }

    if (simplexSolution.isOptimal) {
      recommendations.push(
        "Implemente la solución óptima encontrada para obtener el mejor resultado posible bajo las condiciones actuales.",
      )

      recommendations.push(
        "Monitoree regularmente los parámetros del problema para detectar cambios que puedan afectar la optimalidad de la solución.",
      )

      if (sensitivityAnalysis.optimalBasisStability && !sensitivityAnalysis.optimalBasisStability.isStable) {
        recommendations.push(
          "La solución es sensible a cambios en los parámetros. Considere realizar análisis de escenarios para evaluar el impacto de posibles variaciones.",
        )
      }
    }

    return recommendations
  }

  private generateExecutiveSummary(simplexSolution: any, sensitivityAnalysis: any): string {
    if (simplexSolution.isOptimal) {
      return `Se encontró una solución óptima con valor ${simplexSolution.optimalValue.toFixed(4)}. El análisis de sensibilidad indica que la solución es ${sensitivityAnalysis.optimalBasisStability?.isStable ? "estable" : "sensible"} a cambios en los parámetros. Se identificaron ${sensitivityAnalysis.shadowPrices?.filter((sp: any) => sp.shadowPrice > 0).length || 0} restricciones activas que limitan el valor objetivo.`
    } else if (simplexSolution.isUnbounded) {
      return "El problema presenta una solución no acotada, indicando que el valor objetivo puede mejorar indefinidamente. Esto sugiere la necesidad de revisar las restricciones del modelo."
    } else {
      return "No se encontró una solución factible para el problema planteado. Las restricciones son inconsistentes y requieren revisión."
    }
  }

  private generateSimplexAnalysis(simplexSolution: any): string {
    if (simplexSolution.isOptimal) {
      return `El método simplex convergió en ${simplexSolution.tableaus?.length || 0} iteraciones, encontrando la solución óptima mediante la evaluación sistemática de puntos extremos de la región factible.`
    } else {
      return "El método simplex no pudo encontrar una solución óptima debido a la naturaleza del problema (no factible o no acotado)."
    }
  }

  private generateGraphicalAnalysis(graphicalSolution: any): string {
    if (!graphicalSolution.isValid) {
      return "El método gráfico no es aplicable para este problema debido al número de variables."
    } else if (graphicalSolution.isOptimal) {
      return `El método gráfico identificó ${graphicalSolution.cornerPoints?.length || 0} puntos esquina y determinó la solución óptima mediante evaluación geométrica.`
    } else {
      return "El método gráfico no pudo determinar una solución óptima."
    }
  }

  private generateSensitivitySummary(sensitivityAnalysis: any): string {
    if (sensitivityAnalysis.isValid) {
      return `El análisis de sensibilidad evaluó ${sensitivityAnalysis.shadowPrices?.length || 0} restricciones y ${sensitivityAnalysis.objectiveCoefficients?.length || 0} coeficientes objetivo, proporcionando rangos de estabilidad para la solución actual.`
    } else {
      return "No se pudo realizar el análisis de sensibilidad debido a limitaciones en la solución base."
    }
  }

  private generateConclusions(simplexSolution: any, sensitivityAnalysis: any): string[] {
    const conclusions: string[] = []

    if (simplexSolution.isOptimal) {
      conclusions.push("Se obtuvo una solución óptima válida para el problema de programación lineal.")
      conclusions.push(
        `El valor óptimo de ${simplexSolution.optimalValue.toFixed(4)} representa el mejor resultado alcanzable bajo las restricciones dadas.`,
      )

      if (sensitivityAnalysis.isValid) {
        conclusions.push(
          "El análisis de sensibilidad proporciona información valiosa sobre la estabilidad de la solución ante cambios en los parámetros.",
        )
      }
    } else {
      conclusions.push("El problema requiere revisión debido a la ausencia de una solución factible y óptima.")
    }

    return conclusions
  }

  exportReportAsText(report: DetailedReport): string {
    let text = `${report.title}\n`
    text += "=".repeat(report.title.length) + "\n\n"

    text += "RESUMEN EJECUTIVO\n"
    text += "-".repeat(17) + "\n"
    text += report.executiveSummary + "\n\n"

    text += "DESCRIPCIÓN DEL PROBLEMA\n"
    text += "-".repeat(24) + "\n"
    text += report.problemDescription + "\n\n"

    text += "METODOLOGÍA UTILIZADA\n"
    text += "-".repeat(21) + "\n"
    report.methodologyUsed.forEach((method, index) => {
      text += `${index + 1}. ${method}\n`
    })
    text += "\n"

    text += "ANÁLISIS DE RESULTADOS\n"
    text += "-".repeat(22) + "\n"
    text += `Método Simplex: ${report.resultsAnalysis.simplex}\n\n`
    text += `Método Gráfico: ${report.resultsAnalysis.graphical}\n\n`
    text += `Análisis de Sensibilidad: ${report.resultsAnalysis.sensitivity}\n\n`

    text += "CONCLUSIONES\n"
    text += "-".repeat(12) + "\n"
    report.conclusions.forEach((conclusion, index) => {
      text += `${index + 1}. ${conclusion}\n`
    })
    text += "\n"

    text += "RECOMENDACIONES\n"
    text += "-".repeat(15) + "\n"
    report.recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`
    })

    return text
  }
}
