import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getChatHistory,
  sendChatMessage,
  type ChatCard,
  type ChatMessage,
} from "../../src/api/chat";
import { useAuth } from "../../src/context/AuthContext";
import { colors, radius, shadows } from "../../src/theme/colors";
import ChatBubble from "./components/ChatBubble";
import OrderCard from "./components/OrderCard";
import ProductCard from "./components/ProductCard";
import QuickReplies from "./components/QuickReplies";
import TypingIndicator from "./components/TypingIndicator";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: ChatCard[];
  quickReplies?: string[];
  timestamp?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { authToken: token } = useAuth();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Search products",
    "View my cart",
    "Track order",
    "Show stores",
  ]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        scrollToBottom();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hey! 👋 I'm your MyBusz assistant. I can help you search products, manage your cart, place orders, and much more.\n\nWhat would you like to do?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Load history if we have a sessionId
  useEffect(() => {
    if (sessionId && token) {
      loadHistory();
    }
  }, [sessionId]);

  const loadHistory = async () => {
    if (!sessionId || !token) return;
    try {
      const res: any = await getChatHistory(token, sessionId);
      const msgs = res?.data?.messages || res?.messages || [];
      if (msgs.length > 0) {
        const mapped: DisplayMessage[] = msgs.map(
          (m: ChatMessage, i: number) => ({
            id: m.id || `hist-${i}`,
            role: m.role,
            content: m.content,
            cards: m.cards || undefined,
            timestamp: m.created_at,
          })
        );
        setMessages(mapped);
      }
    } catch (err) {
      console.warn("Failed to load chat history:", err);
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text || inputText).trim();
      if (!msg || isLoading) return;

      // Check auth
      if (!token) {
        const errorMsg: DisplayMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Please log in to use the chatbot.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      setInputText("");
      Keyboard.dismiss();

      // Add user message
      const userMsg: DisplayMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: msg,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setQuickReplies([]);
      setIsLoading(true);
      scrollToBottom();

      try {
        const res: any = await sendChatMessage(token, msg, sessionId);

        // apiRequest unwraps response.data, so res = { success, data: {...} }
        const payload = res?.data || res;

        // Save session ID for subsequent messages
        if (payload.sessionId && !sessionId) {
          setSessionId(payload.sessionId);
        }

        // Add assistant response
        const assistantMsg: DisplayMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.message || "I received your message!",
          cards: payload.cards,
          quickReplies: payload.quickReplies,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setQuickReplies(payload.quickReplies || []);
      } catch (err: any) {
        console.warn("Chat error:", err);
        // Show error as assistant message
        const errorMsg: DisplayMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            err?.message ||
            "Oops, something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setQuickReplies(["Try again", "Search products"]);
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    },
    [inputText, isLoading, token, sessionId, scrollToBottom]
  );

  const handleQuickReply = useCallback(
    (reply: string) => {
      handleSend(reply);
    },
    [handleSend]
  );

  const handleAddToCart = useCallback(
    (productName: string) => {
      handleSend(`Add ${productName} to my cart`);
    },
    [handleSend]
  );

  const handleTrackOrder = useCallback(
    (shortId: string) => {
      handleSend(`Track order #${shortId}`);
    },
    [handleSend]
  );

  // ── Render Functions ───────────────────────────────────────

  const renderCards = (cards: ChatCard[]) => {
    const limited = cards.slice(0, 4); // Show max 4 cards in chat
    return limited.map((card, i) => {
      switch (card.type) {
        case "product":
          return (
            <ProductCard
              key={`card-${i}`}
              data={card.data as any}
              onAddToCart={handleAddToCart}
            />
          );
        case "order":
        case "delivery":
          return (
            <OrderCard
              key={`card-${i}`}
              data={card.data as any}
              onTrack={handleTrackOrder}
            />
          );
        case "store":
          return (
            <TouchableOpacity
              key={`card-${i}`}
              style={styles.storeCard}
              onPress={() =>
                handleSend(`Show me details of store: ${card.data.storeName}`)
              }
              activeOpacity={0.8}
            >
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{card.data.storeName}</Text>
                <Text style={styles.storeCategory}>
                  {card.data.category || "General"}{" "}
                  {card.data.rating ? `⭐ ${card.data.rating}` : ""}
                </Text>
                {card.data.location && (
                  <Text style={styles.storeLocation}>
                    📍 {card.data.location}
                  </Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          );
        case "cart":
          return (
            <View key={`card-${i}`} style={styles.cartCard}>
              <View style={styles.cartHeader}>
                <Ionicons
                  name="cart"
                  size={20}
                  color={colors.brand.primary}
                />
                <Text style={styles.cartTitle}>
                  Your Cart ({card.data.itemCount} items)
                </Text>
              </View>
              <View style={styles.cartTotal}>
                <Text style={styles.cartTotalLabel}>Total</Text>
                <Text style={styles.cartTotalValue}>
                  ₹{card.data.total}
                </Text>
              </View>
            </View>
          );
        default:
          return null;
      }
    });
  };

  const renderItem = ({ item }: { item: DisplayMessage }) => {
    return (
      <View>
        <ChatBubble
          role={item.role}
          content={item.content}
          timestamp={item.timestamp}
        />
        {item.cards && item.cards.length > 0 && (
          <View style={styles.cardsContainer}>{renderCards(item.cards)}</View>
        )}
      </View>
    );
  };

  // ── Main Render ────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[colors.gradient.navyStart, colors.gradient.navyEnd]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>MyBusz Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? "Thinking..." : "Online"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => {
            setMessages([
              {
                id: "welcome-new",
                role: "assistant",
                content:
                  "Starting a fresh chat! 🔄 How can I help you?",
                timestamp: new Date().toISOString(),
              },
            ]);
            setSessionId(null);
            setQuickReplies(["Search products", "View cart", "Track order"]);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="refresh" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <>
              {isLoading && <TypingIndicator />}
              {!isLoading && quickReplies.length > 0 && (
                <QuickReplies
                  replies={quickReplies}
                  onPress={handleQuickReply}
                />
              )}
            </>
          }
        />

        {/* Input Area */}
        <View style={[styles.inputArea, keyboardVisible && styles.inputAreaKeyboard]}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              maxLength={2000}
              editable={!isLoading}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gradient.navyStart,
  },
  flex: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
  menuBtn: {
    padding: 4,
  },

  // Messages
  messageList: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  cardsContainer: {
    marginTop: 4,
    marginBottom: 6,
  },

  // Store Card (inline)
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  storeCategory: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  storeLocation: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Cart Card (inline)
  cartCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.md,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadows.small,
  },
  cartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cartTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    paddingTop: 10,
  },
  cartTotalLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  cartTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand.primary,
  },

  // Input Area
  inputArea: {
    backgroundColor: colors.ui.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
  },
  inputAreaKeyboard: {
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.ui.background,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },
  sendBtnDisabled: {
    backgroundColor: colors.ui.disabled,
  },
});
