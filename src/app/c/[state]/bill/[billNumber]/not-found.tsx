'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function NoTextFound() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">No Text Available</h1>
        <p className="text-lg text-gray-600 mb-8">
          No text format has been found for this bill yet. Please check back later as it may be added in the future.
        </p>
        <Link href="/" passHref>
          <Button
            onClick={() => {
              router.back()
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ArrowLeft className="mr-2 h-5 w-5"/>
            Go Back
          </Button>
        </Link>
      </div>
    </div>
  )
}