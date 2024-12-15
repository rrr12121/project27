'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Switch } from "./ui/switch"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { RefreshCw, Save, Video, Image as ImageIcon, Sparkles, Clock, AlertTriangle, WifiOff, Wand2, Shuffle, Heart, ArrowUpRight, Shield } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { Progress } from "./ui/progress"
import { useBalance } from '../context/BalanceContext'
import { fal } from "@fal-ai/client"

// Configure fal client outside of component
try {
  fal.config({
    credentials: 'eb503ee0-c028-4af3-8804-e9680778e177:d4fb3839485618554f05cebc1f2beb8b'
  });
} catch (error) {
  console.error("Error configuring fal client:", error);
}

// Types
interface AIModel {
  name: string;
  imageCost: number;
  videoCost: number;
  speed: number;
  quality: number;
}

interface GenerationHistoryItem {
  prompt: string;
  model: string;
  images: string[];
  favorite: boolean;
  timestamp: Date;
}

interface ExamplePrompt {
  category: string;
  prompts: string[];
}

const DEFAULT_PROMPT = "IMG_1019.CR2 black woman"

const examplePrompts: ExamplePrompt[] = [
  {
    category: "Portraits",
    prompts: [
      "(Faded Polaroid Photo:1.1), Interior view, (portrait of a fashion woman:1.1), (Pixie bob haircut:1.1), (Midnight hair:0.8), (dressed in a high-necked blouse with a long skirt and a corset:1.1), (edge light, cool light, natural, Triadic:0.9), (Deep space background:1.1), (analog, old faded photo, old polaroid:1.05)",
      "2453_selfie.jpg black woman",
      "A wise old tree spirit with a face formed from bark and moss, eyes glowing with ancient knowledge",
      "a cinematic bust portrait of a beautiful woman from left,Light blond hair,dressed in a long black trench coat with intricate silver embroidery and high boots,In the Astral Sanctuary at the Heart of Cosmic Streams,(highly detailed masterpiece Realistic extremely hyper aesthetic trending on artstation),Nikon d850,Ambient lighting"
    ]
  },
  {
    category: "NSFW",
    prompts: [
      "portrait of a young russian woman sitting on a red couch. She is completely naked, with her body facing the camera and her legs crossed in front of her. She has a red shawl draped over her shoulders and is looking directly at the camera with a seductive expression. The background is a plain red wall. The overall mood of the image is sensual and provocative",
      "african girl with straight, light brown hair. She is standing or posing in an indoor setting, possibly near a swing chair or decorative hanging furniture. She is wearing a cream-colored cardigan tied loosely at the waist, with the cardigan open to reveal part of her chest. The woman appears to be gazing off to the side with a calm or neutral expression. The background features a mix of floral-patterned wallpaper and draped curtains",
      "a young woman with long, wavy blonde hair in a sexy dress, stands in front of a wall in underwear, capturing a picture, then I mentioned about the image that quality is grainy, with a slight blur softening the details, dim lighting",
      "young woman with long dark hair and tattoos on her body. She is standing in a bedroom with a bed in the background. The woman is wearing a red bikini top and is holding a large dick in her hand. She has a serious expression on her face and is looking directly at the camera"
    ]
  },
  {
    category: "Abstract",
    prompts: [
      "A visual representation of the concept of time, with clocks melting and spiraling into infinity",
      "The dance of elemental forces: fire, water, earth, and air intertwining in a cosmic ballet",
      "A fractal landscape that shifts between microscopic and macroscopic scales seamlessly",
      "The birth of a new idea, represented as a burst of colorful light emerging from darkness"
    ]
  },
  {
    category: "Sci-Fi",
    prompts: [
      "A megastructure space elevator extending from Earth's surface into orbit",
      "A time traveler's laboratory with paradoxical objects from different eras",
      "First contact scene between humans and a hyper-advanced alien civilization",
      "A zero-gravity garden on a space station, with plants growing in impossible shapes"
    ]
  },
  {
    category: "Fantasy",
    prompts: [
      "A dragon's hoard of treasure in a massive cavern, with the sleeping dragon barely visible",
      "A wizard's tower that defies physics, with rooms existing in multiple dimensions",
      "A fairy tale forest where the trees have faces and the animals wear clothes",
      "An epic battle between gods in the clouds, with mythical creatures as their steeds"
    ]
  }
]

