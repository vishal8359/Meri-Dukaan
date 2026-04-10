// app/help-support.tsx
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

  const ContactOption = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    color = colors.brand.primary,
  }: any) => (
    <TouchableOpacity
      style={styles.contactOption}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.contactIconContainer, { backgroundColor: `${color}15` }]}
      >
        <Icon size={22} color={color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color={colors.ui.disabled} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[
          colors.gradient.navyStart,
          colors.gradient.navyEnd,
          colors.brand.primaryLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <HelpCircle
              size={28}
              color={colors.tint.green}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to help</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          <View style={styles.contactContainer}>
            <ContactOption
              icon={Phone}
              title="Call Us"
              subtitle="+91 98765 43210"
              onPress={handleCall}
              color={colors.status.info}
            />
            <ContactOption
              icon={Mail}
              title="Email Us"
              subtitle="support@sangam.in"
              onPress={handleEmail}
              color={colors.status.warning}
            />
            <ContactOption
              icon={MessageCircle}
              title="WhatsApp"
              subtitle="Chat with us"
              onPress={handleWhatsApp}
              color={colors.tint.green}
            />
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          <View style={styles.faqContainer}>
            {FAQ_DATA.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Send Message */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Send Us a Message</Text>
          </View>
          <View style={styles.messageCard}>
            <View style={styles.messageWrap}>
              <Send size={18} color={colors.status.info} />
              <Text style={styles.messageLabel}>Your Message</Text>
            </View>
            <TextInput
              style={styles.messageInput}
              placeholder="Tell us how we can help..."
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
              activeOpacity={0.8}
            >
              <Send size={18} color={colors.text.inverse} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Resources</Text>
          </View>
          <View style={styles.linksContainer}>
            <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
              <View
                style={[
                  styles.linkIconContainer,
                  { backgroundColor: "#f0fdf415" },
                ]}
              >
                <FileText size={18} color={colors.status.warning} />
              </View>
              <Text style={styles.linkText}>Terms of Service</Text>
              <ChevronRight size={18} color={colors.ui.disabled} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
              <View
                style={[
                  styles.linkIconContainer,
                  { backgroundColor: "#dbeafe15" },
                ]}
              >
                <FileText size={18} color={colors.status.info} />
              </View>
              <Text style={styles.linkText}>Privacy Policy</Text>
              <ChevronRight size={18} color={colors.ui.disabled} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} activeOpacity={0.7}>
              <View
                style={[
                  styles.linkIconContainer,
                  { backgroundColor: "#f0fdfa15" },
                ]}
              >
                <FileText size={18} color={colors.tint.green} />
              </View>
              <Text style={styles.linkText}>Refund Policy</Text>
              <ChevronRight size={18} color={colors.ui.disabled} />
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
    backgroundColor: colors.ui.background,
  },
  gradientHeader: {
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.ui.disabled,
    marginTop: 2,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIndicator: {
    width: 4,
    height: 24,
    backgroundColor: colors.status.info,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },
  contactContainer: {
    backgroundColor: colors.ui.surface,
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
    borderBottomColor: colors.ui.borderLight,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.ui.borderLight,
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
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.info,
    ...shadows.small,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIconContainer: {
    marginRight: spacing.sm,
    backgroundColor: colors.status.infoLight,
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
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
    paddingLeft: 40,
  },
  messageCard: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  messageWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  messageInput: {
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 120,
    marginBottom: spacing.md,
    textAlignVertical: "top",
    backgroundColor: colors.ui.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.info,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadows.small,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
  },
  linksContainer: {
    backgroundColor: colors.ui.surface,
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
    borderBottomColor: colors.ui.borderLight,
    gap: spacing.md,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  hoursCard: {
    flexDirection: "row",
    backgroundColor: colors.tint.blueLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.infoBorder,
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
