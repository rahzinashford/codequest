from flask import render_template, request, redirect, url_for, flash, jsonify, session
from app import app, db
from models import Task, User, UserProgress
from code_executor import execute_c_code
from datetime import datetime

@app.route('/')
def index():
    """Main dashboard page"""
    tasks = Task.query.order_by(Task.order_index).all()
    user_id = session.get('user_id')
    
    # For demo purposes, create a default user if none exists
    if not user_id:
        user = User.query.filter_by(username='demo_user').first()
        if not user:
            user = User(username='demo_user', email='demo@codequest.com', total_score=0)
            db.session.add(user)
            db.session.commit()
        session['user_id'] = user.id
        user_id = user.id
    
    user = User.query.get(user_id)
    
    # Get user progress for each task
    task_progress = {}
    for task in tasks:
        progress = UserProgress.query.filter_by(user_id=user_id, task_id=task.id).first()
        task_progress[task.id] = progress
    
    return render_template('index.html', tasks=tasks, user=user, task_progress=task_progress)

@app.route('/task/<int:task_id>')
def task_detail(task_id):
    """Task detail page with coding interface"""
    task = Task.query.get_or_404(task_id)
    user_id = session.get('user_id')
    
    if not user_id:
        return redirect(url_for('index'))
    
    user = User.query.get(user_id)
    progress = UserProgress.query.filter_by(user_id=user_id, task_id=task_id).first()
    
    # Get current code (either from progress or starter code)
    current_code = progress.code_solution if progress and progress.code_solution else task.starter_code
    
    return render_template('task.html', task=task, user=user, progress=progress, current_code=current_code)

@app.route('/execute_code', methods=['POST'])
def execute_code():
    """Execute C code and return results"""
    data = request.get_json()
    code = data.get('code', '')
    task_id = data.get('task_id')
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401
    
    # Execute the code
    result = execute_c_code(code)
    
    # Save progress
    if task_id:
        task = Task.query.get(task_id)
        progress = UserProgress.query.filter_by(user_id=user_id, task_id=task_id).first()
        
        if not progress:
            progress = UserProgress(user_id=user_id, task_id=task_id)
            db.session.add(progress)
        
        progress.code_solution = code
        if progress.attempts is None:
            progress.attempts = 0
        progress.attempts += 1
        
        # Check if the output matches expected output (basic check)
        if task and result.get('output', '').strip() == task.expected_output.strip():
            if not progress.completed:
                progress.completed = True
                progress.completed_at = datetime.utcnow()
                progress.score = task.points
                
                # Update user total score
                user = User.query.get(user_id)
                user.total_score += task.points
                user.completed_tasks = UserProgress.query.filter_by(user_id=user_id, completed=True).count()
                
                result['success'] = True
                result['message'] = f'Congratulations! You earned {task.points} points!'
        
        db.session.commit()
    
    return jsonify(result)

@app.route('/leaderboard')
def leaderboard():
    """Display leaderboard with top users"""
    top_users = User.query.order_by(User.total_score.desc()).limit(10).all()
    return render_template('leaderboard.html', users=top_users)

@app.route('/get_hint/<int:task_id>')
def get_hint(task_id):
    """Get hint for a specific task"""
    task = Task.query.get_or_404(task_id)
    return jsonify({'hint': task.hints})

@app.route('/reset_progress/<int:task_id>', methods=['POST'])
def reset_progress(task_id):
    """Reset progress for a specific task"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401
    
    progress = UserProgress.query.filter_by(user_id=user_id, task_id=task_id).first()
    if progress:
        # Subtract points if task was completed
        if progress.completed:
            user = User.query.get(user_id)
            task = Task.query.get(task_id)
            user.total_score -= progress.score
            user.completed_tasks -= 1
        
        db.session.delete(progress)
        db.session.commit()
    
    return jsonify({'success': True})
