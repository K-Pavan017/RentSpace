import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MapPin, Phone, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Saved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const navigate = useNavigate();

  // 1. Sync with the 'wishlist' key used in BrowseItems
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setSavedItems(saved);
  }, []);

  const removeSavedItem = (id) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    
    // Optional: Dispatch a storage event if you want other tabs/components 
    // to update immediately
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <button 
          onClick={() => navigate(-1)} // Takes user back to previous page
          className="group flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-blue-600 transition-all"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="text-sm uppercase tracking-widest">Back to Browse</span>
        </button>

        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Saved <span className="text-blue-600">Items</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            You have {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} ready for rent.
          </p>
        </header>

        {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
              <Heart size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-xs">
              Explore our collection and tap the heart icon to save items you're interested in!
            </p>
            <button 
              onClick={() => navigate('/browse')} // Adjust path to your browse route
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
            >
              Start Browsing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedItems.map(item => (
              <div 
                key={item.id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/600x450'} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-60 transition-opacity" />
                  
                  <button 
                    onClick={() => removeSavedItem(item.id)}
                    className="absolute top-5 right-5 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12"
                    title="Remove from saved"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="absolute bottom-5 left-5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{item.category}</span>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{item.title}</h2>
                    <div className="text-right">
                      <p className="text-xl font-black text-blue-600">₹{item.rentPrice}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Per Day</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-slate-600 font-bold text-xs uppercase tracking-tight">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MapPin size={16} className="text-blue-500" />
                      </div>
                      {item.address?.district || 'Location N/A'}
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href={`tel:${item.mobile}`} 
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        <Phone size={16} /> Call
                      </a>
                      <button 
                        onClick={() => navigate(`/item/${item.id}`)} // Link to your specific item detail page
                        className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                      >
                        <Info size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;