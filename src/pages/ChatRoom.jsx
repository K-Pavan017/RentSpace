import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { 
  doc, onSnapshot, updateDoc, collection, addDoc, 
  serverTimestamp, getDoc 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import { 
  Send, User, Clock, ArrowLeft, Package, 
  CheckCircle, Calendar, ShieldCheck, AlertCircle 
} from 'lucide-react';

export default function ChatRoom() {
  const { roomId } = useParams();
  const [user] = useAuthState(auth);
  const socket = useSocket();
  const navigate = useNavigate();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [bookingProposal, setBookingProposal] = useState(null);
  const scrollRef = useRef();

  // Fetch Chat Meta and History from Firestore (Initial Load and Global Sync)
  useEffect(() => {
    if (!roomId || !user) return;

    const chatRef = doc(db, 'chats', roomId);
    const unsubscribe = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        setChatData(snap.data());
      }
    });

    // Also fetch historical messages from Firestore (for session continuity)
    const msgRef = collection(db, 'chats', roomId, 'messages');
    const unsubscribeMsgs = onSnapshot(msgRef, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds));
    });

    return () => { unsubscribe(); unsubscribeMsgs(); };
  }, [roomId, user]);

  // WebSocket Integration (Live Messaging)
  useEffect(() => {
    if (!socket || !user || !roomId) return;

    socket.emit('join_room', { roomId, userId: user.uid });

    socket.on('receive_message', (data) => {
      // Since we already use Firestore onSnapshot, we only use WebSockets for "typing" or "ephemeral" events
      // OR we can append the live message here if we want absolute instant feel before Firestore syncs
    });

    socket.on('receive_booking_proposal', (data) => {
      setBookingProposal(data);
    });

    socket.on('booking_finalized', async (data) => {
      // Update local state and show celebratory UI
      // Important: The actual DB update happens via the "Accept" click below
    });

    return () => {
      socket.off('receive_message');
      socket.off('receive_booking_proposal');
      socket.off('booking_finalized');
    };
  }, [socket, user, roomId]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const msgData = {
      senderId: user.uid,
      text: input,
      timestamp: serverTimestamp(),
    };

    // 1. Log to Firestore (Persistent History)
    await addDoc(collection(db, 'chats', roomId, 'messages'), msgData);
    
    // 2. Update Chat Meta (Last Message)
    await updateDoc(doc(db, 'chats', roomId), {
      lastMessage: input,
      updatedAt: serverTimestamp()
    });

    // 3. Emit via WebSockets (Live Relay)
    socket.emit('send_message', { roomId, ...msgData, text: input });

    setInput('');
  };

  const sendProposal = () => {
    const duration = prompt("Enter rental duration (days):", "3");
    if (!duration) return;

    const data = {
      roomId,
      itemId: chatData.itemId,
      ownerId: user.uid,
      tenantId: chatData.participants.find(p => p !== user.uid),
      duration,
      price: chatData.itemPrice
    };

    socket.emit('send_booking_proposal', data);
    
    // Also log as a system message in Firestore
    addDoc(collection(db, 'chats', roomId, 'messages'), {
      senderId: 'system',
      text: `OWNER PROPOSAL: Rent for ${duration} days.`,
      timestamp: serverTimestamp(),
      type: 'proposal'
    });
  };

  const acceptBooking = async () => {
    if (!bookingProposal) return;
    
    try {
        const { itemId, duration } = bookingProposal;
        const bookedUntilDate = new Date();
        bookedUntilDate.setDate(bookedUntilDate.getDate() + parseInt(duration));

        // Update Global Listing status in Firestore
        await updateDoc(doc(db, 'listings', itemId), {
            isBooked: true,
            bookedUntil: bookedUntilDate,
            bookedBy: user.uid
        });

        socket.emit('confirm_booking', { ...bookingProposal, status: 'confirmed' });
        
        alert("Booking Confirmed! The item is now listed as booked.");
        setBookingProposal(null);
    } catch (err) {
        console.error(err);
        alert("Failed to confirm booking.");
    }
  };

  if (!chatData) return <div className="flex justify-center py-20 animate-pulse">Connecting...</div>;

  const isOwner = chatData.ownerUid === user.uid;
  const otherParty = chatData.participantNames?.[chatData.participants.find(p => p !== user.uid)] || "Dealer";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/chats')} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold">
              {otherParty[0]}
            </div>
            <div>
              <h2 className="font-bold text-slate-900">{otherParty}</h2>
              <p className="text-[10px] uppercase font-black text-blue-600 tracking-tighter">Regarding: {chatData.itemTitle}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isOwner && (
            <button 
              onClick={sendProposal}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <Package size={14} /> SEND PROPOSAL
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user.uid;
          const isSystem = msg.senderId === 'system';

          if (isSystem) {
             return (
               <div key={idx} className="flex justify-center my-4">
                 <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2">
                   <ShieldCheck size={12}/> {msg.text}
                 </div>
               </div>
             );
          }

          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-4 rounded-3xl ${
                isMe 
                ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <div className={`text-[9px] mt-2 font-bold opacity-60 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                   {isMe && <CheckCircle size={8} />}
                   {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Proposal Overlay */}
      {bookingProposal && (
        <div className="p-6 bg-emerald-50 border-t border-emerald-100 animate-in slide-in-from-bottom-5 duration-300">
           <div className="max-w-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Calendar size={24} />
                 </div>
                 <div>
                    <h4 className="font-black text-emerald-900 uppercase text-xs tracking-widest flex items-center gap-2">
                        Booking Proposal Received <Zap size={10} className="fill-current"/>
                    </h4>
                    <p className="text-sm text-emerald-700 font-bold">Owner is offering {bookingProposal.duration} days for this item.</p>
                 </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <button onClick={() => setBookingProposal(null)} className="px-6 py-3 bg-white text-emerald-600 border border-emerald-200 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-colors">DECLINE</button>
                 {!isOwner && (
                    <button onClick={acceptBooking} className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all">
                        ACCEPT & CONFIRM BOOKING
                    </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white p-6 border-t border-slate-200">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-4">
          <input 
            type="text" 
            placeholder="Write your message..." 
            className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