const aiModels: AIModel[] = [
  { 
    name: "7AICAT mini", 
    imageCost: 30,
    videoCost: 60,
    speed: 1.5, 
    quality: 0.7
  },
  { 
    name: "7AICAT", 
    imageCost: 40,
    videoCost: 80,
    speed: 1, 
    quality: 1
  },
  { 
    name: "7AICAT Pro", 
    imageCost: 50,
    videoCost: 100,
    speed: 0.8, 
    quality: 1.3
  }
]

// Reusable components
const AlertCard: React.FC<{ variant?: string; icon: React.ReactNode; title: string; description: string }> = ({ variant, icon, title, description }) => (
  <Alert variant={variant as any} className="mb-4 sm:mb-6">
    {icon}
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
)

const MediaDisplay: React.FC<{ type: 'image' | 'video'; src: string | string[]; alt?: string; isVisible: boolean; lastGeneratedType: 'image' | 'video' | null }> = ({ type, src, alt, isVisible, lastGeneratedType }) => {
  console.log("MediaDisplay props:", { type, src, alt, isVisible, lastGeneratedType });
  
  const defaultImageSrc = "/1.jpeg";  // Path to the default image in the public folder

  if (!isVisible || lastGeneratedType !== type) {
    console.log("MediaDisplay: Showing default image");
    return (
      <Card className="bg-white shadow-md overflow-hidden">
        <CardContent className="p-0">
          <img src={defaultImageSrc} alt="Default image" className="w-full h-auto" />
        </CardContent>
      </Card>
    );
  }

  if (type === 'image') {
    const imageUrl = Array.isArray(src) ? src[0] : src;
    console.log("MediaDisplay: Rendering single large image");
    return (
      <Card className="bg-white shadow-md overflow-hidden">
        <CardContent className="p-0">
          {imageUrl ? 
            <img src={imageUrl} alt={alt} className="w-full h-auto" onError={(e) => console.error("Error loading image:", e)} />
            : <img src={defaultImageSrc} alt="Default image" className="w-full h-auto" />
          }
        </CardContent>
      </Card>
    );
  } else {
    console.log("MediaDisplay: Rendering video");
    return (
      <Card className="bg-white shadow-md overflow-hidden">
        <CardContent className="p-0">
          {src ? 
            <video src={src as string} className="w-full h-auto" loop controls playsInline>
              Your browser does not support the video tag.
            </video>
            : <img src={defaultImageSrc} alt="Default image" className="w-full h-auto" />
          }
        </CardContent>
      </Card>
    );
  }
}

