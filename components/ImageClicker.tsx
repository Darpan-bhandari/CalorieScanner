import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const CAPTURE_SIZE = Math.floor(WINDOW_HEIGHT * 0.08);

export default function ImageClickerComponent() {
  const router = useRouter();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      if (Platform.OS !== 'web') {
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasGalleryPermission(galleryStatus.status === 'granted');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          exif: false,
          base64: true,
        });
        
        if (!photo || !photo.uri) {
          throw new Error('Failed to capture photo');
        }

        // Ensure the directory exists
        const directory = `${FileSystem.cacheDirectory}photos/`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        
        // Generate a new filename
        const filename = `${directory}${Date.now()}.jpg`;
        
        // Copy the photo to our app's cache directory
        await FileSystem.copyAsync({
          from: photo.uri,
          to: filename
        });
        
        console.log('Photo saved to:', filename);
        handleImageSelected(filename);
      } catch (error) {
        console.error('Error taking picture:', error);
        alert('Failed to take picture. Please try again.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        // Copy selected image to app's cache directory
        const directory = `${FileSystem.cacheDirectory}photos/`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        const filename = `${directory}${Date.now()}.jpg`;
        
        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: filename
        });
        
        handleImageSelected(filename);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to select image. Please try again.');
    }
  };

  const handleImageSelected = async (uri: string) => {
    if (!uri) {
      console.error('No image URI provided');
      alert('Failed to process image. Please try again.');
      return;
    }
    
    try {
      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }
      
      console.log('Image file exists:', fileInfo);
      setShowCamera(false);
      
      router.push({
        pathname: "/results",
        query: { imageUri: uri }
      });
      
    } catch (error) {
      console.error('Error handling image:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  if (hasCameraPermission === null || hasGalleryPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false || hasGalleryPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>No access to camera or gallery</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera
          style={styles.camera}
          type={cameraType}
          ref={cameraRef}
        >
          <View style={styles.overlay}>
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={() => setShowCamera(false)}>
                <MaterialCommunityIcons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isCapturing}>
                <View style={[styles.captureInner, isCapturing && styles.captureButtonDisabled]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}>
                <MaterialCommunityIcons name="image" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <MaterialCommunityIcons name="fruit-cherries" size={80} color="#4CAF50" />
        <Text style={styles.welcomeTitle}>Ready to Scan</Text>
        <Text style={styles.welcomeText}>
          Take a photo or select from gallery to get detailed nutrition information
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={() => setShowCamera(true)}>
          <MaterialCommunityIcons name="camera" size={28} color="#ffffff" />
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.galleryButtonLarge]}
          onPress={pickImage}>
          <MaterialCommunityIcons name="image" size={28} color="#ffffff" />
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#dae4f9',
    justifyContent: 'space-between',
    padding: 20,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07090d',
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  buttonContainer: {
    gap: 15,
    paddingBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  cameraButton: {
    backgroundColor: '#316eda',
  },
  galleryButtonLarge: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: CAPTURE_SIZE,
    height: CAPTURE_SIZE,
    borderRadius: CAPTURE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#ffffff',
    padding: 3,
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: CAPTURE_SIZE / 2,
    backgroundColor: '#ffffff',
  },
  captureButtonDisabled: {
    backgroundColor: '#666666',
  },
  galleryButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});