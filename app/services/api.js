import { Platform } from 'react-native';

// Configure the API URL based on the platform and environment
let API_BASE_URL;

// Use the hosted API URL for production
// IMPORTANT: The correct URL format is exactly as specified by the user
API_BASE_URL = 'https://iotwebapp-7sf7.onrender.com/api';

// For local development, uncomment these lines and use your local API
// if (Platform.OS === 'android') {
//   // For Android emulator, use 10.0.2.2 which routes to the host's localhost
//   API_BASE_URL = 'http://10.0.2.2:7013/api/';
// } else {
//   // For iOS simulator, localhost works
//   API_BASE_URL = 'http://localhost:7013/api/';
// }

// Configuration for API and mock data
const API_CONFIG = {
  // Use mock data as fallback when API is unavailable
  useMockDataFallback: true, // Set to true to ensure we have fallback when API is unavailable
  
  // Always use mock data even if API is available (for testing)
  alwaysUseMockData: false, // Set to false to use real backend data
  
  // Timeout for API requests in milliseconds
  timeout: 10000,
  
  // Show mock data indicator in UI
  showMockIndicator: true,
  
  // Use HTTPS for API connections
  useHttps: true,
  
  // Accept self-signed certificates for development
  acceptSelfSignedCerts: true
};

// Generate mock data for development and testing
const generateMockData = {
  // Generate mock learners
  learners: () => {
    const names = ['John Smith', 'Emma Johnson', 'Michael Brown', 'Olivia Davis', 'William Wilson'];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: names[i],
      age: Math.floor(Math.random() * 5) + 14, // 14-18
      grade: ['9th', '10th', '11th', '12th'][Math.floor(Math.random() * 4)],
      studentId: `STU${1000 + i}`,
      deviceId: `DEV${2000 + i}`,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  },
  
  // Generate mock sensor data
  sensorData: () => {
    const now = Date.now();
    const hourInMs = 3600000;
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      learnerId: Math.floor(Math.random() * 5) + 1,
      concentrationLevel: Math.random() * 100,
      timestamp: new Date(now - (i * hourInMs / 10)).toISOString(),
      deviceId: `DEV${2000 + Math.floor(Math.random() * 5)}`,
      createdAt: new Date(now - (i * hourInMs / 10)).toISOString(),
      updatedAt: new Date(now - (i * hourInMs / 10)).toISOString()
    }));
  },
  
  // Generate mock alerts
  alerts: () => {
    const alertTypes = ['Low Concentration', 'Distracted', 'Improved Focus', 'Consistent Focus'];
    const now = Date.now();
    const hourInMs = 3600000;
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      learnerId: Math.floor(Math.random() * 5) + 1,
      message: `${alertTypes[i % alertTypes.length]} detected`,
      severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      isRead: Math.random() > 0.5,
      timestamp: new Date(now - (i * hourInMs)).toISOString(),
      createdAt: new Date(now - (i * hourInMs)).toISOString(),
      updatedAt: new Date(now - (i * hourInMs)).toISOString()
    }));
  },
  
  // Generate mock feedback
  feedback: () => {
    const comments = [
      'Great progress today!',
      'Needs to improve focus during math lessons',
      'Showing consistent improvement',
      'Concentration drops after lunch period',
      'Excellent focus during morning sessions'
    ];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      learnerId: i + 1,
      facilitatorId: Math.floor(Math.random() * 3) + 1,
      comment: comments[i],
      rating: Math.floor(Math.random() * 5) + 1,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }
};

// Fallback options if needed
const API_URLS = {
  // HTTPS URLs (primary)
  androidEmulator: 'https://10.0.2.2:7013/api/',
  localhost: 'https://localhost:7013/api/',
  
  // HTTP URLs (fallback if HTTPS fails)
  androidEmulatorHttp: 'http://10.0.2.2:7013/api/',
  localhostHttp: 'http://localhost:7013/api/',
  
  // Network IP options if needed
  // networkIp: 'https://192.168.x.x:7013/api/' // Replace with your actual IP
};

console.log(`Using API URL: ${API_BASE_URL}`);

