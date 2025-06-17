import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Tabs, Tab, Alert, ProgressBar, Table } from 'react-bootstrap';
import * as d3 from 'd3';

// Define sample environmental data presets
const ENVIRONMENTAL_PRESETS = {
  sunny: {
    name: 'Sunny Day',
    values: [0.85, 0.12, 0.05], // Temperature (high), Humidity (low), Cloud Cover (low)
    description: 'A hot sunny day with low humidity and minimal cloud cover'
  },
  cloudy: {
    name: 'Cloudy Day',
    values: [0.65, 0.35, 0.75], // Temperature (moderate), Humidity (medium), Cloud Cover (high)
    description: 'A moderately warm day with partial humidity and significant cloud cover'
  },
  rainy: {
    name: 'Rainy Day',
    values: [0.45, 0.95, 0.90], // Temperature (low), Humidity (high), Cloud Cover (high)
    description: 'A cool rainy day with high humidity and heavy cloud cover'
  }
};

function DataInputPanel({ onDataSubmit, onStepChange, currentStep, totalSteps, results }) {
  const [inputType, setInputType] = useState('manual');
  const [manualInputs, setManualInputs] = useState({
    temperature: '',
    humidity: '',
    cloudCover: ''
  });
  const [normalizedInputs, setNormalizedInputs] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [inputError, setInputError] = useState('');
  const [featureImportance, setFeatureImportance] = useState(null);
  
  // Handle preset selection
  useEffect(() => {
    if (selectedPreset && ENVIRONMENTAL_PRESETS[selectedPreset]) {
      setNormalizedInputs(ENVIRONMENTAL_PRESETS[selectedPreset].values);
      
      // Set manual inputs to match preset for display purposes
      const preset = ENVIRONMENTAL_PRESETS[selectedPreset];
      setManualInputs({
        temperature: (preset.values[0] * 100).toFixed(0),
        humidity: (preset.values[1] * 100).toFixed(0),
        cloudCover: (preset.values[2] * 100).toFixed(0)
      });
    }
  }, [selectedPreset]);
  
  // Handle manual input changes
  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualInputs({
      ...manualInputs,
      [name]: value
    });
    setSelectedPreset(''); // Clear preset selection when manually editing
  };
  
  // Validate and normalize inputs
  const validateAndNormalizeInputs = () => {
    setInputError('');
    const { temperature, humidity, cloudCover } = manualInputs;
    
    // Basic validation
    if (temperature === '' || humidity === '' || cloudCover === '') {
      setInputError('All environmental values are required');
      return false;
    }
    
    // Parse values
    const tempValue = parseFloat(temperature);
    const humidityValue = parseFloat(humidity);
    const cloudValue = parseFloat(cloudCover);
    
    // Check for valid ranges (0-100)
    if (isNaN(tempValue) || isNaN(humidityValue) || isNaN(cloudValue) ||
        tempValue < 0 || tempValue > 100 ||
        humidityValue < 0 || humidityValue > 100 ||
        cloudValue < 0 || cloudValue > 100) {
      setInputError('All values must be between 0 and 100');
      return false;
    }
    
    // Normalize values to 0-1 range
    const normalized = [
      tempValue / 100,
      humidityValue / 100,
      cloudValue / 100
    ];
    
    setNormalizedInputs(normalized);
    return normalized;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    let inputValues;
    if (inputType === 'preset' && selectedPreset) {
      inputValues = ENVIRONMENTAL_PRESETS[selectedPreset].values;
    } else {
      inputValues = validateAndNormalizeInputs();
      if (!inputValues) return; // Validation failed
    }
    
    // Calculate mock feature importance based on input values
    // In a real app, this would come from the model
    const mockImportance = [
      { feature: 'Temperature', value: Math.abs(inputValues[0] - 0.5) * 2 },
      { feature: 'Humidity', value: Math.abs(inputValues[1] - 0.5) * 2 },
      { feature: 'Cloud Cover', value: Math.abs(inputValues[2] - 0.5) * 2 }
    ];
    
    // Normalize importance values to sum to 1
    const total = mockImportance.reduce((sum, item) => sum + item.value, 0);
    mockImportance.forEach(item => item.value = item.value / total);
    
    // Sort by importance
    mockImportance.sort((a, b) => b.value - a.value);
    setFeatureImportance(mockImportance);
    
    // Pass the inputs to parent component
    if (onDataSubmit) {
      onDataSubmit(inputValues);
    }
  };
  
  // Render the feature importance visualization
  const renderFeatureImportance = () => {
    if (!featureImportance) return null;
    
    return (
      <div className="feature-importance mt-3">
        <h6>Input Feature Importance</h6>
        {featureImportance.map((feature, index) => (
          <div key={index} className="mb-2">
            <div className="d-flex justify-content-between">
              <span>{feature.feature}</span>
              <span>{Math.round(feature.value * 100)}%</span>
            </div>
            <ProgressBar 
              now={feature.value * 100} 
              variant={index === 0 ? 'danger' : index === 1 ? 'warning' : 'info'} 
            />
          </div>
        ))}
      </div>
    );
  };
  
  // Render prediction results
  const renderResults = () => {
    if (!results) return null;
    
    return (
      <div className="prediction-results mt-4">
        <Alert variant="success">
          <Alert.Heading>Prediction Results</Alert.Heading>
          <p>
            The network predicts a value of <strong>{results.toFixed(5)}</strong>
          </p>
          <hr />
          <p className="mb-0">
            Environmental factors contributed to this prediction as shown in the chart below.
          </p>
        </Alert>
        {renderFeatureImportance()}
      </div>
    );
  };
  
  // Render propagation controls
  const renderPropagationControls = () => {
    if (!totalSteps || totalSteps === 0) return null;
    
    return (
      <div className="propagation-controls mt-4">
        <h6>Forward Propagation Animation</h6>
        <div className="d-flex justify-content-between mb-2">
          <small>Step {currentStep + 1} of {totalSteps}</small>
          <small>{Math.round((currentStep + 1) / totalSteps * 100)}% Complete</small>
        </div>
        <ProgressBar 
          now={(currentStep + 1) / totalSteps * 100} 
          variant="primary" 
          className="mb-3" 
        />
        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => onStepChange(currentStep - 1)}
            disabled={currentStep <= 0}
          >
            Previous Step
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => onStepChange(currentStep + 1)}
            disabled={currentStep >= totalSteps - 1}
          >
            Next Step
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-100">
      <Card.Header as="h5">Data Input Panel</Card.Header>
      <Card.Body>
        <Tabs
          activeKey={inputType}
          onSelect={(k) => setInputType(k)}
          className="mb-3"
        >
          <Tab eventKey="manual" title="Manual Input">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Temperature (0-100)</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0"
                      max="100"
                      name="temperature"
                      value={manualInputs.temperature}
                      onChange={handleManualInputChange}
                      placeholder="Enter temperature value"
                    />
                    <Form.Text className="text-muted">
                      0 = Cold, 100 = Hot
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Humidity (0-100)</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0"
                      max="100"
                      name="humidity"
                      value={manualInputs.humidity}
                      onChange={handleManualInputChange}
                      placeholder="Enter humidity value"
                    />
                    <Form.Text className="text-muted">
                      0 = Dry, 100 = Humid
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Cloud Cover (0-100)</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0"
                      max="100"
                      name="cloudCover"
                      value={manualInputs.cloudCover}
                      onChange={handleManualInputChange}
                      placeholder="Enter cloud cover value"
                    />
                    <Form.Text className="text-muted">
                      0 = Clear, 100 = Overcast
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              {inputError && <Alert variant="danger">{inputError}</Alert>}
              <Button variant="primary" type="submit">
                Process Data
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="preset" title="Preset Samples">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select an Environmental Scenario</Form.Label>
                <Form.Select 
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                >
                  <option value="">Choose a preset...</option>
                  {Object.entries(ENVIRONMENTAL_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              {selectedPreset && (
                <Alert variant="info">
                  <p><strong>{ENVIRONMENTAL_PRESETS[selectedPreset].name}</strong></p>
                  <p>{ENVIRONMENTAL_PRESETS[selectedPreset].description}</p>
                  <Table striped bordered size="sm">
                    <thead>
                      <tr>
                        <th>Input</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Temperature</td>
                        <td>{(ENVIRONMENTAL_PRESETS[selectedPreset].values[0] * 100).toFixed(0)}%</td>
                      </tr>
                      <tr>
                        <td>Humidity</td>
                        <td>{(ENVIRONMENTAL_PRESETS[selectedPreset].values[1] * 100).toFixed(0)}%</td>
                      </tr>
                      <tr>
                        <td>Cloud Cover</td>
                        <td>{(ENVIRONMENTAL_PRESETS[selectedPreset].values[2] * 100).toFixed(0)}%</td>
                      </tr>
                    </tbody>
                  </Table>
                </Alert>
              )}
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={!selectedPreset}
              >
                Use Preset Data
              </Button>
            </Form>
          </Tab>
        </Tabs>
        
        {renderPropagationControls()}
        {renderResults()}
      </Card.Body>
    </Card>
  );
}

export default DataInputPanel;
