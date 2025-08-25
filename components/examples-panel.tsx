"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExampleProblemsService } from "@/lib/example-problems"
import { BookOpen, TrendingUp, BarChart3, Shuffle } from "lucide-react"

interface ExamplesPanelProps {
  onSelectExample: (problemText: string) => void
}

export function ExamplesPanel({ onSelectExample }: ExamplesPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "graphical" | "simplex" | "mixed">("all")
  const exampleService = ExampleProblemsService.getInstance()

  const getExamples = () => {
    switch (selectedCategory) {
      case "graphical":
        return exampleService.getExamplesByCategory("graphical")
      case "simplex":
        return exampleService.getExamplesByCategory("simplex")
      case "mixed":
        return exampleService.getExamplesByCategory("mixed")
      default:
        return exampleService.getAllExamples()
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basic":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "graphical":
        return <BarChart3 className="h-4 w-4" />
      case "simplex":
        return <TrendingUp className="h-4 w-4" />
      case "mixed":
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const handleRandomExample = () => {
    const category = selectedCategory === "all" ? undefined : selectedCategory
    const randomExample = exampleService.getRandomExample(category as any)
    onSelectExample(randomExample.problemText)
  }

  const examples = getExamples()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ejemplos de Problemas
            </CardTitle>
            <CardDescription>Selecciona un ejemplo para cargar automáticamente el problema</CardDescription>
          </div>
          <Button onClick={handleRandomExample} variant="outline" size="sm">
            <Shuffle className="h-4 w-4 mr-2" />
            Aleatorio
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="graphical">Gráfico</TabsTrigger>
            <TabsTrigger value="simplex">Simplex</TabsTrigger>
            <TabsTrigger value="mixed">Mixtos</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {examples.map((example) => (
                  <Card key={example.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(example.category)}
                          <h4 className="font-semibold text-sm">{example.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={getDifficultyColor(example.difficulty)}>
                            {example.difficulty}
                          </Badge>
                          <Badge variant="secondary">{example.category}</Badge>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">{example.description}</p>

                      <div className="bg-muted p-2 rounded text-xs font-mono mb-3">
                        {example.problemText.split("\n").slice(0, 3).join("\n")}
                        {example.problemText.split("\n").length > 3 && "..."}
                      </div>

                      {example.expectedSolution && (
                        <div className="text-xs text-muted-foreground mb-3">
                          <strong>Solución esperada:</strong> Z = {example.expectedSolution.optimalValue}
                          {example.expectedSolution.optimalPoint && (
                            <span>
                              {" "}
                              en ({example.expectedSolution.optimalPoint.x1}, {example.expectedSolution.optimalPoint.x2}
                              )
                            </span>
                          )}
                        </div>
                      )}

                      <Button onClick={() => onSelectExample(example.problemText)} size="sm" className="w-full">
                        Cargar Ejemplo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
