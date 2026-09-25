import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigation, Instagram, Linkedin, Send } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  return (
    <footer className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-8">
      <div className="pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Navigation className="w-3.5 h-3.5 text-[#a3e635]" />
              </div>
              <span className="font-archivo font-bold text-[14px]">CampusRide</span>
            </div>
            <p className="text-[#a6a6a6] font-medium text-[13px] leading-[1.6] max-w-[240px]">Verified campus carpooling that saves you money and time.</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-bold text-[12px] text-white mb-3">Rides</h4>
            <ul className="space-y-2">
              <li><Link to="/offer-ride" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Offer a Ride</Link></li>
              <li><Link to="/find-ride" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Find a Ride</Link></li>
              <li><Link to="/my-rides" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">My Rides</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-[12px] text-white mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/profile" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Profile</Link></li>
              <li><Link to="/notifications" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Notifications</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-bold text-[12px] text-white mb-3">Connect</h4>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/camp_usride?igsi=MTBtdDN5a2F1bmUyeg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-md flex items-center justify-center text-[#a6a6a6] hover:text-[#a3e635] transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <Instagram strokeWidth={1.5} className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[#a6a6a6] font-medium text-[12px]">&copy; {new Date().getFullYear()} CampusRide. All rights reserved.</p>
          <p className="text-[#a6a6a6] font-medium text-[12px]">Pan-India College Carpooling Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
