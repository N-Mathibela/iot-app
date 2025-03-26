import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text className="text-4xl font-bold">Welcome Team! The App is ready for development.</Text>
    </SafeAreaView>
  );
}
