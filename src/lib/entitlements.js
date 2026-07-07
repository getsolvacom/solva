export const PLAN_LIMITS = {
  trial:   { label: "Trial",   ticketCap: 1000, cartRecovery: true,  returnDeflection: true  },
  free:    { label: "Free",    ticketCap: 20,   cartRecovery: false, returnDeflection: false },
  starter: { label: "Starter", ticketCap: 1000, cartRecovery: true,  returnDeflection: false },
  growth:  { label: "Growth",  ticketCap: 5000, cartRecovery: true,  returnDeflection: true  },
  scale:   { label: "Scale",   ticketCap: Infinity, cartRecovery: true, returnDeflection: true },
};

export function getEffectivePlan(profile) {
  const { plan, plan_status, trial_ends_at } = profile || {};

  if (plan_status === 'active') {
    return PLAN_LIMITS[plan] ? plan : 'starter';
  }

  if (
    plan_status === 'trialing' &&
    trial_ends_at &&
    new Date(trial_ends_at) > new Date()
  ) {
    return 'trial';
  }

  return 'free';
}

export function getEntitlements(profile) {
  const planKey = getEffectivePlan(profile);
  return PLAN_LIMITS[planKey] || PLAN_LIMITS.free;
}
