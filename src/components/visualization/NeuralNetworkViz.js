import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './NeuralNetworkViz.css';

const NeuralNetworkViz = ({ network, layerOutputs, layerSizes }) => {
  const d3Container = useRef(null);

  // Calculate neuron activation color based on output value
  const getNodeColor = (value) => {
    // Color scale from blue (low activation) to red (high activation)
    return d3.interpolateRdBu(1 - value);
  };

  useEffect(() => {
    if (d3Container.current && network && layerOutputs && layerSizes) {
      // Clear previous visualization
      d3.select(d3Container.current).selectAll('*').remove();
      
      // Set dimensions
      const width = 800;
      const height = 500;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(d3Container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Calculate node size and spacing
      const maxLayerSize = Math.max(...layerSizes);
      const nodeRadius = Math.min(innerHeight / (maxLayerSize * 2.5), 15);
      const layerSpacing = innerWidth / (layerSizes.length - 1);
      
      // Defs for gradient links
      const defs = svg.append('defs');
      
      // Add layers and nodes
      for (let layerIndex = 0; layerIndex < layerSizes.length; layerIndex++) {
        const layerSize = layerSizes[layerIndex];
        const layerOutputData = layerOutputs[layerIndex] || Array(layerSize).fill(0);
        
        // Calculate vertical positioning
        const layerHeight = layerSize * (nodeRadius * 2 + 10);
        const startY = (innerHeight - layerHeight) / 2 + nodeRadius;
        
        // Add nodes for this layer
        for (let nodeIndex = 0; nodeIndex < layerSize; nodeIndex++) {
          const nodeValue = layerOutputData[nodeIndex] || 0;
          const x = layerIndex * layerSpacing;
          const y = startY + nodeIndex * (nodeRadius * 2 + 10);
          
          // Draw connections to previous layer
          if (layerIndex > 0) {
            const prevLayerSize = layerSizes[layerIndex - 1];
            const prevStartY = (innerHeight - prevLayerSize * (nodeRadius * 2 + 10)) / 2 + nodeRadius;
            
            for (let prevNodeIndex = 0; prevNodeIndex < prevLayerSize; prevNodeIndex++) {
              const prevX = (layerIndex - 1) * layerSpacing;
              const prevY = prevStartY + prevNodeIndex * (nodeRadius * 2 + 10);
              
              // Get weight
              let weight = 0;
              if (network[layerIndex - 1]) {
                weight = network[layerIndex - 1].weights[nodeIndex] ? 
                  network[layerIndex - 1].weights[nodeIndex][prevNodeIndex] : 0;
              }
              
              // Create gradient for this connection
              const gradientId = `gradient-${layerIndex}-${nodeIndex}-${prevNodeIndex}`;
              const gradient = defs.append('linearGradient')
                .attr('id', gradientId)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');
              
              const prevNodeValue = layerOutputs[layerIndex - 1][prevNodeIndex] || 0;
              
              gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', getNodeColor(prevNodeValue));
              
              gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', getNodeColor(nodeValue));
              
              // Draw connection
              svg.append('line')
                .attr('x1', prevX)
                .attr('y1', prevY)
                .attr('x2', x)
                .attr('y2', y)
                .attr('stroke', `url(#${gradientId})`)
                .attr('stroke-width', Math.abs(weight) * 3 + 0.5)
                .attr('opacity', 0.7)
                .attr('class', weight > 0 ? 'positive-weight' : 'negative-weight');
            }
          }
          
          // Draw node
          svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', nodeRadius)
            .attr('fill', getNodeColor(nodeValue))
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .attr('class', 'neuron');
          
          // Add value text
          svg.append('text')
            .attr('x', x)
            .attr('y', y + nodeRadius + 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .text(nodeValue.toFixed(2));
        }
        
        // Add layer labels
        svg.append('text')
          .attr('x', layerIndex * layerSpacing)
          .attr('y', margin.top - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(layerIndex === 0 ? 'Input Layer' : 
                layerIndex === layerSizes.length - 1 ? 'Output Layer' : 
                `Hidden Layer ${layerIndex}`);
      }
    }
  }, [network, layerOutputs, layerSizes]);

  return (
    <div className="neural-network-container">
      <div className="d3-container" ref={d3Container} />
    </div>
  );
};

export default NeuralNetworkViz;
