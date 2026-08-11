import { useEffect } from 'react';
import { useAuth } from '../lib/firebase/authContext';
import { useEmergency } from '../context/EmergencyContext';
import { getRoleConfigForAccount } from '../config/roleConfig';

/**
 * Call this once near the top of your dashboard shell. Reads the logged-in
 * account's Firestore profile (role + buildingId) from useAuth() and sets
 * EmergencyContext's selectedRole automatically — no manual switching.
 *
 * NOTE: profile.role is 'operator' | 'administrator' (see UserProfile),
 * mapped to 'building_operator' | 'network_operator' inside
 * getRoleConfigForAccount. See that function's comment for the mapping rule.
 */
export function useAutoRole() {
  const { profile, loading } = useAuth();
  const { selectRole } = useEmergency();

  useEffect(() => {
    if (loading || !profile) return;
    const config = getRoleConfigForAccount(profile);
    selectRole(config.roleKey);
  }, [profile, loading, selectRole]);
}