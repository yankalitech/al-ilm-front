import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../styles/globalStyles';

const TABS = [
  { route: 'Home', label: 'Accueil', icon: 'home-outline' },
  { route: 'Downloads', label: 'Téléchargements', icon: 'download-outline' },
  { route: 'ContinueListening', label: 'Écoutes', icon: 'headset-outline' },
  { route: 'Profile', label: 'Profil', icon: 'person-outline' },
] as const

export default function BottomNav() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const currentRoute = useNavigationState((state) => state?.routes[state.index]?.name);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing.sm }]}>
      {TABS.map((tab) => {
        const isActive = currentRoute === tab.route
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.item}
            onPress={() => navigation.navigate(tab.route as never)}
          >
            <Ionicons name={tab.icon} size={22} color={isActive ? colors.primary : colors.textSecondary} />
            <Text style={[styles.text, isActive && styles.textActive]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: {
    alignItems: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  textActive: {
    color: colors.primary,
    fontWeight: '600',
  },
})
