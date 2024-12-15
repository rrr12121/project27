import { CheckCircle, Circle } from 'lucide-react'

const milestones = [
  { phase: 'Phase 1', title: 'Project Launch', description: 'Initial token distribution and exchange listings', completed: true },
  { phase: 'Phase 2', title: 'Community Growth', description: 'Expand social media presence and partnerships', completed: true },
  { phase: 'Phase 3', title: 'DeFi Integration', description: 'Launch staking and yield farming features', completed: false },
  { phase: 'Phase 4', title: 'NFT Marketplace', description: 'Introduce unique Cat0 NFT collections', completed: false },
  { phase: 'Phase 5', title: 'Mobile App', description: 'Release Cat0 mobile wallet and trading app', completed: false },
]

export default function Roadmap() {
  return (
    <div className="flex justify-center w-full"> {/* Added flex and justify-center */}
      <div className="w-full max-w-4xl shadow-xl overflow-hidden bg-white rounded-lg">
        <div className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
          <h2 className="text-3xl font-bold">Roadmap</h2> 
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {milestone.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{milestone.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${milestone.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {milestone.phase}
                    </span>
                  </div>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-200 to-blue-200 p-4 text-center">
          <p className="text-sm text-gray-700">
            Stay tuned for more exciting developments at Cat0
          </p>
        </div>
      </div>
    </div>
  )
}