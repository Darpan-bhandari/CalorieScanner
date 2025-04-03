import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { analyzeImage, getNutritionInfo } from '../../utils/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NutritionInfo {
  name: string;
  calories: number;
  serving_size_g: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  potassium_mg?: number;
  cholesterol_mg?: number;
  fat_saturated_g?: number;
}

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);

  const updateNutritionData = async (nutritionItem: NutritionInfo) => {
    try {
      // Create the new food item first
      const newItem = {
        id: Date.now().toString(),
        name: nutritionItem.name,
        calories: nutritionItem.calories,
        icon: 'fruit-cherries',
        color: '#FFA07A'
      };

      // Get and update today's items first
      const savedItems = await AsyncStorage.getItem('todayItems');
      let todayItems = savedItems ? JSON.parse(savedItems) : [];
      todayItems.push(newItem);
      
      // Save updated items immediately
      await AsyncStorage.setItem('todayItems', JSON.stringify(todayItems));

      // Then update nutrition goals
      const savedGoals = await AsyncStorage.getItem('nutritionGoals');
      if (!savedGoals) {
        console.error('No nutrition goals found');
        return;
      }

      const goals = JSON.parse(savedGoals);
      
      // Update calories consumed
      goals.calories.current += nutritionItem.calories;
      
      // Calculate macros based on typical fruit composition (rough estimates)
      const carbsGrams = Math.round((nutritionItem.calories * 0.9) / 4); // 90% carbs
      const proteinGrams = Math.round((nutritionItem.calories * 0.05) / 4); // 5% protein
      const fatGrams = Math.round((nutritionItem.calories * 0.05) / 9); // 5% fat
      
      goals.carbs.current += carbsGrams;
      goals.protein.current += proteinGrams;
      goals.fat.current += fatGrams;

      // Save updated nutrition data
      await AsyncStorage.setItem('nutritionGoals', JSON.stringify(goals));

      console.log('Updated nutrition data with fruit calories:', goals);
    } catch (error) {
      console.error('Error updating nutrition data:', error);
    }
  };

  useEffect(() => {
    const processImage = async () => {
      try {
        setLoading(true);
        const visionResult = await analyzeImage(imageUri as string);
        console.log('Vision API Response:', JSON.stringify(visionResult, null, 2));
        
        // First try to get fruit from localizedObjectAnnotations
        let fruitName = visionResult.responses[0].localizedObjectAnnotations?.[0]?.name;
        
        // If no fruit found in objects, check labels more thoroughly
        if (!fruitName) {
          const fruitLabels = visionResult.responses[0].labelAnnotations
            .filter((label: any) => {
              const desc = label.description.toLowerCase();
              // Expanded list of common fruits
              const commonFruits = [
                'apple', 'banana', 'orange', 'grape', 'mango', 'citrus',
                'pear', 'strawberry', 'blueberry', 'raspberry', 'kiwi',
                'peach', 'plum', 'apricot', 'cherry', 'lemon', 'lime',
                'pineapple', 'watermelon', 'melon', 'fig', 'pomegranate'
              ];
              return !['fruit', 'food', 'produce', 'ingredient'].includes(desc) &&
                     (desc.includes('fruit') || commonFruits.some(fruit => desc.includes(fruit)));
            })
            .map((label: any) => label.description);
          
          fruitName = fruitLabels[0];
        }

        // Store all detected labels for debugging
        const allLabels = visionResult.responses[0].labelAnnotations
          .map((label: any) => label.description);
        setDetectedLabels(allLabels);
        console.log('All detected labels:', allLabels);

        if (!fruitName) {
          setError('No specific fruit detected in the image');
          setLoading(false);
          return;
        }

        console.log('Detected fruit:', fruitName);
        const nutritionData = await getNutritionInfo(fruitName);
        console.log('Nutrition API Response:', JSON.stringify(nutritionData, null, 2));
        
        if (nutritionData.items && nutritionData.items.length > 0) {
          const nutritionItem = nutritionData.items[0];
          setNutritionInfo(nutritionItem);
          
          // Update nutrition data and today's items
          await updateNutritionData(nutritionItem);
          setError(null); // Clear any previous errors
        } else {
          setError('No nutrition information found for ' + fruitName);
        }
      } catch (err) {
        setError('Error processing image');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (imageUri) {
      processImage();
    }
  }, [imageUri]);

  if (!imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="image-search" size={80} color="#4CAF50" />
          <Text style={styles.emptyTitle}>No Results Yet</Text>
          <Text style={styles.emptyText}>
            Scan a fruit using the camera or select from gallery to see nutrition information
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing your fruit...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={60} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri as string }} 
            style={styles.image} 
            resizeMode="cover"
          />
        </View>
        
        {nutritionInfo && (
          <View style={styles.infoContainer}>
            <View style={styles.headerContainer}>
              <MaterialCommunityIcons 
                name="fruit-cherries" 
                size={32} 
                color="#4CAF50" 
              />
              <Text style={styles.title}>{nutritionInfo.name}</Text>
            </View>

            <View style={styles.mainNutrition}>
              <View style={styles.nutritionHighlight}>
                <Text style={styles.highlightValue}>{nutritionInfo.calories}</Text>
                <Text style={styles.highlightLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionHighlight}>
                <Text style={styles.highlightValue}>{nutritionInfo.serving_size_g}g</Text>
                <Text style={styles.highlightLabel}>Serving</Text>
              </View>
            </View>

            <View style={styles.macrosContainer}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionInfo.protein_g}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionInfo.carbohydrates_total_g}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{nutritionInfo.fat_total_g}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              {nutritionInfo.fiber_g !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fiber</Text>
                  <Text style={styles.detailValue}>{nutritionInfo.fiber_g}g</Text>
                </View>
              )}
              {nutritionInfo.sugar_g !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sugar</Text>
                  <Text style={styles.detailValue}>{nutritionInfo.sugar_g}g</Text>
                </View>
              )}
              {nutritionInfo.sodium_mg !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sodium</Text>
                  <Text style={styles.detailValue}>{nutritionInfo.sodium_mg}mg</Text>
                </View>
              )}
              {nutritionInfo.potassium_mg !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Potassium</Text>
                  <Text style={styles.detailValue}>{nutritionInfo.potassium_mg}mg</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#4CAF50',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f44336',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'capitalize',
  },
  //Calories & Serving
  mainNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eaeff9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  nutritionHighlight: {
    alignItems: 'center',
  },
  highlightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  highlightLabel: {
    fontSize: 16,
    color: '#9e9e9e',
    marginTop: 4,
  },
  //Macro Nutrients
  macrosContainer: {
    backgroundColor: '#eaeff9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  macroLabel: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 4,
  },
  // Additional Information
  detailsContainer: {
    backgroundColor: '#eaeff9',
    borderRadius: 15,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
  },
  detailLabel: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});
