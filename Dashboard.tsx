
import React from 'react';
import { FEATURES, APPLICATIONS, HEALTHY_ANGLES } from '../constants';
// Add Target to the imports from lucide-react
import { PlayCircle, Camera, LogOut, Info, ArrowRight, ExternalLink, BookOpen, LayoutDashboard, BrainCircuit, Activity, Target } from 'lucide-react';

interface DashboardProps {
  username: string;
  onNavigate: (state: any) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ username, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">3D</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Pose<span className="text-blue-500">Estimation</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden md:block text-slate-400">User: <span className="text-slate-100 font-medium">{username}</span></span>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-6 border-b border-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              {/* <BrainCircuit className="w-4 h-4" /> */}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              Smart 3D Human <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Posture Intelligence</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
              3D Human Pose Estimation extracts human body posture and motion information from a single RGB camera video. 
              By detecting 2D body key points using MediaPipe and converting them into 3D skeletal structures, 
              we provide unparalleled depth and movement accuracy for well-being.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate('live_demo')}
                className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20"
              >
                <Camera className="w-5 h-5" />
                Live Camera Demo
              </button>
              <button 
                onClick={() => onNavigate('video_demo')}
                className="group flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-slate-700"
              >
                <PlayCircle className="w-5 h-5" />
                Try Video Demo
              </button>
            </div>
          </div>
          
          <div className="hidden lg:block">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8">
                  <Activity className="text-blue-500/20 w-32 h-32" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">How it works?</h3>
                <div className="space-y-4 text-slate-400">
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <span className="block text-blue-400 font-bold mb-1">2D Landmark Detection</span>
                    <p className="text-sm">This identifies 33 key points on the human body including joints and face.</p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <span className="block text-indigo-400 font-bold mb-1">3D Lifting Model</span>
                    <p className="text-sm">Deep learning inferencing estimates depth (Z-axis) to create 3D skeletal geometry.</p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <span className="block text-emerald-400 font-bold mb-1">Feedback Engine</span>
                    <p className="text-sm">Rule-based analysis compares angles against clinical healthy ranges.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Healthy Human Joint Angles Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Target className="text-emerald-400" />
                Healthy Joint Metrics
              </h2>
              <p className="text-slate-400">Our system benchmarks your performance against clinical standards for joint mobility and postural stability.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(HEALTHY_ANGLES).map(([key, data]) => (
              <div key={key} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group hover:border-emerald-500/30 transition-all">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">{key.replace('_', ' ')}</span>
                <h4 className="text-lg font-bold text-slate-100 mb-3">{data.name}</h4>
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl">
                  <span className="text-sm text-slate-400 italic">Target Range</span>
                  <span className="text-emerald-400 font-mono font-black">{data.range[0]}° - {data.range[1]}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human Body Skeleton Explanation */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="text-blue-400" />
                Skeletal Reconstruction Explained
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Unlike 2D methods that only see "up/down" and "left/right", 3D Human Pose Estimation uses depth-sensing algorithms to understand the "forward/backward" component of motion.
              </p>
            </div>
            
            <div className="grid gap-4">
              {[
                { title: "Point Topology", desc: "We track 33 landmarks mapping the head, torso, and limbs." },
                { title: "Kinetic Chains", desc: "Joints are linked to form a rigid skeletal tree structure." },
                { title: "Temporal Smoothing", desc: "Filters out sensor noise to ensure smooth angle calculations." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-slate-900/50 border border-slate-800 rounded-3xl">
                   <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <span className="text-blue-400 font-bold">{i+1}</span>
                   </div>
                   <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-square max-w-md mx-auto">
             <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full"></div>
             <div className="relative z-10 p-8 border border-slate-800 rounded-[50px] bg-slate-900 h-full flex items-center justify-center text-center">
                <div className="space-y-4">
                   <LayoutDashboard className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-50" />
                   <h3 className="text-2xl font-black text-white">Interactive 3D Space</h3>
                   <p className="text-slate-400 text-sm">Every detected movement is projected into a virtual coordinate system for sub-degree feedback.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Application Domains - TEXT ONLY as requested */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Target Applications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {APPLICATIONS.map((app, i) => (
              <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] hover:bg-slate-800/50 transition-all border-b-4 border-b-transparent hover:border-b-blue-600">
                <div className="mb-6">{app.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{app.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
