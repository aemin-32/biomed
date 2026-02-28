
import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';

interface LogoutButtonProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  label?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className,
  iconClassName = "w-5 h-5",
  showText = false,
  label = "تسجيل الخروج"
}) => {
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "p-2.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 hover:scale-105 active:scale-95 transition-all"}
      title={label}
      aria-label={label}
    >
      <LogOut className={`rtl:rotate-180 ${iconClassName}`} />
      {showText && <span>{label}</span>}
    </button>
  );
};

export default LogoutButton;
