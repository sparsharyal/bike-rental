'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative h-[600px] bg-gradient-to-r from-green-900 to-green-700">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Rent Your Dream Bike Today
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Experience the thrill of riding premium motorcycles at affordable rates
          </p>
          {!session ? (
            <div className="space-x-4">
              <Link
                href="/auth/signin"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-white hover:bg-gray-100 text-green-600 font-bold py-3 px-8 rounded-lg text-lg"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
