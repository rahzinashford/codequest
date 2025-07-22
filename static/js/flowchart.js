
// Enhanced Flowchart functionality for CodeQuest
// Real-time AST-based program flow visualization

let canvas = null;
let ctx = null;
let flowchartNodes = [];
let flowchartConnections = [];
let hoveredNode = null;
let tooltip = null;
let executionPath = [];
let isExecuting = false;

// AST node types for proper flow analysis
const ASTNodeTypes = {
    PROGRAM: 'program',
    INCLUDE: 'include',
    MAIN: 'main',
    DECLARATION: 'declaration',
    ASSIGNMENT: 'assignment',
    INPUT: 'input',
    OUTPUT: 'output',
    CONDITION: 'condition',
    LOOP: 'loop',
    BLOCK: 'block',
    RETURN: 'return'
};

// Enhanced node types with better visual properties
const nodeTypes = {
    'start': { shape: 'ellipse', color: '#4CAF50', label: 'Start', width: 80, height: 40 },
    'end': { shape: 'ellipse', color: '#f44336', label: 'End', width: 80, height: 40 },
    'process': { shape: 'rect', color: '#2196F3', label: 'Process', width: 140, height: 60 },
    'decision': { shape: 'diamond', color: '#FF9800', label: 'Decision', width: 120, height: 80 },
    'input': { shape: 'parallelogram', color: '#9C27B0', label: 'Input', width: 120, height: 50 },
    'output': { shape: 'parallelogram', color: '#00BCD4', label: 'Output', width: 120, height: 50 },
    'loop': { shape: 'hexagon', color: '#795548', label: 'Loop', width: 140, height: 70 },
    'declaration': { shape: 'rect', color: '#607D8B', label: 'Declaration', width: 130, height: 50 }
};

// Initialize flowchart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('flowchart-container')) {
        initializeFlowchart();
        // Listen for program structure updates with enhanced responsiveness
        document.addEventListener('programStructureUpdated', handleProgramUpdate);
        document.addEventListener('codeExecutionStarted', handleExecutionStart);
        document.addEventListener('codeExecutionResult', handleExecutionResult);
    }
});

function initializeFlowchart() {
    console.log('Initializing enhanced flowchart with AST parsing...');
    
    const container = document.getElementById('flowchart-container');
    if (!container) return;
    
    // Clear container completely
    container.innerHTML = '';
    
    // Create enhanced controls
    createFlowchartControls(container);
    
    // Create canvas with better sizing
    createFlowchartCanvas(container);
    
    // Set up comprehensive event listeners
    setupComprehensiveEventListeners();
    
    // Create enhanced tooltip
    createEnhancedTooltip();
    
    // Initialize view
    resetView();
    
    console.log('Enhanced flowchart initialized');
}

