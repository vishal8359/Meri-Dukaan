// src/context/SettingsContext.tsx
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

// --- i18n imports ---
import bn from "../i18n/bn";
import gu from "../i18n/gu";
import kn from "../i18n/kn";
import ml from "../i18n/ml";
import mr from "../i18n/mr";
import pa from "../i18n/pa";
import ta from "../i18n/ta";
import te from "../i18n/te";

// --- Types ---
export type AppLanguage =
  | "en"
  | "hi"
  | "mr"
  | "gu"
  | "bn"
  | "ta"
  | "kn"
  | "te"
  | "ml"
  | "pa";
export type AppTheme = "light" | "dark" | "system";

export interface NotificationPrefs {
  orders: boolean;
  promotions: boolean;
  chat: boolean;
  appUpdates: boolean;
}

interface SettingsContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDark: boolean;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  notificationPrefs: NotificationPrefs;
  updateNotificationPref: (
    key: keyof NotificationPrefs,
    value: boolean,
  ) => void;
  locationEnabled: boolean;
  setLocationEnabled: (v: boolean) => void;
}

// ────────────────────────────────────────────
// Translation dictionaries
// ────────────────────────────────────────────
const en: Record<string, string> = {
  // ── Settings ──
  "settings.title": "Settings",
  "settings.subtitle": "Manage your preferences",
  "settings.account": "Account",
  "settings.appearance": "Appearance",
  "settings.security": "Security & Privacy",
  "settings.data": "Data",
  "settings.dangerZone": "Danger Zone",
  "settings.notifications": "Notifications",
  "settings.notifications.desc": "Manage notification preferences",
  "settings.language": "Language",
  "settings.language.desc": "English",
  "settings.location": "Location Services",
  "settings.location.desc": "Allow app to access your location",
  "settings.darkMode": "Dark Mode",
  "settings.darkMode.desc": "Switch between light and dark theme",
  "settings.theme": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System",
  "settings.changePassword": "Change Password",
  "settings.changePassword.desc": "Update your password",
  "settings.privacy": "Privacy Policy",
  "settings.privacy.desc": "Read our privacy policy",
  "settings.terms": "Terms of Service",
  "settings.terms.desc": "Read terms and conditions",
  "settings.clearCache": "Clear Cache",
  "settings.clearCache.desc": "Free up storage space",
  "settings.deleteAccount": "Delete Account",
  "settings.version": "Sangam v1.0.0",
  "settings.build": "Build 2024.01.20",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.success": "Success",
  "common.error": "Error",

  // ── Language selection ──
  "language.title": "Select Language",
  "language.current": "Current Language",
  "language.english": "English",
  "language.hindi": "Hindi",
  "language.marathi": "Marathi",
  "language.gujarati": "Gujarati",
  "language.bengali": "Bengali",
  "language.tamil": "Tamil",
  "language.kannada": "Kannada",
  "language.telugu": "Telugu",
  "language.malayalam": "Malayalam",
  "language.punjabi": "Punjabi",
  "language.changed": "Language changed successfully!",
  "language.info":
    "Select your preferred language. The app interface will update immediately.",

  // ── Notification prefs ──
  "notifications.title": "Notification Preferences",
  "notifications.subtitle": "Choose what you want to be notified about",
  "notifications.master": "All Notifications",
  "notifications.master.desc": "Enable or disable all notifications",
  "notifications.orders": "Order Updates",
  "notifications.orders.desc": "Delivery status, order confirmations",
  "notifications.promotions": "Promotions & Offers",
  "notifications.promotions.desc": "Deals, discounts, and seasonal offers",
  "notifications.chat": "Chat Messages",
  "notifications.chat.desc": "Messages from stores and support",
  "notifications.appUpdates": "App Updates",
  "notifications.appUpdates.desc": "New features and improvements",

  // ── Appearance ──
  "appearance.title": "Appearance",
  "appearance.subtitle": "Customize how Sangam looks",
  "appearance.themeMode": "Theme Mode",
  "appearance.preview": "Preview",

  // ── Change Password ──
  "password.title": "Change Password",
  "password.current": "Current Password",
  "password.new": "New Password",
  "password.confirm": "Confirm New Password",
  "password.requirements": "Password Requirements:",
  "password.req1": "At least 8 characters",
  "password.req2": "One uppercase letter",
  "password.req3": "One number",
  "password.req4": "One special character",
  "password.change": "Change Password",
  "password.forgot": "Forgot Password?",
  "password.success": "Password changed successfully!",
  "password.strength": "Password Strength",
  "password.weak": "Weak",
  "password.fair": "Fair",
  "password.good": "Good",
  "password.strong": "Strong",

  // ── Tabs ──
  "tab.home": "Home",
  "tab.bazar": "Bazar",
  "tab.mybusz": "myBusz",
  "tab.dhindora": "Dhindora",
  "tab.profile": "Profile",

  // ── Drawer / Sidebar ──
  "drawer.account": "Account",
  "drawer.business": "Sangam Business",
  "drawer.support": "Support & Settings",
  "drawer.myProfile": "My Profile",
  "drawer.myOrders": "My Orders",
  "drawer.wishlist": "Wishlist",
  "drawer.myDukaan": "My Dukaan",
  "drawer.transporter": "Join as Transporter",
  "drawer.settings": "Settings",
  "drawer.help": "Help & Support",
  "drawer.logout": "Log Out",
  "drawer.customer": "Customer",
  "drawer.langLabel": "English (India)",

  // ── Profile ──
  "profile.editProfile": "Edit Profile",
  "profile.premiumMember": "Premium Member since Jan 2024",
  "profile.verifiedMember": "Verified Member",
  "profile.orders": "Orders",
  "profile.wishlist": "Wishlist",
  "profile.following": "Following",
  "profile.badges": "Badges",
  "profile.accountDetails": "Account Details",
  "profile.address": "Address",
  "profile.phone": "Phone",
  "profile.email": "Email",
  "profile.quickActions": "Quick Actions",
  "profile.moreOptions": "More Options",
  "profile.myOrders": "My Orders",
  "profile.trackOrders": "Track your orders",
  "profile.wishlistDesc": "Items you saved",
  "profile.myDukaan": "My Dukaan",
  "profile.manageStore": "Manage your store",
  "profile.payments": "Payments",
  "profile.paymentsDesc": "Receipts & payment history",
  "profile.transporter": "Transporter",
  "profile.transporterDesc": "Delivery & logistics",
  "profile.notifications": "Notifications",
  "profile.notificationsDesc": "Alerts & updates",
  "profile.logout": "Logout",
  "profile.logoutDesc": "Sign out from app",

  // ── Orders ──
  "orders.title": "My Orders",
  "orders.all": "All",
  "orders.processing": "Processing",
  "orders.inTransit": "In Transit",
  "orders.delivered": "Delivered",
  "orders.cancelled": "Cancelled",
  "orders.orderNum": "Order #",
  "orders.ordered": "Ordered:",
  "orders.delivery": "Delivery:",
  "orders.totalAmount": "Total Amount",
  "orders.viewDetails": "View Details",
  "orders.noOrders": "No orders yet",

  // ── Wishlist ──
  "wishlist.title": "Wishlist",
  "wishlist.all": "All",
  "wishlist.products": "Products",
  "wishlist.services": "Services",
  "wishlist.stores": "Stores",
  "wishlist.empty": "Your wishlist is empty",
  "wishlist.addToCart": "Add to Cart",
  "wishlist.remove": "Remove",
  "wishlist.clearAll": "Clear All",
  "wishlist.items": "items",

  // ── Cart ──
  "cart.title": "Cart",
  "cart.myCart": "My Cart",
  "cart.products": "Products",
  "cart.services": "Services",
  "cart.empty": "Your cart is empty",
  "cart.emptySubtext": "Add items from stores to get started",
  "cart.startShopping": "Start Shopping",
  "cart.subtotal": "Subtotal",
  "cart.delivery": "Delivery",
  "cart.deliveryFee": "Delivery Fee",
  "cart.total": "Total",
  "cart.checkout": "Checkout",
  "cart.proceedCheckout": "Proceed to Checkout",
  "cart.removeItem": "Removed from cart",
  "cart.summary": "Order Summary",
  "cart.freeDelivery": "Free Delivery",
  "cart.savedDelivery": "You saved ₹40 on delivery!",
  "cart.free": "FREE",
  "cart.pendingPayment": "Pending Payment",
  "cart.confirmed": "Confirmed",
  "cart.confirmPay": "Confirm & Pay",
  "cart.serviceRemoved": "Service removed",
  "cart.bookingCancelled": "Booking cancelled",
  "cart.item": "item",
  "cart.items": "items",
  "cart.booking": "booking",
  "cart.bookings": "bookings",

  // ── Notifications ──
  "notif.title": "Notifications",
  "notif.markAllRead": "Mark all as read",
  "notif.empty": "No notifications yet",
  "notif.today": "Today",
  "notif.yesterday": "Yesterday",
  "notif.earlier": "Earlier",

  // ── Payments History ──
  "payments.title": "Payment History",
  "payments.totalSpent": "Total Spent",
  "payments.refunded": "Refunded",
  "payments.transactions": "Transactions",
  "payments.all": "All",
  "payments.success": "Success",
  "payments.pending": "Pending",
  "payments.failed": "Failed",
  "payments.refundedFilter": "Refunded",
  "payments.searchPlaceholder": "Search payments...",
  "payments.orderId": "Order ID",
  "payments.transactionId": "Transaction ID",
  "payments.subtotal": "Subtotal",
  "payments.deliveryFee": "Delivery Fee",
  "payments.discount": "Discount",
  "payments.totalPaid": "Total Paid",
  "payments.refundInfo": "Refund Info",
  "payments.downloadReceipt": "Download Receipt",
  "payments.visitStore": "Visit Store",
  "payments.noPayments": "No payment records found",
  "payments.free": "Free",

  // ── Product Detail ──
  "product.details": "Product Details",
  "product.notFound": "Product Not Found",
  "product.notFoundDesc": "This product may no longer be available",
  "product.goBack": "Go Back",
  "product.inStock": "In Stock",
  "product.outOfStock": "Out of Stock",
  "product.reviews": "reviews",
  "product.save": "Save",
  "product.soldBy": "Sold by",
  "product.delivery": "Delivery",
  "product.aboutProduct": "About This Product",
  "product.productDetails": "Product Details",
  "product.category": "Category",
  "product.unit": "Unit",
  "product.distance": "Distance",
  "product.rating": "Rating",
  "product.relatedProducts": "Related Products",
  "product.loadMore": "Load More",
  "product.addToCart": "Add to Cart",
  "product.addedToCart": "Added to Cart",
  "product.orderNow": "Order Now",
  "product.notifyMe": "Notify me when available",
  "product.removedFromCart": "Removed from Cart",
  "product.addedToWishlist": "Added to wishlist",
  "product.removedFromWishlist": "Removed from wishlist",
  "product.photo": "photo",
  "product.photos": "photos",
  "product.moreAllowed": "more allowed",
  "product.maxPhotos": "maximum photos",
  "product.items": "items",
  "product.freeDelivery": "Free Delivery",

  // ── Service Detail ──
  "service.details": "Service Details",
  "service.notFound": "Service Not Found",
  "service.notFoundDesc": "This service may no longer be available",
  "service.goBack": "Go Back",
  "service.active": "Active",
  "service.available": "Available",
  "service.unavailable": "Currently Unavailable",
  "service.reviews": "reviews",
  "service.price": "Price",
  "service.complimentary": "Complimentary",
  "service.offeredBy": "Offered by",
  "service.duration": "Duration",
  "service.aboutService": "About Service",
  "service.serviceDetails": "Service Details",
  "service.serviceProvider": "Service Provider",
  "service.totalReviews": "Total Reviews",
  "service.serviceType": "Service Type",
  "service.keyFeatures": "Key Features",
  "service.relatedServices": "Related Services",
  "service.bookService": "Book Service",
  "service.bookNow": "Book Now",
  "service.booked": "Booked",
  "service.pendingPayment": "Pending Payment",
  "service.slotLocked":
    "Slot locked for 3 min \u2014 complete payment to confirm",
  "service.payNow": "Pay Now",
  "service.cancel": "Cancel",
  "service.change": "Change",
  "service.serviceUnavailable": "Service Unavailable",
  "service.checkBackLater": "Check back later",
  "service.changeBooking": "Change Booking",
  "service.selectDate": "Select Date",
  "service.selectTime": "Select Time",
  "service.updateBooking": "Update Booking",
  "service.confirmBooking": "Confirm Booking",
  "service.bookingUpdated": "Booking Updated",
  "service.bookingRescheduled": "Your booking has been rescheduled",
  "service.slotLockedToast": "Slot Locked for 3 Minutes",
  "service.completePayment": "Complete payment to confirm your booking",
  "service.bookedSuccess": "successfully!",
  "service.photo": "photo",
  "service.photos": "photos",
  "service.moreAllowed": "more allowed",
  "service.maxPhotos": "maximum photos",

  // ── Store Detail (Dukaan) ──
  "store.notFound": "Store not found",
  "store.goBack": "Go Back",
  "store.openNow": "Open Now",
  "store.followers": "Followers",
  "store.products": "Products",
  "store.away": "Away",
  "store.saved": "Saved",
  "store.save": "Save",
  "store.share": "Share",
  "store.callStore": "Call Store",
  "store.chat": "Chat",
  "store.removedFromWishlist": "Removed from wishlist",
  "store.storeSaved": "Store saved",
  "store.addedToWishlist": "added to wishlist!",
  "store.searchProducts": "Search products...",
  "store.services": "Services",

  // ── Bazar ──
  "bazar.allCategories": "All Categories",
  "bazar.found": "found",
  "bazar.store": "store",
  "bazar.stores": "stores",
  "bazar.clearFilters": "Clear filters",
  "bazar.categories": "Categories",
  "bazar.searchCategory": "Search category (e.g. Pizza, Gym)",
  "bazar.allStores": "All Stores",
  "bazar.noCategories": "No categories found matching",
  "bazar.noShops": "No shops found in this category",
  "bazar.adjustFilters": "Try adjusting your filters",

  // ── Store Reels ──
  "reels.storeReels": "Store Reels",
  "reels.reels": "Reels",
  "reels.totalLikes": "Total Likes",
  "reels.comments": "Comments",
  "reels.allReels": "All Reels",

  // ── ProductsSection (inside store) ──
  "prodSection.addedToCart": "Added to cart",
  "prodSection.addedSuccess": "added successfully!",
  "prodSection.removedFromWishlist": "Removed from wishlist",
  "prodSection.addedToWishlist": "Added to wishlist",
  "prodSection.saved": "saved!",
  "prodSection.removedFromCart": "Removed from cart",
  "prodSection.removed": "removed",
  "prodSection.inStock": "\u2713 In Stock",
  "prodSection.outOfStock": "Out of Stock",
  "prodSection.freeDelivery": "\uD83D\uDCE6 Free Delivery",
  "prodSection.addToCart": "Add to Cart",
  "prodSection.browseProducts": "Browse our amazing products",
  "prodSection.searchProducts": "Search products...",
  "prodSection.noProducts": "No products found",

  // ── ServicesSection (inside store) ──
  "svcSection.bookingUpdated": "Booking Updated",
  "svcSection.serviceBooked": "Service Booked",
  "svcSection.updated": "updated",
  "svcSection.booked": "booked",
  "svcSection.bookedStatus": "Booked",
  "svcSection.available": "Available",
  "svcSection.unavailable": "Unavailable",
  "svcSection.removedFromWishlist": "Removed from wishlist",
  "svcSection.addedToWishlist": "Added to wishlist",
  "svcSection.saved": "saved!",
  "svcSection.removed": "removed",
  "svcSection.change": "Change",
  "svcSection.book": "Book",
  "svcSection.browseServices": "Book our premium services",
  "svcSection.noServices": "No services available",
  "svcSection.changeBooking": "Change Booking",
  "svcSection.bookService": "Book Service",
  "svcSection.selectDate": "Select Date",
  "svcSection.selectTime": "Select Time",
  "svcSection.updateBooking": "Update Booking",
  "svcSection.confirmBooking": "Confirm Booking",

  // ── StickyHeader ──
  "header.search": "Search products, stores, services...",
  "header.searchShort": "Search products, stores...",
};

