import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Skeleton3DProps {
  landmarks: any;
}

export const Skeleton3D: React.FC<Skeleton3DProps> = ({ landmarks }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const bonesRef = useRef<THREE.Line[]>([]);

  const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [24, 26], [25, 27], [26, 28],
    [27, 29], [28, 30], [27, 31], [28, 32]
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 5, 5);
    scene.add(light);

    const jointGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const jointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const joints: THREE.Mesh[] = [];
    for (let i = 0; i < 33; i++) {
      const mesh = new THREE.Mesh(jointGeometry, jointMaterial);
      mesh.visible = false;
      scene.add(mesh);
      joints.push(mesh);
    }
    jointsRef.current = joints;

    const boneMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
    const bones: THREE.Line[] = [];

    POSE_CONNECTIONS.forEach(() => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)
      );
      const line = new THREE.Line(geometry, boneMaterial);
      line.visible = false;
      scene.add(line);
      bones.push(line);
    });

    bonesRef.current = bones;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!landmarks || jointsRef.current.length === 0) return;

    const scale = 7.5; // 🚀 IMPORTANT

    landmarks.forEach((lm: any, i: number) => {
      const joint = jointsRef.current[i];
      if (!joint || !lm) return;

      joint.position.set(
  (lm.x - 0.5) * scale,
  -(lm.y - 0.5) * scale,
  -lm.z * 2
);

      joint.visible = lm.visibility > 0.3;
    });

    POSE_CONNECTIONS.forEach((pair, i) => {
      const bone = bonesRef.current[i];
      if (!bone) return;

      const start = landmarks[pair[0]];
      const end = landmarks[pair[1]];

      if (start && end && start.visibility > 0.3 && end.visibility > 0.3) {
        const positions =
          bone.geometry.attributes.position.array as Float32Array;

        positions[0] = (start.x - 0.5) * scale;
        positions[1] = -(start.y - 0.5) * scale;
        positions[2] = positions[2] = -start.z * 2;
        positions[3] = (end.x - 0.5) * scale;
        positions[4] = -(end.y - 0.5) * scale;
        positions[5] = -end.z * 2;

        bone.geometry.attributes.position.needsUpdate = true;
        bone.visible = true;
      } else {
        bone.visible = false;
      }
    });
  }, [landmarks]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-[2rem] overflow-hidden border border-slate-800 shadow-inner relative"
    >
      <div className="absolute top-4 left-4 z-10 bg-slate-900/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
          Your Skeleton (3D View)
        </span>
      </div>
    </div>
  );
};