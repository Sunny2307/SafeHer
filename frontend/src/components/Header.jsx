import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ showBack = false }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ) : null}
        <Image
          source={require('../assets/safeher_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>SafeHer</Text>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')}>
          <Icon name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoSection: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  logo: { 
    width: 50, 
    height: 50, 
    marginRight: 10 
  },
  logoText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FF69B4' 
  },
  iconContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  backButton: {
    marginRight: 10,
    marginLeft : -20,
  },
});

export default Header;