const hi: Record<string, string> = {
  // ── Settings ──
  "settings.title": "सेटिंग्स",
  "settings.subtitle": "अपनी पसंद प्रबंधित करें",
  "settings.account": "खाता",
  "settings.appearance": "दिखावट",
  "settings.security": "सुरक्षा और गोपनीयता",
  "settings.data": "डेटा",
  "settings.dangerZone": "खतरनाक क्षेत्र",
  "settings.notifications": "सूचनाएं",
  "settings.notifications.desc": "सूचना प्राथमिकताएं प्रबंधित करें",
  "settings.language": "भाषा",
  "settings.language.desc": "हिन्दी",
  "settings.location": "स्थान सेवाएं",
  "settings.location.desc": "ऐप को आपका स्थान एक्सेस करने दें",
  "settings.darkMode": "डार्क मोड",
  "settings.darkMode.desc": "लाइट और डार्क थीम के बीच स्विच करें",
  "settings.theme": "थीम",
  "settings.theme.light": "लाइट",
  "settings.theme.dark": "डार्क",
  "settings.theme.system": "सिस्टम",
  "settings.changePassword": "पासवर्ड बदलें",
  "settings.changePassword.desc": "अपना पासवर्ड अपडेट करें",
  "settings.privacy": "गोपनीयता नीति",
  "settings.privacy.desc": "हमारी गोपनीयता नीति पढ़ें",
  "settings.terms": "सेवा की शर्तें",
  "settings.terms.desc": "नियम और शर्तें पढ़ें",
  "settings.clearCache": "कैश साफ़ करें",
  "settings.clearCache.desc": "स्टोरेज स्पेस खाली करें",
  "settings.deleteAccount": "खाता हटाएं",
  "settings.version": "संगम v1.0.0",
  "settings.build": "बिल्ड 2024.01.20",
  "common.save": "सहेजें",
  "common.cancel": "रद्द करें",
  "common.back": "वापस",
  "common.success": "सफल",
  "common.error": "त्रुटि",

  // ── Language selection ──
  "language.title": "भाषा चुनें",
  "language.current": "वर्तमान भाषा",
  "language.english": "अंग्रेज़ी",
  "language.hindi": "हिन्दी",
  "language.marathi": "मराठी",
  "language.gujarati": "गुजराती",
  "language.bengali": "बंगाली",
  "language.tamil": "तमिल",
  "language.kannada": "कन्नड़",
  "language.telugu": "तेलुगु",
  "language.malayalam": "मलयालम",
  "language.punjabi": "पंजाबी",
  "language.changed": "भाषा सफलतापूर्वक बदल दी गई!",
  "language.info": "अपनी पसंदीदा भाषा चुनें। ऐप इंटरफ़ेस तुरंत अपडेट हो जाएगा।",

  // ── Notification prefs ──
  "notifications.title": "सूचना प्राथमिकताएं",
  "notifications.subtitle": "चुनें कि आपको किस बारे में सूचित किया जाए",
  "notifications.master": "सभी सूचनाएं",
  "notifications.master.desc": "सभी सूचनाएं सक्षम या अक्षम करें",
  "notifications.orders": "ऑर्डर अपडेट",
  "notifications.orders.desc": "डिलीवरी स्थिति, ऑर्डर पुष्टि",
  "notifications.promotions": "प्रमोशन और ऑफ़र",
  "notifications.promotions.desc": "डील, छूट और मौसमी ऑफ़र",
  "notifications.chat": "चैट संदेश",
  "notifications.chat.desc": "स्टोर और सपोर्ट से संदेश",
  "notifications.appUpdates": "ऐप अपडेट",
  "notifications.appUpdates.desc": "नई सुविधाएं और सुधार",

  // ── Appearance ──
  "appearance.title": "दिखावट",
  "appearance.subtitle": "संगम का लुक कस्टमाइज़ करें",
  "appearance.themeMode": "थीम मोड",
  "appearance.preview": "पूर्वावलोकन",

  // ── Change Password ──
  "password.title": "पासवर्ड बदलें",
  "password.current": "वर्तमान पासवर्ड",
  "password.new": "नया पासवर्ड",
  "password.confirm": "नया पासवर्ड पुष्टि करें",
  "password.requirements": "पासवर्ड आवश्यकताएं:",
  "password.req1": "कम से कम 8 अक्षर",
  "password.req2": "एक बड़ा अक्षर",
  "password.req3": "एक संख्या",
  "password.req4": "एक विशेष अक्षर",
  "password.change": "पासवर्ड बदलें",
  "password.forgot": "पासवर्ड भूल गए?",
  "password.success": "पासवर्ड सफलतापूर्वक बदल दिया गया!",
  "password.strength": "पासवर्ड की मजबूती",
  "password.weak": "कमज़ोर",
  "password.fair": "ठीक",
  "password.good": "अच्छा",
  "password.strong": "मजबूत",

  // ── Tabs ──
  "tab.home": "होम",
  "tab.bazar": "बाज़ार",
  "tab.mybusz": "myBusz",
  "tab.dhindora": "ढिंढोरा",
  "tab.profile": "प्रोफ़ाइल",

  // ── Drawer / Sidebar ──
  "drawer.account": "खाता",
  "drawer.business": "संगम बिज़नेस",
  "drawer.support": "सहायता और सेटिंग्स",
  "drawer.myProfile": "मेरी प्रोफ़ाइल",
  "drawer.myOrders": "मेरे ऑर्डर",
  "drawer.wishlist": "विशलिस्ट",
  "drawer.myDukaan": "मेरी दुकान",
  "drawer.transporter": "ट्रांसपोर्टर बनें",
  "drawer.settings": "सेटिंग्स",
  "drawer.help": "सहायता और समर्थन",
  "drawer.logout": "लॉग आउट",
  "drawer.customer": "ग्राहक",
  "drawer.langLabel": "हिन्दी (भारत)",

  // ── Profile ──
  "profile.editProfile": "प्रोफ़ाइल संपादित करें",
  "profile.premiumMember": "जनवरी 2024 से प्रीमियम सदस्य",
  "profile.verifiedMember": "सत्यापित सदस्य",
  "profile.orders": "ऑर्डर",
  "profile.wishlist": "विशलिस्ट",
  "profile.following": "फॉलोइंग",
  "profile.badges": "बैज",
  "profile.accountDetails": "खाता विवरण",
  "profile.address": "पता",
  "profile.phone": "फ़ोन",
  "profile.email": "ईमेल",
  "profile.quickActions": "त्वरित कार्य",
  "profile.moreOptions": "अन्य विकल्प",
  "profile.myOrders": "मेरे ऑर्डर",
  "profile.trackOrders": "अपने ऑर्डर ट्रैक करें",
  "profile.wishlistDesc": "आपने सहेजी गई वस्तुएं",
  "profile.myDukaan": "मेरी दुकान",
  "profile.manageStore": "अपनी दुकान प्रबंधित करें",
  "profile.payments": "भुगतान",
  "profile.paymentsDesc": "रसीदें और भुगतान इतिहास",
  "profile.transporter": "ट्रांसपोर्टर",
  "profile.transporterDesc": "डिलीवरी और लॉजिस्टिक्स",
  "profile.notifications": "सूचनाएं",
  "profile.notificationsDesc": "अलर्ट और अपडेट",
  "profile.logout": "लॉग आउट",
  "profile.logoutDesc": "ऐप से साइन आउट",

  // ── Orders ──
  "orders.title": "मेरे ऑर्डर",
  "orders.all": "सभी",
  "orders.processing": "प्रोसेसिंग",
  "orders.inTransit": "रास्ते में",
  "orders.delivered": "डिलीवर",
  "orders.cancelled": "रद्द",
  "orders.orderNum": "ऑर्डर #",
  "orders.ordered": "ऑर्डर किया:",
  "orders.delivery": "डिलीवरी:",
  "orders.totalAmount": "कुल राशि",
  "orders.viewDetails": "विवरण देखें",
  "orders.noOrders": "अभी कोई ऑर्डर नहीं",

  // ── Wishlist ──
  "wishlist.title": "विशलिस्ट",
  "wishlist.all": "सभी",
  "wishlist.products": "उत्पाद",
  "wishlist.services": "सेवाएं",
  "wishlist.stores": "दुकानें",
  "wishlist.empty": "आपकी विशलिस्ट खाली है",
  "wishlist.addToCart": "कार्ट में डालें",
  "wishlist.remove": "हटाएं",
  "wishlist.clearAll": "सब साफ़ करें",
  "wishlist.items": "वस्तुएं",

  // ── Cart ──
  "cart.title": "कार्ट",
  "cart.myCart": "मेरी कार्ट",
  "cart.products": "उत्पाद",
  "cart.services": "सेवाएं",
  "cart.empty": "आपकी कार्ट खाली है",
  "cart.emptySubtext": "शुरू करने के लिए दुकानों से आइटम जोड़ें",
  "cart.startShopping": "खरीदारी शुरू करें",
  "cart.subtotal": "सबटोटल",
  "cart.delivery": "डिलीवरी",
  "cart.deliveryFee": "डिलीवरी शुल्क",
  "cart.total": "कुल",
  "cart.checkout": "चेकआउट",
  "cart.proceedCheckout": "चेकआउट करें",
  "cart.removeItem": "कार्ट से हटाया गया",
  "cart.summary": "ऑर्डर सारांश",
  "cart.freeDelivery": "मुफ़्त डिलीवरी",
  "cart.savedDelivery": "आपने डिलीवरी पर ₹40 बचाए!",
  "cart.free": "मुफ़्त",
  "cart.pendingPayment": "भुगतान बाकी",
  "cart.confirmed": "पुष्टि हो गई",
  "cart.confirmPay": "पुष्टि करें और भुगतान करें",
  "cart.serviceRemoved": "सेवा हटाई गई",
  "cart.bookingCancelled": "बुकिंग रद्द की गई",
  "cart.item": "आइटम",
  "cart.items": "आइटम",
  "cart.booking": "बुकिंग",
  "cart.bookings": "बुकिंग्स",

  // ── Notifications ──
  "notif.title": "सूचनाएं",
  "notif.markAllRead": "सभी पढ़ा हुआ करें",
  "notif.empty": "अभी कोई सूचना नहीं",
  "notif.today": "आज",
  "notif.yesterday": "कल",
  "notif.earlier": "पहले",

  // ── Payments History ──
  "payments.title": "भुगतान इतिहास",
  "payments.totalSpent": "कुल खर्च",
  "payments.refunded": "वापसी",
  "payments.transactions": "लेनदेन",
  "payments.all": "सभी",
  "payments.success": "सफल",
  "payments.pending": "लंबित",
  "payments.failed": "विफल",
  "payments.refundedFilter": "वापस",
  "payments.searchPlaceholder": "भुगतान खोजें...",
  "payments.orderId": "ऑर्डर आईडी",
  "payments.transactionId": "ट्रांजैक्शन आईडी",
  "payments.subtotal": "सबटोटल",
  "payments.deliveryFee": "डिलीवरी शुल्क",
  "payments.discount": "छूट",
  "payments.totalPaid": "कुल भुगतान",
  "payments.refundInfo": "वापसी जानकारी",
  "payments.downloadReceipt": "रसीद डाउनलोड",
  "payments.visitStore": "दुकान देखें",
  "payments.noPayments": "कोई भुगतान रिकॉर्ड नहीं मिला",
  "payments.free": "मुफ़्त",

  // ── Product Detail ──
  "product.details": "उत्पाद विवरण",
  "product.notFound": "उत्पाद नहीं मिला",
  "product.notFoundDesc": "यह उत्पाद अब उपलब्ध नहीं हो सकता",
  "product.goBack": "वापस जाएं",
  "product.inStock": "स्टॉक में",
  "product.outOfStock": "स्टॉक में नहीं",
  "product.reviews": "समीक्षाएं",
  "product.save": "सहेजें",
  "product.soldBy": "विक्रेता",
  "product.delivery": "डिलीवरी",
  "product.aboutProduct": "इस उत्पाद के बारे में",
  "product.productDetails": "उत्पाद विवरण",
  "product.category": "श्रेणी",
  "product.unit": "इकाई",
  "product.distance": "दूरी",
  "product.rating": "रेटिंग",
  "product.relatedProducts": "संबंधित उत्पाद",
  "product.loadMore": "और देखें",
  "product.addToCart": "कार्ट में डालें",
  "product.addedToCart": "कार्ट में जोड़ा गया",
  "product.orderNow": "अभी ऑर्डर करें",
  "product.notifyMe": "उपलब्ध होने पर सूचित करें",
  "product.removedFromCart": "कार्ट से हटाया गया",
  "product.addedToWishlist": "विशलिस्ट में जोड़ा गया",
  "product.removedFromWishlist": "विशलिस्ट से हटाया गया",
  "product.photo": "फ़ोटो",
  "product.photos": "फ़ोटो",
  "product.moreAllowed": "और अनुमत",
  "product.maxPhotos": "अधिकतम फ़ोटो",
  "product.items": "आइटम",
  "product.freeDelivery": "मुफ़्त डिलीवरी",

  // ── Service Detail ──
  "service.details": "सेवा विवरण",
  "service.notFound": "सेवा नहीं मिली",
  "service.notFoundDesc": "यह सेवा अब उपलब्ध नहीं हो सकती",
  "service.goBack": "वापस जाएं",
  "service.active": "सक्रिय",
  "service.available": "उपलब्ध",
  "service.unavailable": "वर्तमान में अनुपलब्ध",
  "service.reviews": "समीक्षाएं",
  "service.price": "कीमत",
  "service.complimentary": "निःशुल्क",
  "service.offeredBy": "प्रदाता",
  "service.duration": "अवधि",
  "service.aboutService": "सेवा के बारे में",
  "service.serviceDetails": "सेवा विवरण",
  "service.serviceProvider": "सेवा प्रदाता",
  "service.totalReviews": "कुल समीक्षाएं",
  "service.serviceType": "सेवा प्रकार",
  "service.keyFeatures": "मुख्य विशेषताएं",
  "service.relatedServices": "संबंधित सेवाएं",
  "service.bookService": "सेवा बुक करें",
  "service.bookNow": "अभी बुक करें",
  "service.booked": "बुक किया गया",
  "service.pendingPayment": "भुगतान बाकी",
  "service.slotLocked":
    "स्लॉट 3 मिनट के लिए लॉक \u2014 पुष्टि के लिए भुगतान करें",
  "service.payNow": "अभी भुगतान करें",
  "service.cancel": "रद्द करें",
  "service.change": "बदलें",
  "service.serviceUnavailable": "सेवा अनुपलब्ध",
  "service.checkBackLater": "बाद में देखें",
  "service.changeBooking": "बुकिंग बदलें",
  "service.selectDate": "तारीख चुनें",
  "service.selectTime": "समय चुनें",
  "service.updateBooking": "बुकिंग अपडेट करें",
  "service.confirmBooking": "बुकिंग पुष्टि करें",
  "service.bookingUpdated": "बुकिंग अपडेट हुई",
  "service.bookingRescheduled": "आपकी बुकिंग पुनर्निर्धारित कर दी गई",
  "service.slotLockedToast": "स्लॉट 3 मिनट के लिए लॉक",
  "service.completePayment": "बुकिंग की पुष्टि के लिए भुगतान करें",
  "service.bookedSuccess": "सफलतापूर्वक!",
  "service.photo": "फ़ोटो",
  "service.photos": "फ़ोटो",
  "service.moreAllowed": "और अनुमत",
  "service.maxPhotos": "अधिकतम फ़ोटो",

  // ── Store Detail (Dukaan) ──
  "store.notFound": "दुकान नहीं मिली",
  "store.goBack": "वापस जाएं",
  "store.openNow": "अभी खुला है",
  "store.followers": "फॉलोअर्स",
  "store.products": "उत्पाद",
  "store.away": "दूर",
  "store.saved": "सहेजा गया",
  "store.save": "सहेजें",
  "store.share": "शेयर",
  "store.callStore": "दुकान को कॉल करें",
  "store.chat": "चैट",
  "store.removedFromWishlist": "विशलिस्ट से हटाया गया",
  "store.storeSaved": "दुकान सहेजी गई",
  "store.addedToWishlist": "विशलिस्ट में जोड़ा गया!",
  "store.searchProducts": "उत्पाद खोजें...",
  "store.services": "सेवाएं",

  // ── Bazar ──
  "bazar.allCategories": "सभी श्रेणियां",
  "bazar.found": "मिले",
  "bazar.store": "दुकान",
  "bazar.stores": "दुकानें",
  "bazar.clearFilters": "फ़िल्टर हटाएं",
  "bazar.categories": "श्रेणियां",
  "bazar.searchCategory": "श्रेणी खोजें (जैसे पिज़्ज़ा, जिम)",
  "bazar.allStores": "सभी दुकानें",
  "bazar.noCategories": "कोई श्रेणी नहीं मिली",
  "bazar.noShops": "इस श्रेणी में कोई दुकान नहीं",
  "bazar.adjustFilters": "अपने फ़िल्टर बदलें",

  // ── Store Reels ──
  "reels.storeReels": "स्टोर रील्स",
  "reels.reels": "रील्स",
  "reels.totalLikes": "कुल लाइक्स",
  "reels.comments": "टिप्पणियां",
  "reels.allReels": "सभी रील्स",

  // ── ProductsSection (inside store) ──
  "prodSection.addedToCart": "कार्ट में जोड़ा",
  "prodSection.addedSuccess": "सफलतापूर्वक जोड़ा!",
  "prodSection.removedFromWishlist": "विशलिस्ट से हटाया",
  "prodSection.addedToWishlist": "विशलिस्ट में जोड़ा",
  "prodSection.saved": "सहेजा!",
  "prodSection.removedFromCart": "कार्ट से हटाया",
  "prodSection.removed": "हटाया गया",
  "prodSection.inStock": "\u2713 स्टॉक में",
  "prodSection.outOfStock": "स्टॉक में नहीं",
  "prodSection.freeDelivery": "\uD83D\uDCE6 मुफ़्त डिलीवरी",
  "prodSection.addToCart": "कार्ट में डालें",
  "prodSection.browseProducts": "हमारे शानदार उत्पाद देखें",
  "prodSection.searchProducts": "उत्पाद खोजें...",
  "prodSection.noProducts": "कोई उत्पाद नहीं मिला",

  // ── ServicesSection (inside store) ──
  "svcSection.bookingUpdated": "बुकिंग अपडेट हुई",
  "svcSection.serviceBooked": "सेवा बुक हुई",
  "svcSection.updated": "अपडेट",
  "svcSection.booked": "बुक",
  "svcSection.bookedStatus": "बुक किया गया",
  "svcSection.available": "उपलब्ध",
  "svcSection.unavailable": "अनुपलब्ध",
  "svcSection.removedFromWishlist": "विशलिस्ट से हटाया",
  "svcSection.addedToWishlist": "विशलिस्ट में जोड़ा",
  "svcSection.saved": "सहेजा!",
  "svcSection.removed": "हटाया गया",
  "svcSection.change": "बदलें",
  "svcSection.book": "बुक करें",
  "svcSection.browseServices": "हमारी प्रीमियम सेवाएं बुक करें",
  "svcSection.noServices": "कोई सेवा उपलब्ध नहीं",
  "svcSection.changeBooking": "बुकिंग बदलें",
  "svcSection.bookService": "सेवा बुक करें",
  "svcSection.selectDate": "तारीख चुनें",
  "svcSection.selectTime": "समय चुनें",
  "svcSection.updateBooking": "बुकिंग अपडेट करें",
  "svcSection.confirmBooking": "बुकिंग पुष्टि करें",

  // ── StickyHeader ──
  "header.search": "उत्पाद, दुकानें, सेवाएं खोजें...",
  "header.searchShort": "उत्पाद, दुकानें खोजें...",
};