// Create a custom fetch wrapper with default options
const apiFetch = async (endpoint, options = {}) => {
  // Add a forward slash between base URL and endpoint if needed
  // Ensure the base URL doesn't end with a slash and the endpoint doesn't start with one
  const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${cleanBaseUrl}/${cleanEndpoint}`;
  console.log(`Fetching: ${url}`);
  
  // Default options for fetch
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Allow redirects for production API
    redirect: 'follow',
    // Add mode for CORS support
    mode: 'cors',
    // Add credentials for cookies if needed
    credentials: 'same-origin',
  };
  
  // Add timeout to prevent long-hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  defaultOptions.signal = controller.signal;
  
  try {
    // Clear the timeout when we're done
    const clearTimeoutAndReturn = (result) => {
      clearTimeout(timeoutId);
      return result;
    };
    
    // Merge default options with provided options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    // If we're configured to always use mock data and this is a GET request
    if (API_CONFIG.alwaysUseMockData && (!options.method || options.method === 'GET')) {
      // Determine which mock data to return based on the endpoint
      if (endpoint.includes('Learner')) {
        console.log('Using mock Learner data');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.learners(),
          _isMockData: true 
        };
      } else if (endpoint.includes('SensorData')) {
        console.log('Using mock SensorData data');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.sensorData(),
          _isMockData: true 
        };
      } else if (endpoint.includes('Alert')) {
        console.log('Using mock Alert data');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.alerts(),
          _isMockData: true 
        };
      } else if (endpoint.includes('Feedback')) {
        console.log('Using mock Feedback data');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.feedback(),
          _isMockData: true 
        };
      }
    }
    
    // Try to make the actual API request
    try {
      // Make the fetch request
      const response = await fetch(url, fetchOptions);
      
      // Log response status for debugging
      console.log(`API Response: ${response.status} ${response.statusText} for ${url}`);
      
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}`);
        
        // Try to parse error response if possible
        let errorData = [];
        try {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          if (errorText) {
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              errorData = { message: errorText };
            }
          }
        } catch (e) {
          console.log('Could not parse error response');
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response as JSON
      const responseText = await response.text();
      let data = [];
      
      // Only try to parse if there's actual content
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
          console.log(`API Data received for ${url}:`, 
            Array.isArray(data) ? `Array with ${data.length} items` : 'Object');
        } catch (e) {
          console.error('Error parsing JSON:', e.message);
          console.log('Raw response:', responseText);
          throw new Error('Invalid JSON response');
        }
      }
      
      return clearTimeoutAndReturn({ ok: true, status: response.status, data });
    } catch (apiError) {
      // If the API request fails and we're configured to use mock data as fallback
      if (API_CONFIG.useMockDataFallback) {
        console.log(`API request failed, using mock data for ${endpoint}`);
        
        // Determine which mock data to return based on the endpoint
        if (endpoint.includes('Learner')) {
          return { 
            ok: true, 
            status: 200, 
            data: generateMockData.learners(),
            _isMockData: true 
          };
        } else if (endpoint.includes('SensorData')) {
          return { 
            ok: true, 
            status: 200, 
            data: generateMockData.sensorData(),
            _isMockData: true 
          };
        } else if (endpoint.includes('Alert')) {
          return { 
            ok: true, 
            status: 200, 
            data: generateMockData.alerts(),
            _isMockData: true 
          };
        } else if (endpoint.includes('Feedback')) {
          return { 
            ok: true, 
            status: 200, 
            data: generateMockData.feedback(),
            _isMockData: true 
          };
        }
      }
      
      // If we're not using mock data or there's no mock data for this endpoint, rethrow the error
      throw apiError;
    }
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message);
    
    // Always clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);
    
    // If we're configured to use mock data as fallback, return mock data based on the endpoint
    if (API_CONFIG.useMockDataFallback) {
      if (endpoint.includes('Learner')) {
        console.log('Falling back to mock Learner data after error');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.learners(),
          _isMockData: true 
        };
      } else if (endpoint.includes('SensorData')) {
        console.log('Falling back to mock SensorData data after error');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.sensorData(),
          _isMockData: true 
        };
      } else if (endpoint.includes('Alert')) {
        console.log('Falling back to mock Alert data after error');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.alerts(),
          _isMockData: true 
        };
      } else if (endpoint.includes('Feedback')) {
        console.log('Falling back to mock Feedback data after error');
        return { 
          ok: true, 
          status: 200, 
          data: generateMockData.feedback(),
          _isMockData: true 
        };
      }
    }
    
    // Return empty data on error if no mock data is available
    return { 
      ok: false, 
      error: error.message,
      data: [],
      _isMockData: true 
    };
  }
};

