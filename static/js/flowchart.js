// Flowchart Generation for Colunn IDE

let flowchartSvg = null;
let nodeCounter = 0;

function initializeFlowchart() {
    const container = document.getElementById('flowchart-container');
    if (!container) {
        console.error('Flowchart container not found');
        return;
    }

    // Create SVG element
    flowchartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    flowchartSvg.setAttribute('width', '100%');
    flowchartSvg.setAttribute('height', '600');
    flowchartSvg.setAttribute('viewBox', '0 0 800 600');
    flowchartSvg.style.border = '1px solid #dee2e6';
    flowchartSvg.style.backgroundColor = '#f8f9fa';

    // Add initial message
    addTextNode(400, 300, 'Generate flowchart from your blocks or code', 'text-muted');

    container.innerHTML = '';
    container.appendChild(flowchartSvg);
    
    console.log('Flowchart initialized successfully');
}

function generateFlowchart() {
    if (!flowchartSvg) {
        initializeFlowchart();
        return;
    }

    // Clear existing flowchart
    flowchartSvg.innerHTML = '';
    nodeCounter = 0;

    let nodes = [];
    let currentY = 50;
    const nodeSpacing = 100;
    const centerX = 400;

    if (window.Colunn && window.Colunn.currentMode === 'blocks' && window.Colunn.programBlocks.length > 0) {
        // Generate from blocks
        nodes = generateFromBlocks();
    } else if (window.Colunn && window.Colunn.currentMode === 'text' && typeof getEditorContent === 'function') {
        // Generate from code
        const code = getEditorContent();
        nodes = generateFromCode(code);
    } else {
        // No content to generate from
        addTextNode(centerX, 300, 'No code or blocks to generate flowchart from', 'text-muted');
        return;
    }

    if (nodes.length === 0) {
        addTextNode(centerX, 300, 'No flowchart elements found', 'text-muted');
        return;
    }

    // Add start node
    addFlowchartNode(centerX, currentY, 'START', 'oval', '#28a745');
    currentY += nodeSpacing;

    // Add program nodes
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        addFlowchartNode(centerX, currentY, node.text, node.shape, node.color);
        
        // Add connector from previous node
        if (i === 0) {
            addConnector(centerX, currentY - nodeSpacing, centerX, currentY);
        } else {
            addConnector(centerX, currentY - nodeSpacing, centerX, currentY);
        }
        
        currentY += nodeSpacing;
    }

    // Add end node
    addFlowchartNode(centerX, currentY, 'END', 'oval', '#dc3545');
    addConnector(centerX, currentY - nodeSpacing, centerX, currentY);
}

function generateFromBlocks() {
    const nodes = [];
    
    for (const block of window.Colunn.programBlocks) {
        const node = analyzeBlockForFlowchart(block);
        if (node) {
            nodes.push(node);
        }
    }
    
    return nodes;
}

function generateFromCode(code) {
    const nodes = [];
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
        const node = analyzeCodeLineForFlowchart(line);
        if (node) {
            nodes.push(node);
        }
    }
    
    return nodes;
}

function analyzeBlockForFlowchart(block) {
    const code = block.code.toLowerCase();
    
    if (code.includes('printf') || code.includes('cout') || code.includes('print')) {
        return {
            text: 'Output',
            shape: 'parallelogram',
            color: '#17a2b8'
        };
    } else if (code.includes('scanf') || code.includes('cin') || code.includes('input')) {
        return {
            text: 'Input',
            shape: 'parallelogram',
            color: '#ffc107'
        };
    } else if (code.includes('if')) {
        return {
            text: 'Decision',
            shape: 'diamond',
            color: '#dc3545'
        };
    } else if (code.includes('for') || code.includes('while')) {
        return {
            text: 'Loop',
            shape: 'diamond',
            color: '#6f42c1'
        };
    } else if (code.includes('int') || code.includes('char') || code.includes('=')) {
        return {
            text: 'Process',
            shape: 'rectangle',
            color: '#007bff'
        };
    }
    
    return {
        text: 'Process',
        shape: 'rectangle',
        color: '#6c757d'
    };
}