const translations: Record<AppLanguage, Record<string, string>> = {
  en,
  hi,
  mr,
  gu,
  bn,
  ta,
  kn,
  te,
  ml,
  pa,
};

// ────────────────────────────────────────────
// Context
// ────────────────────────────────────────────
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    {
      orders: true,
      promotions: true,
      chat: true,
      appUpdates: true,
    },
  );
  const [locationEnabled, setLocationEnabled] = useState(true);

  const isDark = theme === "dark";

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
  }, []);

  // Pre-compute a merged Map: en as base → overlay selected language.
  // Single Map.get() per call → O(1) with zero fallback chain.
  const tMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const k in en) map.set(k, en[k]);
    if (language !== "en") {
      const loc = translations[language];
      for (const k in loc) map.set(k, loc[k]);
    }
    return map;
  }, [language]);

  const t = useCallback((key: string): string => tMap.get(key) || key, [tMap]);

  const updateNotificationPref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      theme,
      setTheme,
      isDark,
      notificationsEnabled,
      setNotificationsEnabled,
      notificationPrefs,
      updateNotificationPref,
      locationEnabled,
      setLocationEnabled,
    }),
    [
      language,
      setLanguage,
      t,
      theme,
      setTheme,
      isDark,
      notificationsEnabled,
      notificationPrefs,
      updateNotificationPref,
      locationEnabled,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
