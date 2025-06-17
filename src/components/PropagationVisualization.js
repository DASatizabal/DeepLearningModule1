import React, { useState, useEffect } from 'react';
import { Card, Button, ProgressBar, Alert, Table } from 'react-bootstrap';

function PropagationVisualization({ inputValues, weights, onActivation, currentStep = 0 }) {
  const [calculations, setCalculations] = useState([]);
  const [currentStepInfo, setCurrentStepInfo] = useState(null);
  
  // Define activation function (sigmoid)
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  
  // Generate calculation steps for forward propagation
  useEffect(() => {
    if (!inputValues || !weights) return;
    
    generateCalculationSteps();
  }, [inputValues, weights]);
  
  // Update current step information when step changes
  useEffect(() => {
    if (calculations.length === 0 || currentStep < 0) {
      setCurrentStepInfo(null);
      return;
    }
    
    const stepInfo = calculations[Math.min(currentStep, calculations.length - 1)];
    setCurrentStepInfo(stepInfo);
    
    // Notify parent component about activations for visualization
    if (onActivation && stepInfo) {
      onActivation(stepInfo.activeNodes);
    }
  }, [currentStep, calculations, onActivation]);
  
  const generateCalculationSteps = () => {
    // Input validation
    if (!inputValues || !weights || inputValues.length === 0 || !weights.inputToHidden || !weights.hiddenToOutput) {
      return;
    }
    
    const steps = [];
    const hiddenLayerSize = weights.inputToHidden[0].length;
    const outputLayerSize = weights.hiddenToOutput[0].length;
    
    // Step 1: Initialize with input values
    const step1 = {
      phase: 'input',
      description: 'Input values entered into the network',
      details: inputValues.map((value, i) => `Input ${i+1}: ${value}`),
      activeNodes: {},
      calculations: []
    };
    
    // Add input node activations
    inputValues.forEach((value, i) => {
      step1.activeNodes[`input-${i}`] = true;
      step1.activeNodes[`input-${i}-value`] = value;
    });
    
    steps.push(step1);
    
    // Step 2: Calculate hidden layer weighted sums and activations
    const hiddenLayerSums = [];
    const hiddenLayerActivations = [];
    
    for (let j = 0; j < hiddenLayerSize; j++) {
      let sum = 0;
      const calcDetails = [];
      
      // Calculate weighted sum for this hidden neuron
      for (let i = 0; i < inputValues.length; i++) {
        const weight = parseFloat(weights.inputToHidden[i][j]);
        const contribution = inputValues[i] * weight;
        sum += contribution;
        calcDetails.push(`(Input ${i+1}: ${inputValues[i]}) × (Weight: ${weight.toFixed(3)}) = ${contribution.toFixed(3)}`);
      }
      
      // Apply activation function
      const activation = sigmoid(sum);
      hiddenLayerSums.push(sum);
      hiddenLayerActivations.push(activation);
      
      // Add step for this hidden neuron calculation
      const hiddenStep = {
        phase: 'hidden',
        description: `Calculate Hidden Neuron ${j+1}`,
        details: [
          ...calcDetails,
          `Sum: ${sum.toFixed(3)}`,
          `Activation (sigmoid): ${activation.toFixed(3)}`
        ],
        activeNodes: { ...step1.activeNodes },
        calculations: [{
          nodeType: 'hidden',
          nodeIndex: j,
          weightedSum: sum,
          activation: activation,
          components: calcDetails
        }]
      };
      
      // Activate connections from input to this hidden node
      for (let i = 0; i < inputValues.length; i++) {
        hiddenStep.activeNodes[`input-${i}-hidden-${j}`] = true;
      }
      
      // Activate this hidden node
      hiddenStep.activeNodes[`hidden-${j}`] = true;
      hiddenStep.activeNodes[`hidden-${j}-value`] = sum;
      hiddenStep.activeNodes[`hidden-${j}-activation`] = activation;
      
      steps.push(hiddenStep);
    }
    
    // Step 3: Calculate output layer weighted sums and activations
    const outputLayerSums = [];
    const outputLayerActivations = [];
    
    for (let k = 0; k < outputLayerSize; k++) {
      let sum = 0;
      const calcDetails = [];
      
      // Calculate weighted sum for this output neuron
      for (let j = 0; j < hiddenLayerActivations.length; j++) {
        const weight = parseFloat(weights.hiddenToOutput[j][k]);
        const contribution = hiddenLayerActivations[j] * weight;
        sum += contribution;
        calcDetails.push(`(Hidden ${j+1}: ${hiddenLayerActivations[j].toFixed(3)}) × (Weight: ${weight.toFixed(3)}) = ${contribution.toFixed(3)}`);
      }
      
      // Apply activation function
      const activation = sigmoid(sum);
      outputLayerSums.push(sum);
      outputLayerActivations.push(activation);
      
      // Create step with all previous activations
      const outputStep = {
        phase: 'output',
        description: `Calculate Output Neuron ${k+1}`,
        details: [
          ...calcDetails,
          `Sum: ${sum.toFixed(3)}`,
          `Final Output (sigmoid): ${activation.toFixed(3)}`
        ],
        activeNodes: {},
        calculations: [{
          nodeType: 'output',
          nodeIndex: k,
          weightedSum: sum,
          activation: activation,
          components: calcDetails
        }]
      };
      
      // Maintain all previous active nodes
      for (let i = 0; i < inputValues.length; i++) {
        outputStep.activeNodes[`input-${i}`] = true;
        outputStep.activeNodes[`input-${i}-value`] = inputValues[i];
      }
      
      for (let j = 0; j < hiddenLayerSize; j++) {
        outputStep.activeNodes[`hidden-${j}`] = true;
        outputStep.activeNodes[`hidden-${j}-value`] = hiddenLayerSums[j];
        outputStep.activeNodes[`hidden-${j}-activation`] = hiddenLayerActivations[j];
      }
      
      // Activate connections from hidden to this output node
      for (let j = 0; j < hiddenLayerSize; j++) {
        outputStep.activeNodes[`hidden-${j}-output-${k}`] = true;
      }
      
      // Activate this output node
      outputStep.activeNodes[`output-${k}`] = true;
      outputStep.activeNodes[`output-${k}-value`] = sum;
      outputStep.activeNodes[`output-${k}-activation`] = activation;
      
      steps.push(outputStep);
    }
    
    // Add final result step
    const finalStep = {
      phase: 'result',
      description: 'Final Network Output',
      details: outputLayerActivations.map((value, i) => `Output ${i+1}: ${value.toFixed(5)}`),
      activeNodes: {},
      calculations: []
    };
    
    // Activate all nodes for final visualization
    for (let i = 0; i < inputValues.length; i++) {
      finalStep.activeNodes[`input-${i}`] = true;
      finalStep.activeNodes[`input-${i}-value`] = inputValues[i];
    }
    
    for (let j = 0; j < hiddenLayerSize; j++) {
      finalStep.activeNodes[`hidden-${j}`] = true;
      finalStep.activeNodes[`hidden-${j}-value`] = hiddenLayerSums[j];
      finalStep.activeNodes[`hidden-${j}-activation`] = hiddenLayerActivations[j];
    }
    
    for (let k = 0; k < outputLayerSize; k++) {
      finalStep.activeNodes[`output-${k}`] = true;
      finalStep.activeNodes[`output-${k}-value`] = outputLayerSums[k];
      finalStep.activeNodes[`output-${k}-activation`] = outputLayerActivations[k];
    }
    
    // Activate all connections
    for (let i = 0; i < inputValues.length; i++) {
      for (let j = 0; j < hiddenLayerSize; j++) {
        finalStep.activeNodes[`input-${i}-hidden-${j}`] = true;
      }
    }
    
    for (let j = 0; j < hiddenLayerSize; j++) {
      for (let k = 0; k < outputLayerSize; k++) {
        finalStep.activeNodes[`hidden-${j}-output-${k}`] = true;
      }
    }
    
    steps.push(finalStep);
    setCalculations(steps);
  };
  
  const renderCalculationDetails = () => {
    if (!currentStepInfo) {
      return <Alert variant="info">No calculations to display. Enter input data to begin.</Alert>;
    }
    
    return (
      <div>
        <Alert variant="primary">
          <strong>{currentStepInfo.description}</strong>
        </Alert>
        
        {currentStepInfo.calculations.length > 0 ? (
          <div className="calculation-details">
            <h6>Calculation Breakdown:</h6>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {currentStepInfo.calculations[0].components.map((component, i) => (
                  <tr key={i}>
                    <td>Weight × Input {i+1}</td>
                    <td>{component}</td>
                  </tr>
                ))}
                <tr className="table-primary">
                  <td><strong>Weighted Sum</strong></td>
                  <td><strong>{currentStepInfo.calculations[0].weightedSum.toFixed(3)}</strong></td>
                </tr>
                <tr className="table-success">
                  <td><strong>Activation Output</strong></td>
                  <td><strong>{currentStepInfo.calculations[0].activation.toFixed(5)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        ) : (
          <ul className="detail-list">
            {currentStepInfo.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Card className="h-100">
      <Card.Header as="h5">Propagation Visualization</Card.Header>
      <Card.Body className="propagation-container">
        {calculations.length > 0 ? (
          <div>
            <div className="mb-3">
              <small>Step {currentStep + 1} of {calculations.length}</small>
              <ProgressBar 
                now={(currentStep + 1) / calculations.length * 100} 
                variant="info" 
                className="mb-2" 
              />
            </div>
            {renderCalculationDetails()}
          </div>
        ) : (
          <div className="propagation-placeholder text-center p-4">
            <p>Enter input values in the Data Input Panel to visualize forward propagation.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default PropagationVisualization;
