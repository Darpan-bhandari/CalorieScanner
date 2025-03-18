import React, { useState, useEffect, useRef } from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as MediaLibrary from 'expo-media-library';

export default function ImageFinal() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync(); 
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();

  },[])

  return (
    <View>
      <Text>Camera Comp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: "100%",
    height: 350,
  },
});