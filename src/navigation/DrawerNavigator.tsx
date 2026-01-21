import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  InitialState,
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

// Import des écrans
import TeacherHomeScreen from '../screens/HomeScreen';
import AddCourseScreen from '../screens/AddCourseScreen';
import AddCategoriesScreen from '../screens/AddCategoriesScreen';
import ListCategoriesScreen from '../screens/ListCategoriesScreen';
import EditCategoryScreen from '../screens/EditCategoryScreen';
import CoursesListScreen from '../screens/LivresByCategScreen';
import ViewCourseScreen from '../screens/ViewCourseScreen';
import EditCourseScreen from '../screens/EditCourseScreen';
import CoursesByLivreScreen from '../screens/CoursesByLivreScreen';
import LoginScreen from '../screens/LoginScreen';

// Import du composant drawer personnalisé
import CustomDrawerContent from '../navigation/CustomDrawerContent';

const PERSISTENCE_KEY = 'NAVIGATION_STATE';
const PREFERENCES_KEY = 'APP_PREFERENCES';

// Contexte pour les préférences
export const PreferencesContext = React.createContext({
  toggleTheme: () => {},
  isDarkMode: false,
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator pour les écrans de l'enseignant
function TeacherStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // On gère les headers via le drawer
      }}
    >
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="AddCategories" component={AddCategoriesScreen} />
      <Stack.Screen name="AddCourse" component={AddCourseScreen} />
      <Stack.Screen name="ListCategories" component={ListCategoriesScreen} />
      <Stack.Screen name="EditCategory" component={EditCategoryScreen} />
      <Stack.Screen name="ListCours" component={CoursesListScreen} />
      <Stack.Screen name="CourseDetail" component={ViewCourseScreen} />
      <Stack.Screen name="EditCourse" component={EditCourseScreen} />
      <Stack.Screen name="CoursesByLivre" component={CoursesByLivreScreen} />
    </Stack.Navigator>
  );
}

// Drawer Navigator principal
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
        },
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={TeacherStackNavigator}
        options={{
          title: 'Accueil',
        }}
      />
    </Drawer.Navigator>
  );
}

export default function TeacherApp() {
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Thème adapté
  const theme = React.useMemo(() => {
    return isDarkMode ? MD3DarkTheme : MD3LightTheme;
  }, [isDarkMode]);

  // Restaurer l'état de navigation
  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = JSON.parse(savedStateString || '{}');
        setInitialState(state);
      } catch (e) {
        console.log('Erreur lors de la restauration de l\'état:', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  // Restaurer les préférences
  React.useEffect(() => {
    const restorePrefs = async () => {
      try {
        const prefString = await AsyncStorage.getItem(PREFERENCES_KEY);
        const preferences = JSON.parse(prefString || '{}');

        if (preferences) {
          setIsDarkMode(preferences.isDarkMode || false);
          setIsLoggedIn(preferences.isLoggedIn || false);
        }
      } catch (e) {
        console.log('Erreur lors de la restauration des préférences:', e);
      }
    };

    restorePrefs();
  }, []);

  // Sauvegarder les préférences
  React.useEffect(() => {
    const savePrefs = async () => {
      try {
        await AsyncStorage.setItem(
          PREFERENCES_KEY,
          JSON.stringify({
            isDarkMode,
            isLoggedIn,
          })
        );
      } catch (e) {
        console.log('Erreur lors de la sauvegarde des préférences:', e);
      }
    };

    savePrefs();
  }, [isDarkMode, isLoggedIn]);

  const preferences = React.useMemo(
    () => ({
      toggleTheme: () => setIsDarkMode((oldValue) => !oldValue),
      isDarkMode,
      isLoggedIn,
      setIsLoggedIn,
    }),
    [isDarkMode, isLoggedIn]
  );

  if (!isReady) {
    return null; // Vous pouvez ajouter un écran de chargement ici
  }

  // Configuration des thèmes pour la navigation
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const CombinedDefaultTheme = {
    ...MD3LightTheme,
    ...LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...LightTheme.colors,
    },
  };

  const CombinedDarkTheme = {
    ...MD3DarkTheme,
    ...DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...DarkTheme.colors,
    },
  };

  const combinedTheme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <PreferencesContext.Provider value={preferences}>
        <NavigationContainer
          theme={combinedTheme}
          initialState={initialState}
          onStateChange={(state) =>
            AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
          }
        >
          <SafeAreaInsetsContext.Consumer>
            {(insets) => {
              if (!isLoggedIn) {
                return (
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                  </Stack.Navigator>
                );
              }
              
              return <DrawerNavigator />;
            }}
          </SafeAreaInsetsContext.Consumer>
        </NavigationContainer>
      </PreferencesContext.Provider>
    </PaperProvider>
  );
}