function analyzeCodeLineForFlowchart(line) {
    const lower = line.toLowerCase();
    
    // Skip common structural lines
    if (lower.includes('#include') || lower.includes('using namespace') || 
        lower.includes('int main') || lower.includes('public class') ||
        lower.includes('return 0') || lower.includes('{') || lower.includes('}')) {
        return null;
    }
    
    if (lower.includes('printf') || lower.includes('cout') || lower.includes('system.out')) {
        return {
            text: 'Output',
            shape: 'parallelogram',
            color: '#17a2b8'
        };
    } else if (lower.includes('scanf') || lower.includes('cin')) {
        return {
            text: 'Input',
            shape: 'parallelogram',
            color: '#ffc107'
        };
    } else if (lower.includes('if (')) {
        return {
            text: 'Decision',
            shape: 'diamond',
            color: '#dc3545'
        };
    } else if (lower.includes('for (') || lower.includes('while (')) {
        return {
            text: 'Loop',
            shape: 'diamond',
            color: '#6f42c1'
        };
    } else if (lower.includes('int ') || lower.includes('char ') || lower.includes('=')) {
        return {
            text: 'Process',
            shape: 'rectangle',
            color: '#007bff'
        };
    }
    
    return null;
}

function addFlowchartNode(x, y, text, shape, color) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', `node-${++nodeCounter}`);
    
    let shapeElement;
    
    switch (shape) {
        case 'oval':
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            shapeElement.setAttribute('cx', x);
            shapeElement.setAttribute('cy', y);
            shapeElement.setAttribute('rx', 60);
            shapeElement.setAttribute('ry', 30);
            break;
            
        case 'diamond':
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const points = `${x},${y-30} ${x+60},${y} ${x},${y+30} ${x-60},${y}`;
            shapeElement.setAttribute('points', points);
            break;
            
        case 'parallelogram':
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const paraPoints = `${x-70},${y-25} ${x+50},${y-25} ${x+70},${y+25} ${x-50},${y+25}`;
            shapeElement.setAttribute('points', paraPoints);
            break;
            
        default: // rectangle
            shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shapeElement.setAttribute('x', x - 60);
            shapeElement.setAttribute('y', y - 25);
            shapeElement.setAttribute('width', 120);
            shapeElement.setAttribute('height', 50);
            shapeElement.setAttribute('rx', 5);
            break;
    }
    
    shapeElement.setAttribute('fill', color);
    shapeElement.setAttribute('stroke', '#ffffff');
    shapeElement.setAttribute('stroke-width', '2');
    shapeElement.setAttribute('opacity', '0.8');
    
    // Add text
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y + 5);
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('fill', '#ffffff');
    textElement.setAttribute('font-family', 'Arial, sans-serif');
    textElement.setAttribute('font-size', '14');
    textElement.setAttribute('font-weight', 'bold');
    textElement.textContent = text;
    
    g.appendChild(shapeElement);
    g.appendChild(textElement);
    flowchartSvg.appendChild(g);
}

function addConnector(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1 + 30); // Offset from node edge
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2 - 30); // Offset to node edge
    line.setAttribute('stroke', '#6c757d');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    
    // Add arrowhead marker if it doesn't exist
    if (!flowchartSvg.querySelector('#arrowhead')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#6c757d');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        flowchartSvg.appendChild(defs);
    }
    
    flowchartSvg.appendChild(line);
}

function addTextNode(x, y, text, className) {
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('fill', '#6c757d');
    textElement.setAttribute('font-family', 'Arial, sans-serif');
    textElement.setAttribute('font-size', '16');
    textElement.textContent = text;
    
    flowchartSvg.appendChild(textElement);
}

function refreshFlowchart() {
    generateFlowchart();
}

function exportFlowchart() {
    if (!flowchartSvg) return;
    
    const svgData = new XMLSerializer().serializeToString(flowchartSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Expose functions globally
window.initializeFlowchart = initializeFlowchart;
window.generateFlowchart = generateFlowchart;
window.refreshFlowchart = refreshFlowchart;
window.exportFlowchart = exportFlowchart;
