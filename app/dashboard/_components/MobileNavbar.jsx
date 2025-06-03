import React, { useState } from 'react';
import { Menu, X, Home, User, Settings, GraduationCap, Hand, MessageCircle, LayoutIcon, Laugh, ScanFace } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import ModeToggle from '@/components/ui/Toogle';

const menuItems = [
  { id: 1, name: 'Dashboard', icon: LayoutIcon, path: '/dashboard' },
  { id: 2, name: 'Students', icon: GraduationCap, path: '/dashboard/students' },
  { id: 3, name: 'Attendance', icon: Hand, path: '/dashboard/attendance' },
  { id: 4, name: 'Message', icon: MessageCircle, path: '/dashboard/SendMessage' },
  { id: 5, name: 'Profile', icon: Laugh, path: '/dashboard/profile' },
  { id: 6, name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  { id: 7, name: 'Face ID', icon: ScanFace, path: '/dashboard/faceID' },
];

const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-primary text-white shadow-md md:hidden z-50"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Menu */}
      <div className={`
        fixed inset-0 bg-white transition-transform duration-300 md:hidden z-40
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-5">
          <img src="/logo2.png" alt="App Logo" className="h-10 mb-6" />
          <nav>
            {menuItems.map(item => (
              <Link
                href={item.path}
                key={item.id}
                onClick={() => setOpen(false)}
              >
                <div className={`
                  flex items-center gap-3 p-4 rounded-lg my-2
                  ${pathname === item.path ? 'bg-primary text-white' : 'text-slate-500 hover:bg-primary hover:text-white'}
                `}>
                  <item.icon />
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-10 left-0 w-full flex justify-between items-center px-5">
            <UserButton />
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar; 