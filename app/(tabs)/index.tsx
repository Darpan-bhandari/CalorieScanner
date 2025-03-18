import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import ImagePickerComponent from '../../components/ImagePicker';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.title}>Calorie Counter+</Text>
        <Text style={styles.subtitle}>Log your meals to track nutrition info</Text>
      </View>
      <View style={styles.pickerContainer}>
        <ImagePickerComponent />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9e9e9e',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
});
