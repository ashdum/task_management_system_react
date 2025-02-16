# Task Management System

A modern, feature-rich task management application built with React, TypeScript, and Tailwind CSS.

![Task Management System](https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&q=80)

## Features

- 📋 Intuitive Kanban board interface
- 👥 Real-time team collaboration
- 🏷️ Custom labels and task categorization
- ✅ Checklists and task progress tracking
- 💬 Comments and team discussions
- 🎨 Customizable board backgrounds
- 📱 Responsive design for all devices
- 🔒 Secure authentication system
- 🤝 Team member invitations
- 🔍 Advanced task search and filtering

## Tech Stack

- **Frontend Framework**: React 18
- **Type System**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Drag & Drop**: @hello-pangea/dnd
- **Rich Text Editor**: TipTap
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Form Validation**: Zod
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # React components
├── lib/              # Utility functions and services
│   ├── api/          # API integration
│   ├── auth/         # Authentication logic
│   └── data/         # Data management
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── config/           # Configuration files
└── store/            # State management
```

## Key Features in Detail

### Authentication

- Email/password authentication
- Protected routes
- Session management
- Password reset functionality

### Dashboard Management

- Create and manage multiple dashboards
- Customize dashboard backgrounds
- Invite team members
- Set dashboard permissions

### Task Organization

- Create, edit, and delete tasks
- Drag-and-drop task reordering
- Add labels, checklists, and due dates
- Attach files and images
- Add comments and mentions

### Team Collaboration

- Real-time updates
- Team member assignments
- Task comments and discussions
- Activity tracking
- Email notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TipTap](https://tiptap.dev/)
- [Lucide Icons](https://lucide.dev/)

## Contact

Ashot Dumikyan - ashot.dumikyan@gmail.com

Project Link: [https://github.com/yourusername/task-management-system](https://github.com/yourusername/task-management-system)