import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard statistics"));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!stats) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  const cards = [
    { label: "Total Products", value: stats.totalProducts, color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Categories", value: stats.totalCategories, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "Low Stock (1-5)", value: stats.lowStockProducts, color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Out of Stock", value: stats.outOfStockProducts, color: "bg-red-50 text-red-700 border-red-200" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`p-5 rounded-xl border shadow-sm ${c.color}`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Stock Movements</h2>
          {stats.recentMovements?.length === 0 ? (
            <p className="text-sm text-gray-400">No stock movements recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Note</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentMovements.map((m) => (
                    <tr key={m.id} className="border-b text-sm">
                      <td className="py-2.5 pr-4 font-medium">{m.productName}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            m.type === "IN" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">{m.quantity}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{m.note || "-"}</td>
                      <td className="py-2.5 text-gray-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
