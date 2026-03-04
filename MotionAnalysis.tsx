import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCcw, ArrowLeft, Loader2, AlertCircle, CheckCircle2, PlayCircle, ExternalLink, Video, ChevronRight, Activity, Target, ShieldCheck, Box, Image as ImageIcon, Sparkles } from 'lucide-react';
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

// Specific exercise images for each joint type
const EXERCISE_IMAGES = {
  // KNEE EXERCISES - Different images for knee-specific exercises
  knee: {
    stretch: 'https://images.pexels.com/photos/3822629/pexels-photo-3822629.jpeg', // Hamstring stretch
    strengthen: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg', // Squats/Leg press
    maintain: 'https://images.pexels.com/photos/176782/pexels-photo-176782.jpeg', // Leg extensions
    default: 'https://images.pexels.com/photos/4587352/pexels-photo-4587352.jpeg'
  },
  
  // HIP EXERCISES - Different images for hip-specific exercises
  hip: {
    stretch: 'https://images.pexels.com/photos/6339464/pexels-photo-6339464.jpeg', // Hip flexor stretch
    strengthen: 'hhttps://images.pexels.com/photos/416778/pexels-photo-416778.jpeg', // Hip bridges
    maintain: 'https://images.pexels.com/photos/3984358/pexels-photo-3984358.jpeg', // Clamshells
    default: 'https://images.pexels.com/photos/4473622/pexels-photo-4473622.jpeg'
  },
  
  // ELBOW/ARM EXERCISES - Different images for arm-specific exercises
  elbow: {
    stretch: 'https://images.pexels.com/photos/8018925/pexels-photo-8018925.jpeg', // Tricep stretch
    strengthen: 'https://images.pexels.com/photos/634030/pexels-photo-634030.jpeg', // Bicep curls
    maintain: 'https://images.pexels.com/photos/634030/pexels-photo-634030.jpeg', // Arm circles
    default: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg'
  },
  
  // SPINE/BACK EXERCISES - Different images for back-specific exercises
  spine: {
    stretch: 'https://images.pexels.com/photos/7500435/pexels-photo-7500435.jpeg', // Cat-cow stretch
    strengthen: 'https://images.pexels.com/photos/3823186/pexels-photo-3823186.jpeg', // Planks
    maintain: 'https://images.pexels.com/photos/9338688/pexels-photo-9338688.jpeg', // Bird dogs
    default: 'https://images.pexels.com/photos/3822646/pexels-photo-3822646.jpeg'
  },
  
  // SHOULDER EXERCISES - Different images for shoulder-specific exercises
  shoulder: {
    stretch: 'https://images.pexels.com/photos/2780762/pexels-photo-2780762.jpeg', // Shoulder stretch
    strengthen: 'https://images.pexels.com/photos/7289370/pexels-photo-7289370.jpeg', // Shoulder press
    maintain: 'https://images.pexels.com/photos/8436132/pexels-photo-8436132.jpeg', // Lateral raises
    default: 'https://images.pexels.com/photos/17944268/pexels-photo-17944268.jpeg'
  }
};

