
import React from 'react';
import { Activity, ShieldCheck, Heart, Zap, PlayCircle, Video, BookOpen, Target, Workflow, Info } from 'lucide-react';

export const HEALTHY_ANGLES = {
  knee_left: { range: [170, 185], name: 'Left Knee Extension', exercise: 'https://www.youtube.com/results?search_query=knee+extension+exercises+at+home' },
  knee_right: { range: [170, 185], name: 'Right Knee Extension', exercise: 'https://www.youtube.com/results?search_query=knee+extension+exercises+at+home' },
  hip_left: { range: [170, 180], name: 'Left Hip Alignment', exercise: 'https://www.youtube.com/results?search_query=hip+alignment+exercises' },
  hip_right: { range: [170, 180], name: 'Right Hip Alignment', exercise: 'https://www.youtube.com/results?search_query=hip+alignment+exercises' },
  spine: { range: [175, 180], name: 'Spinal Neutrality', exercise: 'https://www.youtube.com/results?search_query=spine+neutral+posture+exercises' },
  elbow_left: { range: [160, 180], name: 'Left Elbow Extension', exercise: 'https://www.youtube.com/results?search_query=elbow+mobility+exercises' },
  elbow_right: { range: [160, 180], name: 'Right Elbow Extension', exercise: 'https://www.youtube.com/results?search_query=elbow+mobility+exercises' },
};

export const FEATURES = [
  {
    title: "Real-time 3D Lifting",
    description: "Our Lifting model uses a Temporal Convolutional Network to estimate depth from 2D coordinates, creating a true 3D skeletal space.",
    icon: <Zap className="w-6 h-6 text-cyan-400" />
  },
  {
    title: "Joint Angle Analysis",
    description: "Bio-mechanical calculations are performed per frame to track range of motion and joint stress points.",
    icon: <Activity className="w-6 h-6 text-emerald-400" />
  },
  {
    title: "Posture Feedback",
    description: "Automated logic identifies deviations from clinical norms and generates real-time corrective suggestions.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-400" />
  },
  {
    title: "Kinetic Statistics",
    description: "Measures smoothness, velocity, and acceleration of body segments to detect fatigue or injury risks.",
    icon: <Heart className="w-6 h-6 text-rose-400" />
  }
];

export const APPLICATIONS = [
  { 
    name: "Physical Therapy", 
    desc: "Remote monitoring of patient rehabilitation progress with precise measurement of joint range of motion.",
    icon: <Target className="w-8 h-8 text-emerald-500" />
  },
  { 
    name: "Sports Performance", 
    desc: "Optimize athletic form, identify energy leaks in movement, and prevent over-training injuries.",
    icon: <Activity className="w-8 h-8 text-blue-500" />
  },
  { 
    name: "Workplace Safety", 
    desc: "Analyze desk ergonomics or lifting techniques in industrial settings to reduce muscular disorders.",
    icon: <ShieldCheck className="w-8 h-8 text-amber-500" />
  },
  { 
    name: "Gesture Control", 
    desc: "Advanced pose recognition for touchless interfaces in medical or high-tech operational environments.",
    icon: <Workflow className="w-8 h-8 text-purple-500" />
  }
];
