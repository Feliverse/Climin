import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export default function WeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    getWeatherData().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    getWeatherData();
  }, []);

  const getWeatherData = async () => {
    try {
      // 1. Solicitar permisos de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }

      // 2. Obtener ubicación actual
      let location = await Location.getCurrentPositionAsync({});
      
      // 3. Llamar a la API del clima
      const API_KEY = 'a4dab8a2d32d094fbe9e440b6f09314c'; // Reemplazar con key real
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric&lang=es`
      );
      
      const data = await response.json();
      setWeather(data);
      
    } catch (error) {
      setError('Error al obtener datos del clima');
    } finally {
      setLoading(false);
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Obteniendo datos del clima...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const getWeatherIcon = (weatherMain) => {
    const iconMap = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Snow': 'snow',
      'Thunderstorm': 'thunderstorm',
      'Drizzle': 'rainy-outline'
    };
return iconMap[weatherMain] || 'partly-sunny';
};

  // Renderizado principal
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.container}
    >
      {weather && (
        <>

          <Text style={styles.city}>{weather.name}</Text>
          <Ionicons
            name={getWeatherIcon('weather.weather[0].main')}
            size={80}
            color="#364c64ff"
          />
          <Text style={styles.temperature}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.description}>
            {weather.weather[0].description}
          </Text>
          <Text>Humedad: {weather.main.humidity}%</Text>
          <Text>Viento: {weather.wind.speed} m/s</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  city: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  temperature: { fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  description: { fontSize: 20, marginBottom: 20, textTransform: 'capitalize' },
  errorText: { color: 'red', fontSize: 18, textAlign: 'center' }
});