function createFlowchartControls(container) {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flowchart-controls';
    controlsDiv.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    `;
    
    // Enhanced control buttons
    const controls = [
        { text: '🔄 Reset', action: resetView, title: 'Reset view to default' },
        { text: '🔍 Fit', action: fitToView, title: 'Fit flowchart to view' },
        { text: '📋 Analyze', action: analyzeProgram, title: 'Analyze program structure' },
        { text: '🎯 Clear Path', action: clearExecutionPath, title: 'Clear execution highlighting' }
    ];
    
    controls.forEach(ctrl => {
        const btn = document.createElement('button');
        btn.textContent = ctrl.text;
        btn.className = 'btn btn-sm btn-outline-secondary';
        btn.title = ctrl.title;
        btn.onclick = ctrl.action;
        controlsDiv.appendChild(btn);
    });
    
    container.appendChild(controlsDiv);
}

function createFlowchartCanvas(container) {
    canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    canvas.style.width = '100%';
    canvas.style.height = '600px';
    canvas.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    canvas.style.border = '2px solid #dee2e6';
    canvas.style.borderRadius = '10px';
    canvas.style.cursor = 'grab';
    
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
    
    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}

let scale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let lastPanX = 0;
let lastPanY = 0;

function setupComprehensiveEventListeners() {
    if (!canvas) return;
    
    // Enhanced mouse events
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    // Resize handler with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
}

function handleProgramUpdate(event) {
    console.log('Program structure updated, rebuilding flowchart...');
    
    // Clear previous state
    clearFlowchart();
    
    // Parse program blocks into AST
    const ast = parseBlocksToAST();
    
    if (!ast || ast.children.length === 0) {
        showEmptyFlowchartMessage();
        return;
    }
    
    // Generate flowchart from AST
    generateFlowchartFromAST(ast);
    
    // Calculate optimal layout
    calculateOptimalLayout();
    
    // Generate connections with proper flow
    generateSmartConnections();
    
    // Redraw with animations
    animateFlowchartUpdate();
    
    console.log('Flowchart rebuilt with', flowchartNodes.length, 'nodes');
}

function parseBlocksToAST() {
    if (typeof programBlocks === 'undefined' || !programBlocks.length) {
        return null;
    }
    
    const ast = {
        type: ASTNodeTypes.PROGRAM,
        children: [],
        level: 0
    };
    
    let currentLevel = 0;
    let blockStack = [ast];
    let nodeId = 0;
    
    programBlocks.forEach((block, index) => {
        const code = block.code.trim();
        const node = {
            id: ++nodeId,
            type: classifyCodeBlock(code),
            code: code,
            text: block.text || code,
            level: currentLevel,
            blockIndex: index,
            children: []
        };
        
        // Handle block nesting
        if (code.includes('{')) {
            currentLevel++;
            blockStack[blockStack.length - 1].children.push(node);
            blockStack.push(node);
        } else if (code === '}') {
            currentLevel = Math.max(0, currentLevel - 1);
            blockStack.pop();
        } else {
            blockStack[blockStack.length - 1].children.push(node);
        }
    });
    
    return ast;
}

function classifyCodeBlock(code) {
    // Enhanced classification logic
    if (code.includes('#include') || code.includes('#define')) {
        return ASTNodeTypes.INCLUDE;
    }
    if (code.includes('int main()') || code.includes('void main()')) {
        return ASTNodeTypes.MAIN;
    }
    if (code.includes('printf') || code.includes('puts')) {
        return ASTNodeTypes.OUTPUT;
    }
    if (code.includes('scanf') || code.includes('gets')) {
        return ASTNodeTypes.INPUT;
    }
    if (code.includes('if') && code.includes('(')) {
        return ASTNodeTypes.CONDITION;
    }
    if (code.includes('for') || code.includes('while') || code.includes('do')) {
        return ASTNodeTypes.LOOP;
    }
    if (code.includes('return')) {
        return ASTNodeTypes.RETURN;
    }
    if (code.match(/^\s*(int|float|double|char|long)\s+\w+/)) {
        return ASTNodeTypes.DECLARATION;
    }
    if (code.includes('=') && !code.includes('==')) {
        return ASTNodeTypes.ASSIGNMENT;
    }
    
    return ASTNodeTypes.BLOCK;
}

function generateFlowchartFromAST(ast) {
    flowchartNodes = [];
    
    // Always start with start node
    flowchartNodes.push({
        id: 'start',
        type: 'start',
        label: 'Start',
        code: '',
        x: 0, y: 0,
        astNode: null
    });
    
    // Process AST nodes
    processASTNode(ast);
    
    // Always end with end node
    flowchartNodes.push({
        id: 'end',
        type: 'end',
        label: 'End',
        code: '',
        x: 0, y: 0,
        astNode: null
    });
}

function processASTNode(astNode) {
    if (!astNode.children) return;
    
    astNode.children.forEach(child => {
        const flowNode = createFlowNodeFromAST(child);
        if (flowNode) {
            flowchartNodes.push(flowNode);
        }
        
        // Recursively process children for nested structures
        if (child.children && child.children.length > 0) {
            processASTNode(child);
        }
    });
}

function createFlowNodeFromAST(astNode) {
    const nodeType = mapASTToFlowType(astNode.type);
    const label = generateNodeLabel(astNode);
    
    if (astNode.type === ASTNodeTypes.INCLUDE || astNode.type === ASTNodeTypes.MAIN) {
        return null; // Skip these in flowchart
    }
    
    return {
        id: `node_${astNode.id}`,
        type: nodeType,
        label: label,
        code: astNode.code,
        x: 0, y: 0,
        astNode: astNode,
        blockIndex: astNode.blockIndex,
        hasElse: checkForElseBranch(astNode),
        loopType: astNode.type === ASTNodeTypes.LOOP ? getLoopType(astNode.code) : null
    };
}

function mapASTToFlowType(astType) {
    const mapping = {
        [ASTNodeTypes.OUTPUT]: 'output',
        [ASTNodeTypes.INPUT]: 'input',
        [ASTNodeTypes.CONDITION]: 'decision',
        [ASTNodeTypes.LOOP]: 'loop',
        [ASTNodeTypes.DECLARATION]: 'declaration',
        [ASTNodeTypes.ASSIGNMENT]: 'process',
        [ASTNodeTypes.RETURN]: 'process',
        [ASTNodeTypes.BLOCK]: 'process'
    };
    
    return mapping[astType] || 'process';
}

function generateNodeLabel(astNode) {
    const code = astNode.code;
    
    switch (astNode.type) {
        case ASTNodeTypes.OUTPUT:
            const printMatch = code.match(/printf\s*\(\s*"([^"]*)"/);
            return printMatch ? `Print: "${printMatch[1]}"` : 'Output';
            
        case ASTNodeTypes.INPUT:
            const scanMatch = code.match(/scanf\s*\([^,]+,\s*&(\w+)/);
            return scanMatch ? `Read: ${scanMatch[1]}` : 'Input';
            
        case ASTNodeTypes.CONDITION:
            const condMatch = code.match(/if\s*\(\s*([^)]+)\s*\)/);
            return condMatch ? condMatch[1] : 'Condition';
            
        case ASTNodeTypes.LOOP:
            if (code.includes('for')) {
                const forMatch = code.match(/for\s*\([^;]*;\s*([^;]+);/);
                return forMatch ? `For: ${forMatch[1]}` : 'For Loop';
            } else if (code.includes('while')) {
                const whileMatch = code.match(/while\s*\(\s*([^)]+)\s*\)/);
                return whileMatch ? `While: ${whileMatch[1]}` : 'While Loop';
            }
            return 'Loop';
            
        case ASTNodeTypes.DECLARATION:
            const declMatch = code.match(/(int|float|double|char|long)\s+(\w+)/);
            return declMatch ? `Declare: ${declMatch[2]}` : 'Declaration';
            
        case ASTNodeTypes.ASSIGNMENT:
            const assignMatch = code.match(/(\w+)\s*=\s*(.+);/);
            return assignMatch ? `${assignMatch[1]} = ${assignMatch[2]}` : 'Assignment';
            
        case ASTNodeTypes.RETURN:
            return 'Return';
            
        default:
            return code.length > 20 ? code.substring(0, 17) + '...' : code;
    }
}

function checkForElseBranch(astNode) {
    if (astNode.type !== ASTNodeTypes.CONDITION) return false;
    
    // Check if there's an else branch in the next siblings
    if (typeof programBlocks !== 'undefined') {
        const nextIndex = astNode.blockIndex + 1;
        for (let i = nextIndex; i < programBlocks.length; i++) {
            const nextBlock = programBlocks[i];
            if (nextBlock.code.trim() === 'else {') {
                return true;
            }
            if (nextBlock.code.trim() === '}') {
                break;
            }
        }
    }
    
    return false;
}

function getLoopType(code) {
    if (code.includes('for')) return 'for';
    if (code.includes('while')) return 'while';
    if (code.includes('do')) return 'do-while';
    return 'unknown';
}

function calculateOptimalLayout() {
    if (flowchartNodes.length === 0) return;
    
    const containerWidth = canvas.width / (window.devicePixelRatio || 1);
    const containerHeight = canvas.height / (window.devicePixelRatio || 1);
    
    // Enhanced layout algorithm
    const startY = 80;
    const baseSpacing = 120;
    const branchSpacing = 200;
    const centerX = containerWidth / 2;
    
    let currentY = startY;
    let currentLevel = 0;
    const levelOffsets = new Map();
    
    flowchartNodes.forEach((node, index) => {
        // Calculate X position based on nesting level
        const level = node.astNode ? node.astNode.level : 0;
        let xOffset = 0;
        
        if (node.type === 'decision' && node.hasElse) {
            // Special handling for if-else branches
            levelOffsets.set(level + 1, branchSpacing);
            levelOffsets.set(level + 2, -branchSpacing);
        }
        
        if (levelOffsets.has(level)) {
            xOffset = levelOffsets.get(level);
        }
        
        node.x = centerX + xOffset;
        node.y = currentY;
        
        // Calculate next Y position
        const nodeHeight = nodeTypes[node.type]?.height || 60;
        currentY += nodeHeight + baseSpacing;
        
        // Adjust spacing for special nodes
        if (node.type === 'decision') {
            currentY += 40; // Extra space for decision nodes
        }
    });
    
    // Post-process for better branch visualization
    optimizeBranchLayout();
}

function optimizeBranchLayout() {
    const centerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;
    const branchOffset = 180;
    
    flowchartNodes.forEach((node, index) => {
        if (node.type === 'decision' && node.hasElse) {
            // Find the true and false branches
            const trueBranch = flowchartNodes[index + 1];
            const falseBranch = findElseBranch(index);
            
            if (trueBranch) {
                trueBranch.x = centerX + branchOffset;
                trueBranch.branchLabel = 'Yes';
            }
            
            if (falseBranch) {
                falseBranch.x = centerX - branchOffset;
                falseBranch.branchLabel = 'No';
            }
        }
    });
}

function findElseBranch(decisionIndex) {
    for (let i = decisionIndex + 1; i < flowchartNodes.length; i++) {
        const node = flowchartNodes[i];
        if (node.astNode && node.astNode.code.includes('else')) {
            return flowchartNodes[i + 1]; // Return the node after 'else {'
        }
    }
    return null;
}

function generateSmartConnections() {
    flowchartConnections = [];
    
    for (let i = 0; i < flowchartNodes.length - 1; i++) {
        const source = flowchartNodes[i];
        const target = flowchartNodes[i + 1];
        
        // Smart connection generation based on node types
        if (source.type === 'decision') {
            // Handle decision branches
            generateDecisionConnections(source, i);
        } else if (source.type === 'loop') {
            // Handle loop connections
            generateLoopConnections(source, i);
        } else {
            // Standard linear connection
            flowchartConnections.push({
                source: source,
                target: target,
                type: 'normal',
                label: ''
            });
        }
    }
}

function generateDecisionConnections(decisionNode, index) {
    const trueBranch = flowchartNodes[index + 1];
    const falseBranch = findElseBranch(index);
    
    if (trueBranch) {
        flowchartConnections.push({
            source: decisionNode,
            target: trueBranch,
            type: 'decision-true',
            label: 'Yes'
        });
    }
    
    if (falseBranch) {
        flowchartConnections.push({
            source: decisionNode,
            target: falseBranch,
            type: 'decision-false',
            label: 'No'
        });
    } else if (!falseBranch && index + 2 < flowchartNodes.length) {
        // Connect to merge point
        flowchartConnections.push({
            source: decisionNode,
            target: flowchartNodes[index + 2],
            type: 'decision-false',
            label: 'No'
        });
    }
}

function generateLoopConnections(loopNode, index) {
    const loopBody = flowchartNodes[index + 1];
    
    if (loopBody) {
        // Entry to loop body
        flowchartConnections.push({
            source: loopNode,
            target: loopBody,
            type: 'loop-entry',
            label: 'Enter'
        });
        
        // Find loop end and create feedback connection
        const loopEnd = findLoopEnd(index);
        if (loopEnd) {
            flowchartConnections.push({
                source: loopEnd,
                target: loopNode,
                type: 'loop-feedback',
                label: 'Loop'
            });
        }
    }
}

function findLoopEnd(loopStartIndex) {
    let braceCount = 0;
    for (let i = loopStartIndex; i < flowchartNodes.length; i++) {
        const node = flowchartNodes[i];
        if (node.code.includes('{')) braceCount++;
        if (node.code === '}') {
            braceCount--;
            if (braceCount === 0) {
                return node;
            }
        }
    }
    return null;
}

function animateFlowchartUpdate() {
    // Clear and redraw with fade-in animation
    ctx.globalAlpha = 0;
    redrawCanvas();
    
    let alpha = 0;
    const fadeIn = () => {
        alpha += 0.05;
        ctx.globalAlpha = alpha;
        redrawCanvas();
        
        if (alpha < 1) {
            requestAnimationFrame(fadeIn);
        } else {
            ctx.globalAlpha = 1;
        }
    };
    
    requestAnimationFrame(fadeIn);
}

function redrawCanvas() {
    if (!ctx) return;
    
    // Clear with gradient background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up transformation
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
    
    if (flowchartNodes.length === 0) {
        showEmptyFlowchartMessage();
    } else {
        // Draw connections first
        drawEnhancedConnections();
        
        // Draw nodes with enhanced styling
        drawEnhancedNodes();
        
        // Draw execution path if active
        if (executionPath.length > 0) {
            drawExecutionPath();
        }
    }
    
    ctx.restore();
    
    // Draw UI elements
    drawEnhancedControls();
}

function drawEnhancedConnections() {
    flowchartConnections.forEach(connection => {
        drawEnhancedConnection(connection);
    });
}

function drawEnhancedConnection(connection) {
    const { source, target, type, label } = connection;
    
    ctx.save();
    
    // Enhanced connection styling based on type
    const styles = {
        'normal': { color: '#555', width: 2, dash: [] },
        'decision-true': { color: '#4CAF50', width: 3, dash: [] },
        'decision-false': { color: '#f44336', width: 3, dash: [] },
        'loop-entry': { color: '#FF9800', width: 2, dash: [] },
        'loop-feedback': { color: '#9C27B0', width: 2, dash: [5, 5] }
    };
    
    const style = styles[type] || styles.normal;
    
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.setLineDash(style.dash);
    
    // Calculate connection points
    const sourceNodeType = nodeTypes[source.type];
    const targetNodeType = nodeTypes[target.type];
    
    const startY = source.y + (sourceNodeType.height / 2);
    const endY = target.y - (targetNodeType.height / 2);
    
    // Smart path routing
    ctx.beginPath();
    
    if (Math.abs(source.x - target.x) > 100) {
        // Curved path for branched connections
        const midY = startY + (endY - startY) * 0.5;
        ctx.moveTo(source.x, startY);
        ctx.bezierCurveTo(
            source.x, midY,
            target.x, midY,
            target.x, endY
        );
    } else {
        // Straight path
        ctx.moveTo(source.x, startY);
        ctx.lineTo(target.x, endY);
    }
    
    ctx.stroke();
    
    // Enhanced arrowhead
    drawEnhancedArrowhead(target.x, endY, Math.atan2(endY - startY, target.x - source.x) + Math.PI/2, style.color);
    
    // Enhanced label
    if (label) {
        drawEnhancedLabel(
            (source.x + target.x) / 2,
            (startY + endY) / 2,
            label,
            style.color
        );
    }
    
    ctx.restore();
}

function drawEnhancedArrowhead(x, y, angle, color) {
    const size = 12;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size/2);
    ctx.lineTo(-size*0.6, 0);
    ctx.lineTo(-size, size/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function drawEnhancedLabel(x, y, text, color) {
    ctx.save();
    
    // Enhanced label styling
    ctx.font = 'bold 11px Arial, sans-serif';
    const metrics = ctx.measureText(text);
    const padding = 6;
    const width = metrics.width + padding * 2;
    const height = 18;
    
    // Label background with shadow
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(x - width/2, y - height/2, width, height);
    ctx.strokeRect(x - width/2, y - height/2, width, height);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Label text
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    
    ctx.restore();
}

function drawEnhancedNodes() {
    flowchartNodes.forEach(node => {
        drawEnhancedNode(node);
    });
}

function drawEnhancedNode(node) {
    const nodeConfig = nodeTypes[node.type];
    const isHovered = node === hoveredNode;
    const isExecuted = executionPath.includes(node.id);
    
    ctx.save();
    ctx.translate(node.x, node.y);
    
    // Enhanced hover and execution effects
    if (isHovered || isExecuted) {
        ctx.shadowColor = isExecuted ? 'rgba(76, 175, 80, 0.5)' : 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = isExecuted ? 15 : 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    // Node styling
    ctx.fillStyle = isExecuted ? '#4CAF50' : nodeConfig.color;
    ctx.strokeStyle = isHovered ? '#333' : '#555';
    ctx.lineWidth = isHovered ? 3 : 2;
    
    // Draw shape based on type
    const width = nodeConfig.width;
    const height = nodeConfig.height;
    
    switch (nodeConfig.shape) {
        case 'ellipse':
            drawEnhancedEllipse(0, 0, width/2, height/2);
            break;
        case 'rect':
            drawEnhancedRectangle(-width/2, -height/2, width, height, 8);
            break;
        case 'diamond':
            drawEnhancedDiamond(0, 0, width, height);
            break;
        case 'parallelogram':
            drawEnhancedParallelogram(-width/2, -height/2, width, height, 15);
            break;
        case 'hexagon':
            drawEnhancedHexagon(0, 0, width, height);
            break;
    }
    
    // Enhanced text rendering
    drawEnhancedNodeText(node.label, width - 20);
    
    // Execution indicator
    if (isExecuted) {
        drawExecutionIndicator();
    }
    
    ctx.restore();
}

function drawEnhancedEllipse(x, y, radiusX, radiusY) {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawEnhancedRectangle(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();
}

function drawEnhancedDiamond(x, y, width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y - halfHeight);
    ctx.lineTo(x + halfWidth, y);
    ctx.lineTo(x, y + halfHeight);
    ctx.lineTo(x - halfWidth, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawEnhancedParallelogram(x, y, width, height, skew) {
    ctx.beginPath();
    ctx.moveTo(x + skew, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - skew, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawEnhancedHexagon(x, y, width, height) {
    const w = width / 2;
    const h = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x - w * 0.7, y - h);
    ctx.lineTo(x + w * 0.7, y - h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w * 0.7, y + h);
    ctx.lineTo(x - w * 0.7, y + h);
    ctx.lineTo(x - w, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawEnhancedNodeText(text, maxWidth) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text wrapping with better algorithm
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    // Draw lines with proper spacing
    const lineHeight = 14;
    const totalHeight = lines.length * lineHeight;
    const startY = -(totalHeight - lineHeight) / 2;
    
    lines.forEach((line, index) => {
        ctx.fillText(line, 0, startY + (index * lineHeight));
    });
}

function drawExecutionIndicator() {
    // Draw execution checkmark
    ctx.save();
    ctx.translate(25, -25);
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Checkmark
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(-1, 1);
    ctx.lineTo(3, -3);
    ctx.stroke();
    
    ctx.restore();
}

function drawExecutionPath() {
    // Highlight the execution path
    executionPath.forEach((nodeId, index) => {
        const node = flowchartNodes.find(n => n.id === nodeId);
        if (node && index < executionPath.length - 1) {
            const nextNodeId = executionPath[index + 1];
            const nextNode = flowchartNodes.find(n => n.id === nextNodeId);
            
            if (nextNode) {
                drawExecutionConnection(node, nextNode);
            }
        }
    });
}

function drawExecutionConnection(source, target) {
    ctx.save();
    
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    
    const startY = source.y + (nodeTypes[source.type].height / 2);
    const endY = target.y - (nodeTypes[target.type].height / 2);
    
    ctx.beginPath();
    ctx.moveTo(source.x, startY);
    ctx.lineTo(target.x, endY);
    ctx.stroke();
    
    ctx.restore();
}

// Enhanced event handlers
function handleCanvasClick(event) {
    if (isPanning) return;
    
    const coords = getTransformedCoordinates(event.clientX, event.clientY);
    const node = getNodeAtPosition(coords.x, coords.y);
    
    if (node && node.blockIndex !== undefined) {
        highlightCorrespondingBlock(node.blockIndex);
        
        // Dispatch event for block highlighting
        document.dispatchEvent(new CustomEvent('flowchartNodeClicked', {
            detail: { node: node, blockIndex: node.blockIndex }
        }));
    }
}

function handleDoubleClick(event) {
    const coords = getTransformedCoordinates(event.clientX, event.clientY);
    const node = getNodeAtPosition(coords.x, coords.y);
    
    if (node) {
        // Zoom to node
        centerOnNode(node);
    }
}

function centerOnNode(node) {
    const containerWidth = canvas.width / (window.devicePixelRatio || 1);
    const containerHeight = canvas.height / (window.devicePixelRatio || 1);
    
    panX = containerWidth / 2 - node.x * scale;
    panY = containerHeight / 2 - node.y * scale;
    
    redrawCanvas();
}

// Enhanced utility functions
function handleExecutionStart(event) {
    isExecuting = true;
    executionPath = [];
    redrawCanvas();
}

function handleExecutionResult(event) {
    const result = event.detail;
    if (result.success) {
        // Simulate execution path based on code structure
        simulateExecutionPath();
    }
    isExecuting = false;
}

function simulateExecutionPath() {
    executionPath = ['start'];
    
    // Add logic to trace through the flowchart based on program execution
    flowchartNodes.forEach(node => {
        if (node.id !== 'start' && node.id !== 'end') {
            executionPath.push(node.id);
        }
    });
    
    executionPath.push('end');
    redrawCanvas();
}

function analyzeProgram() {
    if (flowchartNodes.length === 0) {
        showNotification('No program to analyze', 'warning');
        return;
    }
    
    const analysis = {
        totalNodes: flowchartNodes.length,
        decisions: flowchartNodes.filter(n => n.type === 'decision').length,
        loops: flowchartNodes.filter(n => n.type === 'loop').length,
        complexity: calculateComplexity()
    };
    
    showAnalysisModal(analysis);
}

function calculateComplexity() {
    let complexity = 1; // Base complexity
    
    flowchartNodes.forEach(node => {
        if (node.type === 'decision') complexity += 1;
        if (node.type === 'loop') complexity += 2;
    });
    
    return complexity;
}

function showAnalysisModal(analysis) {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Program Analysis</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-6">
                            <strong>Total Nodes:</strong> ${analysis.totalNodes}
                        </div>
                        <div class="col-6">
                            <strong>Decisions:</strong> ${analysis.decisions}
                        </div>
                        <div class="col-6">
                            <strong>Loops:</strong> ${analysis.loops}
                        </div>
                        <div class="col-6">
                            <strong>Complexity:</strong> ${analysis.complexity}
                        </div>
                    </div>
                    <hr>
                    <div class="alert alert-info">
                        <strong>Complexity Level:</strong> ${
                            analysis.complexity <= 3 ? 'Simple' :
                            analysis.complexity <= 7 ? 'Moderate' : 'Complex'
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.remove();
    }, 10000);
}

function clearExecutionPath() {
    executionPath = [];
    redrawCanvas();
    showNotification('Execution path cleared', 'info', 2000);
}

function clearFlowchart() {
    flowchartNodes = [];
    flowchartConnections = [];
    executionPath = [];
    hoveredNode = null;
}

// Enhanced mouse and interaction handlers
function getTransformedCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ((clientX - rect.left) * scaleX - panX) / scale;
    const y = ((clientY - rect.top) * scaleY - panY) / scale;
    
    return { x, y };
}

function getNodeAtPosition(x, y) {
    for (let node of flowchartNodes) {
        if (isPointInNode(x, y, node)) {
            return node;
        }
    }
    return null;
}

function isPointInNode(x, y, node) {
    const dx = x - node.x;
    const dy = y - node.y;
    const nodeConfig = nodeTypes[node.type];
    const width = nodeConfig.width;
    const height = nodeConfig.height;
    
    switch (nodeConfig.shape) {
        case 'ellipse':
            return (dx * dx) / ((width/2) * (width/2)) + (dy * dy) / ((height/2) * (height/2)) <= 1;
        case 'rect':
            return dx >= -width/2 && dx <= width/2 && dy >= -height/2 && dy <= height/2;
        case 'diamond':
            return Math.abs(dx) / (width/2) + Math.abs(dy) / (height/2) <= 1;
        case 'parallelogram':
            return dx >= -width/2 && dx <= width/2 && dy >= -height/2 && dy <= height/2;
        case 'hexagon':
            return Math.abs(dx) <= width/2 && Math.abs(dy) <= height/2;
        default:
            return false;
    }
}

function handleMouseMove(event) {
    if (isPanning) {
        panX += event.clientX - lastPanX;
        panY += event.clientY - lastPanY;
        lastPanX = event.clientX;
        lastPanY = event.clientY;
        redrawCanvas();
        return;
    }
    
    const coords = getTransformedCoordinates(event.clientX, event.clientY);
    const node = getNodeAtPosition(coords.x, coords.y);
    
    if (node !== hoveredNode) {
        hoveredNode = node;
        canvas.style.cursor = node ? 'pointer' : 'grab';
        
        if (node) {
            showEnhancedTooltip(event, node);
        } else {
            hideTooltip();
        }
        
        redrawCanvas();
    }
}

function handleMouseDown(event) {
    if (event.button === 0) {
        isPanning = true;
        lastPanX = event.clientX;
        lastPanY = event.clientY;
        canvas.style.cursor = 'grabbing';
    }
}

function handleMouseUp(event) {
    if (event.button === 0) {
        isPanning = false;
        canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }
}

function handleWheel(event) {
    event.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, scale * zoomFactor));
    
    if (newScale !== scale) {
        panX = mouseX - (mouseX - panX) * (newScale / scale);
        panY = mouseY - (mouseY - panY) * (newScale / scale);
        scale = newScale;
        redrawCanvas();
    }
}

function handleKeyDown(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Don't interfere with text input
    }
    
    switch (event.key) {
        case 'r':
        case 'R':
            resetView();
            break;
        case 'f':
        case 'F':
            fitToView();
            break;
        case 'c':
        case 'C':
            clearExecutionPath();
            break;
        case 'a':
        case 'A':
            analyzeProgram();
            break;
        case 'Escape':
            clearExecutionPath();
            break;
    }
}

function handleMouseLeave() {
    hoveredNode = null;
    canvas.style.cursor = 'default';
    hideTooltip();
    redrawCanvas();
}

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    handleCanvasClick(mouseEvent);
}

function handleTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handleMouseMove(mouseEvent);
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    handleMouseLeave();
}

function handleResize() {
    if (canvas) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '600px';
        redrawCanvas();
    }
}

// Enhanced tooltip system
function createEnhancedTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'flowchart-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8));
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-family: 'Segoe UI', Arial, sans-serif;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
        max-width: 250px;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(tooltip);
}

function showEnhancedTooltip(event, node) {
    if (!tooltip) return;
    
    const info = [
        `<strong>${node.label}</strong>`,
        `Type: ${node.type}`,
        node.code ? `Code: ${node.code}` : '',
        node.blockIndex !== undefined ? `Block: ${node.blockIndex + 1}` : ''
    ].filter(Boolean).join('<br>');
    
    tooltip.innerHTML = info;
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
    tooltip.style.opacity = '1';
}

function hideTooltip() {
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}

function resetView() {
    scale = 1;
    panX = 0;
    panY = 0;
    redrawCanvas();
}

function fitToView() {
    if (flowchartNodes.length === 0) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    flowchartNodes.forEach(node => {
        const nodeConfig = nodeTypes[node.type];
        const halfWidth = nodeConfig.width / 2;
        const halfHeight = nodeConfig.height / 2;
        
        minX = Math.min(minX, node.x - halfWidth);
        minY = Math.min(minY, node.y - halfHeight);
        maxX = Math.max(maxX, node.x + halfWidth);
        maxY = Math.max(maxY, node.y + halfHeight);
    });
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const margin = 80;
    
    const containerWidth = canvas.width / (window.devicePixelRatio || 1);
    const containerHeight = canvas.height / (window.devicePixelRatio || 1);
    
    const scaleX = (containerWidth - margin * 2) / contentWidth;
    const scaleY = (containerHeight - margin * 2) / contentHeight;
    
    scale = Math.min(scaleX, scaleY, 2);
    
    panX = (containerWidth - contentWidth * scale) / 2 - minX * scale;
    panY = (containerHeight - contentHeight * scale) / 2 - minY * scale;
    
    redrawCanvas();
}

function drawEnhancedControls() {
    ctx.save();
    
    // Enhanced zoom indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 100, 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Zoom: ${Math.round(scale * 100)}%`, 15, 25);
    
    // Enhanced instructions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'right';
    const instructions = [
        'Scroll: Zoom | Drag: Pan | Click: Highlight',
        'R: Reset | F: Fit | A: Analyze | C: Clear'
    ];
    
    instructions.forEach((instruction, index) => {
        const y = (canvas.height / (window.devicePixelRatio || 1)) - 25 + (index * 12);
        ctx.fillText(instruction, (canvas.width / (window.devicePixelRatio || 1)) - 10, y);
    });
    
    ctx.restore();
}

