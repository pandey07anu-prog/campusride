import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import GenderSelectionModal from '../components/common/GenderSelectionModal';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#171717] text-[#f5f5f5] font-sans relative">
      <Navbar />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-10 py-8 relative">
        {children}
      </main>
      <Footer />
      <GenderSelectionModal />
    </div>
  );
};

export default MainLayout;
