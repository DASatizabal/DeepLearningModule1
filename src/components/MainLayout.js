import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NetworkArchitecture from './NetworkArchitecture';
import DataInputPanel from './DataInputPanel';
import PropagationVisualization from './PropagationVisualization';

function MainLayout() {
  // State for managing network data and visualization
  const [inputValues, setInputValues] = useState(null);
  const [networkWeights, setNetworkWeights] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [activeNodes, setActiveNodes] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);

  // Generate random weights for the network when component mounts
  useEffect(() => {
    generateRandomWeights();
  }, []);

  // Generate random weights for the neural network
  const generateRandomWeights = () => {
    const inputToHidden = Array(3).fill().map(() => 
      Array(4).fill().map(() => (Math.random() * 2 - 1).toFixed(2))
    );
    
    const hiddenToOutput = Array(4).fill().map(() => 
      Array(1).fill().map(() => (Math.random() * 2 - 1).toFixed(2))
    );
    
    setNetworkWeights({ inputToHidden, hiddenToOutput });
  };

  // Handle data submission from input panel
  const handleDataSubmit = (values) => {
    setInputValues(values);
    setCurrentStep(0); // Reset to first step when new data is submitted
    
    // Calculate number of steps based on network architecture
    // Input layer + hidden neurons + output neurons + final result
    const steps = 1 + 4 + 1 + 1; // 1 input step + 4 hidden nodes + 1 output node + final result
    setTotalSteps(steps);
    
    // Calculate final prediction to display result
    calculatePrediction(values, networkWeights);
  };

  // Calculate final prediction given input values and weights
  const calculatePrediction = (inputs, weights) => {
    if (!inputs || !weights) return;

    // Define activation function (sigmoid)
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    
    // Forward pass through hidden layer
    const hiddenOutputs = [];
    for (let j = 0; j < weights.inputToHidden[0].length; j++) {
      let sum = 0;
      for (let i = 0; i < inputs.length; i++) {
        sum += inputs[i] * parseFloat(weights.inputToHidden[i][j]);
      }
      hiddenOutputs.push(sigmoid(sum));
    }
    
    // Forward pass through output layer
    const outputs = [];
    for (let k = 0; k < weights.hiddenToOutput[0].length; k++) {
      let sum = 0;
      for (let j = 0; j < hiddenOutputs.length; j++) {
        sum += hiddenOutputs[j] * parseFloat(weights.hiddenToOutput[j][k]);
      }
      outputs.push(sigmoid(sum));
    }
    
    // Store final prediction
    setPredictionResult(outputs[0]);
  };

  // Handle node activation for visualization
  const handleNodeActivation = (activations) => {
    setActiveNodes(activations);
  };

  // Handle step change for propagation visualization
  const handleStepChange = (step) => {
    // Ensure step is within bounds
    const boundedStep = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(boundedStep);
  };

  // Handle clicking on a node in the visualization
  const handleNodeClick = (nodeId) => {
    console.log(`Node clicked: ${nodeId}`);
    // Additional functionality could be added here
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Neural Network Visualizer</h1>
          <p className="text-center lead">
            Visualize forward propagation through a 3-4-1 neural network with interactive components
          </p>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12} lg={12}>
          <NetworkArchitecture 
            weights={networkWeights}
            activeNodes={activeNodes}
            onNodeClick={handleNodeClick}
          />
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <DataInputPanel 
            onDataSubmit={handleDataSubmit}
            onStepChange={handleStepChange}
            currentStep={currentStep}
            totalSteps={totalSteps}
            results={predictionResult}
          />
        </Col>
        <Col md={6}>
          <PropagationVisualization 
            inputValues={inputValues}
            weights={networkWeights}
            onActivation={handleNodeActivation}
            currentStep={currentStep}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default MainLayout;
