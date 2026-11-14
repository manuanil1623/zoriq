import React, { useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Upload, Trash2, ArrowRight, RefreshCw, Sparkles, Plus, Folder, Check } from 'lucide-react';
import CollectionOrganizerModal from './CollectionOrganizerModal';

export const CURATED_HERO_PRESETS = [
  {
    id: 'wabi-sabi-arches',
    name: 'Wabi-Sabi Warm Arches',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80',
    thumb: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'sunlight-shadows',
    name: 'Sunlight & Neutral Shadows',
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1920&q=80',
    thumb: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'calm-interior',
    name: 'Calm Minimalist Interior',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'warm-stone',
    name: 'Warm Architectural Stone',
    url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1920&q=80',
    thumb: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=300&q=80'
  }
];

export default function ImageManager() {
  const {
    storeImages,
    updateHeroImage,
    removeHeroImage,
    updateCollectionImage,
    removeCollectionImage,
    addCollection,
    deleteCollection,
    sellerSettings,
    products,
    collections,
    setSellerActiveTab,
    addToast
  } = useStore();

  const heroInputRef = useRef(null);
  const colInputRef = useRef(null);
  const [activeUploadCol, setActiveUploadCol] = useState(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [uploadingColName, setUploadingColName] = useState(null);
  const [organizingCol, setOrganizingCol] = useState(null);
  const [newColName, setNewColName] = useState('');
  const [confirmDeleteCol, setConfirmDeleteCol] = useState(null);
  const [isAddingCol, setIsAddingCol] = useState(false);

  // Use dynamic collections from store
  const collectionsList = collections || [];

  // Current hero image (from storeImages or legacy sellerSettings)
  const heroImage = storeImages?.hero || sellerSettings?.heroImage || '';

  // Current collection image getter
  const getColImg = (col) => {
    return storeImages?.cols?.[col] || sellerSettings?.collectionImages?.[col] || '';
  };

  const handleAddCol = async (e) => {
    e?.preventDefault();
    const clean = newColName.trim();
    if (!clean) return;
    setIsAddingCol(true);
    try {
      await addCollection(clean);
      setNewColName('');
    } finally {
      setIsAddingCol(false);
    }
  };

  const handleDeleteCol = async (colName) => {
    if (confirmDeleteCol !== colName) {
      setConfirmDeleteCol(colName);
      setTimeout(() => {
        setConfirmDeleteCol((prev) => (prev === colName ? null : prev));
      }, 4000);
      return;
    }
    setConfirmDeleteCol(null);
    await deleteCollection(colName);
  };

  // Image shrink / compression helper using canvas
  const shrinkImage = (file, maxWidth, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleHeroUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    shrinkImage(file, 1400, (dataUrl) => {
      try {
        updateHeroImage(dataUrl);
        addToast('Hero background picture updated successfully!', 'success');
      } catch (err) {
        console.error('Failed to update hero image:', err);
        addToast('Failed to update picture. Please try again.', 'error');
      } finally {
        setIsUploadingHero(false);
        if (e.target) e.target.value = '';
      }
    });
  };

  const handleRemoveHero = () => {
    removeHeroImage();
    addToast('Hero picture reset to default gradient', 'info');
  };

  const handleColUpload = (e) => {
    const file = e.target.files?.[0];
    const colName = activeUploadCol;
    if (!file || !colName) {
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingColName(colName);
    shrinkImage(file, 600, (dataUrl) => {
      try {
        updateCollectionImage(colName, dataUrl);
        addToast(`Picture for "${colName}" updated!`, 'success');
      } catch (err) {
        console.error(err);
        addToast('Failed to update collection picture.', 'error');
      } finally {
        setUploadingColName(null);
        setActiveUploadCol(null);
        if (e.target) e.target.value = '';
      }
    });
  };

  const handleResetCol = (colName) => {
    removeCollectionImage(colName);
    addToast(`Picture for "${colName}" reset to default`, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs with always reset on change */}
      <input
        ref={heroInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleHeroUpload}
      />
      <input
        ref={colInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleColUpload}
      />

      {/* 1. Main background picture Card */}
      <div className="acard">
        <h4>Main background picture</h4>
        <div className="ipv hero">
          {heroImage ? (
            <img src={heroImage} alt="Main background headline" />
          ) : (
            <span className="text-[var(--ink2)] text-sm font-medium">Default gradient</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            className="ab"
            disabled={isUploadingHero}
            onClick={() => heroInputRef.current?.click()}
          >
            {isUploadingHero ? (
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-1.5" />
            )}
            <span>{isUploadingHero ? 'Processing...' : 'Upload picture'}</span>
          </button>
          {heroImage && (
            <button
              type="button"
              className="ab gh2"
              onClick={handleRemoveHero}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
        <small className="block mt-2 text-xs text-[#6b8579]">
          Shown behind the homepage headline. Wide landscape photos work best.
        </small>

        {/* Curated Aesthetic Presets */}
        <div className="mt-3 pt-3 border-t border-[#edf6f2]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0b6e4f]" />
            <span className="text-xs font-semibold text-[#0f2a21] uppercase tracking-wider">
              Pinterest Aesthetic Presets
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CURATED_HERO_PRESETS.map((preset) => {
              const isSelected = heroImage === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    updateHeroImage(preset.url);
                    addToast(`Applied "${preset.name}" as background!`, 'success');
                  }}
                  className={`text-left rounded-lg overflow-hidden border-2 transition-all group ${
                    isSelected ? 'border-[#0b6e4f] shadow-sm ring-2 ring-[#0b6e4f]/30' : 'border-black/5 hover:border-[#0b6e4f]/50'
                  }`}
                >
                  <div className="h-16 w-full overflow-hidden relative">
                    <img
                      src={preset.thumb}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#0b6e4f] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        Active
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 bg-white text-[11px] font-medium text-[#1c1a17] truncate">
                    {preset.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Collection pictures Card */}
      <div className="acard">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="m-0">Collection pictures & organize</h4>
            <small className="text-[#6b8579] text-xs">
              Add collections, update photos, or organize products into each collection.
            </small>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#eef7f2] text-[#0b6e4f] font-semibold flex-none">
            {collectionsList.length} collections
          </span>
        </div>

        {/* Quick Add Collection Input */}
        <form onSubmit={handleAddCol} className="flex items-center gap-2 mb-4 p-2.5 bg-[#fcfbf8] border border-[#edf6f2] rounded-xl">
          <input
            type="text"
            placeholder="Add collection (e.g. Wooden Serveware)..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-[#cfe8dd] rounded-lg focus:outline-none focus:border-[#0b6e4f]"
          />
          <button
            type="submit"
            className="ab sm flex-none"
            disabled={isAddingCol || !newColName.trim()}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>{isAddingCol ? 'Adding...' : 'Add collection'}</span>
          </button>
        </form>

        <div className="divide-y divide-[#edf6f2]">
          {collectionsList.map((col) => {
            const customPic = getColImg(col);
            const isUploadingThis = uploadingColName === col;
            const isConfirmingDelete = confirmDeleteCol === col;
            const count = (products || []).filter(
              (p) => (p.category || '').toLowerCase() === col.toLowerCase()
            ).length;

            return (
              <div key={col} className="prow flex-wrap sm:flex-nowrap gap-3 py-3">
                <div
                  className="pt cursor-pointer relative group flex-none"
                  title="Click to change photo"
                  onClick={() => {
                    setActiveUploadCol(col);
                    setTimeout(() => colInputRef.current?.click(), 50);
                  }}
                >
                  {customPic ? (
                    <img src={customPic} alt={col} />
                  ) : (
                    <div className="w-full h-full bg-[#eef7f2] flex items-center justify-center text-xs font-bold text-[#0b6e4f]">
                      {col.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>

                <div className="pm min-w-[140px]">
                  <b className="text-sm font-semibold text-[#0f2a21]">{col}</b>
                  <div className="flex items-center gap-2 text-[11px] text-[#6b8579]">
                    <span className="font-semibold text-[#0b6e4f]">
                      {count} product{count === 1 ? '' : 's'}
                    </span>
                    <span>·</span>
                    <span>{customPic ? 'Custom picture' : 'Default picture'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap justify-end ml-auto">
                  {/* Organize Products Button */}
                  <button
                    type="button"
                    className="ab gh2 sm"
                    onClick={() => setOrganizingCol(col)}
                    title={`Organize products in "${col}"`}
                  >
                    <Folder className="w-3.5 h-3.5 mr-1 text-[#0b6e4f]" />
                    <span>Organize ({count})</span>
                  </button>

                  {/* Change Photo Button */}
                  <button
                    type="button"
                    className="ab gh2 sm"
                    disabled={isUploadingThis}
                    onClick={() => {
                      setActiveUploadCol(col);
                      setTimeout(() => colInputRef.current?.click(), 50);
                    }}
                  >
                    {isUploadingThis ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>{isUploadingThis ? 'Saving...' : 'Change'}</span>
                  </button>

                  {/* Reset Photo */}
                  {customPic && (
                    <button
                      type="button"
                      className="ab gh2 sm text-neutral-600"
                      onClick={() => handleResetCol(col)}
                      title="Reset to default picture"
                    >
                      Reset
                    </button>
                  )}

                  {/* Delete Collection Button */}
                  <button
                    type="button"
                    className={`ab sm ${isConfirmingDelete ? 'rd' : 'gh2 text-rose-600'}`}
                    onClick={() => handleDeleteCol(col)}
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>{isConfirmingDelete ? 'Sure?' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Product pictures Card */}
      <div className="acard">
        <h4>Product pictures</h4>
        <small className="block text-xs text-[#6b8579] mb-3">
          Open Products, then Edit, to upload a photo for any product.
        </small>
        <div>
          <button
            type="button"
            className="ab gh2"
            onClick={() => setSellerActiveTab('products')}
          >
            <span>Go to products</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Organize Products Modal */}
      {organizingCol && (
        <CollectionOrganizerModal
          collectionName={organizingCol}
          onClose={() => setOrganizingCol(null)}
        />
      )}
    </div>
  );
}
