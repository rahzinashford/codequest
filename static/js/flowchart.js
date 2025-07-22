
// Flowchart functionality for CodeQuest
// Syncs with visual blocks to show program flow

let flowchartSvg = null;
let flowchartNodes = [];
let flowchartConnections = [];

// Flowchart node types and their visual properties
const nodeTypes = {
    'start': { shape: 'ellipse', color: '#4CAF50', label: 'Start' },
    'end': { shape: 'ellipse', color: '#f44336', label: 'End' },
    'process': { shape: 'rect', color: '#2196F3', label: 'Process' },
    'decision': { shape: 'diamond', color: '#FF9800', label: 'Decision' },
    'input': { shape: 'parallelogram', color: '#9C27B0', label: 'Input' },
    'output': { shape: 'parallelogram', color: '#00BCD4', label: 'Output' },
    'loop': { shape: 'hexagon', color: '#795548', label: 'Loop' }
};

// Initialize flowchart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('flowchart-container')) {
        // Wait for D3 to load with retries
        waitForD3(() => {
            initializeFlowchart();
            // Listen for program structure updates
            document.addEventListener('programStructureUpdated', updateFlowchart);
        });
    }
});

function waitForD3(callback, retries = 0) {
    const maxRetries = 50; // Wait up to 5 seconds
    
    if (typeof d3 !== 'undefined') {
        console.log('D3.js is available, initializing flowchart...');
        callback();
        return;
    }
    
    if (retries < maxRetries) {
        setTimeout(() => waitForD3(callback, retries + 1), 100);
    } else {
        console.error('D3.js library not loaded after waiting. Flowchart functionality disabled.');
        showD3ErrorMessage();
    }
}

function initializeFlowchart() {
    console.log('Initializing flowchart...');
    
    const container = document.getElementById('flowchart-container');
    if (!container) return;
    
    // Create SVG element
    flowchartSvg = d3.select('#flowchart-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '500')
        .attr('viewBox', '0 0 800 500')
        .style('background', '#f8f9fa')
        .style('border', '2px solid #dee2e6')
        .style('border-radius', '10px');
    
    // Add arrow markers for connections
    const defs = flowchartSvg.append('defs');
    defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#666');
    
    console.log('Flowchart initialized');
}

function updateFlowchart() {
    if (!flowchartSvg || typeof d3 === 'undefined') return;
    
    console.log('Updating flowchart from program blocks...');
    
    // Get current program structure
    updateProgramStructure();
    
    // Clear existing flowchart
    flowchartSvg.selectAll('*:not(defs)').remove();
    
    // Generate flowchart nodes from program blocks
    flowchartNodes = generateFlowchartNodes();
    
    if (flowchartNodes.length === 0) {
        showEmptyFlowchartMessage();
        return;
    }
    
    // Calculate positions for nodes
    calculateNodePositions();
    
    // Draw connections first (so they appear behind nodes)
    drawConnections();
    
    // Draw nodes
    drawNodes();
    
    console.log('Flowchart updated with', flowchartNodes.length, 'nodes');
}

function generateFlowchartNodes() {
    const nodes = [];
    let nodeId = 0;
    
    // Always start with a start node
    nodes.push({
        id: nodeId++,
        type: 'start',
        label: 'Start',
        code: '',
        x: 0,
        y: 0
    });
    
    // Process each program block
    programBlocks.forEach((block, index) => {
        const code = block.code.trim();
        let nodeType = 'process';
        let label = code;
        
        // Determine node type based on code content
        if (code.includes('printf')) {
            nodeType = 'output';
            label = extractPrintfText(code);
        } else if (code.includes('scanf')) {
            nodeType = 'input';
            label = extractScanfText(code);
        } else if (code.includes('if') && code.includes('{')) {
            nodeType = 'decision';
            label = extractCondition(code);
        } else if (code.includes('for') || code.includes('while')) {
            nodeType = 'loop';
            label = extractLoopCondition(code);
        } else if (code === 'return 0;') {
            // Skip return 0; as we'll add an end node
            return;
        } else if (code === '}') {
            // Skip closing braces
            return;
        } else if (code.includes('#include') || code.includes('int main()')) {
            // Skip includes and main declaration
            return;
        }
        
        nodes.push({
            id: nodeId++,
            type: nodeType,
            label: label,
            code: code,
            x: 0,
            y: 0,
            blockIndex: index
        });
    });
    
    // Always end with an end node
    nodes.push({
        id: nodeId++,
        type: 'end',
        label: 'End',
        code: '',
        x: 0,
        y: 0
    });
    
    return nodes;
}

function extractPrintfText(code) {
    const match = code.match(/printf\s*\(\s*"([^"]*)"/);
    return match ? `Output: "${match[1]}"` : 'Output';
}

function extractScanfText(code) {
    const match = code.match(/scanf\s*\(\s*"([^"]*)".*?&(\w+)/);
    return match ? `Input: ${match[2]}` : 'Input';
}

function extractCondition(code) {
    const match = code.match(/if\s*\(\s*([^)]+)\s*\)/);
    return match ? match[1] : 'Condition';
}

