import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { testApiConnection, learnerApi, sensorDataApi, alertApi } from '../services/api';

const ApiTester = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title, data) => {
    setResults(prev => [
      { id: Date.now(), title, data, timestamp: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      addResult(`Running ${testName}...`, null);
      const result = await testFunction();
      addResult(`${testName} Result`, result);
    } catch (error) {
      addResult(`${testName} Error`, { message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Tester</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => runTest('Connection Test', testApiConnection)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => runTest('Get Learners', () => learnerApi.getAll())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Learners</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => runTest('Get Sensors', () => sensorDataApi.getAll())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Sensors</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => runTest('Get Alerts', () => alertApi.getAll())}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {results.map(result => (
          <View key={result.id} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.timestamp}>{result.timestamp}</Text>
            </View>
            {result.data === null ? (
              <Text style={styles.loading}>Loading...</Text>
            ) : (
              <Text style={styles.resultData}>
                {JSON.stringify(result.data, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultData: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  loading: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
});

export default ApiTester;
