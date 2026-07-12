export interface ProtocolMetrics {
  totalSlots: number;
  filledSlots: number;
  maxSlots: number;
  circulatingOVL: number;
  maxOVL: number;
  activeClusters: ClusterNode[];
}

export interface ClusterNode {
  id: string;
  hardwareSpecs: string;
  status: 'Thermodynamic Active' | 'Spoofing Defended' | 'Pending Verification';
  verifiedAt: string;
}

export interface UserWalletState {
  address: string;
  balanceHACD: number;
  balanceHAC: number;
  passports: PassportNFT[];
  fungibleCreditsOVL: number;
}

export interface PassportNFT {
  tokenId: string;
  clusterId: string;
  status: 'Thermodynamic Active' | 'Spoofing Defended' | 'Pending Verification';
}
