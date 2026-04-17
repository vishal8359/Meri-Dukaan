import React from "react";
import { ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius } from "../../../src/theme/colors";

interface QuickRepliesProps {
  replies: string[];
  onPress: (reply: string) => void;
}

export default function QuickReplies({ replies, onPress }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {replies.map((reply, i) => (
        <TouchableOpacity
          key={i}
          style={styles.chip}
          onPress={() => onPress(reply)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.ui.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.brand.primary,
  },
});
