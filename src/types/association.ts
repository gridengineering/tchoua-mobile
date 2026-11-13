export type AssocType =
  | "TONTINE_CLUB"
  | "COOPERATIVE"
  | "SOLIDARITY"
  | "INVESTMENT"
  | "AGRICULTURAL"
  | "MUTUAL"
  | "AMICALE"
  | "SECTION"
  | "FEDERATION"
  | "CULTURAL"
  | "PROFESSIONAL"
  | "OTHER";

export const ASSOC_TYPE_META: Record<AssocType, { label: string; icon: string }> = {
  TONTINE_CLUB: { label: "Tontine", icon: "🔄" },
  COOPERATIVE: { label: "Coopérative", icon: "🤝" },
  SOLIDARITY: { label: "Solidarité", icon: "❤️" },
  INVESTMENT: { label: "Fonds d'Investissement", icon: "📈" },
  AGRICULTURAL: { label: "Groupement Agricole", icon: "🌾" },
  MUTUAL: { label: "Mutuelle", icon: "🏥" },
  AMICALE: { label: "Amicale d'élites", icon: "🌍" },
  SECTION: { label: "Section / démembrement", icon: "🏘️" },
  FEDERATION: { label: "Fédération", icon: "🏛️" },
  CULTURAL: { label: "Association culturelle", icon: "🎭" },
  PROFESSIONAL: { label: "Association professionnelle", icon: "💼" },
  OTHER: { label: "Autre", icon: "🌐" },
};

export interface AssociationSummary {
  id: string;
  name: string;
  type: AssocType;
  description?: string | null;
  _count?: {
    memberships?: number;
    members?: number;
    activities?: number;
  };
}

export function getMemberCount(assoc?: AssociationSummary | null): number {
  if (!assoc?._count) return 0;
  return assoc._count.memberships ?? assoc._count.members ?? 0;
}

export type CycleMode = "FIXED_SESSIONS" | "FIXED_PERIOD" | "UNTIL_ALL_BENEFITED";

export const CYCLE_MODE_LABELS: Record<CycleMode, string> = {
  FIXED_SESSIONS: "Sessions fixes",
  FIXED_PERIOD: "Période fixe",
  UNTIL_ALL_BENEFITED: "Jusqu'à épuisement des parts",
};

export function formatShareFraction(fraction?: number | null): string {
  if (!fraction || fraction === 1) return "Part entière";
  if (fraction === 0.5) return "Demi-part (1/2)";
  if (fraction === 0.25) return "Quart de part (1/4)";
  return `${fraction} part`;
}

export interface CycleActivityInfo {
  id: string;
  name: string;
  type: string;
  distributionMode?: string;
  partAmount?: number | null;
  contributionAmount?: number | null;
  beneficiaryAmountPerShare?: number | null;
  maxPartsPerSession?: number;
  minShareFraction?: number;
  maxSharesPerMember?: number | null;
  allowPartialShares?: boolean;
  allowSameBeneficiaryMultipleShares?: boolean;
  maxBeneficiarySharesPerSession?: number | null;
  cycleMode?: CycleMode | string;
  cycleSessions?: number | null;
  cycleStart?: string | null;
  cycleEnd?: string | null;
  conditionMonths?: number | null;
  collectionAmount?: number | null;
}

export interface CycleResponse {
  activity: CycleActivityInfo;
  summary: {
    totalContributions: number;
    totalDistributed: number;
    balance: number;
    totalParts: number;
    distributedParts: number;
    remainingParts: number;
    plannedSessions: number | null;
    heldSessions: number;
    progress: number;
  };
  members: Array<{
    membershipId: string;
    name: string;
    contributed: number;
    received: number;
    parts: number;
    receivedParts: number;
    net: number;
  }>;
  sessions: Array<{
    id: string;
    number: number;
    date: string;
    status: string;
    contributions: number;
    distributions: number;
    balance: number;
    pot: number;
  }>;
  beneficiaries: Array<{
    id: string;
    member: string;
    membershipId: string;
    session: number;
    parts: number;
    amount: number;
    date: string;
  }>;
}

export type HistoryEventType =
  | "CONTRIBUTION"
  | "LOAN"
  | "REPAYMENT"
  | "INTEREST"
  | "BENEFICIARY"
  | "AID"
  | "CAPITAL";

export interface HistoryEvent {
  id: string;
  date: string;
  type: HistoryEventType | string;
  label: string;
  amount: number;
  direction: "IN" | "OUT";
  membershipId?: string | null;
  memberName?: string | null;
  activityId?: string | null;
  activityName?: string | null;
  meta?: Record<string, unknown>;
}

export interface HistoryResponse {
  scope: string;
  typeFilter: string;
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  summary: { in: number; out: number; net: number };
  events: HistoryEvent[];
  canViewAll: boolean;
}

export interface InterestsResponse {
  membershipId: string;
  memberName: string;
  canViewAll: boolean;
  totals: {
    interest: number;
    share: number;
    dividendInterest: number;
    dividendShare: number;
    dividendYear: number | null;
  };
  groups: Array<{
    key: string;
    label: string;
    interest: number;
    share: number;
    count: number;
  }>;
  rows: Array<{
    id: string;
    date: string;
    loanId: string;
    borrower: string;
    activity: string;
    repayment: number;
    interestTotal: number;
    capital: number;
    totalCapital: number;
    ratio: number;
    memberShare: number;
  }>;
}
