import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddCourseScreen from '../screens/AddCourseScreen';
import AddCategoriesScreen from '../screens/AddCategoriesScreen';
import ListCategoriesScreen from '../screens/ListCategoriesScreen';
import EditCategoryScreen from '../screens/EditCategoryScreen';
import CoursesByCategScreen from '../screens/CoursesByCategScreen';
import ViewCourseScreen from '../screens/ViewCourseScreen'
import EditCourseScreen from '../screens/EditCourseScreen'
import AdminLoginScreen from '../screens/LoginScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name="AdminLogin" component={AdminLoginScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/> */}
        <Stack.Screen name="Home" component={HomeScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="AddCategories" component={AddCategoriesScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="AddCourse" component={AddCourseScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="ListCategories" component={ListCategoriesScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/> 
        <Stack.Screen name="EditCategory" component={EditCategoryScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
        <Stack.Screen name="CategoryCourses" component={CoursesByCategScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
         <Stack.Screen name="CourseDetail" component={ViewCourseScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
          <Stack.Screen name="EditCourse" component={EditCourseScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
         <Stack.Screen name="Profile" component={ProfileScreen} 
        options={{
          headerShown: false, // Masquer l'en-tête de navigation
        }}/>
           
      </Stack.Navigator>
    </NavigationContainer>
  );
}