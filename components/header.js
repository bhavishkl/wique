import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiBell, FiHome, FiList, FiBarChart2, FiUser, FiSettings, FiLogOut } from "react-icons/fi";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { href: '/user/queuelist', icon: FiList, label: 'Queue List' },
    { href: '/queue-owner/queue-dashboard', icon: FiBarChart2, label: 'Queue Dashboard' },
    { href: '/user/profile', icon: FiUser, label: 'Profile' },
    { href: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#ffffff] shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard">
                <span className="text-2xl font-bold text-[#3532a7] cursor-pointer">Wique</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <FiBell className="text-2xl text-[#292680] cursor-pointer" />
                  <FiMenu
                    className="text-2xl text-[#292680] cursor-pointer"
                    onClick={toggleSidebar}
                  />
                </>
              ) : (
                <Link href="/api/auth/signin">
                  <span className="bg-[#4845c7] hover:bg-[#3532a7] text-white font-bold py-2 px-4 rounded-full text-sm transition duration-300 ease-in-out cursor-pointer">
                    Sign in
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#ffffff] shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="p-4 bg-[#3532a7]">
            <Link href="/dashboard">
              <span className="text-2xl font-bold text-[#ffffff] cursor-pointer">Wique</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="flex items-center px-4 py-2 text-sm text-[#292680] hover:bg-[#6f6cd3] hover:text-[#ffffff] cursor-pointer">
                  <item.icon className="mr-2" /> {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-[#292680] hover:bg-[#6f6cd3] hover:text-[#ffffff] cursor-pointer rounded"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Header;