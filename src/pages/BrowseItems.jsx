import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import Navbar from '../components/Navbar';
import { auth } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment
} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, LayoutGrid, Tent, Home, Camera, Sofa, 
  Bike, Car, PartyPopper, Smartphone, Music, Sparkles, 
  Dog, Gamepad2, Navigation, ShieldCheck, IndianRupee,
  ChevronLeft, ChevronRight, Info, Heart, Zap, MessageSquare
} from 'lucide-react';
import { calculateTotalRent } from '../utils/pricing';

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [itemDurations, setItemDurations] = useState({}); 
  const [savedItems, setSavedItems] = useState([]);
  
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState('any');
  
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

  // Haversine distance formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    const wishlistRef = collection(db, "users", auth.currentUser.uid, "wishlist");
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const saved = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedItems(saved);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.warn("Location Access Denied:", err)
      );
    }
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
        
        const initialDurations = {};
        data.forEach(item => {
          initialDurations[item.id] = { days: "1", isCustom: false, customVal: "" };
        });
        setItemDurations(initialDurations);
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
      const s = search.toLowerCase();
      temp = temp.filter(i => 
        i.title?.toLowerCase().includes(s) || 
        i.description?.toLowerCase().includes(s) ||
        i.category?.toLowerCase().includes(s) ||
        i.address?.place?.toLowerCase().includes(s)
      );
    }

    if (category !== 'all') {
      temp = temp.filter(i => i.category?.toLowerCase() === category.toLowerCase());
    }

    if (maxDistance !== 'any' && userLocation) {
        temp = temp.filter(i => {
            if (!i.location) return false;
            const dist = calculateDistance(userLocation.lat, userLocation.lng, i.location.lat, i.location.lng);
            return dist !== null && dist <= parseFloat(maxDistance);
        });
    }

    if (sort === 'priceLowHigh') temp.sort((a, b) => a.rentPrice - b.rentPrice);
    else if (sort === 'priceHighLow') temp.sort((a, b) => b.rentPrice - a.rentPrice);
    
    // Internal Helper: Check if item is EXPIRED and needs lazy cleanup
    const now = new Date();
    temp.forEach(async (item) => {
        if (item.isBooked && item.bookedUntil) {
            const expiry = item.bookedUntil.toDate ? item.bookedUntil.toDate() : new Date(item.bookedUntil);
            if (now > expiry) {
                // Lazy Cleanup: Update Firestore
                try {
                    await updateDoc(doc(db, 'listings', item.id), {
                        isBooked: false,
                        bookedUntil: null,
                        bookedBy: null
                    });
                } catch (err) { console.error("Lazy Cleanup Error:", err); }
            }
        }
    });

    setFilteredItems(temp);
}, [search, category, sort, items, userLocation, maxDistance]);

  const navigate = useNavigate();

  const startChat = async (item, bookingDuration = null) => {
    if (!auth.currentUser) return alert("Please Login First");
    if (!item.ownerUid) return alert("This item was listed before the messaging update. Please contact through mobile number instead.");
    if (auth.currentUser.uid === item.ownerUid) return alert("You are the owner of this item");

    // Room ID is deterministic to prevent duplicate chats for the same item/pair
    const roomId = `${item.id}_${item.ownerUid}_${auth.currentUser.uid}`;
    
    try {
        const chatRef = doc(db, "chats", roomId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                participants: [auth.currentUser.uid, item.ownerUid],
                itemId: item.id,
                itemTitle: item.title,
                itemPrice: item.rentPrice,
                itemCategory: item.category,
                ownerUid: item.ownerUid,
                participantNames: {
                    [auth.currentUser.uid]: auth.currentUser.email.split('@')[0],
                    [item.ownerUid]: item.ownerEmail?.split('@')[0] || "Owner"
                },
                unreadCounts: {
                    [auth.currentUser.uid]: 0,
                    [item.ownerUid]: 0
                },
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                lastMessage: "Chat started"
            });
        }

        // If this is a Direct Booking Request from "Book Now"
        if (bookingDuration) {
            const chatData = chatSnap.exists() ? chatSnap.data() : null;
            
            // Only send a new request if there's no active one or if the item is not booked
            if (!chatData?.activeRequest && !item.isBooked) {
                const totalPrice = calculateTotalRent(item.rentPrice, bookingDuration, item.category);
                const requestData = {
                    itemId: item.id,
                    tenantId: auth.currentUser.uid,
                    ownerId: item.ownerUid,
                    duration: bookingDuration,
                    price: totalPrice,
                    status: 'pending',
                    timestamp: Date.now()
                };

                await updateDoc(chatRef, {
                    activeRequest: requestData,
                    lastMessage: `BOOKING REQUEST: ${bookingDuration} days for ₹${totalPrice}`,
                    [`unreadCounts.${item.ownerUid}`]: increment(1),
                    updatedAt: serverTimestamp()
                });

                await addDoc(collection(db, 'chats', roomId, 'messages'), {
                    senderId: 'system',
                    text: `TENANT REQUEST: Rent for ${bookingDuration} days. Total price: ₹${totalPrice}.`,
                    timestamp: serverTimestamp(),
                    type: 'request'
                });
            }
        }

        navigate(`/chat/${roomId}`);
    } catch (err) {
        console.error("Booking Error:", err);
        alert("Failed to start chat or send request.");
    }
  };

  const toggleLike = async (e, item) => {
  e.stopPropagation();
  if (!auth.currentUser) return;

  const ref = doc(
    db,
    "users",
    auth.currentUser.uid,
    "wishlist",
    item.id
  );

  const isLiked = savedItems.some(i => i.id === item.id);

  if (isLiked) {
    await deleteDoc(ref);   // ❌ remove
  } else {
    await setDoc(ref, {     // ❤️ save
      ...item,
      createdAt: new Date()
    });
  }
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

  // Helper to handle duration changes per item
  const updateItemDuration = (itemId, field, value) => {
    setItemDurations(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <Navbar />
      
      {/* Search & Categories */}
      <div className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search for cameras, cars, or furniture..."
                className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border-none rounded-[2rem] font-medium focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200/40">
              <MapPin size={18} className="ml-3 text-slate-400" />
              <select 
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4 cursor-pointer"
              >
                <option value="any">Any distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {filteredItems.map(item => {
              const isExpanded = expandedId === item.id;
              const imgIdx = activeImageIndex[item.id] || 0;
              const isLiked = savedItems.some(i => i.id === item.id);
              
              // Get this specific item's duration settings
              const durationConfig = itemDurations[item.id] || { days: "1", isCustom: false, customVal: "" };
              const currentDisplayDays = durationConfig.isCustom ? durationConfig.customVal : durationConfig.days;

              return (
                <div 
                  key={item.id} 
                  className={`group relative bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isExpanded 
                    ? 'ring-1 ring-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-[1.01] z-10' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {/* Image Section */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        {item.isBooked && (item.bookedUntil?.toDate ? item.bookedUntil.toDate() : new Date(item.bookedUntil)) > new Date() && (
                            <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="bg-red-500 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl animate-pulse flex flex-col items-center">
                                    <span>BOOKED</span>
                                    <span className="text-[8px] opacity-70 mt-1 uppercase font-bold tracking-tighter">
                                        Until: {new Date(item.bookedUntil?.toDate ? item.bookedUntil.toDate() : item.bookedUntil).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}
                        <img 
                          src={item.images?.[activeImageIndex[item.id] || 0] || 'https://via.placeholder.com/600x450'} 
                          className={`w-full h-full object-cover transition-transform duration-700 ${isExpanded ? 'scale-105' : 'group-hover:scale-110'}`}
                          alt={item.title}
                        />
                    
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

                    {item.images?.length > 1 && (
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleImageNav(e, item.id, 'prev', item.images.length)} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all"><ChevronLeft size={18}/></button>
                        <button onClick={(e) => handleImageNav(e, item.id, 'next', item.images.length)} className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all"><ChevronRight size={18}/></button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text font-bold text-slate-900 tracking-tight">{item.title}</h2>
                        {/* FIX: Improved Full Address Display logic */}
                        <div className="flex items-start gap-1.5 text-slate-500 text-[11px] font-bold uppercase">
                          <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" /> 
                          <div className="flex flex-col gap-1">
                            <span className="line-clamp-2">
                              {item.address ? (
                                <>
                                  {item.address.houseNo && `${item.address.houseNo}, `}
                                  {item.address.street && `${item.address.street}, `}
                                  {item.address.place && `${item.address.place}, `}
                                  {item.address.district && `${item.address.district}`}
                                  {item.address.pincode && ` - ${item.address.pincode}`}
                                </>
                              ) : "Location Details Unavailable"}
                            </span>
                            {userLocation && item.location && (
                                <span className="text-blue-600 flex items-center gap-1 normal-case font-black">
                                    <Navigation size={10} className="fill-current" />
                                    {calculateDistance(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng).toFixed(1)} km away
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text font-black text-blue-600">₹{item.rentPrice}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.category === 'houses' ? '/Month' : '/Day'}</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden space-y-6">
                        <div className="h-px bg-slate-100 w-full" />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Condition</p>
                            <p className="font-bold text-slate-800 text-sm">{item.condition || 'Good'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><IndianRupee size={12}/> Security</p>
                            <p className="font-bold text-slate-800 text-sm">₹{item.securityDeposit || '0'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase">Description</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                        </div>

                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-blue-400 uppercase">Contact:</p>
                              <p className="font-black text-slate-900">{item.mobile}</p>
                            </div>
                            {/* FIX: Corrected Google Maps URL and Location check */}
                            {item.location?.lat && (
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`, '_blank')} 
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl shadow-sm font-bold text-xs"
                              >
                                MAP <Navigation size={14} />
                              </button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button 
                                onClick={() => startChat(item)}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm text-center shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                disabled={item.isBooked}
                            >
                                <MessageSquare size={18} /> CHAT NOW
                            </button>
                            <a href={`tel:${item.mobile}`} className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl font-bold text-xs text-center shadow-sm active:scale-95 transition-all flex items-center justify-center">CALL</a>
                          </div>

                          {/* FIX: Per-item Duration Selection */}
                          <div className="pt-2">
                            <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-2 text-center">Rental Duration</label>
                            <div className='w-full p-2 bg-white rounded-xl border border-blue-100 flex items-center justify-center'>   
                              {!durationConfig.isCustom ? (
                                <select 
                                  value={durationConfig.days}
                                  onChange={(e) => {
                                    if (e.target.value === "custom") {
                                      updateItemDuration(item.id, 'isCustom', true);
                                    } else {
                                      updateItemDuration(item.id, 'days', e.target.value);
                                    }
                                  }}
                                  className="w-full bg-transparent text-slate-900 font-bold text-sm outline-none cursor-pointer"
                                >
                                  {[1, 2, 3, 5, 7, 10, 15, 30].map(d => (
                                    <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                                  ))}
                                  <option value="custom" className="text-emerald-600">+ Enter Custom</option>
                                </select>
                              ) : (
                                <div className="flex items-center gap-2 w-full">
                                  <input 
                                    autoFocus
                                    type="number"
                                    placeholder="Days"
                                    className="flex-1 bg-transparent text-emerald-600 font-bold text-sm outline-none"
                                    value={durationConfig.customVal}
                                    onChange={(e) => updateItemDuration(item.id, 'customVal', e.target.value)}
                                  />
                                  <button 
                                    onClick={() => updateItemDuration(item.id, 'isCustom', false)}
                                    className="text-[9px] bg-slate-100 px-2 py-1 rounded font-bold"
                                  >
                                    BACK
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                      
                          <div className="flex flex-col gap-1 pb-2">
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Duration</p>
                                <p className="text-xs font-bold text-slate-900">{currentDisplayDays} {currentDisplayDays == 1 ? 'Day' : 'Days'}</p>
                             </div>
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Rental Charge</p>
                                <div className="text-right">
                                   <p className="text-lg font-black text-blue-600 leading-none">₹{calculateTotalRent(item.rentPrice, currentDisplayDays, item.category)}</p>
                                   <p className="text-[8px] font-bold text-blue-400 uppercase mt-1 italic leading-none">
                                      {item.category?.toLowerCase() === 'houses' ? '(Monthly Rate)' : '(Iterative 10% Discount Applied)'}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <button 
                            onClick={() => startChat(item, currentDisplayDays)}
                            disabled={item.isBooked}
                            className={`w-full py-4 text-white rounded-2xl font-bold text-base text-center shadow-lg transition-all flex items-center justify-center gap-2 ${
                              item.isBooked 
                              ? 'bg-slate-400 cursor-not-allowed' 
                              : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
                            }`}
                          >
                            {item.isBooked ? 'Item Already Booked' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`mt-4 w-full py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                        isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isExpanded ? 'Close' : 'View Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <Info size={40} className="text-slate-300 mb-4" />
             <h3 className="text-xl font-bold text-slate-900">No items found</h3>
             <button onClick={() => {setCategory('all'); setSearch('');}} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">Clear Filters</button>
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