const TruncatedText: React.FC<{ text: string; maxLength: number }> = ({ text, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncated = text.length > maxLength && !isExpanded ? text.slice(0, maxLength) + '...' : text;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className="cursor-help inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {truncated}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs whitespace-normal">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function CatCoinMediaGeneratorAlpha() {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [currentVideo, setCurrentVideo] = useState('')
  const { balance, updateBalance } = useBalance()
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[1])
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image')
  const [creativity, setCreativity] = useState(50)
  const [progress, setProgress] = useState(0)
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(false)
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [lastGeneratedType, setLastGeneratedType] = useState<'image' | 'video' | null>(null)

const handleFalApiRequest = useCallback(async (prompt: string) => {
  console.log("handleFalApiRequest called with prompt:", prompt);
  try {
    const result = await fal.subscribe("fal-ai/flux-realism", {
      input: {
        prompt: prompt,
        enable_safety_checker: enableSafetyChecker,
        image_size: "landscape_4_3"
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update);
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      },
    });
    
    if (!result || !result.data) {
      throw new Error('No data received from API');
    }
    
    console.log("API result:", result);
    return result.data;
  } catch (error) {
    console.error("Error in fal API request:", error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate image');
  }
}, [enableSafetyChecker]);

  const handleGenerate = useCallback(async () => {
    console.log("handleGenerate called");
    const cost = activeTab === 'image' ? selectedModel.imageCost : selectedModel.videoCost
    if (balance < cost) {
      console.log("Insufficient balance");
      toast({
        title: "Insufficient Cat Coins",
        description: "Please add more Cat Coins to your account to generate media.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    await updateBalance(balance - cost)  // Using updateBalance instead of setBalance
    setProgress(0)
    setIsContentVisible(false)

    const interval = setInterval(() => {
      setProgress((prevProgress: number) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 1
      })
    }, 100)

    try {
      console.log("Calling handleFalApiRequest");
      const result = await handleFalApiRequest(prompt);
      console.log("API result:", result);
      if (activeTab === 'image' && Array.isArray(result.images)) {
        console.log("Setting current images:", result.images);
        const imageUrls = result.images.map((img: any) => img.url).filter(Boolean);
        if (imageUrls.length === 0) {
          throw new Error('No valid image URLs returned from the API');
        }
        setCurrentImages(imageUrls);
        setGenerationHistory(prev => [...prev, { prompt, model: selectedModel.name, images: imageUrls, favorite: false, timestamp: new Date() }])
        setLastGeneratedType('image')
      } else if (activeTab === 'video' && typeof result.video === 'string') {
        console.log("Setting current video:", result.video);
        setCurrentVideo(result.video);
        setLastGeneratedType('video')
      } else {
        console.error('Unexpected result format from API:', result);
        throw new Error('Unexpected result format from API');
      }
      
      setIsGenerating(false)
      setIsContentVisible(true)
      clearInterval(interval)
      setProgress(100)
      toast({
        title: "Media Generated",
        description: `${cost} Cat Coins have been deducted from your account.`,
      })
    } catch (error) {
      console.error("Error generating media:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred while generating the media. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
      clearInterval(interval)
      setProgress(0)
    }
  }, [balance, selectedModel, activeTab, prompt, toast, handleFalApiRequest, updateBalance]);

const handleDemoClick = useCallback(() => {
    const demoImageText = `A candid portrait of an urban gardener tending to her rooftop oasis in the heart of a bustling city. The woman, in her mid-thirties, has copper-toned skin that glows in the warm sunlight. Her curly black hair is pulled back into a messy bun, with a few stray tendrils framing her face. She wears round, tortoiseshell glasses that slightly magnify her warm brown eyes, which are crinkled at the corners from frequent laughter.
The gardener is dressed in well-worn denim overalls over a faded green t-shirt. Her hands, adorned with colorful, soil-stained gardening gloves, are gently tending to a tomato plant. A vibrant tattoo of intertwining vines and flowers peeks out from under her rolled-up sleeve, extending from her wrist to her elbow.
Around her neck hangs a hand-made pendant crafted from a smooth river stone. Her feet are clad in scuffed yellow rain boots, despite the sunny weather – clearly a favorite gardening accessory.
The rooftop garden itself is a testament to urban ingenuity. Recycled wooden pallets and colorful plastic containers serve as planters, bursting with a variety of vegetables, herbs, and flowers. A small greenhouse constructed from old windows stands in one corner, housing delicate seedlings.
In the background, skyscrapers loom, creating a striking contrast between the lush greenery of the garden and the steel and glass of the urban landscape. A few honeybees buzz around the gardener, drawn to the island of nature she's created in the concrete jungle.
The woman's face bears an expression of peaceful concentration, a slight smile playing on her lips as she nurtures her plants, seemingly oblivious to the city's chaos below.
Near the edge of the rooftop, a rustic wooden sign is prominently displayed. The sign is weathered and slightly mossy, blending naturally with the garden atmosphere. Painted on the sign in pink letters is the text: "7AICAT". The sign appears to be a unique identifier or perhaps the name of this rooftop sanctuary, adding an intriguing element of mystery to the scene.`

    const demoVideoText = `A mesmerizing timelapse sequence capturing the dynamic transformation of a bustling cityscape from dawn to dusk. The scene begins with the first rays of sunlight painting the sky in soft pastels, gradually illuminating the modern architecture of skyscrapers and office buildings. Throughout the day, shadows dance across glass facades as clouds drift overhead, creating an ever-changing play of light and reflection.

The urban rhythm is visible in the flow of traffic and pedestrians below, appearing as streams of light and movement. As the sun arcs across the sky, the city's mood shifts - from the crisp clarity of morning to the golden warmth of afternoon, and finally to the electric glow of twilight when the buildings begin to illuminate from within.

The video maintains a steady frame on a central architectural focal point while the world transforms around it, creating a hypnotic visual narrative of urban life and the passage of time. The composition emphasizes both the permanence of the city's structure and the constant flux of its daily life.

Weather patterns move through the frame - perhaps a brief rain shower creating reflective surfaces, or sunset clouds adding dramatic color to the sky. The final moments capture the transition to night, as office lights create a constellation of windows against the darkening sky, and the city takes on its nocturnal character.

Throughout the sequence, the 7AICAT logo appears subtly integrated into the urban landscape, perhaps as a digital billboard or architectural element, maintaining brand presence without disrupting the natural flow of the timelapse.`

    const demoText = activeTab === 'image' ? demoImageText : demoVideoText
    setPrompt(demoText)
    setIsDemoMode(true)
    setIsGenerating(true)
    setProgress(0)
    setIsContentVisible(false)

    // Simulate real API behavior with random delays and slower progress
    let currentProgress = 0
    const finalProgress = 100
    const baseInterval = 200 // Base interval between progress updates
    const randomFactor = 0.5 // Random factor to add variation

    const updateProgress = () => {
        // Add random variation to progress increment
        const increment = Math.random() * 2 + 1 // Random increment between 1 and 3
        currentProgress = Math.min(currentProgress + increment, finalProgress)
        setProgress(currentProgress)

        if (currentProgress < finalProgress) {
            // Add random delay to next update
            const delay = baseInterval + (Math.random() * baseInterval * randomFactor)
            setTimeout(updateProgress, delay)
        } else {
            // Show demo content after progress reaches 100%
            if (activeTab === 'image') {
                const demoImagePath = "/Demo1.jpg"
                setCurrentImages([demoImagePath])
                setLastGeneratedType('image')
                // Add to history without charging tokens
                setGenerationHistory(prev => [...prev, { 
                    prompt: demoText,
                    model: selectedModel.name, 
                    images: [demoImagePath], 
                    favorite: false, 
                    timestamp: new Date() 
                }])
            } else {
                const demoVideoPath = "/Demo3.mp4"
                setCurrentVideo(demoVideoPath)
                setLastGeneratedType('video')
            }
            setIsContentVisible(true)
            setIsGenerating(false)
            toast({
                title: "Demo Mode",
                description: `Showing demo ${activeTab} without using Cat Coins.`,
            })
        }
    }

    // Start progress updates with initial delay
    setTimeout(updateProgress, baseInterval)

}, [toast, selectedModel.name, activeTab])

const handleRandomPrompt = useCallback(() => {
    const randomCategory = examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
    const randomPrompt = randomCategory.prompts[Math.floor(Math.random() * randomCategory.prompts.length)]
    setPrompt(randomPrompt)
    toast({
      title: "Random Prompt",
      description: "A random prompt has been selected.",
    })
}, [toast])

  const toggleFavorite = useCallback((index: number) => {
    setGenerationHistory(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, favorite: !item.favorite } : item
      )
    )
  }, [])

  const handleSaveMedia = useCallback(() => {
    if (activeTab === 'image' && currentImages.length > 0) {
      // Create a temporary canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';  // This allows us to download images from other domains
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Convert the canvas to a blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a local URL for the blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary anchor element and trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated-image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up the URL object
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      };
      img.src = currentImages[0];
      
      toast({
        title: "Image Saved",
        description: "The generated image has been saved to your device.",
      });
    } else if (activeTab === 'video' && currentVideo) {
      // For video, we'll create a download link for the video file
      const a = document.createElement('a');
      a.href = currentVideo;
      a.download = 'generated-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Video Saved",
        description: "The generated video has been saved to your device.",
      });
    } else {
      toast({
        title: "No Content to Save",
        description: "Please generate content before saving.",
        variant: "destructive",
      });
    }
  }, [activeTab, currentImages, currentVideo, toast]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [currentVideo])

  // Log MediaDisplay props before rendering
  useEffect(() => {
    console.log("MediaDisplay props:", { 
      type: 'image', 
      src: currentImages, 
      alt: "Generated image", 
      isVisible: isContentVisible, 
      lastGeneratedType 
    });
  }, [currentImages, isContentVisible, lastGeneratedType]);

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center -m-4">
      <Card className="w-full max-w-4xl shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white">
          <CardTitle className="text-3xl font-bold">7AICAT</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <AlertCard
            variant="default"
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Alpha Version"
            description="This is an experimental alpha version. Features may be unstable or change without notice. Use at your own risk."
          />

          <AlertCard
            variant="destructive"
            icon={<WifiOff className="h-4 w-4" />}
            title="Server Video Offline"
            description="The server is currently offline. Some features may be unavailable. We apologize for the inconvenience."
          />

          <div className="mb-6 sm:mb-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                  Cat Coin Balance
                </span>
                <span className="text-xl font-semibold text-pink-600">
                  {Math.floor(balance)} Cat0
                </span>
              </div>
              <Progress value={(Math.floor(balance) / 500) * 100} className="w-full h-4" />
            </div>
          </div>

          <div className="mb-4 sm:mb-6 space-y-4">
            <Select
              value={selectedModel.name}
              onValueChange={(value) => setSelectedModel(aiModels.find(model => model.name === value) || aiModels[1])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    <div className="flex items-center">
                      <span>{model.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {activeTab === 'image' ? model.imageCost : model.videoCost} CC
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Card className="bg-gradient-to-r from-pink-100 to-blue-100">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Model Comparison</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">Speed</p>
                    <Progress value={(selectedModel.speed / 1.5) * 100} className="h-2" />
                  </div>
                  <div>
                    <p className="font-medium">Quality</p>
                    <Progress value={(selectedModel.quality / 1.3) * 100} className="h-2" />
                  </div>
                  <div>
                    <p className="font-medium">Cost</p>
                    <Progress value={(activeTab === 'image' ? selectedModel.imageCost : selectedModel.videoCost) / 90 * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2">
              <Switch
                id="safety-checker"
                checked={enableSafetyChecker}
                onCheckedChange={setEnableSafetyChecker}
              />
              <label htmlFor="safety-checker" className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Enable NSFW
              </label>
            </div>
          </div>

          <Tabs defaultValue="image" className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <TabsList className="bg-gray-100 p-1 rounded-full">
                <TabsTrigger 
                  value="image" 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  onClick={() => setActiveTab('image')}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  onClick={() => setActiveTab('video')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={handleSaveMedia}
                className="bg-black text-white hover:bg-gray-800"
                disabled={isGenerating || !isContentVisible}
              >
                <Save className="h-4 w-4 mr-2" />
                Save {activeTab === 'image' ? 'Image' : 'Video'}
              </Button>
            </div>
            <TabsContent value="image" className="mt-4">
              <MediaDisplay type="image" src={currentImages} alt="Generated image" isVisible={isContentVisible} lastGeneratedType={lastGeneratedType} />
            </TabsContent>
            <TabsContent value="video" className="mt-4">
              <MediaDisplay type="video" src={currentVideo} isVisible={isContentVisible} lastGeneratedType={lastGeneratedType} />
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mb-4 sm:mb-6">
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              className="w-full bg-white border-gray-200"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="w-full sm:flex-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600"
              >
                {isGenerating ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : activeTab === 'image' ? (
                  <ImageIcon className="h-5 w-5 mr-2" />
                ) : (
                  <Video className="h-5 w-5 mr-2" />
                )}
                Generate {activeTab === 'image' ? 'Images' : 'Video'}
              </Button>
              <Button 
                onClick={handleDemoClick} 
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
              >
                <Wand2 className="h-5 w-5 mr-2" /> Demo
              </Button>
              <Button 
                onClick={handleRandomPrompt}
                className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600"
              >
                <Shuffle className="h-5 w-5 mr-2" /> Random
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 sm:mb-6"
              >
                <Card className="bg-gradient-to-r from-pink-100 to-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-pink-600">Generation Progress</h3>
                      <span className="text-sm font-medium text-blue-600">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="w-full h-4" />
                    <div className="mt-2 text-center text-sm font-medium text-gray-600">
                      {progress < 100 ? "Creating your masterpiece..." : "Your creation is ready!"}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        <Card className="mb-4 sm:mb-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-pink-600">Example Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              {examplePrompts.map((category, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-md font-semibold mb-2 text-pink-600">{category.category}</h3>
                  {category.prompts.map((examplePrompt, promptIndex) => (
                    <Button
                      key={promptIndex}
                      variant="ghost"
                      className="w-full justify-start text-left mb-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                      onClick={() => setPrompt(examplePrompt)}
                    >
                      <Wand2 className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
                      <TruncatedText text={examplePrompt} maxLength={100} />
                    </Button>
                  ))}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

          <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-pink-100 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-pink-600">Creativity Level</h3>
                <span className="text-sm font-medium text-blue-600">{creativity}%</span>
              </div>
              <Slider
                defaultValue={[creativity]}
                max={100}
                step={1}
                className="bg-white"
                onValueChange={(value: number[]) => setCreativity(value[0])}
              />
            </CardContent>
          </Card>

          <Card className="mb-4 sm:mb-6 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-pink-600">Generation History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60">
                {generationHistory.map((item, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-700">{item.prompt}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Generated on: {item.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(index)}
                      >
                        <Heart className={`h-5 w-5 ${item.favorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{item.model}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(item.prompt)}
                      >
                        <ArrowUpRight className="h-4 w-4 mr-1" /> Reuse Prompt
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {item.images.map((img, imgIndex) => (
                        <img key={imgIndex} src={img} alt={`Generated image ${imgIndex + 1}`} className="w-full h-auto rounded-md" />
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-600 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-xl font-bold">Current Model: {selectedModel.name}</h3>
                  <p className="text-sm">Generation Cost: {activeTab === 'image' ? selectedModel.imageCost : selectedModel.videoCost} Cat Coins</p>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <div className="flex items-center">
                    <Clock className="w-4 w-4 mr-1" />
                    <span className="text-sm">{selectedModel.speed.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="w-4 w-4 mr-1" />
                    <span className="text-sm">{selectedModel.quality.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
