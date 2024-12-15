import React from 'react'
import { Instagram, Twitter, LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { teamMembers } from './teamMembersData'

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  icon: LucideIcon;
  instagram: string;
  twitter: string;
}

export default function TeamShowcase() {
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="flex justify-center w-full">
        <Card className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
            <CardTitle className="text-3xl font-bold">
              7AI Research
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p>No team members available at the moment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
          <CardTitle className="text-3xl font-bold">
            7AI Research
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member: TeamMember, index: number) => (
              <Card key={index} className="overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105">
                <CardContent className="p-0">
                  <div className="relative w-full h-48">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Error loading image for ${member.name}:`, e);
                        e.currentTarget.src = `https://via.placeholder.com/200x200?text=${member.name.split(' ').map(n => n[0]).join('')}`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      {member.icon && <member.icon className="h-6 w-6 text-pink-500" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{member.description}</p>
                    <div className="flex justify-end space-x-2">
                      {member.instagram && (
                        <a href={`https://instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                          <Instagram className="h-5 w-5" />
                          <span className="sr-only">Instagram profile of {member.name}</span>
                        </a>
                      )}
                      {member.twitter && (
                        <a href={`https://twitter.com/${member.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                          <Twitter className="h-5 w-5" />
                          <span className="sr-only">Twitter profile of {member.name}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <div className="bg-gradient-to-r from-pink-200 to-blue-200 p-4 text-center">
          <p className="text-sm text-gray-700">
            Meet the team behind our success | Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </Card>
    </div>
  )
}

console.log('TeamShowcase component rendered');