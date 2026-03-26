export type DonationMethod = 'bank' | 'toss';
export type DonationStatus = 'pending' | 'confirmed' | 'canceled';

export interface Donation {
  id: string;
  name: string;
  amount: number;
  message?: string;
  method: DonationMethod;
  status: DonationStatus;
  paymentKey?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}
