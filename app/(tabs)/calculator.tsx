import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RBSheet from 'react-native-raw-bottom-sheet';
import FeatherIcon from '@expo/vector-icons/Feather';

export default function CalorieCalculator() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [result, setResult] = useState(null);

  const sheet = React.useRef();

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
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              alt="App Logo"
              resizeMode="contain"
              style={styles.headerImg}
              source={{
                uri: 'https://cdn.iconscout.com/icon/premium/png-256-thumb/calories-1-94158.png?f=webp&w=256',
              }}
            />

            <Text style={styles.title}>
              Enter Details to{' '}
              <Text style={{ color: '#075eec' }}>Calulate BMR</Text>
            </Text>

            <Text style={styles.subtitle}>
              Get Details about your required calories
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Gender</Text>
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
                    color={gender === 'male' ? '#075eec' : '#000'}
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
                    color={gender === 'female' ? '#075eec' : '#000'}
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

            {/*Basic Metrics Container*/}
            <View style={styles.metricsContainer}>
              <View style={styles.input}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.inputControl}
                  keyboardType="numeric"
                  placeholder="Enter your age"
                  placeholderTextColor="#666"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.inputControl}
                  keyboardType="numeric"
                  placeholder="Enter your height"
                  placeholderTextColor="#666"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.inputControl}
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
              <Text style={styles.inputLabel}>Activity Level</Text>
              {Object.entries(activityLevels).map(
                ([key, { label, description }]) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.activityLevelButton,
                      activityLevel === key && styles.activityButtonActive,
                    ]}
                    onPress={() => setActivityLevel(key)}>
                    <View style={styles.activityLevelText}>
                      <Text
                        style={[
                          styles.activityLevelLabel,
                          activityLevel === key && styles.activityLabelActive,
                        ]}>
                        {label}
                      </Text>
                      <Text style={styles.activityLevelDesc}>
                        {description}
                      </Text>
                    </View>
                    {activityLevel === key && (
                      <MaterialCommunityIcons
                        name="check"
                        size={24}
                        color="#075eec"
                      />
                    )}
                  </Pressable>
                )
              )}
            </View>

            <View style={styles.formAction}>
              <TouchableOpacity
                onPress={calculateBMR}
                style={styles.calculateButton}>
                <Text style={styles.calculateButtonText}>Calculate BMR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetCalculator}
                style={styles.resetButton}>
                <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                // handle link
              }}>
              <Text style={styles.formLink}>Go back to Dashboard ?</Text>
            </TouchableOpacity>
          </View>
        </View>

  
      </ScrollView>

      <RBSheet
        customStyles={{ container: styles.sheetContent }}
        height={450}
        openDuration={250}
        ref={sheet}>
        <View style={styles.sheetContent}>
          <FeatherIcon
            color="#2b64e3"
            name="clipboard"
            style={{
              alignSelf: 'center',
            }}
            size={48}
          />

          {/* Results Display */}
          {result && (
            <View style={styles.sheetResult}>
              <Text style={styles.sheetResultTitle}>Your Results</Text>
              <View style={styles.mainNutrition}>
                <View style={styles.nutritionHighlight}>
                  <Text style={styles.sheetResultValue}>{result.bmr}</Text>
                  <Text style={styles.sheetResultTitle}>BMR (calories/day)</Text>
                </View>
                <View style={styles.nutritionHighlight}>
                  <Text style={styles.sheetResultValue}>
                    {result.dailyCalories}
                  </Text>
                  <Text style={styles.sheetResultTitle}>Daily Calories</Text>
                </View>
              </View>
            </View>
          )}
          <Text style={styles.message}>
            These values are calculated on the input provided by user with the
            BMR calculation formula these values may be inaccurate,
          </Text>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Proceed</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Calculate Again</Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 24,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    marginVertical: 36,
  },
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
  /** Form */
  form: {
    marginBottom: 24,
    flex: 1,
  },
  formAction: {
    marginVertical: 24,
  },
  formLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075eec',
    textAlign: 'center',
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#075eec',
    borderColor: '#075eec',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
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
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  genderButtonActive: {
    backgroundColor: '#e3edff',
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
  activityContainer: {
    marginBottom: 20,
  },
  activityLevelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  activityButtonActive: {
    backgroundColor: '#e3edff',
    borderWidth: 2,
    borderColor: '#075eec',
  },
  activityLevelText: {
    flex: 1,
  },
  activityLevelLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#075eec',
  },
  activityLevelDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  sheetContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  sheetSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    marginBottom: 24,
  },
  sheetResult: {
    backgroundColor: '#e3edff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sheetResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  sheetResultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#075eec',
  },
  spacer: {
    height: 24,
  },
  calculateButton: {
    backgroundColor: '#075eec',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#075eec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  calculateButtonText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555',
    marginTop: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  btnSecondaryText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#2b64e3',
  },
  mainNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 15,
    padding: 20,
  },
  nutritionHighlight: {
    alignItems: 'center',
  },
});
