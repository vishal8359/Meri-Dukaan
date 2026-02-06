// app/help-support.tsx
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    ChevronRight,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Send,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const FAQ_DATA = [
  {
    id: "1",
    question: "How do I place an order?",
    answer:
      "Browse stores in the Bazar tab, select items, add them to cart, and proceed to checkout. You can track your order in the My Orders section.",
  },
  {
    id: "2",
    question: "What are the delivery charges?",
    answer:
      "Delivery is FREE for orders above ₹500. For orders below ₹500, a delivery fee of ₹40 applies.",
  },
  {
    id: "3",
    question: "How can I cancel my order?",
    answer:
      "Go to My Orders, select the order you want to cancel, and tap the Cancel button. Orders can only be cancelled before they are dispatched.",
  },
  {
    id: "4",
    question: "How do I add items to my wishlist?",
    answer:
      "Tap the heart icon on any product or store to add it to your wishlist. Access your wishlist from the drawer menu.",
  },
  {
    id: "5",
    question: "How can I become a seller?",
    answer:
      "Tap on 'My Dukaan' in the drawer menu to register as a seller. You'll need to provide business details and complete verification.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleCall = () => {
    Linking.openURL("tel:+919876543210");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@sangam.in");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/919876543210");
  };

  const handleSubmitMessage = () => {
    if (message.trim()) {
      Alert.alert(
        "Success",
        "Your message has been sent. We'll get back to you soon!",
      );
      setMessage("");
    }
  };

  const FAQItem = ({ item }: { item: (typeof FAQ_DATA)[0] }) => {
    const isExpanded = expandedFAQ === item.id;

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => setExpandedFAQ(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqIconContainer}>
            <HelpCircle size={18} color={colors.brand.primary} />
          </View>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text.secondary}
          />
        </View>
        {isExpanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
      </TouchableOpacity>
    );
  };

  const ContactOption = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        <Icon size={22} color={colors.brand.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactContainer}>
            <ContactOption
              icon={Phone}
              title="Call Us"
              subtitle="+91 98765 43210"
              onPress={handleCall}
            />
            <ContactOption
              icon={Mail}
              title="Email Us"
              subtitle="support@sangam.in"
              onPress={handleEmail}
            />
            <ContactOption
              icon={MessageCircle}
              title="WhatsApp"
              subtitle="Chat with us"
              onPress={handleWhatsApp}
            />
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {FAQ_DATA.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Send Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <View style={styles.messageCard}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={5}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSubmitMessage}
            >
              <Send size={18} color="#FFF" />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkItem}>
              <FileText size={18} color={colors.brand.primary} />
              <Text style={styles.linkText}>Terms of Service</Text>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <FileText size={18} color={colors.brand.primary} />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem}>
              <FileText size={18} color={colors.brand.primary} />
              <Text style={styles.linkText}>Refund Policy</Text>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursCard}>
          <Ionicons
            name="time-outline"
            size={24}
            color={colors.brand.primary}
          />
          <View style={styles.hoursInfo}>
            <Text style={styles.hoursTitle}>Support Hours</Text>
            <Text style={styles.hoursText}>
              Monday - Saturday: 9:00 AM - 8:00 PM
            </Text>
            <Text style={styles.hoursText}>Sunday: 10:00 AM - 6:00 PM</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#FFF",
    ...shadows.small,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  contactContainer: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.small,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  faqContainer: {
    gap: spacing.sm,
  },
  faqItem: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIconContainer: {
    marginRight: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: spacing.md,
    paddingLeft: 26,
  },
  messageCard: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  messageInput: {
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 120,
    marginBottom: spacing.md,
    textAlignVertical: "top",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  linksContainer: {
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.small,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  hoursCard: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  hoursInfo: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 6,
  },
  hoursText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
});
