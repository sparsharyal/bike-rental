import Link from "next/link";
import { LogOut, Bike, History, AlertTriangle, CreditCard } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard/browse-bikes" className="block p-2 hover:bg-gray-700 rounded">
              <Bike className="mr-2 inline" /> Browse Bikes
            </Link>
          </li>
          <li>
            <Link href="/dashboard/rental-history" className="block p-2 hover:bg-gray-700 rounded">
              <History className="mr-2 inline" /> Rental History
            </Link>
          </li>
          <li>
            <Link href="/dashboard/report-issue" className="block p-2 hover:bg-gray-700 rounded">
              <AlertTriangle className="mr-2 inline" /> Report an Issue
            </Link>
          </li>
          <li>
            <Link href="/dashboard/payments" className="block p-2 hover:bg-gray-700 rounded">
              <CreditCard className="mr-2 inline" /> Payments
            </Link>
          </li>
        </ul>
      </nav>

      <button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center p-3 rounded mt-6">
        <LogOut className="mr-2" /> Logout
      </button>
    </aside>
  );
}
