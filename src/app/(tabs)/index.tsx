import Accordion from "@/components/ui/Accordion";
import AddTodoRow from "@/components/ui/AddTodoRow";
import FabButton from "@/components/ui/FabButton";
import PlusButton from "@/components/ui/PlusButton";
import AddTaskSheet from "@/features/todos/components/AddTaskSheet";
import TodoItem from "@/features/todos/components/TodoItem";
import { DropZoneProvider } from "@/features/todos/context/DropZoneContext";
import { useGetTodoItemsQuery } from "@/features/todos/todosApi";
import { coral_red, light_grey } from "@/utils/colors";
import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const { data: todos = [], isLoading } = useGetTodoItemsQuery();
  const scrollViewRef = useRef<ScrollView>(null);

  const inboxes = todos
    .filter((todo) => todo.listType === "inbox" && todo.status !== "deleted")
    .sort((a, b) => a.position - b.position);
  const todayItems = todos
    .filter((todo) => todo.listType === "today" && todo.status !== "deleted")
    .sort((a, b) => a.position - b.position);
  const upcomingItems = todos
    .filter((todo) => todo.listType === "upcoming" && todo.status !== "deleted")
    .sort((a, b) => a.position - b.position);
  const somedayItems = todos
    .filter((todo) => todo.listType === "someday" && todo.status !== "deleted")
    .sort((a, b) => a.position - b.position);

  const trashedItems = todos
    .filter((todo) => todo.status === "deleted")
    .sort((a, b) => a.position - b.position);

  return (
    <DropZoneProvider>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={[styles.container, { paddingTop: insets.top }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.headerText}>Receiving Area (Inbox)</Text>
            <Accordion
              title="Brain Dump"
              icon={require("../../../assets/icons/brain.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={
                <AddTodoRow placeholder="Unprocessed thought - add here" />
              }
              listSize={inboxes.length}
              listType="inbox"
            >
              {isLoading ? (
                <Text>Loading todos...</Text>
              ) : (
                inboxes.map((todo, index) => (
                  <TodoItem key={todo.id} todo={todo} index={index} />
                ))
              )}
            </Accordion>
          </View>

          <View style={styles.section}>
            <Text style={styles.headerText}>Organize your to-do</Text>
            <Accordion
              title="Today"
              icon={require("../../../assets/icons/sun.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={
                <AddTodoRow placeholder="Get it done today - add here" />
              }
              listSize={todayItems.length}
              listType="today"
            >
              {todayItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>

            <Accordion
              title="Upcoming"
              icon={require("../../../assets/icons/upcoming.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={<AddTodoRow placeholder="Planning ahead - add here" />}
              listSize={upcomingItems.length}
              listType="upcoming"
            >
              {upcomingItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>
            <Accordion
              title="Someday"
              icon={require("../../../assets/icons/box.png")}
              bgColor={light_grey}
              headerRight={<PlusButton onPress={() => {}} />}
              stickyTop={<AddTodoRow placeholder="Not Sure When? - add here" />}
              listSize={somedayItems.length}
              listType="someday"
            >
              {somedayItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>
            <Accordion
              title="Trash"
              icon={require("../../../assets/icons/trash.png")}
              bgColor={coral_red}
              stickyTop={<AddTodoRow placeholder="Trashed items here" />}
              listSize={trashedItems.length}
              listType="trash"
            >
              {trashedItems.map((todo, index) => (
                <TodoItem key={todo.id} todo={todo} index={index} />
              ))}
            </Accordion>
          </View>
        </ScrollView>

        <FabButton onPress={() => setIsSheetVisible(true)} />

        <AddTaskSheet
          visible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
        />
      </View>
    </DropZoneProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  headerText: {
    fontFamily: "BalsamiqSans-Regular",
    fontWeight: "400",
    fontSize: 24,
    textAlign: "center",
  },
});
