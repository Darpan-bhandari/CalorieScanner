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

interface TodayItem {
  id: string;
  name: string;
  calories: number;
  icon: string;
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
      loadNutritionGoals();
      loadTodayItems();
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
      if (savedItems) {
        setTodayItems(JSON.parse(savedItems));
      } else {
        // Default items for testing
        setTodayItems([
          { id: '1', name: 'Apple', calories: 95, icon: 'food-apple', color: '#FFA07A' },
          { id: '2', name: 'Chicken Salad', calories: 350, icon: 'food', color: '#CCCCFF' },
          { id: '3', name: 'Greek Yogurt', calories: 130, icon: 'cup', color: '#FFA07A' },
        ]);
      }
    } catch (error) {
      console.error('Error loading today items:', error);
    }
  };

  // Helper function to calculate progress bar width
  const getProgressWidth = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Get icon for each meal type
  const getMealIcon = (type: string) => {
    return <MaterialCommunityIcons name={type} size={24} color="#4CAF50" />;
  };

  // Function to add a new meal item
  const handleAddMeal = async (mealId: string) => {
    // TODO: Implement meal addition logic
    console.log(`Add item to meal with id: ${mealId}`);
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nutrition Progress</Text>
        <View style={styles.nutrientBarsContainer}>
          {/* Calorie Progress */}
          <View style={styles.nutrientBar}>
            <View style={styles.nutrientLabelContainer}>
              <Text style={styles.nutrientLabel}>Calories</Text>
              <Text style={styles.nutrientText}>
                {nutritionData.calories.current} / {nutritionData.calories.goal} kcal
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  styles.progressBarCalories,
                  { width: `${getProgressWidth(nutritionData.calories.current, nutritionData.calories.goal)}%` }
                ]} 
              />
            </View>
          </View>

          {/* Carbs Progress */}
          <View style={styles.nutrientBar}>
            <View style={styles.nutrientLabelContainer}>
              <Text style={styles.nutrientLabel}>Carbs</Text>
              <Text style={styles.nutrientText}>
                {nutritionData.carbs.current} / {nutritionData.carbs.goal} g
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  styles.progressBarCarbs,
                  { width: `${getProgressWidth(nutritionData.carbs.current, nutritionData.carbs.goal)}%` }
                ]} 
              />
            </View>
          </View>
          
          {/* Protein Progress */}
          <View style={styles.nutrientBar}>
            <View style={styles.nutrientLabelContainer}>
              <Text style={styles.nutrientLabel}>Protein</Text>
              <Text style={styles.nutrientText}>
                {nutritionData.protein.current} / {nutritionData.protein.goal} g
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  styles.progressBarProtein,
                  { width: `${getProgressWidth(nutritionData.protein.current, nutritionData.protein.goal)}%` }
                ]} 
              />
            </View>
          </View>
          
          {/* Fat Progress */}
          <View style={styles.nutrientBar}>
            <View style={styles.nutrientLabelContainer}>
              <Text style={styles.nutrientLabel}>Fat</Text>
              <Text style={styles.nutrientText}>
                {nutritionData.fat.current} / {nutritionData.fat.goal} g
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  styles.progressBarFat,
                  { width: `${getProgressWidth(nutritionData.fat.current, nutritionData.fat.goal)}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
      
      {/* Meal List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Food</Text>
        <ScrollView style={styles.scrollView}>
          {todayItems.map((item) => (
            <View key={item.id} style={styles.foodItemCard}>
              <View style={styles.foodItemLeft}>
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={24} 
                  color={item.color} 
                  style={styles.foodIcon}
                />
                <Text style={styles.foodName}>{item.name}</Text>
              </View>
              <View style={styles.foodItemRight}>
                <Text style={styles.calorieText}>{item.calories}</Text>
                <Text style={styles.calorieUnit}>cal</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.addFoodButton}
          onPress={() => {/* TODO: Implement add food */}}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
          <Text style={styles.addFoodText}>Add Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Tracker</Text>
        <Text style={styles.subtitle}>
          {value.toLocaleDateString('en-US', { dateStyle: 'full' })}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <NutritionDashboard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a5d6e4',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  nutritionContainer: {
    marginTop: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  nutrientBarsContainer: {
    gap: 16,
  },
  nutrientBar: {
    gap: 8,
  },
  nutrientLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarCalories: {
    backgroundColor: '#4CAF50',
  },
  progressBarCarbs: {
    backgroundColor: '#2196F3',
  },
  progressBarProtein: {
    backgroundColor: '#f44336',
  },
  progressBarFat: {
    backgroundColor: '#ff9800',
  },
  nutrientText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  foodItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodIcon: {
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  foodItemRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 4,
  },
  calorieUnit: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addFoodText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});