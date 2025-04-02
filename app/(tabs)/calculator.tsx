import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RBSheet from 'react-native-raw-bottom-sheet';

export default function CalorieCalculator() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [result, setResult] = useState(null);

  const sheet = useRef<RBSheet>(null);

  const openBottomSheet = () => {
    sheet.current.open();
  };

  const activityLevels = {
    sedentary: { label: 'Sedentary', description: 'Little or no exercise' },
    lightlyActive: { label: 'Lightly Active', description: '1-3 days/week' },
    moderatelyActive: {
      label: 'Moderately Active',
      description: '3-5 days/week',
    },
    veryActive: { label: 'Very Active', description: '6-7 days/week' },
    extraActive: {
      label: 'Extra Active',
      description: 'Very intense exercise',
    },
  };

  const saveNutritionGoals = async (dailyCalories: number) => {
    try {
      const nutritionGoals = {
        calories: {
          goal: dailyCalories,
          current: 0,
        },
        carbs: {
          goal: Math.round((dailyCalories * 0.5) / 4), // 50% of calories from carbs, 4 calories per gram
          current: 0,
        },
        protein: {
          goal: Math.round((dailyCalories * 0.25) / 4), // 25% of calories from protein, 4 calories per gram
          current: 0,
        },
        fat: {
          goal: Math.round((dailyCalories * 0.25) / 9), // 25% of calories from fat, 9 calories per gram
          current: 0,
        },
      };

      await AsyncStorage.setItem(
        'nutritionGoals',
        JSON.stringify(nutritionGoals)
      );
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
      bmr = 88.362 + 13.397 * weightNum + 4.799 * heightNum - 5.677 * ageNum;
    } else {
      bmr = 447.593 + 9.247 * weightNum + 3.098 * heightNum - 4.33 * ageNum;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      moderatelyActive: 1.55,
      veryActive: 1.725,
      extraActive: 1.9,
    };

    const dailyCalories = Math.round(bmr * activityMultipliers[activityLevel]);

    // Save the calculated daily calories and macronutrient goals BEFORE setting the result
    await saveNutritionGoals(dailyCalories);

    setResult({
      bmr: Math.round(bmr),
      dailyCalories: dailyCalories,
    });
    sheet.current.open();
  };

  const resetCalculator = async () => {
    // Reset form fields
    setAge('');
    setHeight('');
    setWeight('');
    setGender('male');
    setActivityLevel('sedentary');
    setResult(null);

    // Reset nutrition goals in AsyncStorage
    try {
      const defaultNutritionGoals = {
        calories: { goal: 0, current: 0 },
        carbs: { goal: 0, current: 0 },
        protein: { goal: 0, current: 0 },
        fat: { goal: 0, current: 0 }
      };
      await AsyncStorage.setItem('nutritionGoals', JSON.stringify(defaultNutritionGoals));
      await AsyncStorage.setItem('todayItems', JSON.stringify([]));
      console.log('Calculator and nutrition data reset successfully');
    } catch (error) {
      console.error('Error resetting nutrition goals:', error);
      alert('Failed to reset nutrition data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="calculator" 
            size={80} 
            color="#075eec"
            style={styles.headerImg}
          />
          <Text style={styles.title}>BMR Calculator</Text>
          <Text style={styles.subtitle}>Calculate your daily calorie needs</Text>
        </View>

        <View style={styles.form}>
          {/* Gender Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.genderButtons}>
              <Pressable
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('male')}>
                <MaterialCommunityIcons
                  name="gender-male"
                  size={24}
                  color={gender === 'male' ? '#075eec' : '#222'}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextActive,
                  ]}>
                  Male
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setGender('female')}>
                <MaterialCommunityIcons
                  name="gender-female"
                  size={24}
                  color={gender === 'female' ? '#075eec' : '#222'}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextActive,
                  ]}>
                  Female
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Basic Metrics */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricInput}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.inputControl}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Years"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.metricInput}>
                <Text style={styles.inputLabel}>Height</Text>
                <TextInput
                  style={styles.inputControl}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="cm"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.metricInput}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                  style={styles.inputControl}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="kg"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Activity Level */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Activity Level</Text>
            <View style={styles.activityContainer}>
              {Object.entries(activityLevels).map(([key, { label, description }]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.activityButton,
                    activityLevel === key && styles.activityButtonActive,
                  ]}
                  onPress={() => setActivityLevel(key)}>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityLabel, activityLevel === key && styles.activityLabelActive]}>
                      {label}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {description}
                    </Text>
                  </View>
                  {activityLevel === key && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#075eec" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.formAction}>
            <Pressable style={styles.calculateButton} onPress={calculateBMR}>
              <MaterialCommunityIcons name="calculator" size={24} color="#fff" />
              <Text style={styles.calculateButtonText}>Calculate BMR</Text>
            </Pressable>

            <Pressable style={styles.resetButton} onPress={resetCalculator}>
              <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Results Sheet */}
      <RBSheet
        ref={sheet}
        height={450}
        openDuration={250}
        customStyles={{
          container: styles.sheetContainer,
        }}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Your Results</Text>
          <Text style={styles.sheetSubtitle}>
            Based on your metrics, here are your daily calorie needs
          </Text>

          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Basal Metabolic Rate (BMR)</Text>
                <Text style={styles.resultValue}>{result.bmr}</Text>
                <Text style={styles.resultUnit}>calories/day</Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Daily Calorie Needs</Text>
                <Text style={styles.resultValue}>{result.dailyCalories}</Text>
                <Text style={styles.resultUnit}>calories/day</Text>
              </View>

              <Text style={styles.resultNote}>
                These calculations are based on the Mifflin-St Jeor equation, which is considered one of the most accurate methods for estimating calorie needs.
              </Text>
            </View>
          )}

          <Pressable style={styles.closeButton} onPress={() => sheet.current?.close()}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </RBSheet>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  genderButtonActive: {
    backgroundColor: '#e3edff',
    borderColor: '#075eec',
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  genderButtonTextActive: {
    color: '#075eec',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metricInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1d1d1d',
    marginBottom: 8,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    fontWeight: '500',
    color: '#1d1d1d',
  },
  activityContainer: {
    gap: 8,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityButtonActive: {
    backgroundColor: '#e3edff',
    borderColor: '#075eec',
  },
  activityContent: {
    flex: 1,
    marginRight: 12,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1d1d1d',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#075eec',
  },
  activityDescription: {
    fontSize: 13,
    color: '#666',
  },
  formAction: {
    gap: 12,
    marginTop: 24,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#075eec',
    borderRadius: 12,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#dc3545',
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
  },
  sheetContent: {
    padding: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  resultContainer: {
    gap: 16,
    marginBottom: 24,
  },
  resultCard: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#075eec',
  },
  resultUnit: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  resultNote: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
