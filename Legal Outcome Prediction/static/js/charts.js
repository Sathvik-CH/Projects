/**
 * Renders SHAP visualization using Chart.js
 * @param {string} canvasId - ID of the canvas element
 * @param {Object} shapData - SHAP visualization data
 */
function renderShapVisualization(canvasId, shapData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.shapChart) {
        window.shapChart.destroy();
    }
    
    // Create new chart
    window.shapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: shapData.features,
            datasets: [{
                label: 'Feature Impact',
                data: shapData.values,
                backgroundColor: shapData.colors,
                borderColor: shapData.colors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Factors Affecting the Prediction',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return value > 0 
                                ? `Favors winning by ${(value * 100).toFixed(1)}%` 
                                : `Favors losing by ${(Math.abs(value) * 100).toFixed(1)}%`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Impact on Prediction',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Factors',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renders confidence gauge visualization
 * @param {string} canvasId - ID of the canvas element
 * @param {number} confidence - Confidence value (0-1)
 * @param {string} outcome - Prediction outcome (win/lose)
 */
function renderConfidenceGauge(canvasId, confidence, outcome) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.confidenceChart) {
        window.confidenceChart.destroy();
    }
    
    // Calculate gradient colors based on confidence
    let colors = [];
    if (outcome === 'win') {
        colors = [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(46, 204, 113, 0.7)'
        ];
    } else {
        colors = [
            'rgba(231, 76, 60, 0.7)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)'
        ];
    }
    
    // Create new chart
    window.confidenceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Confidence', 'Uncertainty'],
            datasets: [{
                data: [confidence * 100, (1 - confidence) * 100],
                backgroundColor: [
                    outcome === 'win' ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)',
                    'rgba(189, 195, 199, 0.2)'
                ],
                borderColor: [
                    outcome === 'win' ? 'rgba(39, 174, 96, 1)' : 'rgba(192, 57, 43, 1)',
                    'rgba(189, 195, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            circumference: 180,
            rotation: 270,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.formattedValue + '%';
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Prediction Confidence',
                    font: {
                        size: 16
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    // Add needle and confidence percentage in the center
    Chart.register({
        id: 'gaugeNeedle',
        afterDatasetDraw: function(chart) {
            const width = chart.width;
            const height = chart.height;
            const ctx = chart.ctx;
            
            ctx.save();
            ctx.fillStyle = outcome === 'win' ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 1)';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                (confidence * 100).toFixed(1) + '%', 
                width / 2, 
                height - 5
            );
            
            // Draw arrow
            const angle = Math.PI * (1 - confidence);
            const radius = Math.min(width, height) / 2 * 0.8;
            
            ctx.translate(width / 2, height);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(0, -radius);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#2c3e50';
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(0, -radius, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#2c3e50';
            ctx.fill();
            
            ctx.restore();
        }
    });
}

/**
 * Renders LIME text explanation visualization
 * @param {string} containerId - ID of the container element
 * @param {Array} limeData - LIME explanation data
 */
function renderLimeExplanation(containerId, limeData) {
    const container = document.getElementById(containerId);
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create explanation elements
    limeData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'lime-explanation-item mb-2 p-2 rounded';
        
        // Set background color based on importance
        const alpha = Math.min(0.9, Math.abs(item.importance) * 1.5);
        if (item.is_positive) {
            div.style.backgroundColor = `rgba(46, 204, 113, ${alpha})`;
        } else {
            div.style.backgroundColor = `rgba(231, 76, 60, ${alpha})`;
        }
        
        // Add text and badge
        const textSpan = document.createElement('span');
        textSpan.textContent = item.text;
        
        const badge = document.createElement('span');
        badge.className = `badge ${item.is_positive ? 'bg-success' : 'bg-danger'} ms-2`;
        badge.textContent = item.is_positive ? '+' + (item.importance * 100).toFixed(1) + '%' : (item.importance * 100).toFixed(1) + '%';
        
        div.appendChild(textSpan);
        div.appendChild(badge);
        container.appendChild(div);
    });
}

/**
 * Renders case precedents table
 * @param {string} containerId - ID of the container element
 * @param {Array} precedents - Case precedents data
 */
function renderPrecedentsTable(containerId, precedents) {
    const container = document.getElementById(containerId);
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'table table-hover';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    [ ' ','Summary', ' ','Relevance'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    precedents.forEach(precedent => {
        const row = document.createElement('tr');
        
        // Citation
        const citationCell = document.createElement('td');
        citationCell.textContent = precedent.citation;
        row.appendChild(citationCell);
        
        // Title
        const titleCell = document.createElement('td');
        titleCell.textContent = precedent.title;
        row.appendChild(titleCell);
        
        // Summary
        const summaryCell = document.createElement('td');
        summaryCell.textContent = precedent.summary;
        row.appendChild(summaryCell);
        
        // Relevance
        const relevanceCell = document.createElement('td');
        const relevancePercentage = (precedent.relevance * 100).toFixed(1) + '%';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.style.height = '20px';
        
        const progressBarInner = document.createElement('div');
        progressBarInner.className = 'progress-bar bg-info';
        progressBarInner.style.width = relevancePercentage;
        progressBarInner.textContent = relevancePercentage;
        
        progressBar.appendChild(progressBarInner);
        relevanceCell.appendChild(progressBar);
        row.appendChild(relevanceCell);
        
        // Actions
        const actionsCell = document.createElement('td');
        
        // const copyButton = document.createElement('button');
        // copyButton.className = 'btn btn-sm btn-outline-secondary copy-citation';
        // copyButton.setAttribute('data-citation', precedent.citation);
        // copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
        
        // actionsCell.appendChild(copyButton);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Initialize copy buttons
    const citationButtons = document.querySelectorAll('.copy-citation');
    citationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const citation = this.getAttribute('data-citation');
            navigator.clipboard.writeText(citation).then(() => {
                // Change button text temporarily
                const originalText = this.innerHTML;
                this.innerHTML = 'Copied!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        });
    });
}
