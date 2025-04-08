# Lionsight

Lionsight is a real-time people tracking and analytics platform that uses computer vision to monitor and analyze foot traffic in physical locations. The system provides insights into customer demographics, peak hours, and staff-to-customer ratios.

## Features

- Real-time people detection using YOLOv11
- Demographic classification
- Traffic flow visualization
- Staff-to-customer ratio monitoring
- Historical analytics
- Secure authentication via Supabase
- Modern React/TypeScript frontend
- Real-time data updates

## Tech Stack

- Frontend: Next.js, TypeScript, React
- Backend: Python (FastAPI), YOLOv11
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Computer Vision: YOLOv11 (Ultralytics)
- Real-time Processing: Streamlit

## Project Structure

```
lionsight/
├── frontend/           # Next.js frontend application
├── backend/           # Python backend for YOLO inference
├── models/            # YOLO model files
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Supabase account
- YOLOv11 model file

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Set up environment variables (see `.env.example`)
5. Place your YOLO model in the `models` directory

### Running the Application

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Start the backend:
   ```bash
   cd backend
   python main.py
   ```

## Environment Variables

Create a `.env` file in both frontend and backend directories with the following variables:

```env
# Frontend
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

## License

MIT

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests. 