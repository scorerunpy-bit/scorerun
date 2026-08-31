import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useSession = create((set, get) => ({
  session: null,
  profile: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session ?? null });
    if (data.session) await get().loadProfile();
    set({ loading: false });
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session });
      if (session) await get().loadProfile();
      else set({ profile: null });
    });
  },

  loadProfile: async () => {
    const uid = get().session?.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    set({ profile: data ?? null });
  },

  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signOut: async () => { await supabase.auth.signOut(); set({ session: null, profile: null }); },
}));
