export interface StripePaymentElement {
  mount(element: HTMLElement): void;
  unmount(): void;
  on(
    eventName: 'change',
    callback: (event: {
      complete: boolean;
      error?: { message?: string };
    }) => void,
  ): void;
}
