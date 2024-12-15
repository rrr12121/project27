import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`px-4 py-4 ${className}`}>
      {children}
    </div>
  )
}