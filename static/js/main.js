// CodeQuest Main JavaScript File

// Global application state
const CodeQuest = {
    currentUser: null,
    tasks: [],
    currentTask: null,
    notifications: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Bootstrap to be available
    function waitForBootstrap() {
        if (typeof bootstrap !== 'undefined') {
            initializeApp();
            setupEventListeners();
            loadAnimations();
        } else {
            setTimeout(waitForBootstrap, 100);
        }
    }
    waitForBootstrap();
});

function initializeApp() {
    console.log('CodeQuest initializing...');
    
    // Load user preferences from localStorage
    loadUserPreferences();
    
    // Initialize tooltips (check if bootstrap is loaded)
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        // Initialize popovers
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }
    
    console.log('CodeQuest initialized successfully');
}

function setupEventListeners() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Task card hover effects
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow-lg');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-lg');
        });
    });
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (typeof bootstrap !== 'undefined') {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    });
}

function loadAnimations() {
    // Animate stat cards on page load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 100);
    });
    
    // Animate task cards
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, 200 + (index * 150));
    });
}

function loadUserPreferences() {
    const preferences = localStorage.getItem('codequest-preferences');
    if (preferences) {
        try {
            const prefs = JSON.parse(preferences);
            // Apply user preferences
            if (prefs.theme) {
                document.body.setAttribute('data-theme', prefs.theme);
            }
            if (prefs.editorFontSize) {
                document.documentElement.style.setProperty('--editor-font-size', prefs.editorFontSize + 'px');
            }
        } catch (e) {
            console.warn('Error loading user preferences:', e);
        }
    }
}

function saveUserPreferences(preferences) {
    try {
        localStorage.setItem('codequest-preferences', JSON.stringify(preferences));
    } catch (e) {
        console.warn('Error saving user preferences:', e);
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
    `;
    
    const icon = getIconForType(type);
    notification.innerHTML = `
        <i class="${icon} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode && typeof bootstrap !== 'undefined') {
            const bsAlert = new bootstrap.Alert(notification);
            bsAlert.close();
        }
    }, duration);
    
    return notification;
}

function getIconForType(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'info': 'fas fa-info-circle',
        'warning': 'fas fa-exclamation-triangle',
        'danger': 'fas fa-exclamation-circle'
    };
    return icons[type] || icons.info;
}

// Progress tracking utilities
function updateProgress(taskId, completed = false) {
    const progressBar = document.querySelector(`[data-task-id="${taskId}"] .progress-bar`);
    if (progressBar) {
        if (completed) {
            progressBar.style.width = '100%';
            progressBar.classList.add('bg-success');
            progressBar.classList.remove('bg-primary');
        }
    }
}

function animateScore(element, newScore, duration = 1000) {
    const startScore = parseInt(element.textContent) || 0;
    const scoreDiff = newScore - startScore;
    const startTime = Date.now();
    
    function updateScore() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(startScore + (scoreDiff * easeOut));
        
        element.textContent = currentScore;
        
        if (progress < 1) {
            requestAnimationFrame(updateScore);
        }
    }
    
    updateScore();
}

// Code execution utilities
function formatExecutionTime(seconds) {
    if (seconds < 1) {
        return `${Math.round(seconds * 1000)}ms`;
    }
    return `${seconds.toFixed(2)}s`;
}

function highlightSyntaxErrors(editor, errors) {
    if (!editor || !errors.length) return;
    
    const model = editor.getModel();
    const markers = errors.map(error => ({
        startLineNumber: error.line,
        startColumn: error.column || 1,
        endLineNumber: error.line,
        endColumn: error.endColumn || model.getLineMaxColumn(error.line),
        message: error.message,
        severity: monaco.MarkerSeverity.Error
    }));
    
    monaco.editor.setModelMarkers(model, 'syntax', markers);
}

// Theme utilities
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    
    // Save preference
    const preferences = JSON.parse(localStorage.getItem('codequest-preferences') || '{}');
    preferences.theme = newTheme;
    saveUserPreferences(preferences);
    
    showNotification(`Switched to ${newTheme} theme`, 'info', 2000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const runButton = document.querySelector('button[onclick*="runCode"]');
        if (runButton && !runButton.disabled) {
            e.preventDefault();
            runButton.click();
        }
    }
    
    // Ctrl/Cmd + / to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Escape to close modals/alerts
    if (e.key === 'Escape') {
        if (typeof bootstrap !== 'undefined') {
            const activeModal = document.querySelector('.modal.show');
            if (activeModal) {
                const modal = bootstrap.Modal.getInstance(activeModal);
                modal.hide();
            }
            
            const activeAlerts = document.querySelectorAll('.alert.show');
            activeAlerts.forEach(alert => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'danger');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('A network error occurred. Please check your connection.', 'warning');
});

// Export for use in other modules
window.CodeQuest = CodeQuest;
window.showNotification = showNotification;
window.animateScore = animateScore;
window.updateProgress = updateProgress;
