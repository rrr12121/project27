import React from 'react'

interface AvatarProps {
  className?: string
  children?: React.ReactNode
}

export const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
    </div>
  )
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage: React.FC<AvatarImageProps> = (props) => {
  return <img {...props} className={`w-full h-full object-cover ${props.className || ''}`} />
}

interface AvatarFallbackProps {
  children: React.ReactNode
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600">
      {children}
    </div>
  )
}