import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';

export default function CollectionsManager() {
  const {
    products,
    collections,
    addCollection,
    renameCollection,
    deleteCollection,
    storeImages,
    sellerSettings,
    setSellerActiveTab,
    addToast
  } = useStore();

  const [newColName, setNewColName] = useState('');
  const [editedNames, setEditedNames] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          {(collections || []).map((col) => {
            const productCount = products.filter(
              (p) => (p.category || '').toLowerCase() === col.toLowerCase()
            ).length;
            const customPic = storeImages?.cols?.[col] || sellerSettings?.collectionImages?.[col];
            const currentInputVal = editedNames[col] !== undefined ? editedNames[col] : col;
            const hasChanged = currentInputVal.trim() !== '' && currentInputVal.trim() !== col;
            const isConfirmingDelete = confirmDelete === col;

            return (
              <div key={col} className="prow">
                {/* Visual Thumbnail */}
                <div className="pt">
                  {customPic ? (
                    <img src={customPic} alt={col} />
                  ) : (
                    <div className="w-full h-full bg-[#eef7f2] flex items-center justify-center text-xs font-bold text-[#0b6e4f]">
                      {col.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Editable Name & Product Count */}
                <div className="pm">
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
                    {productCount} product{productCount === 1 ? '' : 's'} in this collection
                  </small>
                </div>

                {/* Actions: Save & Delete */}
                <div className="flex items-center gap-1.5 flex-none">
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
          })}
        </div>
      </div>
    </div>
  );
}
