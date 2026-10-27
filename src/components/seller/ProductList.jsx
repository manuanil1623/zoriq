import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  ShoppingBag,
  Banknote
} from 'lucide-react';

export default function ProductList() {
  const {
    products,
    deleteProduct,
    toggleProductStock,
    toggleProductCod,
    setIsProductEditorOpen,
    setProductToEdit,
    setSelectedProduct,
    setRole
  } = useStore();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) ||
      (prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || prod.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleEdit = (prod) => {
    setProductToEdit(prod);
    setIsProductEditorOpen(true);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsProductEditorOpen(true);
  };

  const handleDelete = (prod) => {
    if (window.confirm(`Are you sure you want to delete "${prod.name}" from your store?`)) {
      deleteProduct(prod.id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>Product Catalog & Inventory</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Add new products, update prices, adjust stock levels, or modify catalog details
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="wearables">Wearables</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Living</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Stock Units</th>
                <th className="py-3 px-3">COD Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                    <h3 className="text-sm font-bold text-gray-900">Your Store Catalog is Clean</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      All demo products have been removed. Click below to add your first product!
                    </p>
                    <button
                      type="button"
                      onClick={handleAddNew}
                      className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-semibold text-gray-600">No products found</p>
                    <p className="text-[11px] text-gray-400 mt-1">Try clearing search filters or add a new product</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLow = prod.stock > 0 && prod.stock <= 5;
                  const isOut = prod.stock <= 0 || !prod.inStock;

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-gray-900 truncate" title={prod.name}>
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-gray-400">
                                {prod.sku || 'NO-SKU'}
                              </span>
                              {prod.sellerBadge && (
                                <span className="bg-indigo-50 text-indigo-700 font-semibold text-[9px] px-1.5 py-0.2 rounded">
                                  {prod.sellerBadge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 capitalize font-medium text-gray-600">
                        {prod.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">
                          ₹{prod.price?.toLocaleString('en-IN')}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="block text-[10px] text-gray-400 line-through">
                            ₹{prod.originalPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      {/* Stock Units */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold">
                          {isOut ? (
                            <span className="text-rose-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              0 units
                            </span>
                          ) : isLow ? (
                            <span className="text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {prod.stock} (Low)
                            </span>
                          ) : (
                            <span className="text-gray-800">{prod.stock} units</span>
                          )}
                        </div>
                      </td>

                      {/* COD Availability Toggle */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleProductCod(prod.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            prod.codAvailable !== false
                              ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title="Click to toggle COD for this product"
                        >
                          <Banknote className="w-3 h-3" />
                          <span>{prod.codAvailable !== false ? 'COD: Yes' : 'Prepaid Only'}</span>
                        </button>
                      </td>

                      {/* In-Stock Toggle */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleProductStock(prod.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            prod.inStock && prod.stock > 0
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.inStock && prod.stock > 0 ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          <span>{prod.inStock && prod.stock > 0 ? 'Active' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedProduct(prod);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Preview Customer Modal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
