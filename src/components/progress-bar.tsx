import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { ArrowRight, ChevronRight } from 'lucide-react'

interface PaymentMethod {
  name: string;
  amount: number;
  color: string;
}

interface Stage {
  id: number;
  price: number;
  tokens: number;
  raised: number;
  bonus: number;
  threshold: number;
}

interface ProgressBarProps {
  paymentMethods: PaymentMethod[];
  totalRaised: number;
  targetAmount: number;
  currentStage: number;
  stages: Stage[];
  estimatedTime: string;
}

// Define stage thresholds type
type StageThresholds = {
  [key: number]: number;
}

export default function ProgressBar({
  paymentMethods,
  totalRaised,
  targetAmount,
  currentStage: propCurrentStage,
  stages,
  estimatedTime
}: ProgressBarProps) {
  // Convert totalRaised from Cat0 tokens to BUSD value (1 BUSD = 100 Cat0)
  const totalRaisedInBUSD = totalRaised / 100;
  const targetAmountInBUSD = targetAmount / 100;
  
  const percentageRaised = (totalRaisedInBUSD / targetAmountInBUSD) * 100;
  
  // Define stage thresholds
  const stageThresholds: StageThresholds = {
    1: 15,  // Stage 1 -> 2 at 15%
    2: 30,  // Stage 2 -> 3 at 30%
    3: 45,  // Stage 3 -> 4 at 45%
    4: 60,  // Stage 4 -> 5 at 60%
    5: 75,  // Stage 5 -> 6 at 75%
    6: 90,  // Stage 6 -> 7 at 90%
    7: 100  // Stage 7 -> Complete at 100%
  };

  // Determine current stage based on percentage raised
  const calculateStage = (percentage: number): number => {
    if (percentage >= 90) return 7;
    if (percentage >= 75) return 6;
    if (percentage >= 60) return 5;
    if (percentage >= 45) return 4;
    if (percentage >= 30) return 3;
    if (percentage >= 15) return 2;
    return 1;
  };

  // Calculate actual current stage based on percentage
  const currentStage = calculateStage(percentageRaised);
  const currentStageInfo = stages[currentStage - 1];
  const nextStage = stages[currentStage] || stages[stages.length - 1];

  // Calculate percentage left for next stage
  let percentageLeftForNextStage: number;
  let nextMilestone: string;

  if (currentStage < 7) {
    const nextThreshold = stageThresholds[currentStage];
    percentageLeftForNextStage = nextThreshold - percentageRaised;
    nextMilestone = `Stage ${currentStage + 1}`;
  } else {
    percentageLeftForNextStage = 100 - percentageRaised;
    nextMilestone = 'Complete';
  }

  // Check if we've actually reached 100%
  const isComplete = percentageRaised >= 100;

  return (
    <div className="-m-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl rounded">
        <CardHeader className="bg-gradient-to-r from-red-600 to-pink-300 text-white rounded">
          <CardTitle className="text-3xl font-bold">Stage {currentStage} Has Started</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="mb-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                  Progress
                </span>
                <span className="text-xl font-semibold text-pink-600">
                  {percentageRaised.toFixed(2)}%
                </span>
              </div>
              <div className="relative mb-4">
                <div className="h-10 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    style={{ width: `${percentageRaised}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 to-blue-500 transition-all duration-500 ease-in-out"
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray">
                    ${totalRaisedInBUSD.toLocaleString(undefined, {maximumFractionDigits: 2})} / ${targetAmountInBUSD.toLocaleString()} Raised
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center mt-2">
                {isComplete ? (
                  <div className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    Congratulations! You've reached the final stage!
                  </div>
                ) : percentageLeftForNextStage > 0 ? (
                  <div className="flex items-center text-sm font-medium bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    <span className="mr-1 font-bold">{percentageLeftForNextStage.toFixed(2)}%</span>
                    <span>until {nextMilestone}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {stages.map((stage) => (
            <Card 
              key={stage.id}
              className={`mb-4 transition-all duration-300 hover:shadow-lg ${
                stage.id === currentStage 
                  ? 'bg-gradient-to-r from-pink-600 to-blue-600 text-white hover:from-pink-700 hover:to-blue-700' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Stage {stage.id}</h3>
                    <p className="text-sm">Price: ${stage.price}</p>
                    {stage.id === currentStage && stage.bonus && (
                      <p className="text-sm font-semibold bg-yellow-300 text-yellow-800 px-2 py-1 rounded-full inline-block mt-1">
                        Bonus: {stage.bonus}%
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Tokens: {stage.tokens.toLocaleString()}</p>
                    <p className="text-sm">Raised: ${stage.raised.toLocaleString()}</p>
                  </div>
                  {stage.id === currentStage && (
                    <ArrowRight className="w-6 h-6 ml-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-pink-200 to-blue-200 p-6">
          <div className="w-full text-center space-y-2">
            <p className="text-sm text-gray-700">
            Launch Price: $0.017 per Cat0 / Total Supply: 1,000,000,000 Cat0            </p>
            <p className="text-sm font-semibold text-gray-800">
            </p>
            <p className="text-sm font-semibold text-gray-800">
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
