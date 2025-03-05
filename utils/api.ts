import * as FileSystem from 'expo-file-system';

const VISION_API_KEY = "AIzaSyDy_dCcWM2BSK1cE33_zpJjpIgj624nOOI";
const CALORIE_API_KEY = "MIhgnn77dBK5R8G2xbeaHA==Uct3fs4maOUIY76T";

const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
const CALORIE_API_URL = "https://api.calorieninjas.com/v1/nutrition";

export const analyzeImage = async (imageUri: string) => {
  try {
    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const visionRequest = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 5,
            },
            {
              type: "OBJECT_LOCALIZATION",
              maxResults: 5,
            },
          ],
        },
      ],
    };

    const response = await fetch(VISION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visionRequest),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const getNutritionInfo = async (query: string) => {
  try {
    const response = await fetch(`${CALORIE_API_URL}?query=${encodeURIComponent(query)}`, {
      headers: {
        'X-Api-Key': CALORIE_API_KEY,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting nutrition info:', error);
    throw error;
  }
};
