import React from 'react'
import { Shield, Lock, Eye, Key, Server, UserCheck, AlertCircle, ExternalLink } from 'lucide-react'

const securityFeatures = [
  {
    icon: <Shield className="h-8 w-8 text-green-500" />,
    title: "Smart Contract Audits",
    description: "Regular third-party audits ensure the integrity of our smart contracts.",
    status: "Completed",
  },
  {
    icon: <Lock className="h-8 w-8 text-blue-500" />,
    title: "Multi-Signature Wallets",
    description: "Critical operations require multiple approvals for enhanced security.",
    status: "Active",
  },
  {
    icon: <Eye className="h-8 w-8 text-purple-500" />,
    title: "Transparent Transactions",
    description: "All transactions are publicly verifiable on the blockchain.",
    status: "Ongoing",
  },
  {
    icon: <Key className="h-8 w-8 text-yellow-500" />,
    title: "Advanced Encryption",
    description: "State-of-the-art encryption protects user data and communications.",
    status: "Active",
  },
  {
    icon: <Server className="h-8 w-8 text-red-500" />,
    title: "Decentralized Storage",
    description: "Critical data is stored across a decentralized network for resilience.",
    status: "Implemented",
  },
  {
    icon: <UserCheck className="h-8 w-8 text-indigo-500" />,
    title: "KYC (Know Your Customer)",
    description: "Rigorous identity verification process to prevent fraud and ensure compliance.",
    status: "Completed",
  },
]

export default function SecurityFeatures() {
  return (
    <div className="flex justify-center w-full"> {/* New outer div for centering */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
          <h1 className="text-3xl font-bold">Security Features</h1>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="p-4 flex items-start space-x-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${feature.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                      ${feature.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' : ''}
                      ${feature.status === 'Completed' ? 'bg-purple-100 text-purple-800' : ''}
                      ${feature.status === 'Implemented' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                      {feature.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4 mb-6">
            <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-md flex items-center justify-center">
              View Security Certificates <ExternalLink className="ml-2 h-4 w-4" />
            </button>
            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-md flex items-center justify-center">
              Read Full Security Whitepaper <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Real-time Security Monitoring</h3>
            </div>
            <p className="mt-2 text-gray-600">
              Our system continuously monitors for potential threats and unusual activities. Current status: <span className="text-green-500 font-semibold">Normal</span>
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-200 to-blue-200 p-4 text-center">
          <p className="text-sm text-gray-700">
            Our security measures are continuously updated to ensure the highest level of protection for our users.
          </p>
        </div>
      </div>
    </div>
  )
}