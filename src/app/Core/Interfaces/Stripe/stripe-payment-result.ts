export type StripePaymentResult = {
  error?: { message?: string };
  paymentIntent?: { status?: string };
};
