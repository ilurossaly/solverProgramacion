// Example Linear Programming Problems for different methods

export interface ExampleProblem {
  id: string
  title: string
  description: string
  problemText: string
  category: "graphical" | "simplex" | "mixed"
  difficulty: "basic" | "intermediate" | "advanced"
  expectedSolution?: {
    optimalValue: number
    optimalPoint?: { x1: number; x2: number }
    method: string
  }
}

export const EXAMPLE_PROBLEMS: ExampleProblem[] = [
  // Graphical Method Examples (2 variables)
  {
    id: "graphical-1",
    title: "Plan de Publicidad Básico",
    description: "Problema de maximización con restricciones de presupuesto y cobertura mínima.",
    category: "graphical",
    difficulty: "basic",
    problemText: `Maximizar: Z = 40x₁ + 15x₂

Sujeto a:
5x₁ + 1.5x₂ ≤ 60
x₁ ≥ 6
x₁ + x₂ ≤ 30
x₁, x₂ ≥ 0`,
    expectedSolution: {
      optimalValue: 600,
      optimalPoint: { x1: 12, x2: 8 },
      method: "graphical",
    },
  },
  {
    id: "graphical-2",
    title: "Dieta Económica Simple",
    description: "Problema de minimización de costos con restricciones nutricionales.",
    category: "graphical",
    difficulty: "basic",
    problemText: `Minimizar: Z = 0.5x₁ + 0.8x₂

Sujeto a:
200x₁ + 150x₂ ≥ 1500
3x₁ + 8x₂ ≥ 60
x₁, x₂ ≥ 0`,
    expectedSolution: {
      optimalValue: 4.5,
      optimalPoint: { x1: 6, x2: 2.25 },
      method: "graphical",
    },
  },
  {
    id: "graphical-3",
    title: "Producción de Muebles",
    description: "Maximizar ganancias en la producción de sillas y mesas.",
    category: "graphical",
    difficulty: "intermediate",
    problemText: `Maximizar: Z = 3x₁ + 2x₂

Sujeto a:
x₁ + x₂ ≤ 4
2x₁ + x₂ ≤ 6
x₁, x₂ ≥ 0`,
    expectedSolution: {
      optimalValue: 10,
      optimalPoint: { x1: 2, x2: 2 },
      method: "graphical",
    },
  },
  {
    id: "graphical-4",
    title: "Mezcla de Productos",
    description: "Optimizar la mezcla de dos productos con restricciones de recursos.",
    category: "graphical",
    difficulty: "intermediate",
    problemText: `Maximizar: Z = 6x₁ + 4x₂

Sujeto a:
2x₁ + 3x₂ ≤ 12
3x₁ + x₂ ≤ 12
x₁ ≤ 3
x₂ ≤ 3
x₁, x₂ ≥ 0`,
    expectedSolution: {
      optimalValue: 22,
      optimalPoint: { x1: 3, x2: 2 },
      method: "graphical",
    },
  },
  {
    id: "graphical-5",
    title: "Asignación de Recursos",
    description: "Problema de asignación óptima de recursos limitados.",
    category: "graphical",
    difficulty: "basic",
    problemText: `Minimizar: Z = 2x₁ + 3x₂

Sujeto a:
x₁ + 2x₂ ≥ 6
2x₁ + x₂ ≥ 8
x₁, x₂ ≥ 0`,
    expectedSolution: {
      optimalValue: 10,
      optimalPoint: { x1: 2, x2: 2 },
      method: "graphical",
    },
  },
  // Mixed examples for comparison
  {
    id: "mixed-1",
    title: "Plan Maestro de Turnos (Simplificado)",
    description: "Versión simplificada del problema de turnos para método gráfico.",
    category: "mixed",
    difficulty: "intermediate",
    problemText: `Minimizar: Z = 80x₁ + 70x₂

Sujeto a:
x₁ ≥ 30
x₂ ≥ 25
x₁ + x₂ = 80
x₁, x₂ ≥ 0`,
    expectedSolution: {
      optimalValue: 6150,
      optimalPoint: { x1: 30, x2: 50 },
      method: "graphical",
    },
  },
]

export class ExampleProblemsService {
  private static instance: ExampleProblemsService

  private constructor() {}

  static getInstance(): ExampleProblemsService {
    if (!ExampleProblemsService.instance) {
      ExampleProblemsService.instance = new ExampleProblemsService()
    }
    return ExampleProblemsService.instance
  }

  getAllExamples(): ExampleProblem[] {
    return EXAMPLE_PROBLEMS
  }

  getExamplesByCategory(category: "graphical" | "simplex" | "mixed"): ExampleProblem[] {
    return EXAMPLE_PROBLEMS.filter((problem) => problem.category === category)
  }

  getExamplesByDifficulty(difficulty: "basic" | "intermediate" | "advanced"): ExampleProblem[] {
    return EXAMPLE_PROBLEMS.filter((problem) => problem.difficulty === difficulty)
  }

  getExampleById(id: string): ExampleProblem | undefined {
    return EXAMPLE_PROBLEMS.find((problem) => problem.id === id)
  }

  getGraphicalExamples(): ExampleProblem[] {
    return this.getExamplesByCategory("graphical")
  }

  getRandomExample(category?: "graphical" | "simplex" | "mixed"): ExampleProblem {
    const examples = category ? this.getExamplesByCategory(category) : EXAMPLE_PROBLEMS
    const randomIndex = Math.floor(Math.random() * examples.length)
    return examples[randomIndex]
  }
}
