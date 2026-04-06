# Invoice Management System

A full-stack Invoice Management application built with FastAPI (Python) backend and React frontend.

## Features

- **User Authentication**: Firebase-based authentication with Google sign-in
- **Invoice Management**: Create, view, edit, and delete invoices
- **Client Management**: Manage client information and contacts
- **Company Management**: Store company details and branding
- **Expense Tracking**: Track and categorize business expenses
- **Real-time Chat**: WebSocket-based messaging between users and admins
  - Message reactions (emoji)
  - Message editing
  - Archive/Block chats
  - Online status indicators
- **Admin Dashboard**: Comprehensive admin interface for managing all data
- **PDF Generation**: Generate invoice PDFs
- **Payment Integration**: Razorpay payment processing

## Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Firebase Admin** - Authentication
- **WebSockets** - Real-time chat

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **CSS** - Styling
- **Firebase Auth** - Client-side authentication
- **Emoji Picker React** - Emoji selection for reactions

## Project Structure

```
invoice_main/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── core/            # Config, security, dependencies
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── websocket/       # WebSocket manager
│   ├── alembic/             # Database migrations
│   ├── .env.example         # Environment variables template
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── admin/           # Admin components
    │   ├── components/      # User components
    │   ├── context/         # React contexts
│   └── package.json         # Node dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example` and fill in your values):
```bash
cp .env.example .env
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the server:
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `src/firebase.js` (copy from `firebase.example.js` and fill in your Firebase config):
```bash
cp src/firebase.example.js src/firebase.js
```

4. Start the development server:
```bash
npm start
```

Frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/invoice_db
SECRET_KEY=your_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (firebase.js)
```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ...
};
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Features Details

### Chat System
- Real-time messaging via WebSockets
- Emoji reactions on messages
- Edit sent messages
- Archive chats (hide from list)
- Block users (prevent messages)
- Online/offline status indicators

### Invoice System
- Create invoices with multiple items
- Automatic total calculation
- Status tracking (Draft, Sent, Paid, Overdue)
- PDF generation
- Email integration ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues or questions, please open an issue on GitHub.
