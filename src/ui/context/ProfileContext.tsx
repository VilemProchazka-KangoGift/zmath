import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '../../persistence/types.ts';
import { getProfiles, getProfileData, saveProfileData } from '../../persistence/storage.ts';
import { createProfile, deleteProfile, switchProfile, getActiveProfile } from '../../persistence/profileManager.ts';
import type { ProfileData } from '../../persistence/types.ts';

interface ProfileState {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  profileData: ProfileData | null;
}

type ProfileAction =
  | { type: 'SET_ALL'; profiles: UserProfile[]; active: UserProfile | null; data: ProfileData | null }
  | { type: 'REFRESH' };

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SET_ALL':
      return { profiles: action.profiles, activeProfile: action.active, profileData: action.data };
    case 'REFRESH':
      return state;
  }
}

interface ProfileContextValue extends ProfileState {
  create: (name: string) => void;
  remove: (id: string) => void;
  switchTo: (id: string) => void;
  saveData: (data: ProfileData) => void;
  reload: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, {
    profiles: [],
    activeProfile: null,
    profileData: null,
  });

  const load = () => {
    const profiles = getProfiles();
    const active = getActiveProfile();
    const data = active ? getProfileData(active.id) : null;
    dispatch({ type: 'SET_ALL', profiles, active, data });
  };

  useEffect(() => { load(); }, []);

  const ctx: ProfileContextValue = {
    ...state,
    create: (name: string) => { createProfile(name); load(); },
    remove: (id: string) => { deleteProfile(id); load(); },
    switchTo: (id: string) => { switchProfile(id); load(); },
    saveData: (data: ProfileData) => {
      if (state.activeProfile) {
        saveProfileData(state.activeProfile.id, data);
        load();
      }
    },
    reload: load,
  };

  return <ProfileContext value={ctx}>{children}</ProfileContext>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
