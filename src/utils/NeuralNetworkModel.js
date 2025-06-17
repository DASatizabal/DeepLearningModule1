/**
 * Neural Network Model Utilities
 * Handles forward propagation calculations for visualization
 */

// Sigmoid activation function
export const sigmoid = (x) => {
  return 1 / (1 + Math.exp(-x));
};

// ReLU activation function
export const relu = (x) => {
  return Math.max(0, x);
};

// Forward propagation through a single layer
export const forwardPropagateLayer = (inputs, weights, biases, activationFn = sigmoid) => {
  // Initialize output array
  const outputs = [];
  
  // For each neuron in this layer
  for (let i = 0; i < weights.length; i++) {
    let sum = biases[i];
    
    // For each input to this neuron
    for (let j = 0; j < inputs.length; j++) {
      sum += inputs[j] * weights[i][j];
    }
    
    // Apply activation function and add to outputs
    outputs.push(activationFn(sum));
  }
  
  return outputs;
};

// Forward propagation through the entire network
export const forwardPropagate = (inputs, network) => {
  let currentOutputs = [...inputs];
  const allLayerOutputs = [currentOutputs];
  
  // For each layer in the network
  for (let i = 0; i < network.length; i++) {
    const { weights, biases, activation } = network[i];
    const activationFn = activation === 'relu' ? relu : sigmoid;
    
    // Forward propagate through this layer
    currentOutputs = forwardPropagateLayer(currentOutputs, weights, biases, activationFn);
    allLayerOutputs.push(currentOutputs);
  }
  
  return {
    prediction: currentOutputs,
    layerOutputs: allLayerOutputs
  };
};

// Generate a random neural network structure
export const generateRandomNetwork = (layerSizes, seedValue = null) => {
  const network = [];
  
  // Set random seed for reproducible networks if provided
  let seed = seedValue || Math.random() * 1000;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // For each layer (except input layer)
  for (let i = 1; i < layerSizes.length; i++) {
    const layerSize = layerSizes[i];
    const prevLayerSize = layerSizes[i - 1];
    
    // Initialize weights and biases
    const weights = [];
    const biases = [];
    
    // For each neuron in this layer
    for (let j = 0; j < layerSize; j++) {
      const neuronWeights = [];
      
      // For each input to this neuron
      for (let k = 0; k < prevLayerSize; k++) {
        neuronWeights.push((random() * 2 - 1) * 0.5); // Random weight between -0.5 and 0.5
      }
      
      weights.push(neuronWeights);
      biases.push((random() * 2 - 1) * 0.5); // Random bias between -0.5 and 0.5
    }
    
    // Last layer uses sigmoid, others use ReLU
    const activation = i === layerSizes.length - 1 ? 'sigmoid' : 'relu';
    
    network.push({ weights, biases, activation });
  }
  
  return network;
};

// Generate sample environmental data
export const generateEnvironmentalData = () => {
  return [
    { name: "Temperature (°C)", value: (Math.random() * 40 - 10).toFixed(1) },
    { name: "Humidity (%)", value: (Math.random() * 100).toFixed(1) },
    { name: "Wind Speed (km/h)", value: (Math.random() * 50).toFixed(1) },
    { name: "Air Pressure (hPa)", value: (Math.random() * 50 + 980).toFixed(1) },
    { name: "Solar Radiation (W/m²)", value: (Math.random() * 1000).toFixed(1) }
  ];
};

// Normalize input data to range 0-1
export const normalizeData = (data) => {
  const ranges = {
    "Temperature (°C)": { min: -10, max: 40 },
    "Humidity (%)": { min: 0, max: 100 },
    "Wind Speed (km/h)": { min: 0, max: 50 },
    "Air Pressure (hPa)": { min: 980, max: 1030 },
    "Solar Radiation (W/m²)": { min: 0, max: 1000 }
  };
  
  return data.map(item => {
    const range = ranges[item.name];
    return (parseFloat(item.value) - range.min) / (range.max - range.min);
  });
};

// Prediction categories for environmental data
export const predictionCategories = [
  "High Pollution Risk",
  "Moderate Pollution Risk",
  "Low Pollution Risk",
  "Optimal Air Quality"
];

// Convert output to prediction
export const getPrediction = (output) => {
  const index = Math.floor(output[0] * predictionCategories.length);
  return predictionCategories[Math.min(index, predictionCategories.length - 1)];
};
