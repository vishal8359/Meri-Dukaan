declare module 'react-native-razorpay' {
  type RazorpayTheme = {
    color?: string;
  };

  type RazorpayPrefill = {
    name?: string;
    email?: string;
    contact?: string;
  };

  type RazorpayCheckoutOptions = {
    key: string;
    amount: string;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    image?: string;
    prefill?: RazorpayPrefill;
    theme?: RazorpayTheme;
    [key: string]: unknown;
  };

  type RazorpayCheckoutResult = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    [key: string]: unknown;
  };

  const RazorpayCheckout: {
    open(options: RazorpayCheckoutOptions): Promise<RazorpayCheckoutResult>;
  };

  export default RazorpayCheckout;
}
