import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MapPin, Phone, ArrowLeft, Info, MessageCircle, Navigation, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Saved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setSavedItems(saved);
  }, []);

  const removeSavedItem = (id) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    if(selectedItem?.id === id) setSelectedItem(null); 
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <button 
          onClick={() => navigate(-1)} 
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
        </header>

        {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <Heart size={48} className="text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold text-slate-800">Your wishlist is empty</h3>
            <button onClick={() => navigate('/browse')} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold">Start Browsing</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedItems.map(item => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                  <button onClick={() => removeSavedItem(item.id)} className="absolute top-5 right-5 bg-white/90 p-3 rounded-2xl text-red-500 shadow-xl"><Trash2 size={20} /></button>
                </div>
                
                <div className="p-8 text-center">
                  <h2 className="text-xl font-black text-slate-900 mb-2">{item.title}</h2>
                  <p className="text-2xl font-black text-blue-600 mb-6">₹{item.rentPrice} <span className="text-xs text-slate-400 uppercase">/ Day</span></p>
                  
                  <button 
                    onClick={() => setSelectedItem(item)} 
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Info size={18} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FULL DETAILS MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="relative h-56 shrink-0">
              <img src={selectedItem.images?.[0]} className="w-full h-full object-cover" alt="" />
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg text-slate-900 hover:bg-slate-100"><X size={20}/></button>
            </div>

            <div className="p-8 overflow-y-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-1">{selectedItem.title}</h2>
              <p className="text-blue-600 font-bold mb-6 text-xl">₹{selectedItem.rentPrice} / Day</p>

              <div className="space-y-6 mb-8 text-left">
                {/* Description */}
                <div>
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                   <p className="text-slate-600 leading-relaxed font-medium">{selectedItem.description || "No description provided."}</p>
                </div>

               {/* Granular Address Section */}
<div>
  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Address</h4>
  <div className="flex gap-3 text-slate-600 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <MapPin size={20} className="text-blue-500 shrink-0 mt-1" />
    <div className="text-sm space-y-1">
      {/* House Number & Area */}
      <p className="font-black text-slate-900">
        {(selectedItem.address?.houseNo || selectedItem.address?.house_no) && 
          `${selectedItem.address?.houseNo || selectedItem.address?.house_no}, `}
        {selectedItem.address?.place}
      </p>

      {/* Landmark - Checks for multiple possible naming styles */}
      {(selectedItem.address?.landmark || selectedItem.address?.landMark || selectedItem.address?.land_mark) && (
        <p className="text-slate-500 font-medium">
          <span className="text-blue-400 font-bold text-[10px] uppercase mr-1">Landmark:</span>
          {selectedItem.address?.landmark || selectedItem.address?.landMark || selectedItem.address?.land_mark}
        </p>
      )}

      {/* City, District, State */}
      <p className="text-slate-500 pt-1 border-t border-slate-200 mt-1">
        {selectedItem.address?.city && `${selectedItem.address.city}, `}
        {selectedItem.address?.district}, {selectedItem.address?.state}
      </p>
    </div>
  </div>
</div>

                {/* Owner Details Box */}
                <div className="flex items-center justify-between p-5 bg-blue-600 rounded-[2rem] shadow-lg shadow-blue-100">
                  <div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Owner Contact</p>
                    <p className="font-black text-white text-lg">+91 {selectedItem.mobile}</p>
                  </div>
                  <button 
                     onClick={() => window.open(`https://www.google.com/maps?q=${selectedItem.location?.lat},${selectedItem.location?.lng}`)}
                     className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm hover:scale-110 transition-all active:scale-90"
                  >
                    <Navigation size={22} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <a 
                  href={`tel:${selectedItem.mobile}`} 
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Phone size={18} /> Call
                </a>
                <a 
                  href={`https://wa.me/91${selectedItem.mobile}?text=Hi, I'm interested in ${selectedItem.title}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageCircle size={18}/> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;