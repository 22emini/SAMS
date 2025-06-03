import React, { useState } from 'react';

import { GraduationCap, Hand, LayoutIcon, Settings, Menu, X ,MessageCircle, Laugh} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import ModeToggle from '@/components/ui/Toogle';
import { UserButton } from '@clerk/nextjs';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const path = usePathname();

  const menuList = [
    {
      id: 1,
      name: 'Dashboard',
      icon: LayoutIcon,
      path: '/dashboard'
    },
    {
      id: 2,
      name: 'Students',
      icon: GraduationCap,
      path: '/dashboard/students'
    },
    {
      id: 3,
      name: 'Attendance',
      icon: Hand,
      path: '/dashboard/attendance'
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
  ];

  return (
    <div>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 p-2 rounded-lg bg-primary text-white shadow-md md:hidden z-50"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Overlay */}
      <div className={`
        fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out md:hidden z-40
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-5">
           <Image src={'/sam2.png'} 
                width={120} 
                height={50} 
                alt='logo' />
          <hr className="my-5" />
          
          <nav className="mt-8">
            {menuList.map((menu) => (
              <Link 
                href={menu.path} 
                key={menu.id}
                onClick={() => setIsOpen(false)}
              >
                <h2 className={`
                  flex items-center gap-3 text-md p-4
                  text-slate-500
                  hover:bg-primary
                  hover:text-white
                  cursor-pointer
                  rounded-lg
                  my-2
                  ${path === menu.path && 'bg-primary text-white'}
                `}>
                  <menu.icon />
                  {menu.name}
                </h2>
              </Link>
            ))}
            
          </nav>

          {/* User Profile Section */}
          <div className="absolute bottom-13 p-2 flex gap-2 items-center">
           <UserButton />
          <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;