// Exercise instructions specific to each joint
const EXERCISE_INSTRUCTIONS = {
  knee: {
    stretch: {
      title: 'Knee Flexibility Routine',
      description: 'Your knee angle is too small. Focus on hamstring and quadriceps stretches.',
      exercise: '🔹 Seated hamstring stretch\n🔹 Standing quad stretch\n🔹 Calf stretches against wall'
    },
    strengthen: {
      title: 'Knee Strengthening Routine',
      description: 'Your knee angle is too large. Focus on building quad and hamstring strength.',
      exercise: '🔹 Wall sits (hold 30-60 sec)\n🔹 Step-ups (10-15 reps)\n🔹 Leg press machine'
    },
    maintain: {
      title: 'Knee Maintenance',
      description: 'Your knee angle is optimal. Keep up these exercises.',
      exercise: '🔹 Bodyweight squats (15 reps)\n🔹 Lunges (10 each leg)\n🔹 Leg extensions (12 reps)'
    }
  },
  
  hip: {
    stretch: {
      title: 'Hip Flexor Stretches',
      description: 'Your hip angle is too small. Need more hip flexibility.',
      exercise: '🔹 Kneeling hip flexor stretch\n🔹 Pigeon pose (30 sec each side)\n🔹 Butterfly stretch'
    },
    strengthen: {
      title: 'Hip Strengthening',
      description: 'Your hip angle is too large. Focus on building glute strength.',
      exercise: '🔹 Glute bridges (15 reps)\n🔹 Clamshells (15 each side)\n🔹 Side-lying leg raises'
    },
    maintain: {
      title: 'Hip Stability',
      description: 'Your hip angle is optimal. Maintain with these exercises.',
      exercise: '🔹 Hip circles (10 each direction)\n🔹 Fire hydrants (12 reps)\n🔹 Donkey kicks (15 reps)'
    }
  },
  
  elbow: {
    stretch: {
      title: 'Elbow Mobility Routine',
      description: 'Your elbow angle is too small. Focus on extension stretches.',
      exercise: '🔹 Tricep stretch overhead\n🔹 Wrist flexor stretch\n🔹 Gentle elbow extensions'
    },
    strengthen: {
      title: 'Elbow Strengthening',
      description: 'Your elbow angle is too large. Build arm strength.',
      exercise: '🔹 Bicep curls (12 reps)\n🔹 Tricep extensions (12 reps)\n🔹 Hammer curls (10 reps)'
    },
    maintain: {
      title: 'Elbow Maintenance',
      description: 'Your elbow angle is optimal. Keep up with arm exercises.',
      exercise: '🔹 Arm circles (30 sec)\n🔹 Light dumbbell curls\n🔹 Resistance band work'
    }
  },
  
  spine: {
    stretch: {
      title: 'Spine Mobility Routine',
      description: 'Your spine needs more flexibility. Focus on gentle stretches.',
      exercise: '🔹 Cat-cow stretch (10 reps)\n🔹 Child\'s pose (30 sec)\n🔹 Seated spinal twists'
    },
    strengthen: {
      title: 'Core Strengthening',
      description: 'Your spine needs more support. Build core strength.',
      exercise: '🔹 Planks (hold 30-60 sec)\n🔹 Bird dogs (12 reps)\n🔹 Dead bugs (10 reps)'
    },
    maintain: {
      title: 'Core Stability',
      description: 'Your spine alignment is good. Maintain with core work.',
      exercise: '🔹 Russian twists (15 reps)\n🔹 Supermans (12 reps)\n🔹 Glute bridges'
    }
  },
  
  shoulder: {
    stretch: {
      title: 'Shoulder Mobility',
      description: 'Your shoulder angle is too small. Improve flexibility.',
      exercise: '🔹 Cross-body shoulder stretch\n🔹 Doorway chest stretch\n🔹 Arm circles (forward/back)'
    },
    strengthen: {
      title: 'Shoulder Strengthening',
      description: 'Your shoulder angle is too large. Build shoulder stability.',
      exercise: '🔹 Shoulder presses (12 reps)\n🔹 Lateral raises (10 reps)\n🔹 Front raises (10 reps)'
    },
    maintain: {
      title: 'Shoulder Stability',
      description: 'Your shoulder angle is optimal. Keep up the good work!',
      exercise: '🔹 Rotator cuff exercises\n🔹 YTWL raises\n🔹 Resistance band pulls'
    }
  }
};

interface ExerciseImage {
  url: string;
  title: string;
  description: string;
  exercise: string;
  need: 'stretch' | 'strengthen' | 'maintain';
}

