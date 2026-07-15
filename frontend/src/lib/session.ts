export interface UserSession {
  userId: number;
  token: string;
  profileComplete: boolean;
}

const SESSION_KEY = 'viralpe.session';

export function getSession(): UserSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as UserSession;
    if (typeof parsed.userId !== 'number' || typeof parsed.token !== 'string') {
      return null;
    }

    return {
      userId: parsed.userId,
      token: parsed.token,
      profileComplete: Boolean(parsed.profileComplete)
    };
  } catch {
    return null;
  }
}

export function setSession(session: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
