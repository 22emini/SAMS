"use client"
import React, { useState, useEffect } from 'react'
import SideNav from './_components/SideNav'
import Header from './_components/Header'
import { Skeleton } from '@/components/ui/skeleton'
 // Adjust the import based on your project structure

function layout({children}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar skeleton (hidden on mobile) */}
        <div className="md:w-64 hidden md:block bg-gray-100 dark:bg-gray-900 p-4">
          <Skeleton className="h-10 w-3/4 mb-6" />
          <Skeleton className="h-8 w-5/6 mb-4" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-4" />
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 md:ml-64 p-6 space-y-6 w-full">
          {/* Header skeleton */}
          <Skeleton className="h-12 w-1/3 mb-4" />
          {/* Filters skeleton */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          {/* Welcome message skeleton */}
          <Skeleton className="h-24 w-full rounded-xl mb-4" />
          {/* Status cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-64 w-full md:col-span-2 rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='md:w-64 fixed hidden md:block'>
        <SideNav/>
      </div>
      <div className='md:ml-64'>
        <Header/>
        {children}
      </div>
    </div>
  )
}

export default layout