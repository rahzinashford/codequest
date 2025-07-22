from app import db
from datetime import datetime
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    total_score = db.Column(db.Integer, default=0)
    completed_tasks = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to user progress
    progress = db.relationship('UserProgress', backref='user', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(20), default='beginner')
    expected_output = db.Column(db.Text)
    starter_code = db.Column(db.Text)
    hints = db.Column(db.Text)
    points = db.Column(db.Integer, default=100)
    order_index = db.Column(db.Integer, default=0)
    
    # Relationship to user progress
    progress = db.relationship('UserProgress', backref='task', lazy=True)

class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    code_solution = db.Column(db.Text)
    attempts = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime)

def initialize_default_tasks():
    """Initialize default C programming tasks if they don't exist"""
    if Task.query.count() == 0:
        tasks = [
            {
                'title': 'Hello, World!',
                'description': 'Create your first C program that prints "Hello, World!" to the screen. This teaches you the basic syntax and structure of a C program.',
                'difficulty': 'beginner',
                'expected_output': 'Hello, World!',
                'starter_code': '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}',
                'hints': 'Use printf() function to print text. Don\'t forget to include stdio.h header file.',
                'points': 100,
                'order_index': 1
            },
            {
                'title': 'Variables and User Input',
                'description': 'Create a program that asks for the user\'s name and age, then prints a personalized greeting.',
                'difficulty': 'beginner',
                'expected_output': 'Enter your name: John\nEnter your age: 25\nHello John, you are 25 years old!',
                'starter_code': '#include <stdio.h>\n\nint main() {\n    char name[50];\n    int age;\n    \n    // Write your code here\n    \n    return 0;\n}',
                'hints': 'Use scanf() to read user input. Use %s for strings and %d for integers.',
                'points': 150,
                'order_index': 2
            },
            {
                'title': 'Basic Math Operations',
                'description': 'Write a program that asks the user for two numbers and prints their sum, difference, and product.',
                'difficulty': 'beginner',
                'expected_output': 'Enter first number: 10\nEnter second number: 5\nSum: 15\nDifference: 5\nProduct: 50',
                'starter_code': '#include <stdio.h>\n\nint main() {\n    int num1, num2;\n    \n    // Write your code here\n    \n    return 0;\n}',
                'hints': 'Use +, -, and * operators for arithmetic operations.',
                'points': 150,
                'order_index': 3
            },
            {
                'title': 'Conditional Statements',
                'description': 'Create a program that checks if a number is even or odd using conditional statements.',
                'difficulty': 'intermediate',
                'expected_output': 'Enter a number: 7\n7 is odd',
                'starter_code': '#include <stdio.h>\n\nint main() {\n    int number;\n    \n    // Write your code here\n    \n    return 0;\n}',
                'hints': 'Use the modulus operator (%) to check if a number is divisible by 2. Use if-else statements.',
                'points': 200,
                'order_index': 4
            },
            {
                'title': 'Loops',
                'description': 'Write a program that asks the user for a number and prints all numbers from 1 to that number.',
                'difficulty': 'intermediate',
                'expected_output': 'Enter a number: 5\n1\n2\n3\n4\n5',
                'starter_code': '#include <stdio.h>\n\nint main() {\n    int n;\n    \n    // Write your code here\n    \n    return 0;\n}',
                'hints': 'Use a for loop to iterate from 1 to n. You can also use while loops.',
                'points': 250,
                'order_index': 5
            }
        ]
        
        for task_data in tasks:
            task = Task(**task_data)
            db.session.add(task)
        
        db.session.commit()
        print("Default tasks initialized successfully!")
