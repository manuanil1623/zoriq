import React, { useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Upload, Trash2, ArrowRight, RefreshCw } from 'lucide-react';

export default function ImageManager() {
  const {
    storeImages,
    updateHeroImage,
    removeHeroImage,
    updateCollectionImage,
    removeCollectionImage,
    sellerSettings,
    products,
    setSellerActiveTab,
    addToast
  } = useStore();

  const heroInputRef = useRef(null);
  const colInputRef = useRef(null);
  const [activeUploadCol, setActiveUploadCol] = useState(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [uploadingColName, setUploadingColName] = useState(null);

  // Dynamic unique collections from products catalog or defaults
  const collectionsList = React.useMemo(() => {
    const list = [
      'Glassware',
      'Kitchen Finds',
      'Bottles & Lunch Boxes',
      'Steel Essentials',
      'Lunch Boxes'
    ];
    products.forEach((p) => {
      if (p.category) {
        const cat = p.category.charAt(0).toUpperCase() + p.category.slice(1);
        if (!list.includes(cat)) {
          list.push(cat);
        }
      }
    });
    return list;
  }, [products]);

  // Current hero image (from storeImages or legacy sellerSettings)
  const heroImage = storeImages?.hero || sellerSettings?.heroImage || '';

  // Current collection image getter
  const getColImg = (col) => {
    return storeImages?.cols?.[col] || sellerSettings?.collectionImages?.[col] || '';
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
      </div>

      {/* 2. Collection pictures Card */}
      <div className="acard">
        <h4>Collection pictures</h4>
        <div className="divide-y divide-[#edf6f2]">
          {collectionsList.map((col) => {
            const customPic = getColImg(col);
            const isUploadingThis = uploadingColName === col;

            return (
              <div key={col} className="prow">
                <div className="pt">
                  {customPic ? (
                    <img src={customPic} alt={col} />
                  ) : (
                    <div className="w-full h-full bg-[#eef7f2] flex items-center justify-center text-xs font-bold text-[#0b6e4f]">
                      {col.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="pm">
                  <b>{col}</b>
                  <small>{customPic ? 'Custom picture' : 'Default picture'}</small>
                </div>

                <div className="flex items-center gap-1.5">
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
                    ) : null}
                    <span>{isUploadingThis ? 'Saving...' : 'Change'}</span>
                  </button>
                  {customPic && (
                    <button
                      type="button"
                      className="ab gh2 sm text-rose-600"
                      onClick={() => handleResetCol(col)}
                    >
                      Reset
                    </button>
                  )}
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
    </div>
  );
}
