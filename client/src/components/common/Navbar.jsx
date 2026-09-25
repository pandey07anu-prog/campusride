import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import UserAvatar from './UserAvatar';
import AuthRequiredModal from '../auth/AuthRequiredModal';
import { Navigation, ShieldCheck, Bell, LogOut, Menu, X, PlusCircle, Users, Leaf, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logoutUser } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleOfferRideClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(23,23,23,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Navigation className="w-4 h-4 text-[#a3e635]" />
            </div>
            <span className="font-archivo font-extrabold text-[15px] tracking-[-0.02em]">CampusRide</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '0.5rem' }}>
            {[
              { to: '/', label: 'Home' },
              { to: '/find-ride', label: 'Find Ride' },
              { to: '/offer-ride', label: 'Offer Ride', icon: PlusCircle, onClick: handleOfferRideClick },
              { to: '/environmental-impact', label: 'Impact', icon: Leaf },
            ].map(({ to, label, icon: Icon, onClick }) => (
              <Link
                key={to}
                to={to}
                onClick={onClick}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 transition-all duration-150 ${
                  isActive(to)
                    ? 'text-[#171717] bg-[#a3e635]'
                    : 'text-[#a6a6a6] hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </Link>
            ))}
          </div>

          {/* User Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-md text-[#a6a6a6] hover:text-white transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#a3e635] text-[#171717] text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5"
                    style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                  <Link
                    to="/my-rides"
                    className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                      isActive('/my-rides')
                        ? 'bg-[#a3e635] text-[#171717]'
                        : 'text-[#a6a6a6] hover:text-white'
                    }`}
                  >
                    My Rides
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-full transition-all hover:bg-white/[0.06]"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <UserAvatar user={user} className="w-8 h-8 rounded-full text-[11px] font-bold" />
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-[12px] font-semibold text-white flex items-center gap-1">
                        {typeof user?.fullName === 'string' && user.fullName ? user.fullName.split(' ')[0] : 'Student'}
                        {user?.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-3 h-3 text-[#a3e635]" />
                        )}
                      </span>
                      <span className="text-[10px] text-[#525252] font-medium truncate max-w-[80px]">{user?.university || 'Student'}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-[#525252] hover:text-[#a3e635] transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-1.5 rounded-md text-[12px] font-medium text-[#a6a6a6] hover:text-white transition-all">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary shimmer">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#a6a6a6] hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 pt-3 pb-6 space-y-1" style={{ background: 'rgba(23,23,23,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/find-ride', label: 'Find a Ride' },
            { to: '/offer-ride', label: 'Offer a Ride', onClick: handleOfferRideClick },
            { to: '/environmental-impact', label: 'Environmental Impact' },
          ].map(({ to, label, onClick }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => { setMobileMenuOpen(false); if (onClick) onClick(e); }}
              className="block px-3 py-2 rounded-md text-[13px] font-medium text-[#a6a6a6] hover:text-white hover:bg-white/5 transition-all"
            >
              {label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-3 mt-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link to="/my-rides" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-[13px] font-medium text-[#a6a6a6] hover:text-white hover:bg-white/5">
                My Rides
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-[13px] font-medium text-[#a6a6a6] hover:text-white hover:bg-white/5">
                Profile
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2 rounded-md text-[13px] font-medium text-[#ef4444] hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 mt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2 rounded-md text-[13px] font-medium text-white" style={{ background: 'rgba(255,255,255,0.06)' }}>
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2 rounded-md text-[13px] font-semibold btn-primary shimmer">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

    </nav>
    <AuthRequiredModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
