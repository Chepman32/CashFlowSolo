/**
 * @format
 */
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// Ensure vector icon fonts are loaded
import Feather from 'react-native-vector-icons/Feather';
Feather.loadFont();

AppRegistry.registerComponent(appName, () => App);
