import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  value: number;
  maxValue: number;
  radius: number;
  strokeWidth: number;
  title: string;
  activeStrokeColor: string;
  inactiveStrokeColor: string;
  textColor: string;
  titleColor: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  maxValue,
  radius,
  strokeWidth,
  title,
  activeStrokeColor,
  inactiveStrokeColor,
  textColor,
  titleColor,
}) => {
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(Math.max(value, 0), maxValue);
  const percentage = (progressValue / maxValue) * 100;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width={radius * 2} height={radius * 2}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={inactiveStrokeColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={activeStrokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View style={[styles.labelContainer, { width: radius * 2 }]}>
          <Text style={[styles.percentageText, { color: textColor }]}>
            {Math.round(percentage)}%
          </Text>
          <Text style={[styles.titleText, { color: titleColor }]}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  svgContainer: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default CircularProgress;
