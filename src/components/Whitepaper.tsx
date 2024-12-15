import React, { useState } from 'react'
import { FileText, Download, Play, Pause } from 'lucide-react'

const introduction = 'Cat0  Infinity is a revolutionary DeFi project aimed at democratizing access to decentralized finance while promoting sustainability and community engagement. Our platform combines cutting-edge blockchain technology with user-friendly interfaces to create a seamless and inclusive financial ecosystem.'

export default function Whitepaper() {
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleAudio = () => {
    const audio = document.getElementById('whitepaper-audio') as HTMLAudioElement
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Whitepaper</h2>
              <p className="text-lg">Project Overview</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white text-blue-500 px-4 py-2 rounded-md flex items-center text-sm">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center mb-4">
                <FileText className="mr-2 h-6 w-6 text-pink-500" />
                Introduction
              </h3>
              <div className="h-[400px] overflow-y-auto">
                <p className="text-gray-600 whitespace-pre-line">{introduction}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-gray-600 italic">
              Discover Our Project: An Audio Deep Dive
            </p>
            <button 
              onClick={toggleAudio}
              className={`w-full px-4 py-3 rounded-md flex items-center justify-center text-sm transition-colors ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? (
                <Pause className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-200 to-blue-200 p-4 text-center">
          <p className="text-sm text-gray-700">
            Last updated: September 15, 2024 | Version 1.0
          </p>
        </div>
      </div>
      <audio id="whitepaper-audio" src="/podcast.ai.mp3" />
    </div>
  )
}