function showEmptyFlowchartMessage() {
    const containerWidth = canvas.width / (window.devicePixelRatio || 1);
    const containerHeight = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.fillStyle = '#999';
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Build your program with blocks', containerWidth / 2, containerHeight / 2 - 20);
    
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('to see the interactive flowchart', containerWidth / 2, containerHeight / 2 + 10);
}

function highlightCorrespondingBlock(blockIndex) {
    // Enhanced block highlighting with animation
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('flowchart-highlight', 'flowchart-pulse');
    });
    
    const dropZones = document.querySelectorAll('.drop-zone');
    if (dropZones[blockIndex]) {
        const zone = dropZones[blockIndex];
        zone.classList.add('flowchart-highlight', 'flowchart-pulse');
        zone.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
        });
        
        // Enhanced highlight with pulse animation
        setTimeout(() => {
            zone.classList.remove('flowchart-pulse');
        }, 1000);
        
        setTimeout(() => {
            zone.classList.remove('flowchart-highlight');
        }, 4000);
    }
}

// Public API functions
window.updateFlowchart = handleProgramUpdate;
window.syncFlowchartWithBlocks = handleProgramUpdate;
window.retryFlowchartInit = function() {
    if (document.getElementById('flowchart-container')) {
        initializeFlowchart();
        handleProgramUpdate();
    }
};

window.highlightFlowchartNode = function(nodeId) {
    const node = flowchartNodes.find(n => n.id === nodeId);
    if (node) {
        centerOnNode(node);
        hoveredNode = node;
        redrawCanvas();
        
        setTimeout(() => {
            hoveredNode = null;
            redrawCanvas();
        }, 2000);
    }
};

// Initialize notification system if not available
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info', duration = 3000) {
        console.log(`[${type.toUpperCase()}] ${message}`);
    };
}
