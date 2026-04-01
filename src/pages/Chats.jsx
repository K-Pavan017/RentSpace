import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MessageSquare, User, ArrowRight, Clock } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Chats() {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort manually to avoid needing a composite index in Firestore
      const sortedData = data.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setChats(sortedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 text-white rounded-3xl shadow-lg shadow-blue-200">
            <MessageSquare size={28} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Messages</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : chats.length > 0 ? (
          <div className="grid gap-4">
            {chats.map(chat => {
              const otherParticipant = chat.participantNames?.[chat.participants.find(p => p !== user.uid)] || "User";
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <User size={30} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">{otherParticipant}</h3>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                        Regarding: {chat.itemTitle}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-slate-400 line-clamp-1 italic">"{chat.lastMessage}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight size={20} />
                    </div>
                    {chat.updatedAt && (
                        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                            <Clock size={10} /> {new Date(chat.updatedAt.seconds * 1000).toLocaleDateString()}
                        </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={40} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">No messages yet</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Start a conversation from the browse page to chat with item owners.</p>
            <button 
              onClick={() => navigate('/browse')}
              className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              Browse Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
