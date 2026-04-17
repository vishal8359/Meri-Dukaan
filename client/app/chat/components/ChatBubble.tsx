import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../../../src/theme/colors";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {content}
        </Text>
        {timestamp && (
          <Text
            style={[
              styles.time,
              isUser ? styles.userTime : styles.assistantTime,
            ]}
          >
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 3,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  assistantContainer: {
    alignSelf: "flex-start",
  },
  avatarWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.tint.blueLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "100%",
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: colors.brand.primary,
    borderTopRightRadius: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.ui.border,
    shadowColor: "#1B2E4B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: colors.text.primary,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTime: {
    color: "rgba(255,255,255,0.65)",
  },
  assistantTime: {
    color: colors.text.tertiary,
  },
});
