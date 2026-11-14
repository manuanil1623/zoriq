import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Search, Check, Plus, Folder, ArrowRight } from 'lucide-react';

export default function CollectionOrganizerModal({ collectionName, onClose }) {
  const { products, setProductCollection } = useStore();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'in' | 'out'
  const [loadingId, setLoadingId] = useState(null);

  if (!collectionName) return null;

  const colLower = collectionName.toLowerCase();

  // Products belonging to this collection vs others
  const inThisCollection = products.filter(
    (p) => (p.category || '').toLowerCase() === colLower
  );
  const notInThisCollection = products.filter(
    (p) => (p.category || '').toLowerCase() !== colLower
  );

  const filteredProducts = products.filter((p) => {
    const isMember = (p.category || '').toLowerCase() === colLower;
    if (filterMode === 'in' && !isMember) return false;
    if (filterMode === 'out' && isMember) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  });

  const handleToggleProduct = async (product) => {
    setLoadingId(product.id);
    const isCurrentlyIn = (product.category || '').toLowerCase() === colLower;
    try {
      if (isCurrentlyIn) {
        await setProductCollection(product.id, 'General');
      } else {
        await setProductCollection(product.id, collectionName);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#d6efe5] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#edf6f2] flex items-start justify-between bg-gradient-to-r from-[#eaf9f2] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b6e4f] text-white flex items-center justify-center flex-none shadow-md shadow-[#0b6e4f]/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0f2a21]">
                Organize: <span className="text-[#0b6e4f]">{collectionName}</span>
              </h3>
              <p className="text-xs text-[#6b8579]">
                Assign or remove products for this collection ({inThisCollection.length} selected)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#4d6b60] hover:text-[#0f2a21] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-[#edf6f2] bg-[#fcfbf8] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6b8579] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#cfe8dd] rounded-xl focus:outline-none focus:border-[#0b6e4f] focus:ring-1 focus:ring-[#0b6e4f]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#0b6e4f] text-white'
                  : 'bg-white text-[#4d6b60] border border-[#cfe8dd] hover:bg-[#eef7f2]'
              }`}
            >
              All ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('in')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filterMode === 'in'
                  ? 'bg-[#0b6e4f] text-white'
                  : 'bg-white text-[#4d6b60] border border-[#cfe8dd] hover:bg-[#eef7f2]'
              }`}
            >
              In Collection ({inThisCollection.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('out')}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                filterMode === 'out'
                  ? 'bg-[#0b6e4f] text-white'
                  : 'bg-white text-[#4d6b60] border border-[#cfe8dd] hover:bg-[#eef7f2]'
              }`}
            >
              Available ({notInThisCollection.length})
            </button>
          </div>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#edf6f2] p-2 sm:p-3">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6b8579]">
              No products found matching your search.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const isMember = (prod.category || '').toLowerCase() === colLower;
              const isLoading = loadingId === prod.id;
              const imgUrl = prod.image || prod.imageUrl;

              return (
                <div
                  key={prod.id}
                  className="flex items-center justify-between gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-[#f6fbf8] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-[#eef7f2] overflow-hidden flex-none border border-[#d6efe5] flex items-center justify-center">
                      {imgUrl ? (
                        <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[#0b6e4f]">
                          {(prod.name || 'P').slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#0f2a21] truncate">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#6b8579] truncate">
                        {isMember ? (
                          <span className="font-semibold text-[#0b6e4f]">
                            In this collection
                          </span>
                        ) : (
                          <span>Current: {prod.category || 'General'}</span>
                        )}{' '}
                        · ₹{Number(prod.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Action Toggle */}
                  <div className="flex-none">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleProduct(prod)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isMember
                          ? 'bg-[#eaf9f2] text-[#0b6e4f] border border-[#0b6e4f]/30 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                          : 'bg-[#0b6e4f] text-white hover:bg-[#09573e] shadow-sm'
                      }`}
                    >
                      {isLoading ? (
                        <span>Saving...</span>
                      ) : isMember ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In collection</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to this</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#edf6f2] bg-[#fcfbf8] flex items-center justify-between">
          <span className="text-xs text-[#4d6b60] font-medium">
            {inThisCollection.length} product{inThisCollection.length === 1 ? '' : 's'} assigned to <b>{collectionName}</b>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ab sm"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
