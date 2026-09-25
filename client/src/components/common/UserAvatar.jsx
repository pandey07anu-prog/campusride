import React, { useState } from 'react';
import { User } from 'lucide-react';

const FAKE_UNSPLASH_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde';

export default function UserAvatar({ user, src, name, className = "w-10 h-10 rounded-xl" }) {
  const [imgError, setImgError] = useState(false);

  const rawName = typeof name === 'string' ? name : (typeof user?.fullName === 'string' ? user.fullName : 'Student');
  const fullName = rawName || 'Student';
  const rawSrc = src || user?.profileImage;

  // Check if image is missing or contains fake unsplash photo URL
  const isFake = !rawSrc || typeof rawSrc !== 'string' || rawSrc.includes(FAKE_UNSPLASH_URL) || rawSrc.trim() === '';

  // Extract initials (e.g. Aman Sharma -> AS)
  const initials = (typeof fullName === 'string' ? fullName : 'Student')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'S';

  if (!isFake && !imgError) {
    return (
      <img
        src={rawSrc}
        alt={fullName}
        className={`${className} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center font-bold text-sky-400 bg-slate-900 border border-slate-700/60 shadow-inner select-none uppercase shrink-0`}
      title={fullName}
    >
      {initials ? (
        <span className="tracking-wider">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-sky-400" />
      )}
    </div>
  );
}
