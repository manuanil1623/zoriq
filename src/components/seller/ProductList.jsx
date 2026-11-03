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
  Banknote,
  Boxes,
  Sparkles
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
    const matchesSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
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
      
      {/* Top Action Bar in Liquid Glass */}
      <div className="bg-[#101317]/80 backdrop-blur-2xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[var(--amber)] uppercase font-bold">
              Inventory & Catalog
            </span>
            <span className="text-xs bg-amber-500/15 text-[var(--amber)] border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white font-['Syne'] mt-0.5">
            Store Product Information
          </h2>
          <p className="text-xs text-[var(--ink2)] mt-0.5">
            Manage titles, pricing, inventory stock, images, and cash on delivery availability
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--amber)] hover:bg-[#d67e2a] text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101317]/80 backdrop-blur-2xl p-3 sm:p-3.5 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, SKU, category..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics & Audio</option>
            <option value="wearables">Smart Wearables</option>
            <option value="fashion">Fashion & Apparel</option>
            <option value="home">Home & Living</option>
            <option value="accessories">Accessories & Bags</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="bg-[#101317]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-12 text-center text-gray-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-amber-500/60" />
          <h3 className="text-base font-bold text-white font-['Syne']">Your Store Catalog is Empty</h3>
          <p className="text-xs text-[var(--ink2)] mt-1 max-w-sm mx-auto">
            Add your first custom product using the button below. It will instantly sync to the storefront and mobile devices!
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="mt-4 px-5 py-2.5 bg-[var(--amber)] hover:bg-[#d67e2a] text-black rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add First Product</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#101317]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-10 text-center text-gray-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="text-xs font-semibold text-gray-300">No products match your search</p>
          <p className="text-[11px] text-gray-500 mt-1">Try clearing search filters or add a new product</p>
        </div>
      ) : (
        <>
          {/* 1. MOBILE RESPONSIVE CARD VIEW (Displays on small screens for touch usability) */}
          <div className="grid grid-cols-1 gap-3.5 sm:hidden">
            {filteredProducts.map((prod) => {
              const isLow = prod.stock > 0 && prod.stock <= 5;
              const isOut = prod.stock <= 0 || !prod.inStock;

              return (
                <div
                  key={prod.id}
                  className="bg-[#101317]/90 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 space-y-3 shadow-lg shadow-black/40 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover bg-black/40 border border-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--ink2)] font-mono">
                          {prod.category}
                        </span>
                        {prod.sellerBadge && (
                          <span className="bg-amber-500/15 text-[var(--amber)] border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            {prod.sellerBadge}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm truncate font-['Syne'] mt-0.5" title={prod.name}>
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-sm text-[var(--amber)] font-['Syne']">
                          ₹{prod.price?.toLocaleString('en-IN')}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-[10.5px] text-gray-500 line-through">
                            ₹{prod.originalPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock & COD Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => toggleProductStock(prod.id)}
                      className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                        prod.inStock && prod.stock > 0
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${prod.inStock && prod.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{prod.inStock && prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleProductCod(prod.id)}
                      className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                        prod.codAvailable !== false
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>{prod.codAvailable !== false ? 'COD: Yes' : 'Prepaid Only'}</span>
                    </button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Info</span>
                    </button>

                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-[var(--ink2)] hover:text-white rounded-xl text-xs border border-white/10 transition-colors cursor-pointer"
                      title="Preview Product"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(prod)}
                      className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs border border-rose-500/20 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. DESKTOP LIQUID GLASS TABLE VIEW */}
          <div className="hidden sm:block bg-[#101317]/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-black/40 border-b border-white/10 text-[11px] font-bold text-[var(--ink2)] uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-4">Product Info</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Price</th>
                    <th className="py-3.5 px-3">Stock Units</th>
                    <th className="py-3.5 px-3">COD Payment</th>
                    <th className="py-3.5 px-3">Catalog Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((prod) => {
                    const isLow = prod.stock > 0 && prod.stock <= 5;
                    const isOut = prod.stock <= 0 || !prod.inStock;

                    return (
                      <tr key={prod.id} className="hover:bg-white/[0.03] transition-colors">
                        {/* Product Title & Image */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/10 flex-shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <h4 className="font-bold text-white truncate font-['Syne'] text-sm" title={prod.name}>
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-gray-500">
                                  {prod.sku || 'NO-SKU'}
                                </span>
                                {prod.sellerBadge && (
                                  <span className="bg-amber-500/15 text-[var(--amber)] border border-amber-500/30 font-semibold text-[9px] px-1.5 py-0.2 rounded">
                                    {prod.sellerBadge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 capitalize font-medium text-gray-300">
                          {prod.category}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-white font-['Syne'] text-sm">
                            ₹{prod.price?.toLocaleString('en-IN')}
                          </span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="block text-[10px] text-gray-500 line-through">
                              ₹{prod.originalPrice?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>

                        {/* Stock Units */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isOut ? (
                              <span className="text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                0 units
                              </span>
                            ) : isLow ? (
                              <span className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {prod.stock} (Low)
                              </span>
                            ) : (
                              <span className="text-gray-200 text-xs font-mono">{prod.stock} units</span>
                            )}
                          </div>
                        </td>

                        {/* COD Availability Toggle */}
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => toggleProductCod(prod.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                              prod.codAvailable !== false
                                ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border-blue-500/30'
                                : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border-amber-500/30'
                            }`}
                            title="Click to toggle COD for this product"
                          >
                            <Banknote className="w-3 h-3" />
                            <span>{prod.codAvailable !== false ? 'COD: Yes' : 'Prepaid Only'}</span>
                          </button>
                        </td>

                        {/* In-Stock Toggle */}
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => toggleProductStock(prod.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                              prod.inStock && prod.stock > 0
                                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prod.inStock && prod.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            <span>{prod.inStock && prod.stock > 0 ? 'Active' : 'Out of Stock'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedProduct(prod)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              title="Preview Customer Modal"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(prod)}
                              className="p-1.5 text-gray-400 hover:text-[var(--amber)] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod)}
                              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
