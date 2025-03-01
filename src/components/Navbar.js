'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show navbar on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-green-600">BikeRental</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-gray-700">
                  {session.user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-green-600 px-3 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-green-600 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
