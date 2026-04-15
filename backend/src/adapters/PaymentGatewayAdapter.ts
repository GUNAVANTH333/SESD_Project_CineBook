export interface PaymentResult {
  success: boolean;
  transactionId: string;
  failureReason?: string;
}

export interface PaymentGateway {
  charge(amount: number, method: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<boolean>;
}

class SimulatedGateway implements PaymentGateway {
  async charge(amount: number, _method: string): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const success = Math.random() < 0.9;
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    if (success) {
      return { success: true, transactionId };
    }

    return {
      success: false,
      transactionId,
      failureReason: "Payment declined by gateway",
    };
  }

  async refund(_transactionId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return Math.random() < 0.95;
  }
}

export class PaymentGatewayAdapter {
  private gateway: PaymentGateway;

  constructor(gateway?: PaymentGateway) {
    this.gateway = gateway ?? new SimulatedGateway();
  }

  async charge(amount: number, method: string): Promise<PaymentResult> {
    return this.gateway.charge(amount, method);
  }

  async refund(transactionId: string): Promise<boolean> {
    return this.gateway.refund(transactionId);
  }
}
