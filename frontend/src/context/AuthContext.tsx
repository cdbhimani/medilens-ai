import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken } from '../services/api';

interface User {
  uid: string;
  email: string;
  isDemo: boolean;
}

interface AuthContextType {
  user: User | null;
  loginAsDemo: (customUid?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginAsDemo: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setUser({
        uid: token,
        email: token.includes('@') ? token : 'demo.patient@medilens.ai',
        isDemo: token.startsWith('demo-')
      });
    } else {
      // Default to guest demo user for frictionless evaluation
      loginAsDemo();
    }
  }, []);

  const loginAsDemo = (customUid?: string) => {
    const uid = customUid || 'demo-user-evaluator';
    setAuthToken(uid);
    setUser({
      uid,
      email: `${uid}@medilens.ai`,
      isDemo: true
    });
  };

  const logout = () => {
    localStorage.removeItem('medilens_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
