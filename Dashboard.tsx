import React, { useState, useRef, useEffect } from 'react';
import { APPLICATIONS, HEALTHY_ANGLES } from '../constants';
import { 
  PlayCircle, Camera, LogOut, BookOpen, 
  LayoutDashboard, Target, MessageSquare, 
  Send, X, Sparkles, Loader2, Bot, User, Download
} from 'lucide-react';
import Groq from "groq-sdk";
import { HfInference } from '@huggingface/inference';

// --- CONFIGURATION ---
// Note: In a production app, use process.env.REACT_APP_GROQ_KEY
const GROQ_API_KEY = "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"; 
const HF_TOKEN = "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";

const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
const hf = new HfInference(HF_TOKEN);

interface DashboardProps {
  username: string;
  onNavigate: (state: any) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ username, onNavigate, onLogout }) => {
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey ${username}! I'm your Pose AI. Ask me anything about joint health, or tell me to generate any images u want!`, isImage: false }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isChatOpen) scrollToBottom(); }, [messages, isChatOpen]);

  // --- AI Logic ---
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userQuery, isImage: false }]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. IMAGE GENERATION (Hugging Face)
      if (userQuery.toLowerCase().match(/image|generate|draw|picture|create a pic/)) {
        const result = await hf.textToImage({
          model: 'black-forest-labs/FLUX.1-schnell',
          inputs: userQuery,
        });

        // FIXED: The 'instanceof Blob' check prevents the URL error
        if (result instanceof Blob) {
          const imageUrl = URL.createObjectURL(result);
          setMessages(prev => [...prev, { role: 'assistant', content: imageUrl, isImage: true }]);
        } else {
          throw new Error("API returned an invalid format.");
        }
      } 
      // 2. CHAT LOGIC (Groq - Llama 3.3)
      else {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a witty, genius AI assistant for a 3D Human Joint Posture dashboard. You give expert health advice and technical insight." },
            { role: "user", content: userQuery }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || "I'm processing... try again!";
        setMessages(prev => [...prev, { role: 'assistant', content: reply, isImage: false }]);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "API Error! Check your keys or connection.", isImage: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#A7B59E] text-[#35522B] font-sans relative">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#35522B] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#A7B59E] rounded-lg flex items-center justify-center">
            <span className="font-bold text-[#35522B] text-sm">3D</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            Pose<span className="text-[#A7B59E]">Estimation</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden md:block text-white/80 font-bold uppercase text-[10px] tracking-widest">Active System: <span className="text-white ml-2">{username}</span></span>
          <button onClick={onLogout} className="flex items-center gap-2 text-white/70 hover:text-white transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight mb-6">
              3D HUMAN POSTURE <br />
              <span className="text-[#35522B] border-b-4 border-[#35522B]">ESTIMATION</span>
            </h1>
            <p className="text-lg max-w-xl leading-relaxed mb-8 opacity-80">
              Transform standard 2D video into precise 3D anatomical skeletal data for clinical-grade posture analysis.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('live_demo')} className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black bg-[#35522B] text-white hover:scale-105 transition-all shadow-xl">
                <Camera className="w-5 h-5" /> Live Camera
              </button>
              <button onClick={() => onNavigate('video_demo')} className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black bg-transparent border-2 border-[#35522B] hover:bg-[#35522B] hover:text-white transition-all">
                <PlayCircle className="w-5 h-5" /> Video File
              </button>
            </div>
          </div>

          <div className="bg-[#B8C5AE] p-10 rounded-[3rem] shadow-2xl border-2 border-[#35522B] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={120} /></div>
            <h3 className="text-xl font-serif font-black mb-6">System Capabilities</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#35522B] text-white flex items-center justify-center text-xs font-bold">01</div>
                <div className="font-bold text-sm uppercase tracking-wide">33-Point Landmark Mapping</div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#35522B] text-white flex items-center justify-center text-xs font-bold">02</div>
                <div className="font-bold text-sm uppercase tracking-wide">Spatial Depth Interpolation</div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#35522B] text-white flex items-center justify-center text-xs font-bold">03</div>
                <div className="font-bold text-sm uppercase tracking-wide">Real-time Clinical Feedback</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="py-20 px-6 bg-[#96a68b]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-serif font-black mb-12 flex items-center gap-3 uppercase tracking-tighter">Healthy Joint Angles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(HEALTHY_ANGLES).map(([key, data]: any) => (
              <div key={key} className="bg-[#B8C5AE] p-8 rounded-[2rem] border-2 border-[#35522B] shadow-lg transition-transform hover:-translate-y-2">
                <span className="text-[10px] uppercase block mb-2 font-black opacity-40 tracking-[0.2em]">{key}</span>
                <h4 className="text-lg font-black mb-4">{data.name}</h4>
                <div className="bg-[#35522B] text-white p-3 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-60">Optimal</span>
                  <span className="font-mono font-bold">{data.range[0]}° - {data.range[1]}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AI CHATBOT WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[350px] md:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col border-2 border-[#35522B] mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Chat Header */}
            <div className="bg-[#35522B] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#A7B59E] p-2 rounded-xl"><Bot size={20} className="text-[#35522B]" /></div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">AI Engine</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold opacity-60">SYSTEM ONLINE</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-[#35522B]' : 'bg-[#A7B59E]'}`}>
                      {msg.role === 'user' ? <User size={14} className="text-white"/> : <Sparkles size={14} className="text-[#35522B]"/>}
                    </div>
                    <div className={`p-4 rounded-3xl text-[13px] leading-relaxed ${
                      msg.role === 'user' ? 'bg-[#35522B] text-white rounded-tr-none shadow-lg' : 'bg-white text-gray-800 rounded-tl-none border-2 border-gray-100 shadow-sm'
                    }`}>
                      {msg.isImage ? (
                        <div className="space-y-3">
                          <img src={msg.content} alt="AI Gen" className="rounded-2xl w-full border border-gray-100" />
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase opacity-40">Model: FLUX.1 Schnell</span>
                            <a href={msg.content} download="ai_posture_gen.png" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"><Download size={14} /></a>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-3">
                   <div className="w-8 h-8 bg-[#A7B59E] rounded-full flex items-center justify-center animate-bounce">
                     <Loader2 size={14} className="animate-spin text-[#35522B]" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Processing Data...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white border-t">
              <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl items-center ring-2 ring-transparent focus-within:ring-[#35522B] transition-all">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask or generate an image..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-4 font-medium"
                />
                <button onClick={handleSendMessage} disabled={isLoading} className="bg-[#35522B] text-white p-3 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-[#35522B] text-white px-8 py-5 rounded-full shadow-[0_20px_50px_rgba(53,82,43,0.3)] hover:scale-105 transition-all flex items-center gap-4 border-2 border-[#A7B59E] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          {isChatOpen ? <X size={28}/> : <><MessageSquare size={28} className="animate-pulse"/><span className="font-black tracking-widest text-sm">AI ASSISTANT</span></>}
        </button>
      </div>

    </div>
  );
};