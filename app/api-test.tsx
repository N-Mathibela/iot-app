import React from 'react';
import { SafeAreaView, Text, View, StyleSheet, ScrollView } from 'react-native';
import ApiTester from './components/ApiTester';

export default function ApiTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>API Connection Testing</Text>
          <Text style={styles.subtitle}>
            Use this screen to test connections to your API endpoints
          </Text>
        </View>
        
        <ApiTester />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});
