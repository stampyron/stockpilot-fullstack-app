import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: "", type: "IN", quantity: "", note: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
    api.get("/products").then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  async function loadMovements() {
    try {
      const res = await api.get("/stock-movements");
      setMovements(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/stock-movements", {
        productId: Number(form.productId),
        type: form.type,
        quantity: parseInt(form.quantity, 10),
        note: form.note,
      });
      setSuccess("Stock movement recorded successfully.");
      setForm({ productId: "", type: "IN", quantity: "", note: "" });
      loadMovements();
      api.get("/products").then((res) => setProducts(res.data)).catch(() => {});
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const selectedProduct = products.find((p) => String(p.id) === String(form.productId));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Stock Movements</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          required
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="">Select Product *</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.quantity} in stock)
            </option>
          ))}
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="IN">Stock IN</option>
          <option value="OUT">Stock OUT</option>
        </select>
        <input
          required
          type="number"
          min="1"
          placeholder="Quantity *"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <input
          placeholder="Note (e.g. restock, damaged)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 md:col-span-1"
        >
          Record Movement
        </button>
        {selectedProduct && (
          <p className="text-xs text-gray-500 md:col-span-3 self-center">
            Current stock for <span className="font-medium">{selectedProduct.name}</span>:{" "}
            <span className="font-semibold">{selectedProduct.quantity}</span> units
          </p>
        )}
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-sm text-gray-600">
              <th className="p-3">ID</th>
              <th className="p-3">Product</th>
              <th className="p-3">Type</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Note</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400 text-sm">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && movements.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400 text-sm">
                  No stock movements recorded yet.
                </td>
              </tr>
            )}
            {movements.map((m) => (
              <tr key={m.id} className="border-b text-sm hover:bg-gray-50">
                <td className="p-3 text-gray-400">{m.id}</td>
                <td className="p-3 font-medium">{m.productName}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      m.type === "IN" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {m.type}
                  </span>
                </td>
                <td className="p-3">{m.quantity}</td>
                <td className="p-3 text-gray-500">{m.note || "-"}</td>
                <td className="p-3 text-gray-400">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
