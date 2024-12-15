// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tabs, TabsContent } from "../components/ui/tabs"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ArrowRight, Wallet } from "lucide-react"

export default function Tokenomics() {
  const data = [
    {
      title: "Total Supply",
      value: "1,000,000,000",
      description: "Maximum token supply",
    },
    {
      title: "Initial Price",
      value: "$0.01",
      description: "Launch price per token",
    },
    {
      title: "Market Cap",
      value: "$10M",
      description: "Initial market capitalization",
    },
  ]

  const distribution = [
    {
      category: "Public Sale",
      percentage: 40,
    },
    {
      category: "Team & Advisors",
      percentage: 20,
    },
    {
      category: "Development",
      percentage: 15,
    },
    {
      category: "Marketing",
      percentage: 15,
    },
    {
      category: "Reserve",
      percentage: 10,
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-2xl font-bold">{item.title}</div>
              <div className="text-3xl font-bold text-primary">{item.value}</div>
              <div className="text-sm text-gray-500">{item.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {distribution.map((item, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-xl font-semibold">{item.category}</div>
                <div className="text-sm text-gray-500">{item.percentage}% of total supply</div>
              </div>
              <div className="text-2xl font-bold text-primary">{item.percentage}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button className="gap-2">
          View Whitepaper
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
