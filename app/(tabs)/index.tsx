import { StyleSheet, View, Text, SafeAreaView, StatusBar } from 'react-native';
import ImagePickerComponent from '../../components/ImagePicker';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.title}>Fruit Scanner</Text>
        <Text style={styles.subtitle}>Scan any fruit to get nutrition info</Text>
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
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
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
