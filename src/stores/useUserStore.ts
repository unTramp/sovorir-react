import { create } from 'zustand';
import type { Profile } from '../types/api';

interface UserState {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  setFromProfile: (profile: Profile) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  firstName: 'Андрей',
  lastName: 'Дорофеев',
  avatarUrl: '/assets/student-avatar.png',
  setFromProfile: (profile) => {
    const parts = profile.fullName.split(' ');
    set({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
      avatarUrl: profile.avatarUrl ?? '/assets/student-avatar.png',
    });
  },
}));
