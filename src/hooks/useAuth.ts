import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) console.warn('getSession error:', error.message);
      setState({ session: session ?? null, user: session?.user ?? null, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setState({ session, user: session?.user ?? null, loading: false });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'donolvidon://auth/callback' },
    });
    if (error) throw error;
    return data;
  }, []);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: 'donolvidon://auth/callback' },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signInWithGoogle, signInWithApple, signOut };
}
