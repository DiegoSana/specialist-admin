export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Professionals</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Reviews</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
        </div>
      </div>
    </div>
  )
}

