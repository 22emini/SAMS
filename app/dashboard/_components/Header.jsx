"use client"
import Image from 'next/image';
import React from 'react'
import MobileNavbar from './MobileNavbar';
import { UserButton } from '@clerk/nextjs';
import ModeToggle from '@/components/ui/Toogle';

function Header() {

  return (
    <div className='p-4 shadow-sm border flex justify-between items-center'>
      <div className="md:hidden">
        <MobileNavbar />
      </div>
      <div>
        {/* You can add a logo or title here if needed */}
      </div>
      <div className=''>
        <ModeToggle />
      </div>
    </div>
  )
}

export default Header