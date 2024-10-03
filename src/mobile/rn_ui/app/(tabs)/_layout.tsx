import { Tabs } from 'expo-router/tabs';
export default function TabLayout() {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="albums"
          options={{
            title: 'Albums',
          }}
        />
        <Tabs.Screen
          name="artists"
          options={{
            title: 'Artists',
          }}
        />
        <Tabs.Screen
          name="songs"
          options={{
            title: 'Songs',
          }}
        />
      </Tabs>
    );
  }