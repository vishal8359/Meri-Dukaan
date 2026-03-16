// app/auth/personal-details.tsx
import { register } from "@/src/api/auth";
import { useApp } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { colors, radius, shadows, spacing } from "@/src/theme/colors";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    AtSign,
    Camera,
    CheckCircle,
    MapPin,
    User,
    UserCheck,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface FieldState {
  name: string;
  address: string;
  email: string;
}

interface FieldErrors {
  name?: string;
  address?: string;
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const {
    pendingPhone,
    pendingCountryCode,
    completeAuth,
  } = useAuth();

  const { login: appLogin, updateProfile } = useApp();

  const [fields, setFields] = useState<FieldState>({
    name: "",
    address: "",
    email: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key: keyof FieldState, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to upload a profile picture.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take a profile photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        imageUri
          ? {
              text: "Remove Photo",
              style: "destructive",
              onPress: () => setImageUri(null),
            }
          : null,
        { text: "Cancel", style: "cancel" },
      ].filter(Boolean) as any,
    );
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!fields.name.trim() || fields.name.trim().length < 2) {
      newErrors.name = "Please enter your full name (min 2 characters).";
    }
    if (!fields.address.trim() || fields.address.trim().length < 5) {
      newErrors.address = "Please enter a valid address.";
    }
    if (fields.email.trim() && !EMAIL_REGEX.test(fields.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);

    const emailTrimmed = fields.email.trim().toLowerCase();

    const safeEmail =
      emailTrimmed || `${pendingPhone.replace(/\D/g, "")}@user.sangam.local`;
    const generatedPassword = `Sangam@${pendingPhone.replace(/\D/g, "")}`;

    try {
      const { user, token } = await register({
        name: fields.name.trim(),
        email: safeEmail,
        phone: pendingPhone,
        password: generatedPassword,
        profileImage: imageUri ?? undefined,
        location: fields.address.trim(),
      });

      await completeAuth(
        {
          id: user.id,
          phone: user.phone,
          countryCode: pendingCountryCode,
          name: user.name,
          address: user.location || fields.address.trim(),
          email: user.email || undefined,
          imageUri: user.profile_image || imageUri || undefined,
        },
        token,
      );

      appLogin(user.name);
      updateProfile({
        phone: `${pendingCountryCode} ${pendingPhone}`,
        email: user.email || undefined,
        address: user.location || fields.address.trim(),
      });

      router.replace("/(drawer)/(tabs)/" as any);
    } catch (err: any) {
      Alert.alert(
        "Setup failed",
        err?.message || "Could not complete setup. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReady =
    fields.name.trim().length >= 2 && fields.address.trim().length >= 5;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.brand.primary}
      />

      {/* Header */}
      <LinearGradient
        colors={[colors.brand.primary, colors.brand.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={colors.text.inverse} />
        </TouchableOpacity>

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.iconWrap}
        >
          <UserCheck size={36} color={colors.brand.secondary} />
        </MotiView>
        <Text style={styles.headerTitle}>Your Details</Text>
        <Text style={styles.headerSubtitle}>
          Help us personalize your experience
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.body}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 150 }}
            style={styles.card}
          >
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={showImageOptions}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color={colors.brand.primary} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={14} color={colors.text.inverse} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>
                Profile photo{" "}
                <Text style={styles.optionalLabel}>(optional)</Text>
              </Text>
            </View>

            {/* Name Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <User size={14} color={colors.text.secondary} />
                <Text style={styles.fieldLabelText}>Full Name</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              </View>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={fields.name}
                onChangeText={(v) => updateField("name", v)}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={colors.ui.muted}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Address Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <MapPin size={14} color={colors.text.secondary} />
                <Text style={styles.fieldLabelText}>Address</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.inputMultiline,
                  errors.address ? styles.inputError : null,
                ]}
                value={fields.address}
                onChangeText={(v) => updateField("address", v)}
                placeholder="Street, City, State, Pincode"
                placeholderTextColor={colors.ui.muted}
                multiline
                numberOfLines={3}
                returnKeyType="next"
                textAlignVertical="top"
              />
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}
            </View>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <AtSign size={14} color={colors.text.secondary} />
                <Text style={styles.fieldLabelText}>Email Address</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalBadgeText}>Optional</Text>
                </View>
              </View>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={fields.email}
                onChangeText={(v) => updateField("email", v)}
                placeholder="you@example.com"
                placeholderTextColor={colors.ui.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
              {fields.email.trim() && !errors.email ? (
                <View style={styles.emailHintRow}>
                  <CheckCircle size={13} color={colors.status.success} />
                  <Text style={styles.emailHint}>
                    We'll send a confirmation to your email.
                  </Text>
                </View>
              ) : (
                <Text style={styles.skipHint}>
                  Skip email to go straight to the app.
                </Text>
              )}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.ctaBtn,
                (!isReady || isSubmitting) && styles.ctaBtnDisabled,
              ]}
              onPress={handleContinue}
              disabled={!isReady || isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isReady
                    ? [colors.brand.secondary, colors.brand.accent]
                    : [colors.ui.disabled, colors.ui.disabled]
                }
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>
                  {isSubmitting ? "Completing Setup..." : "Complete Setup"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text.inverse,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  body: {
    flex: 1,
    backgroundColor: colors.ui.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -radius.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.ui.surface,
    margin: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.medium,
    marginTop: spacing.xl,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.xs,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.brand.primary,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.tint.blueLight,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.ui.surface,
  },
  avatarHint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  optionalLabel: {
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xs,
  },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: colors.tint.blueLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand.primary,
    textTransform: "uppercase",
  },
  optionalBadge: {
    backgroundColor: colors.tint.goldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionalBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.tint.gold,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    backgroundColor: colors.ui.backgroundAlt,
    fontSize: 15,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: spacing.sm + 2,
  },
  inputError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.errorLight,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: 4,
  },
  emailHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  emailHint: {
    fontSize: 12,
    color: colors.status.successDark,
  },
  skipHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
    fontStyle: "italic",
  },
  ctaBtn: {
    borderRadius: radius.md,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.inverse,
    letterSpacing: 0.3,
  },
});
