import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import Navbar from '../components/Navbar';

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  Search, MapPin, LayoutGrid, Tent, Home, Camera, Sofa, 
  Bike, Car, PartyPopper, Smartphone, Music, Sparkles, 
  Dog, Gamepad2, Navigation, ShieldCheck, IndianRupee,
  ChevronLeft, ChevronRight, MessageCircle, Info, Heart
} from 'lucide-react';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [days, setDays] = useState("1");
  const [customDays, setCustomDays] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // New state for saved items
  const [savedItems, setSavedItems] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const selectedDuration = showCustomInput && customDays ? customDays : days;
  const categories = [
    { name: 'All', icon: <LayoutGrid size={22} /> },
    { name: 'Tent House Items', icon: <Tent size={22} /> },
    { name: 'Houses', icon: <Home size={22} /> },
    { name: 'Cameras', icon: <Camera size={22} /> },
    { name: 'Furniture', icon: <Sofa size={22} /> },
    { name: 'Bikes', icon: <Bike size={22} /> },
    { name: 'Cars', icon: <Car size={22} /> },
    { name: 'Party Equipment', icon: <PartyPopper size={22} /> },
    { name: 'Electronics', icon: <Smartphone size={22} /> },
    { name: 'Musical Instruments', icon: <Music size={22} /> },
    { name: 'Makeup Artist', icon: <Sparkles size={22} /> },
    { name: 'Pets', icon: <Dog size={22} /> },
    { name: 'Video Games', icon: <Gamepad2 size={22} /> },
  ];

  // Persist saved items to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
        setFilteredItems(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let temp = [...items];
    if (search.trim()) {
      temp = temp.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));
    }
    if (category !== 'all') {
      temp = temp.filter(i => i.category?.toLowerCase() === category.toLowerCase());
    }
    if (sort === 'priceLowHigh') temp.sort((a, b) => a.rentPrice - b.rentPrice);
    else if (sort === 'priceHighLow') temp.sort((a, b) => b.rentPrice - a.rentPrice);
    setFilteredItems(temp);
  }, [search, category, sort, items]);

  const toggleLike = (e, item) => {
    e.stopPropagation();
    setSavedItems(prev => {
      const isSaved = prev.find(i => i.id === item.id);
      if (isSaved) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleImageNav = (e, itemId, direction, max) => {
    e.stopPropagation();
    setActiveImageIndex(prev => {
      const current = prev[itemId] || 0;
      let next = direction === 'next' ? current + 1 : current - 1;
      if (next >= max) next = 0;
      if (next < 0) next = max - 1;
      return { ...prev, [itemId]: next };
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <Navbar />
      
      <div className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search for cameras, cars, or furniture..."
              className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border-none rounded-[2rem] font-medium focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none"
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button 
                key={cat.name} 
                onClick={() => setCategory(cat.name.toLowerCase())} 
                className="flex flex-col items-center gap-2 flex-shrink-0 group min-w-[70px]"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  category === cat.name.toLowerCase() 
                  ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600 shadow-sm'
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter text-center max-w-[80px] leading-tight ${
                   category === cat.name.toLowerCase() ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
           </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {filteredItems.map(item => {
              const isExpanded = expandedId === item.id;
              const imgIdx = activeImageIndex[item.id] || 0;
              const isLiked = savedItems.some(i => i.id === item.id);

              return (
                <div 
                  key={item.id} 
                  className={`group relative bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isExpanded 
                    ? 'ring-1 ring-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-[1.01] z-10' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img 
                      src={item.images?.[imgIdx] || 'https://via.placeholder.com/600x450'} 
                      className={`w-full h-full object-cover transition-transform duration-700 ${isExpanded ? 'scale-105' : 'group-hover:scale-110'}`}
                      alt={item.title}
                    />
                    
                    {/* HEART / LIKE BUTTON */}
                    <button 
                      onClick={(e) => toggleLike(e, item)}
                      className={`absolute top-5 right-5 p-3 rounded-2xl backdrop-blur-md transition-all duration-300 z-20 ${
                        isLiked 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110' 
                        : 'bg-white/20 text-white hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                    {item.images?.length > 1 && (
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleImageNav(e, item.id, 'prev', item.images.length)} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all"><ChevronLeft size={18}/></button>
                        <button onClick={(e) => handleImageNav(e, item.id, 'next', item.images.length)} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all"><ChevronRight size={18}/></button>
                      </div>
                    )}

                    <div className="absolute top-5 left-5 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{item.category}</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text font-bold text-slate-900 tracking-tight leading-tight">{item.title}</h2>
                        <div className="flex items-start gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-tight">
                        <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" /> 
                        <span>
                          {item.address?.houseNo && `${item.address.houseNo}, `}
                          {item.address?.place && `${item.address.place}, `}
                          {item.address?.district}
                        </span>
                      </div>
                      </div>
                      <div className="text-right">
                        <p className="text font-black text-blue-600">₹{item.rentPrice}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category === 'houses' ? '/Month' : '/Day'}</p>
                      </div>
                    </div>

                    <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden space-y-6">
                        <div className="h-px bg-slate-100 w-full" />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Condition</p>
                            <p className="font-bold text-slate-800 text-sm">{item.condition || 'Mint'}</p>
                          </div>
                          <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><IndianRupee size={12}/> Security</p>
                            <p className="font-bold text-slate-800 text-sm">₹{item.securityDeposit || '0'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Details</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                        </div>

                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4">
                          <div className="grid grid-cols-1 items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-blue-400 uppercase">Owner Details:</p>
                              <p className="font-black text-slate-900">{item.mobile}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                              onClick={() => window.open(`https://www.google.com/maps?q=${item.location?.lat},${item.location?.lng}`)} 
                              className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm hover:shadow-md transition-all"
                            >
                              <span>Location </span>
                              <Navigation size={20} />
                            </button>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4 w-full">
                          {/* Call Button - Added flex-1 to match WhatsApp width */}
                          <a 
                            href={`tel:${item.mobile}`} 
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm text-center shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center"
                          >
                            Call
                          </a>

                          {/* WhatsApp Button - Kept flex-1 and improved centering */}
                          <a 
                            href={`https://wa.me/91${item.mobile}?text=Hi, I am interested in your ${item.title}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm text-center shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                            Chat
                          </a>
                        </div>
                       <div className="w-full max-w-md mx-auto flex flex-col md:grid md:grid-cols-1 items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
  {/* Duration Selection */}
  <div className="w-full flex flex-col px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200">
    <label className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1">
      Duration
    </label>

    <div className="relative flex items-center min-h-[32px]">
      {!showCustomInput ? (
        <select
          value={days}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setShowCustomInput(true);
            } else {
              setDays(e.target.value);
            }
          }}
          className="w-full bg-transparent text-slate-900 font-bold text-sm focus:outline-none cursor-pointer appearance-none"
        >
          {[1, 2, 3, 7, 10, 15, 30].map((d) => (
            <option key={d} value={d}>
              {d} {d === 1 ? "Day" : "Days"}
            </option>
          ))}
          <option value="custom" className="text-emerald-600 font-semibold">
            + Enter Days
          </option>
        </select>
      ) : (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="number"
              placeholder="00"
              className="w-16 bg-transparent text-emerald-600 font-bold text-sm focus:outline-none border-b border-emerald-100"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
            />
            <span className="text-sm font-bold text-slate-900">Days</span>
          </div>
          <button
            onClick={() => {
              setShowCustomInput(false);
              setCustomDays("");
            }}
            className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors"
          >
            ESC
          </button>
        </div>
      )}
      
      {/* Custom Arrow Icon (Optional but recommended for appearance-none) */}
      {!showCustomInput && (
        <div className="pointer-events-none absolute right-0 flex items-center text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="Step 19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  </div>
</div>
                          {/* Book Now Button */}
                          <div className="mt-2 w-full">
                          {/* Your other content (Title, Price, etc.) would go here */}

                          <a 
                            href={`https://wa.me/91${item.mobile}?text=Hi, I want to take rent your ${item.title} for ${selectedDuration} ${selectedDuration === "1" ? "Day." : "Days."}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-base text-center shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                          >
                            <span>Book Now</span>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5 group-hover:translate-x-1 transition-transform" 
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`mt-6 w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                        isExpanded 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200'
                      }`}
                    >
                      {isExpanded ? 'Close Listing' : 'View Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
               <Info size={40} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">No items found</h3>
               <p className="text-slate-500">Try changing your filters or searching for something else.</p>
             </div>
             <button onClick={() => {setCategory('all'); setSearch('');}} className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">Show All Items</button>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default BrowseItems;