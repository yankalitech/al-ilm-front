import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  label: string
  value: string | number
}

export default function SummaryCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    margin: 4,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
})
