
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'Engineer' | 'Admin' | 'Nurse' | 'StoreManager';

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  responsibleRooms?: string[]; 
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, name: string, id: string) => void;
  logout: () => void;
  updateUserRooms: (rooms: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available to persist session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('biomed_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Save to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('biomed_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('biomed_user');
    }
  }, [user]);

  const login = (role: UserRole, name: string, id: string) => {
    const newUser: User = { 
        id: id || `${role.toUpperCase().substring(0,3)}-${Math.floor(Math.random()*1000)}`, 
        name: name || (role === 'Engineer' ? 'المهندس' : role === 'Nurse' ? 'طبيب/ممرض' : role === 'Admin' ? 'مدير النظام' : 'أمين المخزن'), 
        role: role,
        department: role === 'Nurse' ? 'Medical Staff' : role === 'StoreManager' ? 'Central Warehouse' : role === 'Admin' ? 'Administration' : 'Engineering',
        // Initialize empty array for nurses to trigger room selection
        responsibleRooms: [] 
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('biomed_user');
  };

  const updateUserRooms = (rooms: string[]) => {
    if (user) {
        // Update state, useEffect will handle localStorage
        setUser({ ...user, responsibleRooms: rooms });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserRooms }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
