import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRESET_IMAGES } from '../../data/initialData';
import { adminUploadImage } from '../../services/supabase';
import {
  X,
  Plus,
  Image as ImageIcon,
  Check,
  Tag,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Info,
  Banknote,
  Upload,
  Loader2
} from 'lucide-react';

export default function ProductEditorModal() {
  const {
    isProductEditorOpen,
    setIsProductEditorOpen,
    productToEdit,
    setProductToEdit,
    addProduct,
    updateProduct,
    adminToken,
    addToast
  } = useStore();

  const isEditing = Boolean(productToEdit);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    image: PRESET_IMAGES[0].url,
    sellerBadge: '',
    codAvailable: true,
    description: '',
    features: ''
  });

  const [errors, setErrors] = useState({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'electronics',
        price: productToEdit.price || '',
        originalPrice: productToEdit.originalPrice || '',
        stock: productToEdit.stock !== undefined ? productToEdit.stock : 10,
        sku: productToEdit.sku || '',
        image: productToEdit.image || PRESET_IMAGES[0].url,
        sellerBadge: productToEdit.sellerBadge || '',
        codAvailable: productToEdit.codAvailable !== undefined ? productToEdit.codAvailable : true,
        description: productToEdit.description || '',
        features: Array.isArray(productToEdit.features)
          ? productToEdit.features.join('\n')
          : productToEdit.features || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'electronics',
        price: '',
        originalPrice: '',
        stock: '15',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        image: PRESET_IMAGES[0].url,
        sellerBadge: 'New Arrival',
        codAvailable: true,
        description: '',
        features: 'High performance & premium durability\n1-Year official brand warranty\nFast dispatch within 24 hours',
      });
    }
    setErrors({});
  }, [productToEdit, isProductEditorOpen]);

  if (!isProductEditorOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product title is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Valid price is required';
    if (!formData.stock || Number(formData.stock) < 0) errs.stock = 'Valid stock count is required';
    if (!formData.image.trim()) errs.image = 'Product image URL is required';
    if (!formData.description.trim()) errs.description = 'Description is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsUploadingImage(true);
    try {
      const publicUrl = await adminUploadImage(file, adminToken);
      if (publicUrl) {
        setFormData((prev) => ({ ...prev, image: publicUrl }));
        if (addToast) addToast('Image uploaded to Supabase Storage!', 'success');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed: ' + err.message);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (isEditing) {
        await updateProduct(productToEdit.id, formData);
      } else {
        await addProduct(formData);
      }
      setIsProductEditorOpen(false);
      setProductToEdit(null);
    } catch (err) {
      // toast shown in context
    } finally {
      setIsSaving(false);
    }
  };

  const discountPercent = formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
    ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEditing ? 'Owner Editor: Modify Product' : 'Owner Editor: Add New Product to Store'}
              </h2>
              <p className="text-xs text-indigo-200">
                Configure details, pricing, inventory stock, and catalog images
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsProductEditorOpen(false);
              setProductToEdit(null);
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                Product Title / Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. UltraClear Noise Cancelling Wireless Headphones"
                className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.name ? 'border-rose-400' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="text-rose-500 text-[11px] mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="electronics">Electronics & Audio</option>
                <option value="wearables">Smart Wearables</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="home">Home & Living</option>
                <option value="accessories">Accessories & Bags</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Seller Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={formData.sellerBadge}
                onChange={(e) => setFormData({ ...formData, sellerBadge: e.target.value })}
                placeholder="e.g. Best Seller, Trending, 20% Off, New"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Section 2: Pricing & Stock Inventory */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Selling Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 1999"
                  className={`w-full pl-7 pr-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    errors.price ? 'border-rose-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.price && <p className="text-rose-500 text-[11px] mt-0.5">{errors.price}</p>}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Original MSRP Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="e.g. 3999"
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {discountPercent > 0 && (
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  Shows {discountPercent}% discount to buyers!
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="e.g. 25"
                className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.stock ? 'border-rose-400' : 'border-gray-200'
                }`}
              />
              {errors.stock && <p className="text-rose-500 text-[11px] mt-0.5">{errors.stock}</p>}
            </div>

          </div>

          {/* Section 2.5: Cash on Delivery (COD) Control */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            formData.codAvailable
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  formData.codAvailable ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-xs">
                      Cash on Delivery (COD) Availability
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      formData.codAvailable
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {formData.codAvailable ? 'COD Enabled' : 'Prepaid Only (No COD)'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    {formData.codAvailable
                      ? 'Customers can pay with cash or delivery agent QR upon doorstep arrival.'
                      : 'Disabled: Customers MUST pay in advance using UPI/Online (No cash on delivery for this product).'}
                  </span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={formData.codAvailable}
                  onChange={(e) => setFormData({ ...formData, codAvailable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>

          {/* Section 3: Product Image URL & Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-gray-700">
                Product Image *
              </label>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Device Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://... or upload image above"
                className={`flex-1 px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  errors.image ? 'border-rose-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.image && <p className="text-rose-500 text-[11px] mt-0.5">{errors.image}</p>}

            {/* Quick Presets Picker */}
            <div className="pt-1">
              <span className="text-[10px] text-gray-500 block mb-1 font-medium">
                Or select from curated high-res product photos:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className={`flex items-center gap-1.5 p-1 rounded-lg border text-[11px] transition-all whitespace-nowrap ${
                      formData.image === preset.url
                        ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700 ring-1 ring-indigo-500'
                        : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded object-cover" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of features, materials, and benefits for customers..."
              className={`w-full px-3 py-2 text-xs bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.description ? 'border-rose-400' : 'border-gray-200'
              }`}
            />
            {errors.description && <p className="text-rose-500 text-[11px] mt-0.5">{errors.description}</p>}
          </div>

          {/* Section 5: Highlights / Bullet Points */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Feature Highlights (One item per line)
            </label>
            <textarea
              rows={3}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="e.g. 40-Hour Battery Life&#10;Active Noise Cancellation&#10;IPX7 Waterproof"
              className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={() => {
                setIsProductEditorOpen(false);
                setProductToEdit(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Product Changes' : 'Publish Product to Store'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
