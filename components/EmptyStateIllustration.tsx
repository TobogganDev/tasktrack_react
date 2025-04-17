// MADE WITH AI - AUTO SVG
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';

const EmptyStateIllustration = () => {
  return (
    <View style={styles.container}>
      <Svg width={200} height={160} viewBox="0 0 200 160">
        {/* Desk/Table */}
        <Path
          d="M30,120 L170,120 L170,125 L30,125 Z"
          fill="#E0E0E0"
        />
        
        {/* Laptop base */}
        <Rect x="60" y="108" width="70" height="12" rx="2" fill="#F5F5F5" />
        
        {/* Laptop screen */}
        <Rect x="60" y="75" width="70" height="45" rx="2" fill="#F5F5F5" />
        
        {/* Laptop red dot */}
        <Circle cx="95" cy="97" r="6" fill="#FF5252" />
        
        {/* Person body outline */}
        <Path
          d="M140,112 C140,90 130,70 110,70 C90,70 85,85 88,105 C91,125 120,125 140,112 Z"
          fill="none"
          stroke="#212121"
          strokeWidth="1.5"
        />
        
        {/* Person head */}
        <Path
          d="M115,65 C115,65 120,62 125,65 C130,68 130,73 125,80 C120,87 112,82 115,75 C118,68 115,65 115,65 Z"
          fill="none"
          stroke="#212121"
          strokeWidth="1.5"
        />
        
        {/* Person collar */}
        <Path
          d="M105,85 C105,85 110,80 115,85"
          fill="none"
          stroke="#212121"
          strokeWidth="1.5"
        />
        
        {/* Yellow pocket square */}
        <Rect x="110" y="85" width="5" height="7" fill="#FDD835" />
        
        {/* Person arm */}
        <Path
          d="M95,115 C85,110 90,105 100,102 C110,99 115,95 110,90"
          fill="none"
          stroke="#212121"
          strokeWidth="1.5"
        />
        
        {/* Person hand */}
        <Path
          d="M95,115 C93,117 90,116 90,113 C90,110 93,108 95,110"
          fill="none"
          stroke="#212121"
          strokeWidth="1.5"
        />
        
        {/* Red sparkle */}
        <Path
          d="M145,70 L150,65 M145,65 L150,70 M142.5,67.5 L152.5,67.5 M147.5,62.5 L147.5,72.5"
          stroke="#FF5252"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EmptyStateIllustration;