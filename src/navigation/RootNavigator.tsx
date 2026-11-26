import React from 'react';
import { StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import SettingsScreen from '../screens/SettingsScreen';
import AccountDeletedScreen from '../screens/AccountDeletedScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

import LivresByCategScreen from '../screens/LivresByCategScreen';
import ViewCourseScreen from '../screens/ViewCourseScreen'
import SearchCourseScreen from '../screens/SearchCourseScreen'
import ProfileScreen from '../screens/ProfileScreen'
import MesTelechargements from '../screens/MesTelechargements'
import MesEcoutes from '../screens/MesEcoutes'
import AllCoursesScreen from '../screens/AllCoursesScreen'

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { colors, isDark } = useTheme();
  // Couleurs de la navigation alignées sur le thème (évite un flash blanc entre deux écrans)
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Stack.Navigator>
        {/* <Stack.Screen name="AdminLogin" component={AdminLoginScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/> */}
        <Stack.Screen name="Home" component={HomeScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/> 
        <Stack.Screen name="CategoryCourses" component={LivresByCategScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="AccountDeleted" component={AccountDeletedScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}/>
        <Stack.Screen name="Settings" component={SettingsScreen}
        options={{
          headerShown: false,
        }}/>
        <Stack.Screen name="AllCourses" component={AllCoursesScreen}
        options={{
          headerShown: false,
        }}/>
        <Stack.Screen name="AllLivres" component={LivresByCategScreen}
        options={{
          headerShown: false,
        }}/>
         <Stack.Screen name="Search" component={SearchCourseScreen}
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="CoursesByLivre" component={AllCoursesScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
         <Stack.Screen name="CourseDetail" component={ViewCourseScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
         <Stack.Screen name="Profile" component={ProfileScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="Downloads" component={MesTelechargements}
        options={{
          headerShown: false,
        }}/>
        <Stack.Screen name="ContinueListening" component={MesEcoutes}
        options={{
          headerShown: false,
        }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}