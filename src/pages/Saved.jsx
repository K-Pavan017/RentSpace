import React, { useState, useEffect } from 'react';
import { 
  Heart, Trash2, MapPin, Phone, ArrowLeft, Info, MessageCircle, Navigation, X,
  ChevronLeft, ChevronRight, ShieldCheck, IndianRupee, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { collection, getDocs, deleteDoc, doc, setDoc, getDoc, serverTimestamp, addDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onSnapshot } from "firebase/firestore";
import { calculateTotalRent } from '../utils/pricing';

const Saved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [itemDurations, setItemDurations] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

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
    if (!auth.currentUser) return;

    const wishlistRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "wishlist"
    );

    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedItems(items);

      const initialDurations = {};
      items.forEach(item => {
        initialDurations[item.id] = { days: "1", isCustom: false, customVal: "" };
      });
      setItemDurations(initialDurations);
    });

    return () => unsubscribe();
  }, []);

  const startChat = async (item, bookingDuration = null) => {
    if (!auth.currentUser) return alert("Please Login First");
    if (!item.ownerUid) return alert("This item was listed before the messaging update. Please contact through mobile number instead.");
    if (auth.currentUser.uid === item.ownerUid) return alert("You are the owner of this item");

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

        if (bookingDuration) {
            const chatData = chatSnap.exists() ? chatSnap.data() : null;
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

  const updateItemDuration = (itemId, field, value) => {
    setItemDurations(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const removeSavedItem = async (itemId) => {
    if (!auth.currentUser) return;
    try {
      const itemRef = doc(db, "users", auth.currentUser.uid, "wishlist", itemId);
      await deleteDoc(itemRef);
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
      if (expandedId === itemId) setExpandedId(null);
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 items-start pb-6 w-full">
            {savedItems.map(item => {
              const isExpanded = expandedId === item.id;
              const imgIdx = activeImageIndex[item.id] || 0;
              const isLiked = true; // They are in Saved, so they are liked
              
              const durationConfig = itemDurations[item.id] || { days: "1", isCustom: false, customVal: "" };
              const currentDisplayDays = durationConfig.isCustom ? durationConfig.customVal : durationConfig.days;

              return (
                <div 
                  key={item.id} 
                  className={`group relative bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex-none w-full ${
                    isExpanded 
                    ? 'ring-1 ring-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-[1.01] z-10' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img 
                      src={item.images?.[activeImageIndex[item.id] || 0] || 'https://via.placeholder.com/600x450'} 
                      className={`w-full h-full object-cover transition-transform duration-700 ${isExpanded ? 'scale-105' : 'group-hover:scale-110'}`}
                      alt={item.title}
                    />
                    
                    <button 
                      onClick={() => removeSavedItem(item.id)}
                      className="absolute top-5 right-5 p-3 bg-red-500 text-white rounded-2xl shadow-lg z-20 hover:scale-110 transition-all"
                    >
                      <Trash2 size={20} />
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
                                    <option key={d} value={d}>
                                      {d} {item.category?.toLowerCase() === 'houses' 
                                        ? (d === 1 ? 'Month' : 'Months') 
                                        : (d === 1 ? 'Day' : 'Days')}
                                    </option>
                                  ))}
                                  <option value="custom" className="text-emerald-600">+ Enter Custom</option>
                                </select>
                              ) : (
                                <div className="flex items-center gap-2 w-full">
                                  <input 
                                    autoFocus
                                    type="number"
                                    placeholder={item.category?.toLowerCase() === 'houses' ? "Months" : "Days"}
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
                                <p className="text-xs font-bold text-slate-900">
                                   {currentDisplayDays} {item.category?.toLowerCase() === 'houses' 
                                      ? (currentDisplayDays == 1 ? 'Month' : 'Months') 
                                      : (currentDisplayDays == 1 ? 'Day' : 'Days')}
                                </p>
                             </div>
                             <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Rental Charge</p>
                                <div className="text-right">
                                   <p className="text-lg font-black text-blue-600 leading-none">₹{calculateTotalRent(item.rentPrice, currentDisplayDays, item.category)}</p>
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
        )}
      </div>
    </div>
  );
};

export default Saved;