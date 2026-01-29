import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'

import { 
  ArrowLeft, ChevronDown, ChevronUp, HelpCircle, 
  MessageCircle, ShieldCheck, Info, Zap 
} from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I approach an item owner?",
      answer: "Once you find an item you like, click 'See Full Details' to reveal the owner's contact information. You can call them directly or use the 'Contact Us' button in the menu to reach our support team for mediation.",
      icon: <MessageCircle className="text-blue-500" size={20} />
    },
    {
      question: "Is there a security deposit involved?",
      answer: "Security deposits are handled directly between the owner and the renter. We recommend discussing this before the exchange. Usually, owners ask for a small refundable amount or a valid ID proof.",
      icon: <ShieldCheck className="text-emerald-500" size={20} />
    },
    {
      question: "What are the benefits of listing my items?",
      answer: "Listing items allows you to earn passive income from things sitting idle in your home (like cameras, tents, or tools). It's eco-friendly, helps your local community, and keeps your belongings in active use.",
      icon: <Zap className="text-amber-500" size={20} />
    },
    {
      question: "What service details should I look for?",
      answer: "Always check the 'Price per Day', 'Location', and 'Description' fields. The description often contains specific rules about how to use the item and whether delivery is available.",
      icon: <Info className="text-purple-500" size={20} />
    },
    {
      question: "Can I cancel a rental request?",
      answer: "Since payments and bookings are currently handled directly between users, you should call the owner as soon as possible if your plans change to maintain a good reputation in the community.",
      icon: <HelpCircle className="text-red-500" size={20} />
    },
    {
      question: "What if the item is damaged during use?",
      answer: "We advise both parties to inspect the item together at the time of pickup and return. Any damages should be settled according to the agreement made between the owner and the renter.",
      icon: <ShieldCheck className="text-orange-500" size={20} />
    },
    {
      question: "How do I ensure my listing gets more views?",
      answer: "Use clear, high-quality photos and write a detailed description. Mention the exact brand or model, and ensure your price is competitive within your district.",
      icon: <Zap className="text-blue-400" size={20} />
    },
    {
      question: "Is my personal data safe?",
      answer: "We only display your mobile number and general location to registered users to facilitate the rental process. Your exact coordinates are never shown publicly.",
      icon: <ShieldCheck className="text-indigo-500" size={20} />
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-6">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 flex items-center gap-3">
            Help Center <HelpCircle className="text-blue-600" size={32} />
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Everything you need to know about using the Rent Space platform.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                openIndex === index ? 'border-blue-500 shadow-xl shadow-blue-50' : 'border-slate-200'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    {faq.icon}
                  </div>
                  <span className="font-bold text-slate-800 text-lg leading-tight">
                    {faq.question}
                  </span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-blue-600" size={24} />
                ) : (
                  <ChevronDown className="text-slate-400" size={24} />
                )}
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-8 ml-16 text-slate-600 font-medium leading-relaxed border-t border-slate-50 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Contact */}
        <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-8 text-center">
          <h3 className="text-white text-xl font-black mb-2">Still have questions?</h3>
          <p className="text-slate-400 mb-6 font-medium">Our team is here to help you 24/7.</p>
          <button 
            onClick={() => window.open('https://wa.me/917993242204', '_blank')}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
          >
            Chat with Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;