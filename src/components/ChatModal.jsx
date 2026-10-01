import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Phone, 
  Video, 
  Sparkles, 
  Gift, 
  Smile, 
  CheckCheck,
  CreditCard,
  Flame,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ChatModal({ match, onClose }) {
  if (!match) return null;

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'them',
      text: match.lastMessage || "Hey! Nice to connect with another Ghanaian here. How's your week going?",
      time: '12:04 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [momoSuccess, setMomoSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (textToSend) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate smart Ghanaian reply after 1.5 seconds
    setTimeout(() => {
      let replyText = "Ah charlie! You have jokes! Are we doing Buka restaurant in Osu or are you taking me to a quiet spot?";
      if (content.toLowerCase().includes('kelewele') || content.toLowerCase().includes('food')) {
        replyText = "Say no more! If the kelewele has extra ginger and roasted groundnuts, I am already on my way.";
      } else if (content.toLowerCase().includes('december') || content.toLowerCase().includes('detty')) {
        replyText = "Charlie December in Accra is madness! We definitely have to do Afrochella or Polo Beach club together.";
      } else if (content.toLowerCase().includes('momo')) {
        replyText = "Ei! You are spoiling me already! MTN MoMo received with pure gratitude haha! 💛";
      }

      setMessages(prev => [
        ...prev, 
        {
          id: Date.now() + 1,
          sender: 'them',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const handleSendMomo = (amount, label) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setMomoSuccess(true);
    setTimeout(() => {
      setShowMomoModal(false);
      setMomoSuccess(false);
      handleSendMessage(`🎁 Sent MoMo Gift: GHS ${amount} for ${label}!`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md h-[92vh] bg-[#11141c] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        
        {/* Chat Header */}
        <div className="p-3.5 border-b border-white/10 glass-panel flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-400/40">
              <img src={match.photo} alt={match.name} className="w-full h-full object-cover" />
              {match.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#11141c]" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{match.name}</span>
                <span className="text-[10px] font-normal text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                  {match.hometown}
                </span>
              </h3>
              <p className="text-[10px] text-emerald-400 font-medium">
                {match.online ? 'Online now' : 'Active today'}
              </p>
            </div>
          </div>

          {/* Quick Action: MoMo Gift Trigger */}
          <button 
            onClick={() => setShowMomoModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
            title="Send MoMo Kelewele / Drinks gift"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>MoMo Gift</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* Ghanaian Date Safety & Culture Notice */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <p className="text-[10px] text-slate-400">
              🇬🇭 Behind The Scenes Verified Connection • Both profiles shared candid moments.
            </p>
          </div>

          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'me' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-br-none shadow-md shadow-amber-500/10'
                    : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
                <span>{msg.time}</span>
                {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Cultural Icebreaker Chips */}
        <div className="px-3 py-1.5 overflow-x-auto flex gap-1.5 scrollbar-none border-t border-white/5 bg-black/20">
          <button 
            onClick={() => handleSendMessage("Are we having jollof or waakye on our first date? 🍛")}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            🍛 Jollof or Waakye?
          </button>
          <button 
            onClick={() => handleSendMessage("What's your Detty December plan this year? 🇬🇭")}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            🎉 Detty December vibes?
          </button>
          <button 
            onClick={() => handleSendMessage("Your voice note cracked me up! Tell me more about your hometown.")}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            🎙️ Loved the voice note!
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 glass-panel flex items-center gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${match.name}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />

          <button 
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black transition-all shadow-md shadow-amber-400/20"
          >
            <Send className="w-4 h-4 fill-black" />
          </button>
        </div>

        {/* MoMo Gift Modal (Paystack / Mobile Money Integration Preview) */}
        {showMomoModal && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center animate-in fade-in">
            <div className="bg-[#181c27] p-5 rounded-3xl border border-amber-400/40 shadow-2xl space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-2 text-amber-400">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Send MoMo Date Gesture</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send a friendly icebreaker treat via MTN MoMo / Telecel Cash
                </p>
              </div>

              {momoSuccess ? (
                <div className="py-6 text-center text-emerald-400 font-bold text-sm animate-bounce">
                  ✨ MoMo Sent Successfully!
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={() => handleSendMomo(35, "Spicy Kelewele + Peanuts")}
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400 text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">🍌 Spicy Kelewele Treat</div>
                      <span className="text-[10px] text-slate-400">Night roadside sweet plantain</span>
                    </div>
                    <span className="text-xs font-black text-amber-400">GHS 35</span>
                  </button>

                  <button 
                    onClick={() => handleSendMomo(50, "Sobolo / Fresh Palm Wine Drinks")}
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400 text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">🍹 Sobolo & Chilled Drinks</div>
                      <span className="text-[10px] text-slate-400">Ginger-infused iced sobolo</span>
                    </div>
                    <span className="text-xs font-black text-amber-400">GHS 50</span>
                  </button>

                  <button 
                    onClick={() => handleSendMomo(120, "Waakye Special with all the works")}
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400 text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">🍛 The Full Waakye Platter</div>
                      <span className="text-[10px] text-slate-400">Fish, wele, egg, shito, spaghetti</span>
                    </div>
                    <span className="text-xs font-black text-amber-400">GHS 120</span>
                  </button>
                </div>
              )}

              <button 
                onClick={() => setShowMomoModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
