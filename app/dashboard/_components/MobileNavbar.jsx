import React, { useState, useEffect } from 'react';
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
 
];

const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close menu on resize to md and up, and lock body scroll when open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-primary text-white shadow-md md:hidden z-50"
        style={{ display: 'block' }}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Menu */}
      <div className={`
        fixed inset-0 bg-white transition-transform duration-300 md:hidden z-40
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        <div className="flex flex-col h-full p-5 relative">
          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 hover:bg-slate-300 focus:outline-none"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <div className="flex-grow flex flex-col">
            <img src="/logo2.png" alt="App Logo" className="w-full max-w-[80px] h-auto mb-6 mx-auto object-contain" />
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
          </div>
          <div className="w-full flex justify-between items-center px-5 mt-4 pt-4 border-t absolute bottom-10 left-0">
            <UserButton />
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar; 