import { useEffect, useState } from "react";
import api, { getErrorMessage, imageUrl } from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  categoryId: "",
  supplierId: "",
  imageUrl: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState("desc");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => {});
    api.get("/suppliers").then((res) => setSuppliers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, categoryId, sortBy, direction]);

  async function loadProducts() {
    try {
      const res = await api.get("/products", {
        params: {
          keyword: keyword || undefined,
          categoryId: categoryId || undefined,
          sortBy,
          direction,
        },
      });
      setProducts(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      imageUrl: form.imageUrl || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      supplierId: form.supplierId ? Number(form.supplierId) : null,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      quantity: String(p.quantity),
      categoryId: p.categoryId || "",
      supplierId: p.supplierId || "",
      imageUrl: p.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Products Inventory</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <input
          type="text"
          placeholder="Search products by name..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="id">Sort by Date Added</option>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="quantity">Sort by Stock</option>
        </select>
        <button
          onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))}
          className="border rounded-lg px-4 py-2 bg-gray-50 font-medium hover:bg-gray-100"
        >
          {direction === "asc" ? "↑ Ascending" : "↓ Descending"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
        <h2 className="font-semibold text-gray-700">{editingId ? `Edit Product #${editingId}` : "Add New Product"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            required
            placeholder="Product Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Price *"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Quantity *"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            className="border rounded-lg px-3 py-2 bg-white"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border rounded-lg px-3 py-1.5 text-sm flex-1"
            />
            {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
            {form.imageUrl && !uploading && (
              <img src={imageUrl(form.imageUrl)} alt="preview" className="w-10 h-10 object-cover rounded border" />
            )}
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-5 py-2 font-medium hover:bg-blue-700"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="border rounded-lg px-4 py-2 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-sm text-gray-600">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400 text-sm">
                  No products found. Add your first product above.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b text-sm hover:bg-gray-50">
                <td className="p-3">
                  {p.imageUrl ? (
                    <img src={imageUrl(p.imageUrl)} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.categoryName || "-"}</td>
                <td className="p-3">{p.supplierName || "-"}</td>
                <td className="p-3">${Number(p.price).toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      p.quantity === 0
                        ? "bg-red-100 text-red-700"
                        : p.quantity <= 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.quantity} in stock
                  </span>
                </td>
                <td className="p-3 space-x-3 whitespace-nowrap">
                  <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
