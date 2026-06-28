# 3D Human Pose Estimation and Health Analysis Using Deep Learning

A web-based application that performs **3D Human Pose Estimation** using deep learning and computer vision. The system captures human movement from a single RGB camera, reconstructs the 3D human skeleton, analyzes posture, and provides basic movement analysis.

## Features

- 3D human pose estimation from a single RGB camera
- Real-time skeleton visualization
- Human posture and movement analysis
- Motion tracking using AI
- User-friendly web interface

## Technologies Used

- React
- TypeScript
- Vite
- MediaPipe Pose
- Groq API
- Hugging Face Inference API

## Installation

### Prerequisites

- Node.js (v18 or later)
- npm

### Clone the Repository

```bash
git clone https://github.com/Bhavyasree04/3dhuman_pose_estimation.git
cd 3dhuman_pose_estimation
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root and add:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_HF_TOKEN=your_huggingface_token
```

### Run the Project

```bash
npm run dev
```

The application will start at:

```
http://localhost:3000
```

## Project Structure

```
├── components/
├── services/
├── App.tsx
├── index.tsx
├── package.json
├── vite.config.ts
└── README.md
```

## Future Enhancements

- Multi-person pose estimation
- Exercise and fitness tracking
- AI-based posture correction
- Health monitoring dashboard
- Mobile application support

## Team Members

- Bhavya Sree B
- Cheguri Khethana
- Kothapalli Sowmya

## License

This project is developed for educational and academic purposes.
