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
  Loader2,
  ShieldCheck
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

  const discountPercent =
    formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
      ? Math.round(
          ((Number(formData.originalPrice) - Number(formData.price)) /
            Number(formData.originalPrice)) *
            100
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#101317]/95 text-[var(--ink)] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/10 relative my-6 max-h-[92vh] flex flex-col backdrop-blur-2xl">
        
        {/* Header in Liquid Glass */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[var(--amber)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[var(--amber)] uppercase block font-bold">
                Owner Portal Editor
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Syne']">
                {isEditing ? 'Modify Product Information' : 'Add New Product to Storefront'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setIsProductEditorOpen(false);
              setProductToEdit(null);
            }}
            className="p-2 text-[var(--ink2)] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body in Liquid Glass */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Section 1: Basic Product Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                Product Title / Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Minimalist Titanium Chronograph Watch"
                className={`w-full px-3.5 py-2.5 bg-black/50 border rounded-xl text-white placeholder-gray-500 font-medium focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] ${
                  errors.name ? 'border-rose-500' : 'border-white/10'
                }`}
              />
              {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-gray-200 font-medium focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] cursor-pointer"
              >
                <option value="electronics">Electronics & Audio</option>
                <option value="wearables">Smart Wearables</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="home">Home & Living</option>
                <option value="accessories">Accessories & Bags</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                Seller Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={formData.sellerBadge}
                onChange={(e) => setFormData({ ...formData, sellerBadge: e.target.value })}
                placeholder="e.g. Best Seller, Trending, 20% Off"
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 font-medium focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)]"
              />
            </div>

          </div>

          {/* Section 2: Pricing & Stock Inventory */}
          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            <div>
              <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                Selling Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 1999"
                  className={`w-full pl-7 pr-3 py-2 bg-black/50 border rounded-xl text-white font-bold font-['Syne'] focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] ${
                    errors.price ? 'border-rose-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.price && <p className="text-rose-400 text-[11px] mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                Original MSRP (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="e.g. 3999"
                  className="w-full pl-7 pr-3 py-2 bg-black/50 border border-white/10 rounded-xl text-gray-300 font-bold font-['Syne'] focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)]"
                />
              </div>
              {discountPercent > 0 && (
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                  Shows {discountPercent}% discount to buyers!
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="e.g. 25"
                className={`w-full px-3 py-2 bg-black/50 border rounded-xl text-white font-mono focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] ${
                  errors.stock ? 'border-rose-500' : 'border-white/10'
                }`}
              />
              {errors.stock && <p className="text-rose-400 text-[11px] mt-1">{errors.stock}</p>}
            </div>

          </div>

          {/* Section 2.5: Cash on Delivery (COD) Control */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            formData.codAvailable
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  formData.codAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      Cash on Delivery (COD) Availability
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      formData.codAvailable
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {formData.codAvailable ? 'COD Enabled' : 'Prepaid Only'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--ink2)] block mt-0.5">
                    {formData.codAvailable
                      ? 'Customers can pay with cash or delivery agent QR upon doorstep delivery.'
                      : 'Disabled: Customer MUST pay in advance using UPI/Online payment.'}
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
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>
          </div>

          {/* Section 3: Product Image URL & Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-[var(--ink2)] uppercase tracking-wider">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-[var(--amber)] rounded-xl text-xs font-semibold border border-amber-500/30 transition-colors disabled:opacity-50 cursor-pointer"
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
              <div className="w-14 h-14 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://... or upload image with button above"
                className={`flex-1 px-3.5 py-2.5 text-xs bg-black/50 border rounded-xl text-white placeholder-gray-500 font-medium focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] ${
                  errors.image ? 'border-rose-500' : 'border-white/10'
                }`}
              />
            </div>
            {errors.image && <p className="text-rose-400 text-[11px] mt-1">{errors.image}</p>}

            {/* Quick Presets Picker */}
            <div className="pt-1">
              <span className="text-[10px] text-[var(--ink2)] block mb-1 font-medium">
                Or select from curated high-res product photos:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, image: preset.url })}
                    className={`flex items-center gap-1.5 p-1 rounded-xl border text-[11px] transition-all whitespace-nowrap cursor-pointer ${
                      formData.image === preset.url
                        ? 'border-amber-500 bg-amber-500/15 font-bold text-[var(--amber)]'
                        : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded-lg object-cover" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
              Description *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of product features, materials, and buyer benefits..."
              className={`w-full px-3.5 py-2 text-xs bg-black/50 border rounded-xl text-white placeholder-gray-500 font-medium focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] ${
                errors.description ? 'border-rose-500' : 'border-white/10'
              }`}
            />
            {errors.description && <p className="text-rose-400 text-[11px] mt-1">{errors.description}</p>}
          </div>

          {/* Section 5: Highlights / Bullet Points */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--ink2)] mb-1 uppercase tracking-wider">
              Feature Highlights (One item per line)
            </label>
            <textarea
              rows={3}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="e.g. 40-Hour Battery Life&#10;Active Noise Cancellation&#10;IPX7 Waterproof"
              className="w-full px-3.5 py-2 text-xs font-mono bg-black/50 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)]"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={() => {
                setIsProductEditorOpen(false);
                setProductToEdit(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="px-6 py-2.5 rounded-xl bg-[var(--amber)] hover:bg-[#d67e2a] text-black font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
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
