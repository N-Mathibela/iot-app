import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StudentCard from "../components/StudentCard";

// Sample student data
const STUDENTS = [
  { id: '1', name: 'Sabelo', email: 'sabelo@gmail.com' },
  { id: '2', name: 'Maria', email: 'maria@gmail.com' },
  { id: '3', name: 'John', email: 'john@gmail.com' },
  { id: '4', name: 'Alex', email: 'alex@gmail.com' },
  { id: '5', name: 'Sarah', email: 'sarah@gmail.com' },
];

export default function Index() {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="p-6">
        <View className="flex-row justify-center items-center w-full">
          <View className="h-48 w-48 border-2 border-gray-400 rounded-lg m-2 p-4">
            <Text className="text-base font-bold text-primary">Total Students</Text>
            <Text className="text-6xl font-semibold text-primary my-8">{STUDENTS.length}</Text>
          </View>
          <View className="h-48 w-48 border-2 border-gray-400 rounded-lg m-2 p-4">
            <Text className="text-base font-bold text-primary">Concentration</Text>
            <Text className="text-6xl font-semibold text-green-600 my-8">75%</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-left my-5">Students</Text>

        <View>
          {STUDENTS.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
