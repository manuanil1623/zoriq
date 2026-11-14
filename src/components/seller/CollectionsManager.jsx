import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, Save, Image as ImageIcon, Folder, Upload, RefreshCw } from 'lucide-react';
import CollectionOrganizerModal from './CollectionOrganizerModal';

export default function CollectionsManager() {
  const {
    products,
    collections,
    addCollection,
    renameCollection,
    deleteCollection,
    updateCollectionImage,
    storeImages,
    sellerSettings,
    setSellerActiveTab,
    addToast
  } = useStore();

  const [newColName, setNewColName] = useState('');
  const [editedNames, setEditedNames] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizingCol, setOrganizingCol] = useState(null);
  const [activeUploadCol, setActiveUploadCol] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const colInputRef = useRef(null);

  // Initialize editedNames map when collections list updates
  useEffect(() => {
    const map = {};
    (collections || []).forEach((c) => {
      map[c] = c;
    });
    setEditedNames(map);
  }, [collections]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setIsSubmitting(true);
    try {
      await addCollection(newColName.trim());
      setNewColName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRename = async (originalName) => {
    const currentVal = (editedNames[originalName] || '').trim();
    if (!currentVal) {
      addToast('Name cannot be empty', 'warning');
      return;
    }
    if (currentVal.toLowerCase() === originalName.toLowerCase()) {
      return;
    }
    await renameCollection(originalName, currentVal);
  };

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

  const handleColUpload = (e) => {
    const file = e.target.files?.[0];
    const colName = activeUploadCol;
    if (!file || !colName) {
      if (e.target) e.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    shrinkImage(file, 600, (dataUrl) => {
      try {
        updateCollectionImage(colName, dataUrl);
        addToast(`Picture for "${colName}" updated!`, 'success');
      } catch (err) {
        console.error(err);
        addToast('Failed to update collection picture.', 'error');
      } finally {
        setIsUploadingPhoto(false);
        setActiveUploadCol(null);
        if (e.target) e.target.value = '';
      }
    });
  };

  const handleDelete = async (colName) => {
    if (confirmDelete !== colName) {
      setConfirmDelete(colName);
      setTimeout(() => {
        setConfirmDelete((prev) => (prev === colName ? null : prev));
      }, 4000);
      return;
    }
    setConfirmDelete(null);
    await deleteCollection(colName);
  };

  return (
    <div className="space-y-4">
      <input
        ref={colInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleColUpload}
      />
      {/* 1. Add Collection Card */}
      <div className="acard">
        <h4>Add collection</h4>
        <form onSubmit={handleAdd} className="two">
          <input
            type="text"
            placeholder="Collection name (e.g. Wooden Serveware)"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
          />
          <button type="submit" className="ab" disabled={isSubmitting}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Add collection</span>
          </button>
        </form>
        <small className="block text-xs text-[#6b8579] mt-2">
          New collections appear on the homepage, shop filters and menu. Add its picture in the
          Images tab.
        </small>
      </div>

      {/* 2. Your Collections Card */}
      <div className="acard">
        <div className="flex items-center justify-between">
          <h4>Your collections ({collections?.length || 0})</h4>
          <button
            type="button"
            className="ab gh2 sm"
            onClick={() => setSellerActiveTab('images')}
          >
            <ImageIcon className="w-3.5 h-3.5 mr-1" />
            <span>Set photos in Images tab</span>
          </button>
        </div>

        <div className="divide-y divide-[#edf6f2] mt-2">
          {(!collections || collections.length === 0) ? (
            <div className="py-8 text-center text-[#6b8579] space-y-1.5">
              <p className="text-sm font-semibold text-[#0f2a21]">No custom collections created yet</p>
              <p className="text-xs">
                The storefront is currently showcasing smart discovery highlights (New In, Bestsellers, Value Finds).
              </p>
              <p className="text-xs text-[#0b6e4f] font-medium">
                Type a collection name above to add your first one anytime!
              </p>
            </div>
          ) : (
            collections.map((col) => {
            const productCount = products.filter(
              (p) => (p.category || '').toLowerCase() === col.toLowerCase()
            ).length;
            const customPic = storeImages?.cols?.[col] || sellerSettings?.collectionImages?.[col];
            const currentInputVal = editedNames[col] !== undefined ? editedNames[col] : col;
            const hasChanged = currentInputVal.trim() !== '' && currentInputVal.trim() !== col;
            const isConfirmingDelete = confirmDelete === col;

            return (
              <div key={col} className="prow flex-wrap sm:flex-nowrap gap-3 py-3">
                {/* Visual Thumbnail */}
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

                {/* Editable Name & Product Count */}
                <div className="pm min-w-[140px]">
                  <input
                    type="text"
                    value={currentInputVal}
                    onChange={(e) =>
                      setEditedNames((prev) => ({
                        ...prev,
                        [col]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveRename(col);
                      }
                    }}
                    placeholder="Collection name"
                  />
                  <small className="text-[#6b8579]">
                    <span className="font-semibold text-[#0b6e4f]">{productCount}</span> product{productCount === 1 ? '' : 's'} assigned
                  </small>
                </div>

                {/* Actions: Organize, Photo, Save & Delete */}
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap justify-end ml-auto">
                  <button
                    type="button"
                    className="ab gh2 sm"
                    onClick={() => setOrganizingCol(col)}
                    title={`Organize products in "${col}"`}
                  >
                    <Folder className="w-3.5 h-3.5 mr-1 text-[#0b6e4f]" />
                    <span>Organize ({productCount})</span>
                  </button>

                  <button
                    type="button"
                    className="ab gh2 sm"
                    disabled={isUploadingPhoto && activeUploadCol === col}
                    onClick={() => {
                      setActiveUploadCol(col);
                      setTimeout(() => colInputRef.current?.click(), 50);
                    }}
                    title="Change collection photo"
                  >
                    {isUploadingPhoto && activeUploadCol === col ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>Photo</span>
                  </button>

                  <button
                    type="button"
                    className={`ab sm ${hasChanged ? '' : 'gh2 opacity-60'}`}
                    disabled={!hasChanged}
                    onClick={() => handleSaveRename(col)}
                    title={hasChanged ? 'Save renamed collection' : 'No changes to save'}
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    className={`ab sm ${isConfirmingDelete ? 'rd' : 'gh2 text-rose-600'}`}
                    onClick={() => handleDelete(col)}
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>{isConfirmingDelete ? 'Sure?' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          }))}
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
