import { Tabs } from 'expo-router';
import { SessionProvider, useSession } from '@/context/SessionContext';
import { View, StyleSheet } from 'react-native'; // Import ImageBackground
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import '@/global.css'

export default function RootLayout() {
  return (
    <SessionProvider>
      <LayoutWithSession />
    </SessionProvider>
  );
}

function LayoutWithSession() {
  const { session } = useSession();

  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'black', // Semi-transparent for better visibility
            paddingTop: 8,
            paddingBottom: 20,
            borderTopWidth: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name="home" size={28} color={focused ? 'white' : 'gray'} />
            ),
          }}
        />
        <Tabs.Screen
          name="search/index"
          options={{
            tabBarIcon: ({ focused }) => (
              <FontAwesome5 name="search" size={24} color={focused ? 'white' : 'gray'} />
            ),
          }}
        />
        <Tabs.Screen
          name="create/index"
          options={{
            tabBarIcon: () => (
              <View className="bg-white w-[55px] h-[35px] rounded-lg flex items-center justify-center">
                <Feather name="plus" size={24} color="black" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="notifications/index"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons name="notifications" size={26} color={focused ? 'white' : 'gray'} />
            ),
          }}
        />
        <Tabs.Screen
          name="account/index"
          options={
            session?.user
              ? {
                  title: '',
                  headerShown: false,
                  tabBarIcon: ({ focused }) => (
                    <FontAwesome5 name="user" size={24} color={focused ? 'white' : 'gray'} />
                  ),
                }
              : {
                  title: 'Sign in',
                  tabBarIcon: ({ focused }) => (
                    <FontAwesome5 name="user" size={24} color={focused ? 'white' : 'gray'} />
                  ),
                }
          }
        />
      </Tabs>
  );
}

// Styles for the background
const styles = StyleSheet.create({
  background: {
    flex: 1, // Ensure the background covers the entire screen
  },
});