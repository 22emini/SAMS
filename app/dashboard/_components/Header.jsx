"use client"
import Image from 'next/image';
import React from 'react'
import MobileNav from './Test';
import { UserButton } from '@clerk/nextjs';
import ModeToggle from '@/components/ui/Toogle';

function Header() {

  return (
    <div className='p-4 shadow-sm border flex justify-between'>
       <MobileNav />
        <div>
       
      
        </div>
        <div className=''>
          <ModeToggle />
       
      
        </div>
    </div>
  )
}

export default Header