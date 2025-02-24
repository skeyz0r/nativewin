// context/SessionContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';  // Ensure supabase is properly set up
import { Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';

interface SessionContextProps {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  findNameById: (id: number) => string | null;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbTokenKey;

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [genre, setGenre] = useState<{ movies: { id: number; name: string }[]; tv: { id: number; name: string }[] }>({
    movies: [],
    tv: [],
  });

  const findNameById = (id: number) => {
    for (const key in genre) {
      const item = genre[key as keyof typeof genre].find(item => item.id === id);
      if (item) return item.name;
    }
    return null; // Not found
  };

  async function getGenre() {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    };

    const movieData = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options);
    const movieResponse = await movieData.json();

    const tvData = await fetch('https://api.themoviedb.org/3/genre/tv/list?language=en', options);
    const tvResponse = await tvData.json();

    setGenre({ movies: movieResponse.genres, tv: tvResponse.genres });
  }

  useEffect(() => {
    // Get the session from Supabase on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for session changes (auth state)
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Fetch genre data after session is set up
    getGenre();
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession, findNameById }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
