// import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from 'expo-router/drawer';

function Layout() {
  return <Drawer>
    <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Music',
          title: 'Music',
        }}
      />
    </Drawer>
}

export default Layout;