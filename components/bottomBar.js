import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FiHome, FiList, FiBarChart2 } from 'react-icons/fi';

const BottomBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { href: '/user/queuelist', icon: FiList, label: 'Queue List' },
    { href: '/queue-owner/queue-dashboard', icon: FiBarChart2, label: 'Queue Dashboard' },
  ];

  if (!isVisible) return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              router.pathname === item.href ? 'text-[#3532a7]' : 'text-gray-600'
            }`}
          >
            <item.icon className="text-2xl mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
        <Link
          href="/user/profile"
          className={`flex flex-col items-center justify-center w-full h-full ${
            router.pathname === '/user/profile' ? 'text-[#3532a7]' : 'text-gray-600'
          }`}
        >
          {session?.user?.image ? (
            <div className="w-6 h-6 rounded-full overflow-hidden mb-1">
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 mb-1 flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {session?.user?.name ? session.user.name[0].toUpperCase() : 'U'}
              </span>
            </div>
          )}
          <span className="text-xs truncate w-full text-center">
            {session?.user?.name || 'Profile'}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomBar;