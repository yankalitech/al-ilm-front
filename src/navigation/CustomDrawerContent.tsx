import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PreferencesContext } from './DrawerNavigator';

export default function CustomDrawerContent(props:any) {
  const { toggleTheme, isDarkMode, isLoggedIn, setIsLoggedIn } = useContext(PreferencesContext);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const navigateToLogin = () => {
    props.navigation.closeDrawer();
    // Si vous voulez naviguer vers un écran de connexion différent
    // props.navigation.navigate('Login');
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          {/* Section utilisateur */}
          <View style={styles.userInfoSection}>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Avatar.Image
                source={{
                  uri: 'https://api.adorable.io/avatars/50/abott@adorable.png',
                }}
                size={50}
              />
              <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                <Title style={styles.title}>Professeur</Title>
                <Caption style={styles.caption}>Espace Enseignant</Caption>
              </View>
            </View>
          </View>

          {/* Menu principal */}
          <Drawer.Section style={styles.drawerSection}>
            <Drawer.Item
              icon={({ color, size }) => (
                <Ionicons name="home-outline" color={color} size={size} />
              )}
              label="Accueil"
              onPress={() => props.navigation.navigate('TeacherHome')}
            />
            
            <Drawer.Item
              icon={({ color, size }) => (
                <Ionicons name="folder-plus-outline" color={color} size={size} />
              )}
              label="Ajouter Catégorie"
              onPress={() => props.navigation.navigate('AddCategories')}
            />
            
            <Drawer.Item
              icon={({ color, size }) => (
                <Ionicons name="format-list-bulleted" color={color} size={size} />
              )}
              label="Liste Catégories"
              onPress={() => props.navigation.navigate('ListCategories')}
            />
            
            <Drawer.Item
              icon={({ color, size }) => (
                <Ionicons name="book-plus-outline" color={color} size={size} />
              )}
              label="Ajouter Cours"
              onPress={() => props.navigation.navigate('AddCourse')}
            />
            
            <Drawer.Item
              icon={({ color, size }) => (
                <Ionicons name="book-outline" color={color} size={size} />
              )}
              label="Liste des Cours"
              onPress={() => props.navigation.navigate('ListCours')}
            />
          </Drawer.Section>

          <Divider />

          {/* Section connexion */}
          <Drawer.Section style={styles.drawerSection}>
            {!isLoggedIn ? (
              <Drawer.Item
                icon={({ color, size }) => (
                  <Ionicons name="login" color={color} size={size} />
                )}
                label="Se connecter"
                onPress={navigateToLogin}
              />
            ) : (
              <Drawer.Item
                icon={({ color, size }) => (
                  <Ionicons name="logout" color={color} size={size} />
                )}
                label="Se déconnecter"
                onPress={handleLogout}
              />
            )}
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>

      {/* Section préférences */}
      <Drawer.Section style={styles.bottomDrawerSection}>
        <TouchableRipple
          onPress={toggleTheme}
          rippleColor="rgba(0, 0, 0, .32)"
        >
          <View style={styles.preference}>
            <Text>Thème sombre</Text>
            <View pointerEvents="none">
              <Switch value={isDarkMode} />
            </View>
          </View>
        </TouchableRipple>
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});