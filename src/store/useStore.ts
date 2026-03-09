import { create } from 'zustand';

interface MemoryItem {
  id: string;
  category: string;
  content: string;
  timestamp: Date;
}

interface UserProfile {
  xp: number;
  level: number;
  nextLevelXp: number;
}

interface JarvisStore {
  memories: MemoryItem[];
  userProfile: UserProfile;
  addMemory: (category: string, content: string) => void;
  addXp: (amount: number) => void;
  clearMemories: () => void;
}

export const useJarvisStore = create<JarvisStore>((set) => ({
  memories: [],
  userProfile: {
    xp: 0,
    level: 1,
    nextLevelXp: 100,
  },
  addMemory: (category, content) => set((state) => ({
    memories: [
      ...state.memories,
      {
        id: Math.random().toString(36).substring(7),
        category,
        content,
        timestamp: new Date(),
      },
    ],
  })),
  addXp: (amount) => set((state) => {
    let newXp = state.userProfile.xp + amount;
    let newLevel = state.userProfile.level;
    let newNextLevelXp = state.userProfile.nextLevelXp;

    while (newXp >= newNextLevelXp) {
      newXp -= newNextLevelXp;
      newLevel += 1;
      newNextLevelXp = Math.floor(newNextLevelXp * 1.5);
    }

    return {
      userProfile: {
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextLevelXp,
      },
    };
  }),
  clearMemories: () => set({ memories: [] }),
}));
