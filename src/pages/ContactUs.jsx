import React from 'react';
import Navbar from '../components/Navbar';
import { Mail, Phone, MessageSquare, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-tight">
              We're here to <span className="text-blue-600">help.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed">
              Have questions about a rental, need help with your account, or just want to say hello? Our team is ready to assist you.
            </p>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Email Support</h4>
                  <p className="text-slate-500 mb-2">Typically responds within 2 hours</p>
                  <a href="mailto:support@rentspace.com" className="text-blue-600 font-bold hover:underline">support@rentspace.com</a>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Live Chat</h4>
                  <p className="text-slate-500 mb-2">Available 24/7 for urgent matters</p>
                  <button className="text-emerald-600 font-bold hover:underline">Start a conversation</button>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Call Us</h4>
                  <p className="text-slate-500 mb-2">Mon-Fri from 9am to 6pm</p>
                  <a href="tel:+917993242204" className="text-indigo-600 font-bold hover:underline">+91 7993242204</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
            
            <h3 className="text-3xl font-black mb-8 relative z-10">Send a message</h3>
            <form className="space-y-6 relative z-10">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">First Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">Last Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Email Address</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-colors" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">Message</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition-colors h-40" placeholder="How can we help you?" />
              </div>
              <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
