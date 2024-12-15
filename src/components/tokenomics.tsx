import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts'
import { Coins, Percent, TrendingUp, Users, Wallet, ChevronRight, Lock, Zap, Shield, Flame, Brain } from 'lucide-react'

// Data for token distribution
const tokenDistribution = [
  { name: 'Public Sale', value: 90, color: '#FF6B6B' },
  { name: 'Rewards', value: 5, color: '#4ECDC4' },
  { name: 'Jackpot', value: 5, color: '#45B7D1' },
]

// Data for token information
const tokenInfo = [
  {
    icon: <Coins className="h-6 w-6 text-pink-500" />,
    title: "Total Supply",
    value: "1,000,000,000 Cat0",
    description: "Fixed supply, deflationary model"
  },
  {
    icon: <Percent className="h-6 w-6 text-blue-500" />,
    title: "Initial Circulating Supply",
    value: "90%",
    description: "900,000,000 Cat0 available at launch"
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    title: "Initial Market Cap",
    value: "$17,000,000",
    description: "Based on initial token price"
  },
  {
    icon: <Flame className="h-6 w-6 text-red-500" />,
    title: "Planned Token Burn",
    value: "0% of total supply",
    description: ""
  },
]

// Data for token utility
const tokenUtility = [
  {
    icon: <Brain className="h-6 w-6 text-indigo-500" />,
    title: "AI Decision Making",
    description: "Vote on key AI protocol decisions"
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "7AI-Staking",
    description: "Earn rewards by locking up tokens"
  },
  {
    icon: <Percent className="h-6 w-6 text-green-500" />,
    title: "Discounts",
    description: "Reduced platform fees for token holders"
  },
  {
    icon: <Shield className="h-6 w-6 text-red-500" />,
    title: "Exclusive Access",
    description: "Participate in special events (7AI-7AICAT)"
  },
]

// Custom tooltip component for the pie chart
const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: Array<any> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm md:text-base">
        <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

// Custom active shape for the pie chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="#333"
        className="text-sm md:text-base font-medium"
      >{`${value}%`}</text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        dy={18} 
        textAnchor={textAnchor} 
        fill="#666"
        className="text-xs md:text-sm"
      >
        {payload.name}
      </text>
    </g>
  );
};

export default function Tokenomics() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    const handleResize = () => {
      // Adjust chart height based on screen width
      if (window.innerWidth < 640) { // mobile
        setChartHeight(250);
      } else {
        setChartHeight(300);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-0">
      <Card className="w-full max-w-4xl shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white">
          <CardTitle className="text-3xl font-bold">Tokenomics</CardTitle>
          <CardDescription className="text-lg text-white/80">
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="distribution" className="mb-6">
            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Token Distribution</CardTitle>
                  <CardDescription>Hover over the chart for more details</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-4">
                  <div className="w-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height={chartHeight}>
                      <PieChart>
                        <Pie
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={tokenDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={window.innerWidth < 640 ? 40 : 60}
                          outerRadius={window.innerWidth < 640 ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          onMouseEnter={onPieEnter}
                        >
                          {tokenDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {tokenDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Key Token Info</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {tokenInfo.map((info, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{info.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{info.title}</p>
                      <p className="text-lg text-gray-700">{info.value}</p>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Token Utility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokenUtility.map((utility, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{utility.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{utility.title}</p>
                      <p className="text-sm text-gray-500">{utility.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mb-6">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white py-3 rounded-md flex items-center justify-center">
              Download Detailed Tokenomics Paper <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-md flex items-center justify-center">
              Join Our Community <Users className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">Token Sale Information</h3>
              </div>
              <p className="mt-2 text-gray-600">
                Token Name: <span className="font-semibold">Cat0 (Cat0)</span><br />
                Token Type: <span className="font-semibold">ERC-20</span><br />
                Wallet Adresse: <span className="font-semibold">ccc</span>
              </p>
            </CardContent>
          </Card>
        </CardContent>
        <div className="bg-gradient-to-r from-pink-200 to-blue-200 p-4 text-center">
          <p className="text-sm text-gray-700">
            The Cat0 is designed for long-term sustainability and community-driven growth.
          </p>
        </div>
      </Card>
    </div>
  )
}
