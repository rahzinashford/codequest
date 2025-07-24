from flask import render_template, request, redirect, url_for, flash, jsonify, session
from code_executor import execute_c_code, execute_python_code, execute_java_code, execute_cpp_code
from datetime import datetime
import os

def register_routes(app, db):
    @app.route('/')
    def index():
        """Main Colunn IDE page"""
        return render_template('index.html')

    @app.route('/compile', methods=['POST'])
    def compile_code():
        """Compile code and return compilation results"""
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'c')
        
        # Determine language from extension if provided
        filename = data.get('filename', '')
        if filename:
            ext = os.path.splitext(filename)[1].lower()
            if ext == '.py':
                language = 'python'
            elif ext == '.java':
                language = 'java'
            elif ext == '.cpp' or ext == '.cxx':
                language = 'cpp'
            elif ext == '.c':
                language = 'c'
        
        if not code.strip():
            return jsonify({
                'success': False,
                'error': 'No code provided'
            })
        
        try:
            # For C and C++, compilation is separate from execution
            if language == 'c':
                result = execute_c_code(code, compile_only=True)
            elif language == 'cpp':
                result = execute_cpp_code(code, compile_only=True)
            elif language == 'java':
                result = execute_java_code(code, compile_only=True)
            elif language == 'python':
                # Python doesn't need compilation, just syntax check
                try:
                    compile(code, '<string>', 'exec')
                    result = {'success': True, 'output': 'Python syntax is valid'}
                except SyntaxError as e:
                    result = {'success': False, 'error': f'Syntax error: {str(e)}'}
            else:
                return jsonify({
                    'success': False,
                    'error': f'Unsupported language: {language}'
                })
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Compilation error: {str(e)}'
            })

    @app.route('/run', methods=['POST'])
    def run_code():
        """Execute code and return results"""
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'c')
        
        # Determine language from extension if provided
        filename = data.get('filename', '')
        if filename:
            ext = os.path.splitext(filename)[1].lower()
            if ext == '.py':
                language = 'python'
            elif ext == '.java':
                language = 'java'
            elif ext == '.cpp' or ext == '.cxx':
                language = 'cpp'
            elif ext == '.c':
                language = 'c'
        
        if not code.strip():
            return jsonify({
                'success': False,
                'error': 'No code provided'
            })
        
        try:
            # Execute the code based on language
            if language == 'c':
                result = execute_c_code(code)
            elif language == 'cpp':
                result = execute_cpp_code(code)
            elif language == 'java':
                result = execute_java_code(code)
            elif language == 'python':
                result = execute_python_code(code)
            else:
                return jsonify({
                    'success': False,
                    'error': f'Unsupported language: {language}'
                })
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Execution error: {str(e)}'
            })
