// features/donation/types/index.ts

export type DonationStatus = 'PENDING' | 'CONFIRMED' | 'MESSAGE_ONLY';

export interface DonationRecord {
  id: string;
  donorName?: string | null;
  isAnonymous: boolean;
  amount: number;
  status: DonationStatus;
  message?: string | null;
  createdAt: string | Date;
  hasDonated: boolean;
}
