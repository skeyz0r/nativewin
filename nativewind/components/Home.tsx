import { Text, View } from "react-native";
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


export default function Home()
{

    function HomeScreen() {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Home Screen</Text>
          </View>
        );
      }
      

    const RootStack = createNativeStackNavigator({
        screens: {
          Home: HomeScreen,
        },
      });
      
      const Navigation = createStaticNavigation(RootStack);

    return(
        <Navigation/>
    )
}