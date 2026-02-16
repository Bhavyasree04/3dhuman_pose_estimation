
import { HEALTHY_ANGLES } from '../constants';

export interface FeedbackItem {
  joint: string;
  message: string;
  link: string;
  severity: 'optimal' | 'warning' | 'critical';
}

export const calculateAngle = (p1: any, p2: any, p3: any): number => {
  if (!p1 || !p2 || !p3 || p1.visibility < 0.5 || p2.visibility < 0.5 || p3.visibility < 0.5) return 180;
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return Math.round(angle);
};

export const getStatus = (angle: number, range: [number, number]): 'optimal' | 'warning' | 'critical' => {
  const [min, max] = range;
  const warningBuffer = 10;
  if (angle >= min && angle <= max) return 'optimal';
  if (angle >= min - warningBuffer && angle <= max + warningBuffer) return 'warning';
  return 'critical';
};

export const getDetailedFeedback = (angles: Record<string, number>): FeedbackItem[] => {
  const feedback: FeedbackItem[] = [];
  
  Object.entries(HEALTHY_ANGLES).forEach(([key, config]) => {
    const angle = angles[key] || 180;
    const status = getStatus(angle, config.range as [number, number]);
    
    if (status !== 'optimal') {
      let msg = "";
      if (key.includes('knee')) msg = "Improper knee extension detected. This can lead to joint strain.";
      else if (key.includes('hip')) msg = "Hip misalignment found. Focus on pelvic stability.";
      else if (key.includes('spine')) msg = "Spinal posture deviates from neutral. Engage core to straighten.";
      else msg = "Joint range of motion is outside the recommended healthy zone.";

      feedback.push({
        joint: config.name,
        message: msg,
        link: config.exercise,
        severity: status
      });
    }
  });
  
  if (feedback.length === 0) {
    feedback.push({
      joint: "Overall Posture",
      message: "Excellent form! All monitored joints are within optimal ranges.",
      link: "https://www.youtube.com/results?search_query=advanced+mobility+routines",
      severity: 'optimal'
    });
  }
  
  return feedback;
};