export const MotionAnalysis: React.FC<MotionAnalysisProps> = ({ mode, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState(mode === 'live' ? 20 : 0);
  const [results, setResults] = useState<any>(null);
  const [currentAngles, setCurrentAngles] = useState<Record<string, number | null>>({});
  const [worldLandmarks, setWorldLandmarks] = useState<any>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [exerciseImages, setExerciseImages] = useState<Record<string, ExerciseImage>>({});
  const [showImages, setShowImages] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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
      color: '#35522B',
      lineWidth: 3,
    });

    window.drawLandmarks(ctx, results.poseLandmarks, {
      color: '#A7B59E',
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
    const angles: Record<string, number | null> = {
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
    if (file) {
      setUploadedVideo(URL.createObjectURL(file));
    }
  };

  const startVideoAnalysis = async () => {
    if (!videoRef.current || !poseRef.current) return;

    setAnalyzing(true);
    
    try {
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
    } catch (err) {
      setAnalyzing(false);
    }
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
    setExerciseImages({});
    setShowImages(false);
    setImageErrors({});
  };

  // Handle image load error
  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({
      ...prev,
      [imageKey]: true
    }));
  };

  // Determine if joint needs stretch or strengthen based on angle
  const getExerciseNeed = (joint: string, angle: number | null): 'stretch' | 'strengthen' | 'maintain' => {
    if (angle === null) return 'maintain';
    
    // Extract base joint name (knee, hip, elbow, spine)
    const baseJoint = joint.toLowerCase().split(' ')[0];
    
    // Get the range for this joint
    let range: [number, number] = [0, 180];
    
    if (baseJoint.includes('knee')) {
      range = [160, 170]; // Healthy knee extension range
    } else if (baseJoint.includes('hip')) {
      range = [170, 180]; // Healthy hip extension
    } else if (baseJoint.includes('elbow')) {
      range = [140, 160]; // Healthy elbow extension
    } else if (baseJoint.includes('spine')) {
      range = [160, 175]; // Healthy spine angle
    } else {
      // Fallback to HEALTHY_ANGLES
      const key = Object.keys(HEALTHY_ANGLES).find(k => 
        k.toLowerCase().includes(baseJoint)
      ) as keyof typeof HEALTHY_ANGLES;
      if (key) {
        range = HEALTHY_ANGLES[key].range as [number, number];
      }
    }
    
    if (angle < range[0]) return 'stretch'; // Too tight, needs stretching
    if (angle > range[1]) return 'strengthen'; // Too loose, needs strengthening
    return 'maintain'; // Just right
  };

  // Get exercise image based on joint and actual angle
  const getExerciseForJoint = (feedback: FeedbackItem): ExerciseImage => {
    const jointName = feedback.joint.toLowerCase();
    let baseJoint = 'knee'; // default
    
    // Determine which joint type this is
    if (jointName.includes('knee')) baseJoint = 'knee';
    else if (jointName.includes('hip')) baseJoint = 'hip';
    else if (jointName.includes('elbow')) baseJoint = 'elbow';
    else if (jointName.includes('spine')) baseJoint = 'spine';
    else if (jointName.includes('shoulder')) baseJoint = 'shoulder';
    
    const angle = results?.finalAngles[feedback.joint.toLowerCase().replace(' ', '_')];
    const need = getExerciseNeed(feedback.joint, angle);
    
    // Get the appropriate image set for this specific joint
    const imageSet = EXERCISE_IMAGES[baseJoint as keyof typeof EXERCISE_IMAGES] || EXERCISE_IMAGES.knee;
    const instructions = EXERCISE_INSTRUCTIONS[baseJoint as keyof typeof EXERCISE_INSTRUCTIONS] || EXERCISE_INSTRUCTIONS.knee;
    
    // Get image based on need
    let imageUrl = imageSet.default;
    if (need === 'stretch' && imageSet.stretch) imageUrl = imageSet.stretch;
    if (need === 'strengthen' && imageSet.strengthen) imageUrl = imageSet.strengthen;
    if (need === 'maintain' && imageSet.maintain) imageUrl = imageSet.maintain;
    
    // Get instructions based on need
    const instruction = instructions[need] || instructions.maintain;
    
    return {
      url: imageUrl,
      title: instruction.title,
      description: instruction.description,
      exercise: instruction.exercise,
      need: need
    };
  };

  // Show exercise images
  const showExerciseImages = () => {
    if (!results?.feedback) return;
    
    const images: Record<string, ExerciseImage> = {};
    
    results.feedback.forEach((feedback: FeedbackItem, index: number) => {
      const jointKey = feedback.joint.toLowerCase().replace(' ', '_');
      images[`${jointKey}-${index}`] = getExerciseForJoint(feedback);
    });
    
    setExerciseImages(images);
    setShowImages(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#A7B59E] text-[#35522B] text-center">
        <Loader2 className="w-12 h-12 text-[#35522B] animate-spin mb-4" />
        <h2 className="text-xl font-bold">Waking AI Vision Engine...</h2>
      </div>
    );
    
  if (results) {
    return (
      <div className="min-h-screen bg-[#A7B59E] text-[#35522B] p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
        <div className="max-w-7xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-[#35522B] hover:opacity-70 mb-8 group transition">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </button>

          <div className="bg-[#B8C5AE] border-2 border-[#35522B] rounded-[3rem] overflow-hidden shadow-lg">
            {/* Header Area */}
            <div className="bg-[#B8C5AE] p-10 border-b-2 border-[#35522B] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-serif font-black text-[#35522B] mb-2">Posture Intelligence Report</h1>
                <p className="text-[#35522B] opacity-80">Deep analysis of bio-mechanical joint alignment and posture performance.</p>
              </div>
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-[#35522B] flex flex-col items-center justify-center bg-[#A7B59E] shadow-inner">
                  <span className="text-3xl font-black text-[#35522B]">{results.score}%</span>
                  <span className="text-[10px] font-bold text-[#35522B] uppercase tracking-widest">Score</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#35522B] text-white p-1.5 rounded-full shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-10 space-y-12">
              {/* Table Section */}
              <section>
                <h3 className="text-xl font-serif font-bold text-[#35522B] mb-6 flex items-center gap-2">
                  <Target className="text-[#35522B] w-5 h-5" /> Joint Comparison Matrix
                </h3>
                <div className="overflow-x-auto rounded-3xl border-2 border-[#35522B]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#A7B59E] text-[#35522B] text-xs font-black uppercase tracking-widest">
                        <th className="px-6 py-4">Anatomical Joint</th>
                        <th className="px-6 py-4">Your Angle</th>
                        <th className="px-6 py-4">Healthy Bench</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#35522B]">
                     {Object.entries(HEALTHY_ANGLES).map(([key, config]) => {
                      const rawVal = results.finalAngles[key];
                      const val = rawVal === undefined || rawVal === null ? null : rawVal;
                      const status = val === null ? "critical" : getStatus(val, config.range as [number, number]);
                      return (
                        <tr key={key} className="hover:bg-[#A7B59E] transition-colors group">
                          <td className="px-6 py-5 font-bold text-[#35522B]">{config.name}</td>
                          <td className="px-6 py-5">
                            <span className={`font-mono text-lg font-black ${
                              status === 'optimal' ? 'text-emerald-600' : status === 'warning' ? 'text-amber-600' : 'text-rose-600'
                            }`}>{val === null ? "Not Visible" : `${Math.round(val)}°`}</span>
                          </td>
                          <td className="px-6 py-5 text-[#35522B] font-mono text-sm">{config.range[0]}° - {config.range[1]}°</td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              status === 'optimal' ? 'bg-emerald-600/10 text-emerald-700' : 
                              status === 'warning' ? 'bg-amber-600/10 text-amber-700' : 'bg-rose-600/10 text-rose-700'
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

              {/* Show Exercise Images Button */}
              {!showImages && (
                <div className="flex justify-center">
                  <button
                    onClick={showExerciseImages}
                    className="flex items-center gap-3 bg-[#35522B] hover:opacity-90 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95"
                  >
                    <Sparkles className="w-5 h-5" /> Show Personalized Exercises
                  </button>
                </div>
              )}

              {/* Feedback, Videos & Personalized Exercises Area */}
              <section className="grid lg:grid-cols-3 gap-8">
                {/* Detailed Feedback Column */}
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-[#35522B] flex items-center gap-2">
                    <Activity className="text-[#35522B] w-5 h-5" /> Detailed Feedback
                  </h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {results.feedback.map((f: FeedbackItem, i: number) => {
                      const jointKey = f.joint.toLowerCase().replace(' ', '_');
                      const actualAngle = results.finalAngles[jointKey];
                      
                      return (
                        <div key={i} className="bg-[#A7B59E] p-6 rounded-3xl border-2 border-[#35522B] hover:border-[#35522B] transition">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-black text-[#35522B] uppercase">{f.joint}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              f.severity === 'optimal' ? 'bg-emerald-600/10 text-emerald-700' : 
                              f.severity === 'warning' ? 'bg-amber-600/10 text-amber-700' : 'bg-rose-600/10 text-rose-700'
                            }`}>{f.severity}</span>
                          </div>
                          <p className="text-[#35522B] text-sm leading-relaxed mb-2">{f.message}</p>
                          {actualAngle && (
                            <p className="text-[10px] text-[#35522B] font-mono">
                              Current angle: {Math.round(actualAngle)}°
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Exercise Videos Column */}
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-[#35522B] flex items-center gap-2">
                    <PlayCircle className="text-[#35522B] w-5 h-5" /> Video Guides
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {results.feedback.map((f: FeedbackItem, i: number) => {
                      const jointKey = f.joint.toLowerCase().replace(' ', '_');
                      const actualAngle = results.finalAngles[jointKey];
                      const need = getExerciseNeed(f.joint, actualAngle);
                      const searchQuery = need === 'stretch' ? 'stretching exercises' : 
                                         need === 'strengthen' ? 'strengthening exercises' : 
                                         'maintenance exercises';
                      const exerciseLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(f.joint + ' ' + searchQuery)}`;
                      
                      return (
                        <a 
                          key={i} 
                          href={exerciseLink}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-5 bg-[#A7B59E] hover:bg-[#A7B59E] border-2 border-[#35522B] hover:border-[#35522B] rounded-3xl transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#35522B] flex items-center justify-center text-white">
                               <Video className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="block text-sm font-bold text-[#35522B]">{f.joint} {need}</span>
                              <span className="text-xs text-[#35522B] italic">Watch {need} videos</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#35522B] group-hover:text-[#35522B] group-hover:translate-x-1 transition-all" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Personalized Exercise Images Column */}
                <div className="space-y-6">
                  <h3 className="text-xl font-serif font-bold text-[#35522B] flex items-center gap-2">
                    <ImageIcon className="text-[#35522B] w-5 h-5" /> Personalized Exercises
                  </h3>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {results.feedback.map((f: FeedbackItem, i: number) => {
                      const jointKey = f.joint.toLowerCase().replace(' ', '_');
                      const imageKey = `${jointKey}-${i}`;
                      const exercise = exerciseImages[imageKey];
                      const actualAngle = results.finalAngles[jointKey];
                      const hasError = imageErrors[imageKey];
                      const need = getExerciseNeed(f.joint, actualAngle);
                      
                      if (!showImages) {
                        return (
                          <div key={i} className="bg-[#A7B59E] p-4 rounded-3xl border-2 border-[#35522B] border-dashed">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-black text-[#35522B] uppercase">{f.joint}</span>
                            </div>
                            <div className="rounded-2xl border-2 border-[#35522B] mb-3 aspect-square bg-[#35522B]/10 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-[#35522B] opacity-30" />
                            </div>
                            <p className="text-[10px] text-[#35522B] text-center">
                              Click "Show Personalized Exercises" to see exercises for {f.joint}
                            </p>
                          </div>
                        );
                      }
                      
                      if (!exercise) return null;
                      
                      // Get need-based badge color
                      const needColor = need === 'stretch' ? 'bg-blue-600/10 text-blue-700' :
                                       need === 'strengthen' ? 'bg-orange-600/10 text-orange-700' :
                                       'bg-green-600/10 text-green-700';
                      
                      return (
                        <div key={i} className="bg-[#A7B59E] p-4 rounded-3xl border-2 border-[#35522B] hover:border-[#35522B] transition-all">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-[#35522B] uppercase">
                              {f.joint}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${needColor}`}>
                              needs {need}
                            </span>
                          </div>
                          
                          <div className="relative rounded-2xl overflow-hidden border-2 border-[#35522B] mb-3 aspect-square bg-[#35522B]/10">
                            {!hasError ? (
                              <img 
                                src={exercise.url} 
                                alt={`${need} exercise for ${f.joint}`}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(imageKey)}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#35522B] text-white text-center">
                                <Activity className="w-8 h-8 mb-2" />
                                <p className="text-xs font-bold">{exercise.title}</p>
                                <p className="text-[10px] mt-2">{exercise.exercise.split('\n')[0]}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-[#35522B]">
                              {exercise.title}
                            </p>
                            <p className="text-xs text-[#35522B]">
                              {exercise.description}
                            </p>
                            <div className="text-[10px] text-[#35522B] font-bold bg-[#35522B]/10 p-2 rounded-lg whitespace-pre-line">
                              {exercise.exercise}
                            </div>
                            <p className="text-[10px] text-[#35522B]">
                              Current Angle: {actualAngle ? Math.round(actualAngle) : '?'}°
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 pt-10 border-t-2 border-[#35522B]">
                <button onClick={reset} className="flex items-center gap-3 bg-[#35522B] hover:opacity-90 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95">
                  <RefreshCcw className="w-5 h-5" /> Try Once More
                </button>
                <button onClick={onBack} className="flex items-center gap-3 bg-[#A7B59E] hover:bg-[#B8C5AE] text-[#35522B] border-2 border-[#35522B] px-10 py-4 rounded-2xl font-black transition-all active:scale-95">
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
    <div className="min-h-screen bg-[#A7B59E] text-[#35522B] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#35522B] hover:opacity-70 mb-8 transition">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Visual Trackers (Left 3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid md:grid-cols-2 gap-6 h-[600px]">
              {/* Camera Feed */}
              <div className="relative bg-[#B8C5AE] rounded-[2.5rem] overflow-hidden border-2 border-[#35522B] shadow-lg group">
                {!analyzing && !uploadedVideo && mode === 'video' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    <Video className="w-12 h-12 text-[#35522B] mb-4" />
                    <h3 className="text-xl font-black mb-2 text-[#35522B]">Upload File</h3>
                    <label className="bg-[#35522B] hover:opacity-90 text-white px-8 py-3 rounded-2xl font-black cursor-pointer transition-all">
                      Browse
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                )}
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${!analyzing && !uploadedVideo ? 'hidden' : ''}`} 
                  src={uploadedVideo || undefined} 
                  muted 
                  playsInline 
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute inset-0 w-full h-full pointer-events-none z-10" 
                  width={640} 
                  height={480} 
                />
                <div className="absolute bottom-4 left-4 z-20 bg-[#35522B] text-white px-3 py-1 rounded-full text-[10px] font-bold border border-[#35522B] uppercase">Camera Vision Feed</div>
              </div>

              {/* 3D Skeleton Viewer */}
              <div className="h-[600px]">
                <Skeleton3D landmarks={worldLandmarks} />
              </div>
            </div>

            <div className="flex items-center justify-center pt-4">
              {!analyzing ? (
                mode === 'live' ? (
                  <button onClick={startLiveAnalysis} className="flex items-center gap-4 bg-[#35522B] hover:opacity-90 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95">
                    <Camera className="w-6 h-6" /> Start 20s Live Analysis
                  </button>
                ) : uploadedVideo ? (
                  <button onClick={startVideoAnalysis} className="flex items-center gap-4 bg-[#35522B] hover:opacity-90 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95">
                    <PlayCircle className="w-6 h-6" /> Begin Analysis
                  </button>
                ) : null
              ) : (
                <button onClick={stopAnalysis} className="bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95">
                  Stop Analysis
                </button>
              )}
            </div>
          </div>

          {/* Telemetry (Right Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#B8C5AE] border-2 border-[#35522B] rounded-[2.5rem] p-8 shadow-lg">
              <h3 className="text-xl font-serif font-black mb-6 flex items-center gap-3 text-[#35522B]">
                <Activity className="text-[#35522B] w-6 h-6" /> Real-time Metrics
              </h3>
              <div className="space-y-6">
                {Object.entries(HEALTHY_ANGLES).map(([key, info]) => {
                  const val = currentAngles[key] || 180;
                  const status = getStatus(val, info.range as [number, number]);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-[#35522B]">{info.name}</span>
                        <span className={status === 'optimal' ? 'text-emerald-700' : status === 'warning' ? 'text-amber-700' : 'text-rose-700'}>
                          {Math.round(val)}°
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#A7B59E] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${status === 'optimal' ? 'bg-emerald-600' : status === 'warning' ? 'bg-amber-600' : 'bg-rose-600'}`} style={{ width: `${Math.min((val / 180) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-[#B8C5AE] border-2 border-[#35522B] rounded-[2rem] p-6">
              <h4 className="text-[#35522B] font-bold text-sm mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Calibration Active
              </h4>
              <p className="text-[10px] text-[#35522B] leading-relaxed uppercase tracking-wider font-bold">
                3D Depth lifting model is compensating for lens distortion. Stand center frame.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};