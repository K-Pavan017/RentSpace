import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Camera, 
  Bike, 
  Home as HomeIcon,
  CheckCircle,
  TrendingUp,
  Search,
  MessageCircle,
  Package
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const featuredCategories = [
    { name: 'Properties', icon: <HomeIcon className="w-6 h-6" />, color: 'bg-blue-500' },
    { name: 'Electronics', icon: <Smartphone className="w-6 h-6" />, color: 'bg-purple-500' },
    { name: 'Cameras', icon: <Camera className="w-6 h-6" />, color: 'bg-orange-500' },
    { name: 'Vehicles', icon: <Bike className="w-6 h-6" />, color: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-slate-900 pt-14 pb-24 lg:pt-22 lg:pb-40">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 py-1 px-3 mb-8 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-400/10 rounded-full border border-blue-400/20">
            <TrendingUp className="w-3 h-3" />
            The Ultimate Rental Marketplace
          </div>
          <h1 className="text-5xl lg:text-8xl font-black mb-8 tracking-tighter text-white leading-tight">
            Rent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">Anything.</span> <br /> 
            Anywhere.
          </h1>
          <p className="text-lg lg:text-2xl mb-12 text-slate-400 max-w-3xl mx-auto leading-relaxed">
            From professional gear and mountain bikes to luxury stays. 
            Connect directly with owners and access what you need, exactly when you need it.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={() => navigate('/browse')}
              className="group flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 active:scale-95"
            >
              Explore Catalog
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/add-property')}
              className="group flex items-center justify-center gap-3 bg-white/5 backdrop-blur-lg text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all border border-white/10 active:scale-95"
            >
              <Plus className="w-6 h-6 text-blue-400" />
              List an Item
            </button>
          </div>
        </div>
      </section>

      {/* --- CATEGORY QUICK-LINKS --- */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredCategories.map((cat, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/browse')}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className={`${cat.color} p-3 rounded-xl text-white shadow-lg`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-slate-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-4">
              Your journey in <span className="text-blue-600">3 simple steps</span>
            </h2>
            <p className="text-slate-500 text-lg">Getting what you need has never been this effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-slate-100 -z-10" />

            <div className="group text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200 group-hover:-translate-y-2 transition-transform duration-300">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">01. Discover</h3>
              <p className="text-slate-500 leading-relaxed px-4">
                Browse thousands of verified listings—from cameras to apartments—right in your neighborhood.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 group-hover:-translate-y-2 transition-transform duration-300">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">02. Connect</h3>
              <p className="text-slate-500 leading-relaxed px-4">
                Chat directly with owners. Confirm availability, ask questions, and finalize the deal in seconds.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200 group-hover:-translate-y-2 transition-transform duration-300">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">03. Enjoy</h3>
              <p className="text-slate-500 leading-relaxed px-4">
                Pick up your item, use it for as long as you need, and return it safely. No long-term debt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PASSIVE INCOME SECTION --- */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[3.5rem] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="lg:w-1/2 relative z-10">
              <div className="inline-block px-4 py-1.5 mb-6 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest">
                Monetize your assets
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Turn your idle items into <span className="text-blue-400">passive income.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                That camera in your drawer or the extra space in your garage could be earning you money right now. List it on RentSpace and join the sharing economy.
              </p>
              <button 
                onClick={() => navigate('/add-property')}
                className="group bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
              >
                Start Earning Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4 relative z-10">
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-8">
                  <Camera className="text-blue-400 mb-4 w-8 h-8" />
                  <p className="text-white font-bold">Photography</p>
                  <p className="text-slate-500 text-xs italic">Earn up to ₹5k/mo</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                  <Bike className="text-emerald-400 mb-4 w-8 h-8" />
                  <p className="text-white font-bold">Mobility</p>
                  <p className="text-slate-500 text-xs italic">Earn up to ₹8k/mo</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                  <HomeIcon className="text-purple-400 mb-4 w-8 h-8" />
                  <p className="text-white font-bold">Spaces</p>
                  <p className="text-slate-500 text-xs italic">Earn up to ₹25k/mo</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-blue-500/30">
                  <Zap className="text-yellow-400 mb-4 w-8 h-8" />
                  <p className="text-white font-bold">And more...</p>
                  <p className="text-slate-500 text-xs italic">Infinite potential</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="text-3xl font-black italic text-slate-900 mb-6">RENT<span className="text-blue-600">SPACE</span></div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Empowering communities to share resources, reduce waste, and save money through seamless peer-to-peer rentals.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6">Marketplace</h5>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li className="hover:text-blue-600 cursor-pointer">How it Works</li>
                <li className="hover:text-blue-600 cursor-pointer">Safety & Insurance</li>
                <li className="hover:text-blue-600 cursor-pointer">Community Rules</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6">Support</h5>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li className="hover:text-blue-600 cursor-pointer">Help Center</li>
                <li className="hover:text-blue-600 cursor-pointer">Contact Us</li>
                <li className="hover:text-blue-600 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center text-slate-400 text-xs font-medium">
            © 2026 RentSpace Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}