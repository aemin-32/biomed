
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  fallback?: string; // Optional manual override
}

const BackButton: React.FC<BackButtonProps> = ({ className, fallback }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = () => {
    // 1. Priority: Explicit Back Path via State (Passed from previous page)
    // This is the "Golden Path" if we navigated internally
    if ((location.state as any)?.backPath) {
       navigate((location.state as any).backPath);
       return;
    }

    // 2. History Check (If user navigated here naturally)
    // window.history.state.idx > 0 implies there is a history stack in React Router
    if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
        return;
    }

    // 3. Smart Fallback (Deep Link / Refresh / No History)
    // "Drawing the path based on where I am exactly"
    if (fallback) {
        navigate(fallback);
        return;
    }

    const path = location.pathname;

    // Logic Map: Where should I go if I have no history?
    if (path.includes('/maintenance/options')) {
        navigate('/maintenance');
    } else if (path.includes('/maintenance/pm')) {
        navigate('/maintenance'); 
    } else if (path.includes('/maintenance/ticket')) {
        navigate('/maintenance/requests');
    } else if (path.includes('/maintenance')) {
        navigate('/'); // Maintenance root -> Dashboard
    } else if (path.includes('/device/')) {
        navigate('/devices'); // Device Profile -> Device List
    } else if (path.includes('/tools/')) {
        // If inside a tool -> Back to Tools Menu
        if (path === '/tools') navigate('/');
        else navigate('/tools');
    } else if (path.includes('/settings/')) {
        // If inside a setting -> Back to Settings Menu
        if (path === '/settings') navigate('/');
        else navigate('/settings');
    } else if (path.includes('/inventory')) {
        navigate('/');
    } else if (path.includes('/nurse/')) {
        // If inside nurse sub-page -> Nurse Dashboard
        if (path === '/nurse') navigate('/');
        else navigate('/nurse');
    } else {
        // Ultimate Fallback
        navigate('/');
    }
  };

  return (
    <button 
      onClick={handleNavigation} 
      className={className || "p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"}
      aria-label="Back"
    >
      <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default BackButton;
