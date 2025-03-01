<<<<<<< HEAD
'use client';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
=======
// app/layout.js
import { Inter } from "next/font/google"; // Import Google Fonts
import "./globals.css"; // Import global styles
import { Toaster } from "react-hot-toast"; // Import Toaster component
import AuthProvider from "../components/AuthProvider"; // Import AuthProvider component
import Navbar from "../components/Navbar"; // Import Navbar component

// Load custom fonts
const inter = Inter({
  subsets: ["latin"], // Define the subset (e.g., Latin)
  display: 'swap', // Optimize font loading
});

export const metadata = {
  title: "Bike Rental App", // Customize the title
  description: "Rent bikes easily and securely", // Update the description
  // Add more metadata tags if needed
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <Navbar />
          <main>
            {children} {/* Render children (e.g., page content) */}
          </main>
          <Toaster position="top-center" /> {/* Add Toaster component */}
        </AuthProvider>
      </body>
    </html>
>>>>>>> 62488ab270a13ac4108d262168a4172ffb5e312a
  );
}
