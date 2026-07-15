import { prisma } from './prisma';

export type DonationStatus = 'pending' | 'confirmed' | 'rejected';

export interface Donation {
  id: string;
  name: string;
  memo: string | null;
  amount: number;
  status: string;
  createdAt: Date;
  confirmedAt: Date | null;
}

export async function createDonation(data: { name: string; memo?: string; amount: number }): Promise<Donation> {
  const newDonation = await prisma.donation.create({
    data: {
      name: data.name,
      memo: data.memo || '',
      amount: data.amount,
      status: 'pending',
    },
  });
  return newDonation;
}

export async function listDonations(status?: DonationStatus): Promise<Donation[]> {
  if (status) {
    return prisma.donation.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }
  return prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateDonationStatus(id: string, status: DonationStatus): Promise<Donation | null> {
  const existing = await prisma.donation.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.donation.update({
    where: { id },
    data: {
      status,
      confirmedAt: status === 'confirmed' ? new Date() : null,
    },
  });
}
