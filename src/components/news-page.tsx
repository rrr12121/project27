import React, { useState } from 'react'
import { Calendar, ChevronDown, ChevronUp, Play, Pause, Headphones } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

interface NewsItem {
  title: string;
  date: string;
  content: string;
  fullContent: string;
  badge: string;
  podcastUrl: string;
}

export default function NewsPage() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const newsItems: NewsItem[] = [
    {
      title: "Presale starts",
      date: "October 10, 2024",
      content: "Our team has made significant progress in combining AI with blockchain technology, potentially revolutionizing decentralized finance applications.",
      fullContent: "Our team has made significant progress in combining AI with blockchain technology, potentially revolutionizing decentralized finance applications. Full details to be released soon. This breakthrough could lead to more efficient, secure, and accessible financial services for users worldwide. Stay tuned for our upcoming whitepaper that will delve into the technical specifics and potential use cases of our innovative solution.",
      badge: "Event",
      podcastUrl: "/podcast.ai.mp3"
    },
    {
      title: "Partnership Announcement",
      date: "September 15, 2024",
      content: "We're excited to announce a strategic partnership with a leading blockchain infrastructure provider.",
      fullContent: "We're excited to announce a strategic partnership with a leading blockchain infrastructure provider. This collaboration will enhance our platform's scalability and security, allowing us to deliver even more robust solutions to our users. The partnership includes joint research initiatives, shared resources, and a commitment to advancing the broader blockchain ecosystem. We believe this alliance will accelerate our development timeline and bring cutting-edge features to our platform sooner than anticipated.",
      badge: "Partnership",
      podcastUrl: "/podcast.ai.mp3"
    },
  ]

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleAudio = (index: number) => {
    if (playingAudio === index) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(index);
    }
  };

  return (
    <Card className="-m-4 rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
        <div className="flex justify-between items-center mb-1">
          <CardTitle className="text-3xl font-bold">News</CardTitle>
          <Badge variant="secondary" className="text-sm">Latest Updates</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {newsItems.map((item, index) => (
          <Card key={index} className="overflow-hidden transition-all duration-300 ease-in-out">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold">{item.title}</h2>
                <Badge variant="outline">{item.badge}</Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                {item.date}
              </div>
              <p className="text-gray-600 mb-4">
                {expandedItems.includes(index) ? item.fullContent : item.content}
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleExpand(index)}
                >
                  {expandedItems.includes(index) ? (
                    <>Read Less <ChevronUp className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Read More <ChevronDown className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className={`bg-gradient-to-r ${playingAudio === index ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-purple-500'} text-white font-semibold py-2 px-4 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105`}
                  onClick={() => toggleAudio(index)}
                >
                  {playingAudio === index ? (
                    <><Pause className="mr-2 h-5 w-5" /> Podcast</>
                  ) : (
                    <><Play className="mr-2 h-5 w-5" />  Podcast</>
                  )}
                </Button>
              </div>
              <audio
                src={item.podcastUrl}
                controls={false}
                ref={(audio) => {
                  if (audio) {
                    playingAudio === index ? audio.play() : audio.pause();
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
