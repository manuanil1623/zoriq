import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, Save, Layers } from 'lucide-react';

export default function CollectionsManager() {
  const {
    products,
    sellerSettings,
    updateSellerSettings,
    addToast
  } = useStore();

  const [newColName, setNewColName] = useState('');

  // Default collections list or saved custom collections
  const collections = React.useMemo(() => {
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

  const handleAddCollection = async (e) => {
    e.preventDefault();
    const clean = newColName.trim();
    if (!clean) return;

    if (collections.map((c) => c.toLowerCase()).includes(clean.toLowerCase())) {
      addToast('Collection already exists!', 'warning');
      return;
    }

    try {
      const customCols = sellerSettings?.customCollections || [];
      const updated = {
        ...sellerSettings,
        customCollections: [...customCols, clean],
      };
      await updateSellerSettings(updated);
      setNewColName('');
      addToast(`Collection "${clean}" added! You can now set its picture in the Images tab.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to add collection', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Add Collection Card */}
      <div className="acard">
        <h4>Add collection</h4>
        <form onSubmit={handleAddCollection} className="two">
          <input
            type="text"
            placeholder="Collection name (e.g. Wooden Serveware)"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
          />
          <button type="submit" className="ab">
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
        <h4>Your collections ({collections.length})</h4>
        <div className="divide-y divide-[#edf6f2]">
          {collections.map((col) => {
            const productCount = products.filter(
              (p) => (p.category || '').toLowerCase() === col.toLowerCase()
            ).length;
            const customPic = sellerSettings?.collectionImages?.[col];

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
                  <small>{productCount} products in this collection</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
