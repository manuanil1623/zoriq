import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';

export default function ProductList() {
  const {
    products,
    collections,
    addProduct,
    updateProduct,
    deleteProduct,
    addToast
  } = useStore();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null); // 'new' | product id | null
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Form state for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: 20,
    description: '',
    image: '',
    isNew: false,
    isBestseller: false,
    codAvailable: true,
  });

  const availableCollections = collections && collections.length > 0
    ? collections
    : ['Glassware', 'Kitchen Finds', 'Bottles & Lunch Boxes', 'Steel Essentials', 'Lunch Boxes'];

  const startAddNew = () => {
    setEditingId('new');
    setFormData({
      name: '',
      category: availableCollections[0] || 'General',
      price: '',
      originalPrice: '',
      stock: 20,
      description: '',
      image: '',
      isNew: true,
      isBestseller: false,
      codAvailable: true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (prod) => {
    setEditingId(prod.id);
    const tags = Array.isArray(prod.tags) ? prod.tags : [];
    setFormData({
      name: prod.name || '',
      category: prod.category || availableCollections[0] || 'General',
      price: prod.price || '',
      originalPrice: prod.originalPrice || prod.mrp || '',
      stock: prod.stock !== undefined ? prod.stock : 20,
      description: prod.description || '',
      image: prod.image || prod.imageUrl || '',
      isNew: tags.includes('New') || Boolean(prod.isNew),
      isBestseller: tags.includes('Bestseller') || Boolean(prod.isBestseller),
      codAvailable: prod.codAvailable !== undefined ? prod.codAvailable : true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, image: compressed }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const numPrice = Number(formData.price);

    if (!cleanName) {
      addToast('Product name is required', 'warning');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      addToast('Please enter a valid price', 'warning');
      return;
    }

    const tags = [];
    if (formData.isNew) tags.push('New');
    if (formData.isBestseller) tags.push('Bestseller');

    const productPayload = {
      name: cleanName,
      category: formData.category || availableCollections[0] || 'General',
      price: numPrice,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : numPrice,
      mrp: formData.originalPrice ? Number(formData.originalPrice) : numPrice,
      stock: Math.max(0, Number(formData.stock) || 0),
      inStock: Number(formData.stock) > 0,
      description: formData.description.trim() || 'A useful everyday find from ZORIQ.',
      image: formData.image || '',
      imageUrl: formData.image || '',
      tags,
      codAvailable: Boolean(formData.codAvailable),
    };

    setIsSaving(true);
    try {
      if (editingId === 'new') {
        await addProduct(productPayload);
      } else {
        await updateProduct(editingId, productPayload);
      }
      setEditingId(null);
    } catch (err) {
      console.error('Save product error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (confirmDeleteId !== prod.id) {
      setConfirmDeleteId(prod.id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === prod.id ? null : prev));
      }, 4000);
      return;
    }
    setConfirmDeleteId(null);
    try {
      await deleteProduct(prod.id);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      {/* 1. Add / Edit Product Card */}
      {editingId && (
        <div className="acard">
          <div className="flex items-center justify-between">
            <h4>{editingId === 'new' ? 'Add product' : 'Edit product'}</h4>
            <button
              type="button"
              className="text-[#6b8579] hover:text-[#0b6e4f] text-xs font-semibold"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-3 mt-1">
            {/* Photo preview box */}
            <div className="ipv" id="pPrev">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#6b8579] text-xs">No photo selected</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="ab gh2 sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span>Upload photo</span>
              </button>
              {formData.image && (
                <button
                  type="button"
                  className="ab gh2 sm text-rose-600"
                  onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Remove photo</span>
                </button>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="text-xs text-[#4d6b60] font-medium block mb-1">Product name</label>
              <input
                type="text"
                placeholder="Product name (e.g. Minimalist Ceramic Cup)"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            {/* Collection select */}
            <div>
              <label className="text-xs text-[#4d6b60] font-medium block mb-1">Collection</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              >
                {availableCollections.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Price & MRP */}
            <div className="two">
              <div>
                <label className="text-xs text-[#4d6b60] font-medium block mb-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="Price ₹"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#4d6b60] font-medium block mb-1">MRP / Original (₹)</label>
                <input
                  type="number"
                  placeholder="MRP ₹"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                />
              </div>
            </div>

            {/* Stock Count */}
            <div>
              <label className="text-xs text-[#4d6b60] font-medium block mb-1">Stock quantity</label>
              <input
                type="number"
                placeholder="Available stock"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-[#4d6b60] font-medium block mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Product description and details..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              ></textarea>
            </div>

            {/* Badges / Options */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="w-auto"
                  checked={formData.isNew}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isNew: e.target.checked }))}
                />
                <span>New arrival tag</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="w-auto"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isBestseller: e.target.checked }))}
                />
                <span>Bestseller tag</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  className="w-auto"
                  checked={formData.codAvailable}
                  onChange={(e) => setFormData((prev) => ({ ...prev, codAvailable: e.target.checked }))}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button type="submit" className="ab" disabled={isSaving}>
                <span>{isSaving ? 'Saving...' : 'Save product'}</span>
              </button>
              <button type="button" className="ab gh2" onClick={cancelEdit}>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Top Bar & Products List */}
      <div className="acard">
        <div className="two">
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="ab flex-none" onClick={startAddNew}>
            <Plus className="w-4 h-4 mr-1" />
            <span>+ Add product</span>
          </button>
        </div>

        <div className="divide-y divide-[#edf6f2] mt-2">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6b8579]">
              No products found matching your search.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const imgUrl = p.image || p.imageUrl;
              const isConfirming = confirmDeleteId === p.id;

              return (
                <div key={p.id} className="prow">
                  {/* Thumbnail */}
                  <div className="pt">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.name} />
                    ) : (
                      <div className="w-full h-full bg-[#eef7f2] flex items-center justify-center text-xs font-bold text-[#0b6e4f]">
                        {(p.name || 'P').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="pm">
                    <b>{p.name}</b>
                    <small className="text-[#6b8579]">
                      {p.category || 'General'} · ₹{Number(p.price).toLocaleString('en-IN')} · Stock {p.stock !== undefined ? p.stock : 20}
                    </small>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 flex-none">
                    <button
                      type="button"
                      className="ab gh2 sm"
                      onClick={() => startEdit(p)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className={`ab sm ${isConfirming ? 'rd' : 'gh2 text-rose-600'}`}
                      onClick={() => handleDeleteProduct(p)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>{isConfirming ? 'Sure?' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
