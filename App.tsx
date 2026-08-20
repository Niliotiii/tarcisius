import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { registerServiceWorker } from "./src/lib/pwa";

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
  },
});
