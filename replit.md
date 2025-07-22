# CodeQuest - C Programming Learning Platform

## Overview

CodeQuest is a web-based interactive learning platform designed to teach C programming fundamentals through hands-on challenges. The application features a gamified learning experience with visual block programming, traditional text editing, code execution simulation, and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database**: SQLAlchemy ORM with SQLite (default) or PostgreSQL support
- **Session Management**: Flask built-in sessions with configurable secret key
- **Code Execution**: Simulated C code execution with pattern-based output generation
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default)
- **CSS Framework**: Bootstrap 5.3.0 for responsive design
- **Icons**: Font Awesome 6.4.0
- **Code Editor**: Monaco Editor for syntax highlighting and IntelliSense
- **Interactive Elements**: Custom drag-and-drop visual blocks system
- **Styling**: Custom CSS with CSS variables for consistent theming

### Database Schema
- **Users**: Authentication, scoring, and progress tracking
- **Tasks**: Programming challenges with difficulty levels and starter code
- **UserProgress**: Junction table tracking completion status and solutions

## Key Components

### Models (models.py)
- **User Model**: Stores user credentials, scores, and completion statistics
- **Task Model**: Contains programming challenges with descriptions, expected outputs, and difficulty levels
- **UserProgress Model**: Tracks individual user progress on specific tasks

### Code Execution Engine (code_executor.py)
- Simulates C code compilation and execution
- Pattern-based output generation for educational purposes
- Safety-focused approach avoiding actual code compilation
- Execution time tracking and error reporting

### Route Handlers (routes.py)
- Dashboard with task overview and user statistics
- Individual task pages with coding interface
- Code execution endpoint for real-time feedback
- Progress tracking and scoring system

### Frontend Components
- **Visual Blocks System**: Drag-and-drop programming interface for beginners
- **Monaco Code Editor**: Professional code editing experience with C syntax support
- **Dual-mode Interface**: Toggle between visual blocks and text editing
- **Real-time Feedback**: Instant code execution results and error reporting

## Data Flow

1. **User Session Management**: Demo user creation for immediate access without registration
2. **Task Loading**: Sequential task presentation with progress tracking
3. **Code Execution**: User code → Simulation engine → Results display
4. **Progress Saving**: Automatic saving of user solutions and completion status
5. **Scoring System**: Point allocation based on task completion and difficulty

## External Dependencies

### Frontend Libraries
- Bootstrap 5.3.0 (CDN) - UI framework
- Font Awesome 6.4.0 (CDN) - Icon library
- Monaco Editor 0.44.0 (CDN) - Code editor

### Python Packages
- Flask - Web framework
- Flask-SQLAlchemy - Database ORM
- Werkzeug - WSGI utilities and middleware

### Database
- SQLite (default) - File-based database for development
- PostgreSQL support - Configurable via DATABASE_URL environment variable

## Deployment Strategy

### Environment Configuration
- **Database URL**: Configurable via DATABASE_URL environment variable
- **Session Secret**: Configurable via SESSION_SECRET environment variable
- **Debug Mode**: Enabled for development, should be disabled in production

### Database Management
- Automatic table creation on application startup
- Default task initialization for new deployments
- Connection pooling and health checks configured

### Production Considerations
- ProxyFix middleware configured for reverse proxy deployment
- Database connection pooling with 300-second recycle time
- Pre-ping enabled for connection health verification

### Scaling Approach
- Stateless application design enables horizontal scaling
- Session data stored server-side for consistency
- Database-backed progress tracking supports multiple instances

The application is designed as a single-page application with server-side rendering, making it suitable for educational environments with focus on simplicity and immediate engagement.