"use client";

export function OwnerDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>
      <p>Manage your bikes and track rentals.</p>
      <div className="flex gap-4 mt-4">
        <Button><Bike className="mr-2" /> Add Bike</Button>
        <Button><Map className="mr-2" /> Track Rentals</Button>
      </div>
      <Button
        onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/auth/login"))}
        className="mt-6"
      >
        <LogOut className="mr-2" /> Logout
      </Button>
    </div>
  );
}
  