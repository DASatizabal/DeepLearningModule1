import React, { useEffect, useRef, useState } from 'react';
import { Card, Tooltip, OverlayTrigger } from 'react-bootstrap';
import * as d3 from 'd3';

function NetworkArchitecture({ onNodeClick, activeNodes = [], weights = null }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  
  // Network configuration
  const networkConfig = {
    inputNodes: 3,
    hiddenNodes: 4,
    outputNodes: 1,
    nodeRadius: 20,
    layerSpacing: 180,
    verticalSpacing: 70
  };

  // Generate random weights if not provided
  const getWeights = () => {
    if (weights) return weights;
    
    // Default random weights
    const inputToHidden = Array(networkConfig.inputNodes).fill().map(() => 
      Array(networkConfig.hiddenNodes).fill().map(() => (Math.random() * 2 - 1).toFixed(2))
    );
    
    const hiddenToOutput = Array(networkConfig.hiddenNodes).fill().map(() => 
      Array(networkConfig.outputNodes).fill().map(() => (Math.random() * 2 - 1).toFixed(2))
    );
    
    return { inputToHidden, hiddenToOutput };
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate dimensions and create SVG
    const width = svgRef.current.clientWidth || 800;
    const height = Math.max(
      networkConfig.inputNodes * networkConfig.verticalSpacing,
      networkConfig.hiddenNodes * networkConfig.verticalSpacing,
      networkConfig.outputNodes * networkConfig.verticalSpacing
    ) + 100;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Calculate positions for all nodes
    const calculateNodePositions = () => {
      const positions = {
        input: [],
        hidden: [],
        output: []
      };

      // Input layer positions
      const inputStartY = height / 2 - ((networkConfig.inputNodes - 1) * networkConfig.verticalSpacing) / 2;
      for (let i = 0; i < networkConfig.inputNodes; i++) {
        positions.input.push({
          x: networkConfig.nodeRadius * 3,
          y: inputStartY + i * networkConfig.verticalSpacing
        });
      }

      // Hidden layer positions
      const hiddenStartY = height / 2 - ((networkConfig.hiddenNodes - 1) * networkConfig.verticalSpacing) / 2;
      for (let i = 0; i < networkConfig.hiddenNodes; i++) {
        positions.hidden.push({
          x: width / 2,
          y: hiddenStartY + i * networkConfig.verticalSpacing
        });
      }

      // Output layer positions
      const outputStartY = height / 2 - ((networkConfig.outputNodes - 1) * networkConfig.verticalSpacing) / 2;
      for (let i = 0; i < networkConfig.outputNodes; i++) {
        positions.output.push({
          x: width - (networkConfig.nodeRadius * 3),
          y: outputStartY + i * networkConfig.verticalSpacing
        });
      }

      return positions;
    };

    const positions = calculateNodePositions();
    const networkWeights = getWeights();
    
    // Create a tooltip div
    const tooltipDiv = d3.select(svgRef.current.parentNode)
      .append('div')
      .attr('class', 'weight-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('text-align', 'center')
      .style('padding', '8px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', 1000);

    // Draw connections first (so they're behind the nodes)
    // Input to Hidden connections
    positions.input.forEach((inputNode, i) => {
      positions.hidden.forEach((hiddenNode, j) => {
        const weight = networkWeights.inputToHidden[i][j];
        const isActive = activeNodes && activeNodes[`input-${i}-hidden-${j}`];
        
        svg.append('line')
          .attr('class', `connection input-to-hidden-${i}-${j}`)
          .attr('x1', inputNode.x)
          .attr('y1', inputNode.y)
          .attr('x2', hiddenNode.x)
          .attr('y2', hiddenNode.y)
          .attr('stroke', isActive ? '#FF9900' : '#aaa')
          .attr('stroke-width', isActive ? 3 : 1.5)
          .attr('data-weight', weight)
          .on('mouseover', function(event) {
            d3.select(this)
              .attr('stroke-width', isActive ? 4 : 2.5)
              .attr('stroke', isActive ? '#FF9900' : '#666');
              
            tooltipDiv.transition()
              .duration(200)
              .style('opacity', 0.9);
            
            tooltipDiv.html(`Weight: ${weight}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('stroke-width', isActive ? 3 : 1.5)
              .attr('stroke', isActive ? '#FF9900' : '#aaa');
              
            tooltipDiv.transition()
              .duration(500)
              .style('opacity', 0);
          });
      });
    });

    // Hidden to Output connections
    positions.hidden.forEach((hiddenNode, i) => {
      positions.output.forEach((outputNode, j) => {
        const weight = networkWeights.hiddenToOutput[i][j];
        const isActive = activeNodes && activeNodes[`hidden-${i}-output-${j}`];
        
        svg.append('line')
          .attr('class', `connection hidden-to-output-${i}-${j}`)
          .attr('x1', hiddenNode.x)
          .attr('y1', hiddenNode.y)
          .attr('x2', outputNode.x)
          .attr('y2', outputNode.y)
          .attr('stroke', isActive ? '#FF9900' : '#aaa')
          .attr('stroke-width', isActive ? 3 : 1.5)
          .attr('data-weight', weight)
          .on('mouseover', function(event) {
            d3.select(this)
              .attr('stroke-width', isActive ? 4 : 2.5)
              .attr('stroke', isActive ? '#FF9900' : '#666');
              
            tooltipDiv.transition()
              .duration(200)
              .style('opacity', 0.9);
            
            tooltipDiv.html(`Weight: ${weight}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('stroke-width', isActive ? 3 : 1.5)
              .attr('stroke', isActive ? '#FF9900' : '#aaa');
              
            tooltipDiv.transition()
              .duration(500)
              .style('opacity', 0);
          });
      });
    });

    // Draw input nodes
    positions.input.forEach((pos, i) => {
      const isActive = activeNodes && activeNodes[`input-${i}`];
      const nodeGroup = svg.append('g')
        .attr('class', `node input-node-${i}`);
        
      nodeGroup.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', networkConfig.nodeRadius)
        .attr('fill', isActive ? '#4285F4' : '#A8C7FA')
        .attr('stroke', isActive ? '#2A56C6' : '#7BAAF7')
        .attr('stroke-width', isActive ? 3 : 2)
        .attr('cursor', 'pointer')
        .on('click', function() {
          if (onNodeClick) onNodeClick(`input-${i}`);
        })
        .on('mouseover', function(event) {
          // Show node value tooltip if active
          if (isActive) {
            tooltipDiv.transition()
              .duration(200)
              .style('opacity', 0.9);
              
            tooltipDiv.html(`Input ${i+1}: ${activeNodes[`input-${i}-value`] || 'N/A'}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          }
          
          d3.select(this)
            .attr('stroke-width', isActive ? 4 : 3);
        })
        .on('mouseout', function() {
          tooltipDiv.transition()
            .duration(500)
            .style('opacity', 0);
            
          d3.select(this)
            .attr('stroke-width', isActive ? 3 : 2);
        });

      nodeGroup.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('pointer-events', 'none')
        .text(`I${i+1}`);
    });

    // Draw hidden nodes
    positions.hidden.forEach((pos, i) => {
      const isActive = activeNodes && activeNodes[`hidden-${i}`];
      const nodeGroup = svg.append('g')
        .attr('class', `node hidden-node-${i}`);
        
      nodeGroup.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', networkConfig.nodeRadius)
        .attr('fill', isActive ? '#34A853' : '#A3E4B1')
        .attr('stroke', isActive ? '#1E8E3E' : '#7DCCA1')
        .attr('stroke-width', isActive ? 3 : 2)
        .attr('cursor', 'pointer')
        .on('click', function() {
          if (onNodeClick) onNodeClick(`hidden-${i}`);
        })
        .on('mouseover', function(event) {
          // Show node value and activation tooltip if active
          if (isActive) {
            tooltipDiv.transition()
              .duration(200)
              .style('opacity', 0.9);
              
            const valueText = activeNodes[`hidden-${i}-value`] 
              ? `Value: ${activeNodes[`hidden-${i}-value`].toFixed(3)}` 
              : 'N/A';
            const activationText = activeNodes[`hidden-${i}-activation`] 
              ? `Activation: ${activeNodes[`hidden-${i}-activation`].toFixed(3)}` 
              : '';
              
            tooltipDiv.html(`${valueText}<br>${activationText}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          }
          
          d3.select(this)
            .attr('stroke-width', isActive ? 4 : 3);
        })
        .on('mouseout', function() {
          tooltipDiv.transition()
            .duration(500)
            .style('opacity', 0);
            
          d3.select(this)
            .attr('stroke-width', isActive ? 3 : 2);
        });

      nodeGroup.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('pointer-events', 'none')
        .text(`H${i+1}`);
    });

    // Draw output nodes
    positions.output.forEach((pos, i) => {
      const isActive = activeNodes && activeNodes[`output-${i}`];
      const nodeGroup = svg.append('g')
        .attr('class', `node output-node-${i}`);
        
      nodeGroup.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', networkConfig.nodeRadius)
        .attr('fill', isActive ? '#EA4335' : '#F5ABA6')
        .attr('stroke', isActive ? '#C5221F' : '#ED9D97')
        .attr('stroke-width', isActive ? 3 : 2)
        .attr('cursor', 'pointer')
        .on('click', function() {
          if (onNodeClick) onNodeClick(`output-${i}`);
        })
        .on('mouseover', function(event) {
          // Show prediction value tooltip if active
          if (isActive) {
            tooltipDiv.transition()
              .duration(200)
              .style('opacity', 0.9);
              
            const valueText = activeNodes[`output-${i}-value`] 
              ? `Value: ${activeNodes[`output-${i}-value`].toFixed(3)}` 
              : 'N/A';
            const activationText = activeNodes[`output-${i}-activation`] 
              ? `Activation: ${activeNodes[`output-${i}-activation`].toFixed(3)}` 
              : '';
              
            tooltipDiv.html(`${valueText}<br>${activationText}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          }
          
          d3.select(this)
            .attr('stroke-width', isActive ? 4 : 3);
        })
        .on('mouseout', function() {
          tooltipDiv.transition()
            .duration(500)
            .style('opacity', 0);
            
          d3.select(this)
            .attr('stroke-width', isActive ? 3 : 2);
        });

      nodeGroup.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('pointer-events', 'none')
        .text(`O${i+1}`);
    });

    // Add layer labels
    svg.append('text')
      .attr('x', positions.input[0].x)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Input Layer');

    svg.append('text')
      .attr('x', positions.hidden[0].x)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Hidden Layer');

    svg.append('text')
      .attr('x', positions.output[0].x)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Output Layer');

  }, [networkConfig]);

  return (
    <Card className="h-100">
      <Card.Header as="h5">Network Architecture Visualization</Card.Header>
      <Card.Body className="network-architecture-container">
        <div className="network-architecture-canvas">
          <svg ref={svgRef} width="100%" height="400" style={{ maxHeight: '600px' }}></svg>
        </div>
      </Card.Body>
    </Card>
  );
}

export default NetworkArchitecture;
