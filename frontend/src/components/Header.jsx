import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/safeher_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>SafeHer</Text>
      </View>
      <View style={styles.iconContainer}>
        <Icon name="notifications-outline" size={24} color="#000" />
        <Icon name="menu-outline" size={28} color="#000" />
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
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50, marginRight: 10 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#FF69B4' },
  iconContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});

export default Header;