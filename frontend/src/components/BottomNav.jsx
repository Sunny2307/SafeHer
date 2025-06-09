import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BottomNav = () => {
  const navigation = useNavigation();

  const handleBottomNav = (label) => {
    if (label === 'Record') {
      navigation.navigate('RecordScreen');
    } else if (label === 'Track Me') {
      navigation.navigate('HomeScreen');
    } else {
      alert(`${label} feature coming soon!`);
    }
  };

  return (
    <View style={styles.bottomNav}>
      {[
        ['location-outline', 'Track Me'],
        ['mic-outline', 'Record'],
        ['warning-outline', 'SOS', true],
        ['call-outline', 'Fake Call'],
        ['help-circle-outline', 'Help'],
      ].map(([icon, label, isSos], index) => (
        <TouchableOpacity
          key={index}
          style={[styles.navItem, isSos && styles.sosButton]}
          onPress={() => handleBottomNav(label)}
        >
          <Icon name={icon} size={26} color={isSos ? '#fff' : '#000'} />
          <Text style={[styles.navText, isSos && { color: '#fff' }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 1,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, textAlign: 'center', color: '#000', marginTop: 4 },
  sosButton: {
    backgroundColor: '#FF4B5C',
    padding: 14,
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -15,
  },
});

export default BottomNav;