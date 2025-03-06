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
    },
    meals: [
      {
        id: '1',
        name: 'Breakfast',
        consumed: 0,
        goal: 0,
        icon: 'coffee',
      },
      {
        id: '2',
        name: 'Lunch',
        consumed: 0,
        goal: 0,
        icon: 'food',
      },
      {
        id: '3',
        name: 'Dinner',
        consumed: 0,
        goal: 0,
        icon: 'food-variant',
      },
      {
        id: '4',
        name: 'Snacks',
        consumed: 0,
        goal: 0,
        icon: 'fruit-cherries',
      },
    ],
  });

  // Load goals whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNutritionGoals();
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
            calories: goals.calories,
            carbs: goals.carbs,
            protein: goals.protein,
            fat: goals.fat,
            eaten: goals.calories.current || 0,
            remaining: goals.calories.goal - (goals.calories.current || 0),
            meals: prevData.meals.map(meal => ({
              ...meal,
              goal: Math.round(goals.calories.goal * (
                meal.id === '1' ? 0.25 : // Breakfast 25%
                meal.id === '2' ? 0.35 : // Lunch 35%
                meal.id === '3' ? 0.30 : // Dinner 30%
                0.10 // Snacks 10%
              )),
            })),
          };
          console.log('Updated nutrition data:', updatedData);
          return updatedData;
        });
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
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
        <Text style={styles.cardTitle}>Today's Meals</Text>
        {nutritionData.meals.map((meal) => (
          <View key={meal.id} style={styles.mealItem}>
            <View style={styles.mealIconContainer}>
              <View style={styles.iconCircle}>
                {getMealIcon(meal.icon)}
              </View>
            </View>
            
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.mealProgress}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${getProgressWidth(meal.consumed, meal.goal)}%`,
                        backgroundColor: '#4CAF50'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.calorieText}>
                  {meal.consumed} / {meal.goal} Cal
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddMeal(meal.id)}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))}
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
    backgroundColor: '#1a1a1a',
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
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
  },
  mealIconContainer: {
    marginRight: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
    gap: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  mealProgress: {
    gap: 4,
  },
  calorieText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
});