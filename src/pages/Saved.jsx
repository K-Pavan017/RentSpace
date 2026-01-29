import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'


const Saved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedRentals') || '[]');
    setSavedItems(saved);
  }, []);

  const removeSavedItem = (id) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('savedRentals', JSON.stringify(updated));
  };

  return (
    
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Browse
        </button>

        <h1 className="text-4xl font-black text-slate-900 mb-2">Saved Rentals</h1>
        <p className="text-slate-500 mb-10 font-medium">Your personal wishlist of items to rent.</p>

        {savedItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-300">
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-slate-500 mt-2">Go back and like some items to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedItems.map(item => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="relative h-56">
                  <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeSavedItem(item.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-red-500 shadow-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="p-8">
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-3">
                    {item.category}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">{item.title}</h2>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-blue-600">₹{item.rentPrice}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">/ day</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-tight">
                      <MapPin size={16} className="text-blue-500" />
                      {item.address?.district}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                      <Phone size={16} className="text-emerald-500" />
                      +91 {item.mobile}
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