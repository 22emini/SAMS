"use client"
import { UserButton } from '@clerk/nextjs'

import { GraduationCap, Hand, LayoutIcon, MessageCircle , Settings, ScanFace, Laugh } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

function SideNav() {


  const menuList=[
    {
      id:1,
      name:'Dashboard',
      icon:LayoutIcon,
      path:'/dashboard'
    },
    {
      id:2,
      name:'Students',
      icon:GraduationCap,
      path:'/dashboard/students'
    },
    {
      id:3,
      name:'Attendance',
      icon:Hand,
      path:'/dashboard/attendance'
    },
    
    {
      id:4,
      name:'Message',
      icon:MessageCircle ,
      path:'/dashboard/SendMessage'
    },
       {
      id:5,
      name:'Profile',
      icon:Laugh,
      path:'/dashboard/profile'
    },
    {
      id:6,
      name:'Settings',
      icon:Settings,
      path:'/dashboard/settings'
    },
  
    
     



  ]
  const path=usePathname();
  useEffect(()=>{
    console.log(path)
  },[path])
  return (
    <div className='border shadow-md h-screen p-5'>
        <Image src={'/sam2.png'} 
        width={120} 
        height={50} 
        alt='logo' />

      <hr className='my-5'></hr>

      {menuList.map((menu,index)=>(
        <Link href={menu.path} key={menu.id}>
          <h2 className={`flex items-center gap-3 text-md p-4
          text-slate-500
          hover:bg-primary
          hover:text-white
          cursor-pointer
          rounded-lg
          my-2
          ${path==menu.path&&'bg-primary text-white'}
          `}>
              <menu.icon/>
              {menu.name}
          </h2>
        </Link>
      ))}
 
      <div className='flex gap-2 items-center bottom-1 fixed p-2'>

        <UserButton/>
        
      </div>

    </div>
  )
}

export default SideNav