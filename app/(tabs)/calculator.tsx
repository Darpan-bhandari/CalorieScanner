import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  Pressable 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalorieCalculator() {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [result, setResult] = useState(null);

  const activityLevels = {
    sedentary: { label: 'Sedentary', description: 'Little or no exercise' },
    lightlyActive: { label: 'Lightly Active', description: '1-3 days/week' },
    moderatelyActive: { label: 'Moderately Active', description: '3-5 days/week' },
    veryActive: { label: 'Very Active', description: '6-7 days/week' },
    extraActive: { label: 'Extra Active', description: 'Very intense exercise' }
  };

  const saveNutritionGoals = async (dailyCalories: number) => {
    try {
      const nutritionGoals = {
        calories: {
          goal: dailyCalories,
          current: 0
        },
        carbs: {
          goal: Math.round(dailyCalories * 0.5 / 4), // 50% of calories from carbs, 4 calories per gram
          current: 0
        },
        protein: {
          goal: Math.round(dailyCalories * 0.25 / 4), // 25% of calories from protein, 4 calories per gram
          current: 0
        },
        fat: {
          goal: Math.round(dailyCalories * 0.25 / 9), // 25% of calories from fat, 9 calories per gram
          current: 0
        }
      };

      await AsyncStorage.setItem('nutritionGoals', JSON.stringify(nutritionGoals));
      console.log('Nutrition goals saved:', nutritionGoals);
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
    }
  };

  const calculateBMR = async () => {
    const ageNum = parseFloat(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || !heightNum || !weightNum) {
      alert('Please fill in all fields');
      return;
    }

    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      moderatelyActive: 1.55,
      veryActive: 1.725,
      extraActive: 1.9
    };

    const dailyCalories = Math.round(bmr * activityMultipliers[activityLevel]);

    // Save the calculated daily calories and macronutrient goals BEFORE setting the result
    await saveNutritionGoals(dailyCalories);

    setResult({
      bmr: Math.round(bmr),
      dailyCalories: dailyCalories
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="calculator" size={32} color="#4CAF50" />
          <Text style={styles.title}>Calorie Calculator</Text>
        </View>

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderButtons}>
            <Pressable 
              style={[
                styles.genderButton, 
                gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setGender('male')}
            >
              <MaterialCommunityIcons 
                name="gender-male" 
                size={24} 
                color={gender === 'male' ? '#4CAF50' : '#9e9e9e'} 
              />
              <Text style={[
                styles.genderButtonText,
                gender === 'male' && styles.genderButtonTextActive
              ]}>Male</Text>
            </Pressable>
            <Pressable 
              style={[
                styles.genderButton, 
                gender === 'female' && styles.genderButtonActive
              ]}
              onPress={() => setGender('female')}
            >
              <MaterialCommunityIcons 
                name="gender-female" 
                size={24} 
                color={gender === 'female' ? '#4CAF50' : '#9e9e9e'} 
              />
              <Text style={[
                styles.genderButtonText,
                gender === 'female' && styles.genderButtonTextActive
              ]}>Female</Text>
            </Pressable>
          </View>
        </View>

        {/* Basic Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor="#666"
              value={age}
              onChangeText={setAge}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter your height"
              placeholderTextColor="#666"
              value={height}
              onChangeText={setHeight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter your weight"
              placeholderTextColor="#666"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        {/* Activity Level Selection */}
        <View style={styles.activityContainer}>
          <Text style={styles.label}>Activity Level</Text>
          {Object.entries(activityLevels).map(([key, { label, description }]) => (
            <Pressable
              key={key}
              style={[
                styles.activityButton,
                activityLevel === key && styles.activityButtonActive
              ]}
              onPress={() => setActivityLevel(key)}
            >
              <View style={styles.activityContent}>
                <Text style={[
                  styles.activityLabel,
                  activityLevel === key && styles.activityLabelActive
                ]}>{label}</Text>
                <Text style={styles.activityDescription}>{description}</Text>
              </View>
              {activityLevel === key && (
                <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Calculate Button */}
        <TouchableOpacity 
          style={styles.calculateButton} 
          onPress={calculateBMR}
        >
          <Text style={styles.calculateButtonText}>Calculate Calories</Text>
        </TouchableOpacity>

        {/* Results Display */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Your Results</Text>
            <View style={styles.mainNutrition}>
              <View style={styles.nutritionHighlight}>
                <Text style={styles.highlightValue}>{result.bmr}</Text>
                <Text style={styles.highlightLabel}>BMR (calories/day)</Text>
              </View>
              <View style={styles.nutritionHighlight}>
                <Text style={styles.highlightValue}>{result.dailyCalories}</Text>
                <Text style={styles.highlightLabel}>Daily Calories</Text>
              </View>
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
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
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
    color: '#ffffff',
  },
  genderContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d2d2d',
  },
  genderButtonActive: {
    borderColor: '#4CAF50',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  genderButtonTextActive: {
    color: '#4CAF50',
  },
  metricsContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  activityButtonActive: {
    backgroundColor: '#2d2d2d',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#4CAF50',
  },
  activityDescription: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  mainNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 20,
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
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 4,
    textAlign: 'center',
  },
});
