import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
}

export const Button = ({ title, onPress, variant = 'primary' }: ButtonProps) => (
  <TouchableOpacity
    style={[styles.base, variant === 'primary' ? styles.primary : styles.secondary]}
    onPress={onPress}
  >
    <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>{title}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: '#3b82f6',
  },
  secondary: {
    backgroundColor: '#334155',
  },
  primaryText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#e2e8f0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
})
