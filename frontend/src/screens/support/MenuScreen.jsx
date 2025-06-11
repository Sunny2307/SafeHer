import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';

const screenWidth = Dimensions.get('window').width;
const numColumns = 3;
const itemSpacing = 12;
const totalSpacing = itemSpacing * (numColumns + 1);
const itemSize = (screenWidth - totalSpacing) / numColumns;

const MenuScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    { name: 'History', icon: 'time-outline', screen: 'HistoryScreen' },
    { name: 'Friends', icon: 'people-outline', screen: 'FriendsScreen' },
    { name: 'Block List', icon: 'ban-outline', screen: 'BlockListScreen' },
    { name: 'Feedback', icon: 'chatbubble-outline', screen: 'FeedbackScreen' },
    { name: 'Legal', icon: 'document-outline', screen: 'LegalScreen' },
    { name: 'Help', icon: 'help-buoy-outline', screen: 'HelpScreen' },
    { name: 'Language', icon: 'language-outline', screen: 'LanguageScreen' },
    { name: 'Settings', icon: 'settings-outline', screen: 'SettingsScreen' },
    { name: 'Helpline', icon: 'call-outline', screen: 'HelplineScreen' },
    { name: 'Share App', icon: 'share-outline', screen: 'ShareAppScreen' },
    { name: 'Log Out', icon: 'log-out-outline', action: () => handleLogout() },
  ];

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignUpLogin' }],
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => {
        if (item.screen) {
          navigation.navigate(item.screen);
        } else if (item.action) {
          item.action();
        }
      }}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={32} color="#FF69B4" />
      </View>
      <Text style={styles.gridText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View>
            <Text style={styles.userName}>Sunny</Text>
            <Text style={styles.phoneNumber}>+91 7434929842</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editIcon}>
          <Icon name="pencil-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.gridContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FF69B4',
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FF69B4',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#F5F7FA',
    opacity: 0.9,
  },
  editIcon: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  gridContainer: {
    paddingHorizontal: itemSpacing,
    paddingBottom: 20,
  },
  gridItem: {
    width: itemSize,
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: itemSpacing / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 15,
    marginBottom: 5,
  },
  gridText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MenuScreen;