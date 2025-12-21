// src/components/DrawerToggleButton.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors } from '../styles/globalStyles';

interface DrawerToggleButtonProps {
  style?: any;
  size?: number;
  color?: string;
}

const DrawerToggleButton: React.FC<DrawerToggleButtonProps> = ({ 
  style, 
  size = 24, 
  color = colors.text 
}) => {
  const navigation = useNavigation();

  const openDrawer = () => {
    // @ts-ignore - Navigation drawer methods
    navigation.openDrawer?.();
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={openDrawer}
    >
      <Ionicons name="menu" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = {
  button: {
    padding: 8,
    borderRadius: 6,
  },
};

export default DrawerToggleButton; 