function extractLoopCondition(code) {
    if (code.includes('for')) {
        const match = code.match(/for\s*\([^;]*;\s*([^;]+);/);
        return match ? `Loop: ${match[1]}` : 'For Loop';
    } else if (code.includes('while')) {
        const match = code.match(/while\s*\(\s*([^)]+)\s*\)/);
        return match ? `While: ${match[1]}` : 'While Loop';
    }
    return 'Loop';
}

function calculateNodePositions() {
    const containerWidth = 800;
    const containerHeight = 500;
    const nodeSpacing = 80;
    const startY = 50;
    
    // Simple vertical layout
    flowchartNodes.forEach((node, index) => {
        node.x = containerWidth / 2;
        node.y = startY + (index * nodeSpacing);
    });
    
    // Adjust for branching (if/else structures)
    adjustForBranching();
}

function adjustForBranching() {
    // Look for decision nodes and adjust layout
    flowchartNodes.forEach((node, index) => {
        if (node.type === 'decision') {
            // Move subsequent nodes to show branching
            const nextNodes = flowchartNodes.slice(index + 1);
            nextNodes.forEach((nextNode, i) => {
                if (i === 0) {
                    // First node after decision goes to the right (true branch)
                    nextNode.x += 150;
                } else if (i === 1 && nextNode.type !== 'end') {
                    // Second node might be else branch
                    nextNode.x -= 150;
                }
            });
        }
    });
}

function drawNodes() {
    const nodeGroups = flowchartSvg.selectAll('.node')
        .data(flowchartNodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // Draw node shapes
    nodeGroups.each(function(d) {
        const group = d3.select(this);
        const nodeConfig = nodeTypes[d.type];
        
        switch (nodeConfig.shape) {
            case 'ellipse':
                group.append('ellipse')
                    .attr('rx', 60)
                    .attr('ry', 25)
                    .attr('fill', nodeConfig.color)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                break;
                
            case 'rect':
                group.append('rect')
                    .attr('x', -80)
                    .attr('y', -20)
                    .attr('width', 160)
                    .attr('height', 40)
                    .attr('rx', 5)
                    .attr('fill', nodeConfig.color)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                break;
                
            case 'diamond':
                group.append('polygon')
                    .attr('points', '0,-30 80,0 0,30 -80,0')
                    .attr('fill', nodeConfig.color)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                break;
                
            case 'parallelogram':
                group.append('polygon')
                    .attr('points', '-70,-20 70,-20 80,20 -60,20')
                    .attr('fill', nodeConfig.color)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                break;
                
            case 'hexagon':
                group.append('polygon')
                    .attr('points', '-60,-20 -40,-30 40,-30 60,-20 40,30 -40,30')
                    .attr('fill', nodeConfig.color)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                break;
        }
    });
    
    // Add text labels
    nodeGroups.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .each(function(d) {
            const text = d3.select(this);
            const words = d.label.split(' ');
            
            if (words.length > 1 && d.label.length > 15) {
                // Split long labels into multiple lines
                text.text('');
                words.forEach((word, i) => {
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', i === 0 ? 0 : '1.2em')
                        .text(word);
                });
            } else {
                text.text(d.label.length > 20 ? d.label.substring(0, 17) + '...' : d.label);
            }
        });
    
    // Add hover effects
    nodeGroups
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this).select('rect, ellipse, polygon')
                .attr('stroke-width', 3)
                .attr('filter', 'brightness(1.1)');
            
            // Show tooltip with full code
            showNodeTooltip(event, d);
        })
        .on('mouseout', function(event, d) {
            d3.select(this).select('rect, ellipse, polygon')
                .attr('stroke-width', 2)
                .attr('filter', 'none');
            
            hideNodeTooltip();
        })
        .on('click', function(event, d) {
            if (d.blockIndex !== undefined) {
                highlightCorrespondingBlock(d.blockIndex);
            }
        });
}