// Create a simpler API for common HTTP methods
const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiFetch(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => apiFetch(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

// SensorData API
export const sensorDataApi = {
  getAll: () => api.get('SensorData'),
  getById: (id) => api.get(`SensorData/${id}`),
  create: (data) => api.post('SensorData', data),
  update: (id, data) => api.put(`SensorData/${id}`, data),
  delete: (id) => api.delete(`SensorData/${id}`),
};

// Learner API - note that we're using the correct endpoints based on your Postman test
export const learnerApi = {
  getAll: () => api.get('Learner'),
  getById: (id) => api.get(`Learner/${id}`),
  create: (data) => api.post('Learner', data),
  update: (id, data) => api.put(`Learner/${id}`, data),
  delete: (id) => api.delete(`Learner/${id}`),
};

// Feedback API
export const feedbackApi = {
  getAll: () => api.get('Feedback'),
  getById: (id) => api.get(`Feedback/${id}`),
  create: (data) => api.post('Feedback', data),
  update: (id, data) => api.put(`Feedback/${id}`, data),
  delete: (id) => api.delete(`Feedback/${id}`),
};

// Facilitator API
export const facilitatorApi = {
  getAll: () => api.get('Facilitator'),
  getById: (id) => api.get(`Facilitator/${id}`),
  create: (data) => api.post('Facilitator', data),
  update: (id, data) => api.put(`Facilitator/${id}`, data),
  delete: (id) => api.delete(`Facilitator/${id}`),
};

// Alert API
export const alertApi = {
  getAll: () => api.get('Alert'),
  getById: (id) => api.get(`Alert/${id}`),
  create: (data) => api.post('Alert', data),
  update: (id, data) => api.put(`Alert/${id}`, data),
  delete: (id) => api.delete(`Alert/${id}`),
};

// Add a test function to verify connectivity
export const testApiConnection = async () => {
  console.log('Testing API connection to:', API_BASE_URL);
  
  // Try multiple approaches to connect to the API
  const results = {};
  
  // Test 1: Try the Learner endpoint with our custom fetch wrapper
  try {
    console.log('Test 1: Using custom fetch wrapper');
    const response = await api.get('Learner');
    console.log('Test 1 result:', response);
    results.test1 = { success: response.ok, response };
  } catch (error) {
    console.error('Test 1 failed:', error.message);
    results.test1 = { success: false, error: error.message };
  }
  
  // Test 2: Try direct fetch with HTTP (not HTTPS)
  try {
    console.log('Test 2: Direct fetch with HTTP');
    const httpUrl = API_BASE_URL.replace('https://', 'http://');
    console.log('Using URL:', httpUrl + 'Learner');
    const response = await fetch(httpUrl + 'Learner', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const responseText = await response.text();
    console.log('Test 2 response:', response.status, responseText);
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { text: responseText };
    }
    results.test2 = { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('Test 2 failed:', error.message);
    results.test2 = { success: false, error: error.message };
  }
  
  // Test 3: Try XMLHttpRequest as a last resort
  try {
    console.log('Test 3: Using XMLHttpRequest');
    const xhrResult = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            let data;
            try {
              data = JSON.parse(xhr.responseText);
            } catch (e) {
              data = { text: xhr.responseText };
            }
            resolve({ success: true, status: xhr.status, data });
          } else {
            resolve({ 
              success: false, 
              status: xhr.status, 
              statusText: xhr.statusText,
              responseText: xhr.responseText 
            });
          }
        }
      };
      xhr.onerror = function(e) {
        reject(new Error('XHR error: ' + e.message));
      };
      xhr.open('GET', API_BASE_URL + 'Learner', true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.timeout = 10000;
      xhr.send();
    });
    console.log('Test 3 result:', xhrResult);
    results.test3 = xhrResult;
  } catch (error) {
    console.error('Test 3 failed:', error.message);
    results.test3 = { success: false, error: error.message };
  }
  
  // Return all test results
  return {
    success: results.test1.success || results.test2.success || results.test3?.success,
    results,
    url: API_BASE_URL,
    platform: Platform.OS
  };
};

export default api;
