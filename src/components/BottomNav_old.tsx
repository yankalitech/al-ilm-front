import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function BottomNav() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="home-outline" size={22} color="#fff" />
        <Text style={styles.text}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="play-circle-outline" size={22} color="#fff" />
        <Text style={styles.text}>Courses</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="person-outline" size={22} color="#fff" />
        <Text style={styles.text}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item}>
        <Ionicons name="settings-outline" size={22} color="#3b82f6" />
        <Text style={[styles.text, styles.adminText]}>Admin</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  item: {
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    marginTop: 2,
  },
  adminText: {
    color: '#3b82f6', // Couleur bleue pour différencier le bouton admin
  },
})