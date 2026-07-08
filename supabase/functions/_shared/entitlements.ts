export const PLAN_LIMITS = {
  trial:   { label: "Trial",   ticketCap: 1000, cartRecovery: true,  returnDeflection: true  },
  free:    { label: "Free",    ticketCap: 20,   cartRecovery: false, returnDeflection: false },
  starter: { label: "Starter", ticketCap: 1000, cartRecovery: true,  returnDeflection: false },
  growth:  { label: "Growth",  ticketCap: 5000, cartRecovery: true,  returnDeflection: true  },
  scale:   { label: "Scale",   ticketCap: Infinity, cartRecovery: true, returnDeflection: true },
};

export function getEffectivePlan(profile) {
  if (profile.plan_status === 'active') return profile.plan && PLAN_LIMITS[profile.plan] ? profile.plan : 'starter';
  if (profile.plan_status === 'trialing' && profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) return 'trial';
  return 'free';
}

export function getEntitlements(profile) {
  const key = getEffectivePlan(profile);
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.free;
}
