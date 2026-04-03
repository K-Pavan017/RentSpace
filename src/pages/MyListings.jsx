import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Edit3, 
  Trash2, 
  Plus, 
  MapPin, 
  IndianRupee, 
  Info,
  AlertCircle,
  Loader2,
  Package,
  ExternalLink
} from 'lucide-react';

export default function MyListings() {
  const [user] = useAuthState(auth);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'listings'),
      where('ownerUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Client-side sorting by createdAt (descending)
      const sortedDocs = docs.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000;
        return dateB - dateA;
      });
      setListings(sortedDocs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'listings', id));
        alert("Listing deleted successfully");
      } catch (err) {
        console.error(err);
        alert("Error deleting listing");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-item/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Navbar />
      
      {/* Header */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">My Listings</h1>
            <p className="text-slate-400 text-sm">Manage and track all your posted items.</p>
          </div>
          <button 
            onClick={() => navigate('/add-property')}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            List New Item
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        {loading ? (
          <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center shadow-sm border border-slate-100">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="font-bold text-slate-400">Loading your items...</p>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(item => (
              <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/600x450'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider text-slate-900 shadow-sm border border-slate-100">
                      {item.category}
                    </span>
                    {item.isBooked && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Booked
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px] font-bold uppercase tracking-tighter">
                        <MapPin size={12} className="text-blue-500" />
                        <span className="line-clamp-1">{item.address?.place}, {item.address?.district}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-blue-600">₹{item.rentPrice}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">/{item.category === 'houses' ? 'Month' : 'Day'}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 mb-6" />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEdit(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-2xl font-bold text-sm transition-all active:scale-95"
                    >
                      <Edit3 size={18} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-sm transition-all active:scale-95"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/browse')} // Search for it to see how it looks
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    View in Browse <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Listings Yet</h2>
            <p className="text-slate-400 max-w-sm mb-8">
              You haven't posted any items for rent yet. Start earning today by listing your first item!
            </p>
            <button 
              onClick={() => navigate('/add-property')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Post Your First Listing
            </button>
          </div>
        )}
      </div>

      {/* Stats/Dashboard Summary (Optional) */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
            {listings.length}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Listings</p>
            <p className="font-bold text-slate-900">Active Items</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black">
            {listings.filter(i => i.isBooked).length}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booked Items</p>
            <p className="font-bold text-slate-900">Currently Rented</p>
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center">
            <Info size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Owner Support</p>
            <p className="font-bold text-emerald-800">Need Help?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
