import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  User, 
  MessageCircle, 
  HelpCircle, 
  LogOut,
  Heart,
  LayoutDashboard,
  Search,
  Home,
  MessageSquare,
  Package
} from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [totalUnread, setTotalUnread] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user) {
        setTotalUnread(0);
        return;
    }

    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
        let count = 0;
        snap.docs.forEach(doc => {
            const data = doc.data();
            if (data.unreadCounts && data.unreadCounts[user.uid]) {
                count += data.unreadCounts[user.uid];
            }
        });
        setTotalUnread(count);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) { console.error(err); }
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100 h-20">
        <div className="max-w-[1600px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <NavLink to="/home" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300">
              <img 
                src="/pwa-192x192.png" 
                alt="RentSpace Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl sm:text-2xl font-black italic text-slate-900 tracking-tighter">
              RENT<span className="text-blue-600 transition-colors duration-300 group-hover:text-indigo-600">SPACE</span>
            </span>
          </NavLink>

          {/* CENTER NAV - Visible only on Desktop (lg and up) */}
          <div className="hidden lg:flex items-center bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/40">
            <PillNavLink to="/home" label="Home" />
            <PillNavLink to="/browse" label="Browse" />
            <PillNavLink to="/chats" label="Messages" icon={
              <div className="relative">
                <MessageSquare size={16} />
                {totalUnread > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{totalUnread}</span>}
              </div>
            } />
            <PillNavLink to="/saved" label="Saved" icon={<Heart size={16} />} />
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => navigate('/add-property')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
            >
              <Plus size={18}  />
              <span className="xs:inline">List Item</span>
            </button>

            <div className="relative pl-2 sm:pl-4 border-l border-slate-100" ref={dropdownRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isMenuOpen ? 'bg-slate-900 text-white rotate-12 shadow-xl shadow-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <User size={20} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 p-3 animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                  <MenuLink icon={<LayoutDashboard className="text-blue-500" />} label="Dashboard" onClick={() => navigate('/browse')} />
                  <MenuLink 
                    icon={
                      <div className="relative">
                        <MessageSquare className="text-emerald-500" />
                        {totalUnread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{totalUnread}</span>}
                      </div>
                    } 
                    label="My Messages" 
                    onClick={() => navigate('/chats')} 
                  />
                  <MenuLink icon={<Package className="text-purple-500" />} label="My Listings" onClick={() => navigate('/my-listings')} />
                  <MenuLink icon={<HelpCircle className="text-amber-500" />} label="Help Center" onClick={() => navigate('/help')} />
                  <div className="my-2 border-t border-slate-50" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION - Visible only on Mobile/Tablet (hidden on lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 pb-safe-area-inset-bottom">
        <div className="flex justify-between items-center h-20 max-w-lg mx-auto relative">
          <MobileTab to="/home" icon={<Home size={22} />} label="Home" />
          <MobileTab to="/browse" icon={<Search size={22} />} label="Browse" />
          {/* CENTER SPECIAL TAB */}
          <MobileTab 
            to="/add-property" 
            icon={<Plus size={32} strokeWidth={2.5} />} 
            label="List" 
            special 
          />
          <MobileTab to="/chats" icon={
            <div className="relative">
              <MessageSquare size={22} />
              {totalUnread > 0 && <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{totalUnread}</span>}
            </div>
          } label="Messages" />
          <MobileTab to="/saved" icon={<Heart size={22} />} label="Saved" />
        </div>
      </div>
    </>
  );
}

// Helper Components
function PillNavLink({ to, label, icon }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        relative px-6 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all duration-500 flex items-center gap-2 overflow-hidden group
        ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-900'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className={`
            absolute inset-0 bg-blue-600 transition-all duration-500
            ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-2 group-hover:opacity-10'}
          `} />
          <span className="relative z-10 flex items-center gap-2">
            {icon && icon}
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function MobileTab({ to, icon, label, special }) {
  if (special) {
    return (
      <NavLink to={to} className="relative -top-6 flex flex-col items-center">
        {({ isActive }) => (
          <>
            <div className={`
            w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
            ${isActive
              ? 'bg-slate-900 text-white scale-115 -rotate-90'
              : 'bg-blue-600 text-white hover:scale-115 active:scale-95 shadow-blue-200'
            }
          `}>
            {icon}
          </div>
            <span className={`
              text-[10px] font-black mt-2 uppercase tracking-tighter transition-colors duration-300
              ${isActive ? 'text-slate-900' : 'text-blue-600'}
            `}>
              {label}
            </span>
          </>
        )}
      </NavLink>
    );
  }

  return (
    <NavLink to={to} className="w-full h-full">
      {({ isActive }) => (
        <div className={`
          flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300
          ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}
        `}>
          <div className="relative">
            {icon}
            {/* Active indicator glow */}
            {isActive && (
              <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full -z-10" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">{label}</span>
          
          {/* Active indicator dot */}
          <div className={`
            w-1 h-1 rounded-full bg-blue-600 transition-all duration-300 mt-0.5
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `} />
        </div>
      )}
    </NavLink>
  );
}

function MenuLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all group">
      <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-white transition-all shadow-sm">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <span className="font-bold text-slate-700 text-sm">{label}</span>
    </button>
  );
}