function drawConnections() {
    const connections = [];
    
    // Create connections between consecutive nodes
    for (let i = 0; i < flowchartNodes.length - 1; i++) {
        const source = flowchartNodes[i];
        const target = flowchartNodes[i + 1];
        
        connections.push({
            source: source,
            target: target,
            type: 'normal'
        });
    }
    
    // Draw connection lines
    flowchartSvg.selectAll('.connection')
        .data(connections)
        .enter()
        .append('line')
        .attr('class', 'connection')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y + 25)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y - 25)
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');
}

function showEmptyFlowchartMessage() {
    flowchartSvg.append('text')
        .attr('x', 400)
        .attr('y', 250)
        .attr('text-anchor', 'middle')
        .attr('fill', '#999')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '18px')
        .text('Drag code blocks to see the flowchart');
}

function showNodeTooltip(event, data) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'flowchart-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('font-family', 'monospace')
        .style('z-index', '1000')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    
    tooltip.html(data.code || data.label)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
}

function hideNodeTooltip() {
    d3.selectAll('.flowchart-tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
}

function highlightCorrespondingBlock(blockIndex) {
    // Remove existing highlights
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('flowchart-highlight');
    });
    
    // Highlight the corresponding block
    const dropZones = document.querySelectorAll('.drop-zone');
    if (dropZones[blockIndex]) {
        dropZones[blockIndex].classList.add('flowchart-highlight');
        dropZones[blockIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
            dropZones[blockIndex].classList.remove('flowchart-highlight');
        }, 3000);
    }
}

function syncFlowchartWithBlocks() {
    updateFlowchart();
}

function showD3ErrorMessage() {
    const container = document.getElementById('flowchart-container');
    if (container) {
        const isOnline = navigator.onLine;
        const errorMessage = isOnline 
            ? 'Unable to load the flowchart library. This may be temporary.'
            : 'No internet connection detected. Flowchart requires network access.';
        
        container.innerHTML = `
            <div class="d-flex align-items-center justify-content-center h-100">
                <div class="text-center p-4">
                    <i class="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                    <h5>Flowchart Temporarily Unavailable</h5>
                    <p class="text-muted mb-3">${errorMessage}</p>
                    <div>
                        <button class="btn btn-outline-primary me-2" onclick="location.reload()">
                            <i class="fas fa-refresh me-1"></i>Refresh Page
                        </button>
                        <button class="btn btn-outline-secondary" onclick="switchToVisualMode()">
                            <i class="fas fa-cubes me-1"></i>Use Visual Blocks
                        </button>
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            Network status: ${isOnline ? 'Connected' : 'Offline'}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }
}

function switchToVisualMode() {
    document.getElementById('visualMode').checked = true;
    document.getElementById('visual-mode-container').style.display = 'block';
    document.getElementById('flowchart-mode-container').style.display = 'none';
}

function safeUpdateFlowchart() {
    if (typeof d3 === 'undefined') {
        console.warn('D3.js not available, skipping flowchart update');
        return;
    }
    updateFlowchart();
}

// Export functions
window.updateFlowchart = safeUpdateFlowchart;
window.syncFlowchartWithBlocks = safeUpdateFlowchart;
window.retryFlowchartInit = function() {
    if (document.getElementById('flowchart-container')) {
        waitForD3(() => {
            initializeFlowchart();
            updateFlowchart();
        });
    }
};
window.switchToVisualMode = switchToVisualMode;
