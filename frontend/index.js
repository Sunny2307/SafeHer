import { AppRegistry } from 'react-native';
   import App from './src/App'; // Update the path to point to src/App.js
   import { name as appName } from './app.json';

   AppRegistry.registerComponent(appName, () => App);