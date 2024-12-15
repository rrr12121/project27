import { Briefcase, Code, Megaphone, Shield, Palette, Cpu, LucideIcon } from 'lucide-react'

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  icon: LucideIcon;
  instagram: string;
  twitter: string;
}

export const teamMembers: TeamMember[] = [
  { name: 'Alex Johnson', role: 'CEO & Founder', image: '/placeholder.svg?height=200&width=200', description: 'Blockchain enthusiast with 10+ years in fintech. Passionate about democratizing finance.', icon: Briefcase, instagram: 'alex.johnson', twitter: 'alexjohnson_defi' },
  { name: 'Sarah Lee', role: 'CTO', image: '/placeholder.svg?height=200&width=200', description: 'Former lead developer at a major crypto exchange. Expert in smart contract security.', icon: Code, instagram: 'sarahlee_tech', twitter: 'sarahlee_blockchain' },
  { name: 'Emily Nkosi', role: 'AI Research Lead', image: '/placeholder.svg?height=200&width=200', description: 'AI specialist focusing on advanced video and image generation models. Drives innovation in our AI-powered solutions.', icon: Cpu, instagram: 'emily_nkosi_ai', twitter: 'emilynkosi_ai' },
  { name: 'David Kim', role: 'Lead Smart Contract Developer', image: '/placeholder.svg?height=200&width=200', description: 'Solidity expert with multiple successful DeFi protocol deployments.', icon: Shield, instagram: 'davidkim_dev', twitter: 'davidkim_solidity' },
  { name: 'Lisa Garcia', role: 'UX/UI Designer & Digital Marketer', image: '/Alice.jpg', description: 'Award-winning designer crafting intuitive DeFi interfaces. Expert in digital marketing strategies for blockchain products.', icon: Palette, instagram: 'lisagarcia_design', twitter: 'lisagarcia_ux' },
  { name: 'Ryan Patel', role: 'AI Engineer', image: '/7AICAT1.png', description: 'Machine learning expert specializing in natural language processing and computer vision applications.', icon: Cpu, instagram: 'ryanpatel_ai', twitter: 'ryanpatel_aitech' }
]