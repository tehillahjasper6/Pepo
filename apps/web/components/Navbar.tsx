'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PepoIcon } from './PepoBee';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <PepoIcon size={40} />
            <span className="text-2xl font-bold text-primary-600">PEPO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/browse" active={isActive('/browse')}>
              Browse
            </NavLink>
            <NavLink href="/create" active={isActive('/create')}>
              Post Giveaway
            </NavLink>
            {isAuthenticated && (
              <NavLink href="/profile" active={isActive('/profile')}>
                Profile
              </NavLink>
            )}
            <Link
              href="/ngo/register"
              className="ml-2 px-4 py-2 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 transition-colors"
            >
              NGOs Apply
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="hidden md:inline-block px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <MobileNavLink href="/browse" active={isActive('/browse')} icon="🔍">
            Browse
          </MobileNavLink>
          <MobileNavLink href="/create" active={isActive('/create')} icon="➕">
            Post
          </MobileNavLink>
          {isAuthenticated && (
            <MobileNavLink href="/profile" active={isActive('/profile')} icon="👤">
              Profile
            </MobileNavLink>
          )}
          <MobileNavLink href="/ngo/register" active={isActive('/ngo/register')} icon="🏢">
            NGOs
          </MobileNavLink>
        </div>
      </div>
    </nav>
  );
}


function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, icon, children }: { href: string; active: boolean; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'text-primary-600'
          : 'text-gray-600'
      }`}
    >
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-xs font-medium">{children}</span>
    </Link>
  );
}

