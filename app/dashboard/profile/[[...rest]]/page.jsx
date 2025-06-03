import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className=' flex justify-center mt-36 items-center h-screen'>
      <UserProfile />
    </div>
  )
}

export default page
