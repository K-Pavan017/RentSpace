import React from 'react';
import Navbar from '../components/Navbar';
import { Search, Package, CheckCircle, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Find what you need",
      description: "Browse our extensive catalog of properties, electronics, gear, and more. Use our smart filters to find the perfect item in your local area.",
      icon: <Search className="w-8 h-8" />,
      color: "bg-blue-600",
      lightColor: "bg-blue-50"
    },
    {
      title: "Connect & Book",
      description: "Chat directly with the owner to discuss details, check availability, and agree on terms. Once ready, book the item securely through our platform.",
      icon: <Package className="w-8 h-8" />,
      color: "bg-indigo-600",
      lightColor: "bg-indigo-50"
    },
    {
      title: "Rent & Enjoy",
      description: "Pick up your item or have it delivered. Use it for as long as you need, then return it to the owner. It's that simple!",
      icon: <CheckCircle className="w-8 h-8" />,
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-slate-900 py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-tight">
            Rent Anything. <br />
            <span className="text-blue-500">Zero Hassle.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            RentSpace is a community-driven marketplace that makes sharing resources easy, safe, and rewarding for everyone.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full border-t-2 border-dashed border-slate-100 -translate-x-10" />
                )}
                <div className={`${step.lightColor} w-20 h-20 rounded-3xl flex items-center justify-center ${step.color.replace('bg-', 'text-')} mb-8 shadow-sm`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">0{index + 1}. {step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Built on <span className="text-blue-600">trust & safety</span></h2>
            <p className="text-slate-500 text-lg">Your peace of mind is our top priority.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-xl mb-4">Verified Users</h4>
              <p className="text-slate-500 leading-relaxed">Every member of our community undergoes a verification process to ensure a safe environment for all.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
                <Zap size={24} />
              </div>
              <h4 className="font-bold text-xl mb-4">Instant Communication</h4>
              <p className="text-slate-500 leading-relaxed">Our real-time chat system allows you to connect with owners instantly and negotiate terms directly.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                <Users size={24} />
              </div>
              <h4 className="font-bold text-xl mb-4">Community Driven</h4>
              <p className="text-slate-500 leading-relaxed">Built by people, for people. We rely on honest reviews and community standards to keep the quality high.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
          <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/20 blur-[80px] rounded-full translate-x-1/2" />
          <h2 className="text-4xl lg:text-6xl font-black mb-8 relative z-10">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-12 relative z-10 max-w-2xl mx-auto">Join thousands of people who are already sharing resources and saving money with RentSpace.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/browse')}
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              Start Browsing <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/add-property')}
              className="bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-800 transition-all border border-blue-500/30 active:scale-95"
            >
              List an Item
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
