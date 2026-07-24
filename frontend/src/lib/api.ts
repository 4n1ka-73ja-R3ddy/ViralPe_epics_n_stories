export interface AuthResponse {
  userId: number;
  token: string;
  profileComplete: boolean;
  message: string;
}

export interface UserProfileResponse {
  userId: number;
  email: string;
  fullName: string;
  profileComplete: boolean;
  registeredPincode: string | null;
}

export interface WalletBalanceResponse {
  userId: number;
  balance: number;
}

export interface ReversalWalletResponse {
  userId: number;
  balance: number;
  expiresAt: string | null;
}

export interface WalletSummaryResponse {
  walletBalance: number;
  reversalBalance: number;
  cashback: number;
  referral: number;
  vendorRoyalty: number;
  pincodeRoyalty: number;
  totalEarnings: number;
}

export interface LedgerEntryResponse {
  id: number;
  category: string;
  amount: number;
  sourceReference: string;
  createdAt: string;
}

export interface ProfileCompletionResponse {
  message: string;
  warning?: string;
}

export interface PincodeValidationResponse {
  pincode: string;
  city: string;
  district: string;
  state: string;
  valid: boolean;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Request failed. Please try again.';

    if (responseText) {
      try {
        const errorBody = JSON.parse(responseText) as ApiErrorBody;

        errorMessage =
          errorBody.error ||
          errorBody.message ||
          errorMessage;
      } catch {
        errorMessage = responseText;
      }
    }

    throw new Error(errorMessage);
  }

  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(`Invalid response received from ${path}`);
  }
}

export function signInWithGoogle(
  idToken: string
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    '/api/auth/sign-in/google',
    {
      method: 'POST',
      body: JSON.stringify({ idToken })
    }
  );
}

export function signInDemo(payload: {
  userType: 'NEW' | 'RETURNING';
  provider: 'GOOGLE' | 'APPLE';
  fullName?: string;
  email?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    '/api/auth/sign-in/demo',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export function validatePincode(
  pincode: string
): Promise<PincodeValidationResponse> {
  return apiRequest<PincodeValidationResponse>(
    `/api/user/pincode/${encodeURIComponent(pincode)}`
  );
}

export function completeProfile(payload: {
  userId: number;
  pincode: string;
  locationConfirmed: boolean;
  referralCode?: string;
}): Promise<ProfileCompletionResponse> {
  return apiRequest<ProfileCompletionResponse>(
    '/api/user/complete-profile',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
}

export function getProfile(
  userId: number
): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>(
    `/api/user/profile/${userId}`
  );
}

export function getWalletBalance(
  userId: number
): Promise<WalletBalanceResponse> {
  return apiRequest<WalletBalanceResponse>(
    `/api/wallet/balance/${userId}`
  );
}

export function getReversalWallet(
  userId: number
): Promise<ReversalWalletResponse> {
  return apiRequest<ReversalWalletResponse>(
    `/api/wallet/reversal/${userId}`
  );
}

export function getLedger(
  userId: number
): Promise<LedgerEntryResponse[]> {
  return apiRequest<LedgerEntryResponse[]>(
    `/api/wallet/ledger/${userId}`
  );
}

export function getWalletSummary(
  userId: number
): Promise<WalletSummaryResponse> {
  return apiRequest<WalletSummaryResponse>(
    `/api/wallet/summary/${userId}`
  );
}