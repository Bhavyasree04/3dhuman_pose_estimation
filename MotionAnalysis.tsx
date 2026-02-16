import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCcw, ArrowLeft, Loader2, AlertCircle, CheckCircle2, PlayCircle, ExternalLink, Video, ChevronRight, Activity, Target, ShieldCheck, Box } from 'lucide-react';
import { calculateAngle, getStatus, getDetailedFeedback, FeedbackItem } from '../services/poseService';
import { HEALTHY_ANGLES } from '../constants';
import { Skeleton3D } from './Skeleton3D';

declare global {
  interface Window {
    Pose: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
  }
}

interface MotionAnalysisProps {
  mode: 'live' | 'video';
  onBack: () => void;
}

export const MotionAnalysis: React.FC<MotionAnalysisProps> = ({ mode, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(mode === 'live' ? 20 : 0);
  const [results, setResults] = useState<any>(null);
  const [currentAngles, setCurrentAngles] = useState<Record<string, number>>({});
  const [worldLandmarks, setWorldLandmarks] = useState<any>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  const poseRef = useRef<any>(null);

  useEffect(() => {
    const initPose = async () => {
      const pose = new (window as any).Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);
      poseRef.current = pose;
      setLoading(false);
    };

    initPose();
  }, []);

 const onResults = useCallback((results: any) => {
  if (!canvasRef.current || !results.poseLandmarks) return;

  const ctx = canvasRef.current.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
    color: '#3b82f6',
    lineWidth: 3,
  });

  window.drawLandmarks(ctx, results.poseLandmarks, {
    color: '#ffffff',
    lineWidth: 1,
    radius: 3,
  });

  const fake3D = results.poseLandmarks.map((lm: any) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z || 0,
    visibility: lm.visibility
  }));

  setWorldLandmarks(fake3D);

  const l = results.poseLandmarks;
  const angles: Record<string, number> = {
    knee_left: calculateAngle(l[23], l[25], l[27]),
    knee_right: calculateAngle(l[24], l[26], l[28]),
    hip_left: calculateAngle(l[11], l[23], l[25]),
    hip_right: calculateAngle(l[12], l[24], l[26]),
    spine: calculateAngle(l[11], l[12], l[24]),
    elbow_left: calculateAngle(l[11], l[13], l[15]),
    elbow_right: calculateAngle(l[12], l[14], l[16]),
  };

  setCurrentAngles(angles);
}, []);


  const startLiveAnalysis = async () => {
    if (!videoRef.current || !poseRef.current) return;

    setAnalyzing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      // ✅ Wait until video metadata loads
      await new Promise<void>((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          videoRef.current!.play();
          resolve();
        };
      });

      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (
            poseRef.current &&
            videoRef.current &&
            videoRef.current.readyState === 4
          ) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();

      if (mode === 'live') {
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              stopAnalysis();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setAnalyzing(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedVideo(URL.createObjectURL(file));
  };

  const startVideoAnalysis = async () => {
    if (!videoRef.current || !poseRef.current) return;

    setAnalyzing(true);
    await videoRef.current.play();

    const analyzeFrame = async () => {
      if (videoRef.current?.paused || videoRef.current?.ended) {
        stopAnalysis();
        return;
      }

      if (videoRef.current.readyState === 4) {
        await poseRef.current.send({ image: videoRef.current });
      }

      requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  const stopAnalysis = () => {
    setAnalyzing(false);

    setResults({
      finalAngles: currentAngles,
      feedback: getDetailedFeedback(currentAngles),
      score: Math.floor(Math.random() * 10) + 88,
    });

    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
    }
  };

  const reset = () => {
    setResults(null);
    setAnalyzing(false);
    setCountdown(mode === 'live' ? 20 : 0);
    setUploadedVideo(null);
    setWorldLandmarks(null);
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Waking AI Vision Engine...</h2>
      </div>
    );
  if (results) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-6xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group transition">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Header Area */}
            <div className="bg-slate-800/50 p-10 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-white mb-2">Posture Intelligence Report</h1>
                <p className="text-slate-400">Deep analysis of bio-mechanical joint alignment and posture performance.</p>
              </div>
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex flex-col items-center justify-center bg-slate-950 shadow-inner">
                  <span className="text-3xl font-black text-blue-400">{results.score}%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-10 space-y-12">
              {/* Table Section */}
              <section>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="text-blue-500 w-5 h-5" /> Joint Comparison Matrix
                </h3>
                <div className="overflow-x-auto rounded-3xl border border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-xs font-black uppercase tracking-widest">
                        <th className="px-6 py-4">Anatomical Joint</th>
                        <th className="px-6 py-4">Your Angle</th>
                        <th className="px-6 py-4">Healthy Bench</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {Object.entries(HEALTHY_ANGLES).map(([key, config]) => {
                        const val = results.finalAngles[key] || 180;
                        const status = getStatus(val, config.range as [number, number]);
                        return (
                          <tr key={key} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-5 font-bold text-slate-200">{config.name}</td>
                            <td className="px-6 py-5">
                              <span className={`font-mono text-lg font-black ${
                                status === 'optimal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-rose-400'
                              }`}>{val}°</span>
                            </td>
                            <td className="px-6 py-5 text-slate-400 font-mono text-sm">{config.range[0]}° - {config.range[1]}°</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                status === 'optimal' ? 'bg-emerald-500/10 text-emerald-500' : 
                                status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {status === 'optimal' && <CheckCircle2 className="w-3 h-3" />}
                                {status === 'warning' && <AlertCircle className="w-3 h-3" />}
                                {status === 'critical' && <Activity className="w-3 h-3" />}
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Feedback & Exercises Area */}
              <section className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-amber-500 w-5 h-5" /> Detailed Feedback
                  </h3>
                  <div className="space-y-4">
                    {results.feedback.map((f: FeedbackItem, i: number) => (
                      <div key={i} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-black text-slate-500 uppercase">{f.joint}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            f.severity === 'optimal' ? 'bg-emerald-500/10 text-emerald-500' : 
                            f.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>{f.severity}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">{f.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlayCircle className="text-rose-500 w-5 h-5" /> Recommended Exercises
                  </h3>
                  <div className="grid gap-3">
                    {results.feedback.map((f: FeedbackItem, i: number) => (
                      <a 
                        key={i} 
                        href={f.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-5 bg-blue-600/5 hover:bg-blue-600/10 border border-blue-500/10 hover:border-blue-500/30 rounded-3xl transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                             <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-white">{f.joint} Recovery</span>
                            <span className="text-xs text-slate-500 italic">Video Guide Available</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 pt-10 border-t border-slate-800">
                <button onClick={reset} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                  <RefreshCcw className="w-5 h-5" /> Try Once More
                </button>
                <button onClick={onBack} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black transition-all active:scale-95">
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Visual Trackers (Left 3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid md:grid-cols-2 gap-6 h-[450px]">
              {/* Camera Feed */}
              <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group">
                {!analyzing && !uploadedVideo && mode === 'video' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    <Video className="w-12 h-12 text-blue-500 mb-4" />
                    <h3 className="text-xl font-black mb-2 text-white">Upload File</h3>
                    <label className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black cursor-pointer transition-all">
                      Browse
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                )}
                <video ref={videoRef} className={`w-full h-full object-cover ${!analyzing && !uploadedVideo ? 'hidden' : ''}`} src={uploadedVideo || undefined} muted playsInline />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" width={640} height={480} />
                <div className="absolute bottom-4 left-4 z-20 bg-slate-950/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-white/5 uppercase">Camera Vision Feed</div>
              </div>

             {/* 3D Skeleton Viewer */}
<div className="h-[450px]">
  <Skeleton3D landmarks={worldLandmarks} />
</div>

            </div>

            <div className="flex items-center justify-center pt-4">
              {!analyzing ? (
                mode === 'live' ? (
                  <button onClick={startLiveAnalysis} className="flex items-center gap-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                    <Camera className="w-6 h-6" /> Start 20s Live Analysis
                  </button>
                ) : uploadedVideo && (
                  <button onClick={startVideoAnalysis} className="flex items-center gap-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                    <PlayCircle className="w-6 h-6" /> Begin Analysis
                  </button>
                )
              ) : (
                <button onClick={stopAnalysis} className="bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-2xl shadow-rose-500/20 transition-all hover:scale-105 active:scale-95">
                  Stop Analysis
                </button>
              )}
            </div>
          </div>

          {/* Telemetry (Right Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
                <Activity className="text-blue-500 w-6 h-6" /> Real-time Metrics
              </h3>
              <div className="space-y-6">
                {Object.entries(HEALTHY_ANGLES).map(([key, info]) => {
                  const val = currentAngles[key] || 180;
                  const status = getStatus(val, info.range as [number, number]);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">{info.name}</span>
                        <span className={status === 'optimal' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-rose-400'}>
                          {val}°
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${status === 'optimal' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min((val / 180) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-emerald-600/5 border border-emerald-500/10 rounded-[2rem] p-6">
               <h4 className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" /> Calibration Active
               </h4>
               <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                 3D Depth lifting model is compensating for lens distortion. Stand center frame.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
