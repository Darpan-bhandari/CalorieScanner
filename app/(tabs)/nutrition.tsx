import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import CircularProgress from '../../components/CircularProgress';

interface TodayItem {
  id: string;
  name: string;
  calories: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

export default function NutritionScreen() {
  const [value] = useState(new Date());
  const [nutritionData, setNutritionData] = useState({
    eaten: 0,
    remaining: 0,
    burned: 0,
    calories: {
      current: 0,
      goal: 0,
    },
    carbs: {
      current: 0,
      goal: 0,
    },
    protein: {
      current: 0,
      goal: 0,
    },
    fat: {
      current: 0,
      goal: 0,
    }
  });

  const [todayItems, setTodayItems] = useState<TodayItem[]>([]);

  // Load goals whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await loadNutritionGoals();
        await loadTodayItems();
      };
      loadData();
      
      // Set up an interval to refresh data every few seconds
      const interval = setInterval(loadData, 3000);
      
      // Clean up interval on unfocus
      return () => clearInterval(interval);
    }, [])
  );

  const loadNutritionGoals = async () => {
    try {
      const savedGoals = await AsyncStorage.getItem('nutritionGoals');
      console.log('Loaded nutrition goals:', savedGoals);
      
      if (savedGoals) {
        const goals = JSON.parse(savedGoals);
        console.log('Parsed goals:', goals);
        
        setNutritionData(prevData => {
          const updatedData = {
            ...prevData,
            calories: {
              current: Math.round(goals.calories.current || 0),
              goal: Math.round(goals.calories.goal || 0)
            },
            carbs: {
              current: Math.round(goals.carbs.current || 0),
              goal: Math.round(goals.carbs.goal || 0)
            },
            protein: {
              current: Math.round(goals.protein.current || 0),
              goal: Math.round(goals.protein.goal || 0)
            },
            fat: {
              current: Math.round(goals.fat.current || 0),
              goal: Math.round(goals.fat.goal || 0)
            },
            eaten: Math.round(goals.calories.current || 0),
            remaining: Math.round(goals.calories.goal - (goals.calories.current || 0)),
          };
          console.log('Updated nutrition data:', updatedData);
          return updatedData;
        });
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const loadTodayItems = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('todayItems');
      console.log('Loading today items:', savedItems);
      
      if (savedItems) {
        const items = JSON.parse(savedItems);
        console.log('Parsed today items:', items);
        setTodayItems(items);
      }
    } catch (error) {
      console.error('Error loading today items:', error);
    }
  };

  // Get icon for each meal type
  const getMealIcon = (type: keyof typeof MaterialCommunityIcons.glyphMap) => {
    return <MaterialCommunityIcons name={type} size={24} color="#4CAF50" />;
  };

  // Calculate percentage for circular progress
  const calculatePercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  // Nutrition Dashboard Component
  const NutritionDashboard = () => (
    <View style={styles.nutritionContainer}>
      {/* Daily Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="food-apple" size={24} color="#4CAF50" />
          <Text style={styles.summaryValue}>{nutritionData.eaten}</Text>
          <Text style={styles.summaryLabel}>Eaten</Text>
        </View>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="timer-sand" size={24} color="#2196F3" />
          <Text style={styles.summaryValue}>{nutritionData.remaining}</Text>
          <Text style={styles.summaryLabel}>Remaining</Text>
        </View>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="fire" size={24} color="#FF5722" />
          <Text style={styles.summaryValue}>{nutritionData.burned}</Text>
          <Text style={styles.summaryLabel}>Burned</Text>
        </View>
      </View>

      {/* Circular Progress Charts */}
      <View style={styles.chartsContainer}>
        <Text style={styles.sectionTitle}>Nutrition Progress</Text>
        <View style={styles.chartsRow}>
          {/* Calories Progress */}
          <View style={styles.chartItem}>
            <CircularProgress
              value={nutritionData.calories.current}
              maxValue={nutritionData.calories.goal}
              radius={40}
              strokeWidth={10}
              title="Calories"
              activeStrokeColor="#4CAF50"
              inactiveStrokeColor="#E8E8E8"
              textColor="#1d1d1d"
              titleColor="#666"
            />
            <Text style={styles.chartValue}>
              {nutritionData.calories.current} / {nutritionData.calories.goal} kcal
            </Text>
          </View>

          {/* Carbs Progress */}
          <View style={styles.chartItem}>
            <CircularProgress
              value={nutritionData.carbs.current}
              maxValue={nutritionData.carbs.goal}
              radius={40}
              strokeWidth={10}
              title="Carbs"
              activeStrokeColor="#2196F3"
              inactiveStrokeColor="#E8E8E8"
              textColor="#1d1d1d"
              titleColor="#666"
            />
            <Text style={styles.chartValue}>
              {nutritionData.carbs.current} / {nutritionData.carbs.goal} g
            </Text>
          </View>
        </View>

        <View style={styles.chartsRow}>
          {/* Protein Progress */}
          <View style={styles.chartItem}>
            <CircularProgress
              value={nutritionData.protein.current}
              maxValue={nutritionData.protein.goal}
              radius={40}
              strokeWidth={10}
              title="Protein"
              activeStrokeColor="#FF9800"
              inactiveStrokeColor="#E8E8E8"
              textColor="#1d1d1d"
              titleColor="#666"
            />
            <Text style={styles.chartValue}>
              {nutritionData.protein.current} / {nutritionData.protein.goal} g
            </Text>
          </View>

          {/* Fat Progress */}
          <View style={styles.chartItem}>
            <CircularProgress
              value={nutritionData.fat.current}
              maxValue={nutritionData.fat.goal}
              radius={40}
              strokeWidth={10}
              title="Fat"
              activeStrokeColor="#F44336"
              inactiveStrokeColor="#E8E8E8"
              textColor="#1d1d1d"
              titleColor="#666"
            />
            <Text style={styles.chartValue}>
              {nutritionData.fat.current} / {nutritionData.fat.goal} g
            </Text>
          </View>
        </View>
      </View>
      
      {/* Today's Food Items */}
      <View style={styles.todaysFoodContainer}>
        <Text style={styles.sectionTitle}>Today's Food</Text>
        {todayItems.length > 0 ? (
          todayItems.map((item) => (
            <View key={item.id} style={styles.foodItem}>
              <View style={styles.foodItemLeft}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                <Text style={styles.foodItemName}>{item.name}</Text>
              </View>
              <Text style={styles.foodItemCalories}>{item.calories} cal</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-apple-outline" size={32} color="#666" />
            <Text style={styles.emptyStateText}>No food items added today</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <NutritionDashboard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  nutritionContainer: {
    paddingHorizontal: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1d',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chartsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 20,
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartItem: {
    alignItems: 'center',
    width: '45%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  todaysFoodContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foodItemName: {
    fontSize: 16,
    color: '#1d1d1d',
  },
  foodItemCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});