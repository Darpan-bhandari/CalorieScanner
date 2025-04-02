import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';

export default function Example() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Image
          source={{ uri: 'https://assets.withfra.me/Landing.3.png' }}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Plan your day</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.titleText, styles.withText]}>with</Text>
              <View style={styles.appNameContainer}>
                <Text style={styles.appNameText}>Calorie Tracker+</Text>
              </View>
            </View>
          </View>
          <Text style={styles.text}>
            Track your daily calories, set fitness goals, and watch your progress unfold. 
            We've made healthy living simple and engaging.
          </Text>
        </View>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1d1d1d',
    lineHeight: 36,
  },
  withText: {
    fontSize: 24,
    opacity: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  appNameContainer: {
    backgroundColor: '#075eec',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  appNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    color: '#9992a7',
    textAlign: 'center',
  },
  /** Hero */
  hero: {
    backgroundColor: '#d8dffe',
    margin: 12,
    borderRadius: 16,
    padding: 16,
  },
  heroImage: {
    width: '100%',
    height: 400,
  },
  /** Content */
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  contentHeader: {
    paddingHorizontal: 26,
  },
  /** Button */
  button: {
    backgroundColor: '#075eec',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
});