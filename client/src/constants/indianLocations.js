import { INDIAN_UNIVERSITIES } from './indianUniversities';

export const POPULAR_INDIAN_LOCATIONS = [
  // Chitkara University Campuses & Gates (Primary user base)
  { name: 'Chitkara University (Main Campus), Rajpura - Chandigarh Highway, Punjab', type: 'campus' },
  { name: 'Chitkara University Gate 1 (Main Entrance), Rajpura, Punjab', type: 'campus' },
  { name: 'Chitkara University Gate 2 (Hostel & Sports Complex), Rajpura', type: 'campus' },
  { name: 'Chitkara University (Himachal Campus), Atal Shiksha Kunj, Baddi, HP', type: 'campus' },
  { name: 'Chitkara International School, Sector 25, Chandigarh', type: 'campus' },
  { name: 'Chitkara Innovation Incubator, MDC Sector 4, Panchkula', type: 'campus' },

  // Tri-City & Punjab / Haryana Student Hotspots
  { name: 'Sector 17 ISBT (Bus Stand), Chandigarh', type: 'transit' },
  { name: 'Sector 43 ISBT (Interstate Bus Stand), Chandigarh', type: 'transit' },
  { name: 'Sector 35 Market (Inner Circle), Chandigarh', type: 'place' },
  { name: 'Sector 22 Market / Aroma Chowk, Chandigarh', type: 'place' },
  { name: 'Panjab University (PU) Student Centre (Stu-C), Sector 14, Chandigarh', type: 'campus' },
  { name: 'PEC University of Technology Main Gate, Sector 12, Chandigarh', type: 'campus' },
  { name: 'Chandigarh Railway Station, Daria, Chandigarh', type: 'transit' },
  { name: 'Shaheed Bhagat Singh International Airport, Mohali, Chandigarh', type: 'transit' },
  { name: 'Mohali Phase 7 (Phase VII Market), Mohali, Punjab', type: 'place' },
  { name: 'Mohali Phase 3B2 Market (Food Street), Mohali, Punjab', type: 'place' },
  { name: 'Chandigarh University (CU) Main Gate, NH-05, Gharuan, Mohali', type: 'campus' },
  { name: 'CGC Landran Campus Main Gate, Landran - Sirhind Road, Mohali', type: 'campus' },
  { name: 'CGC Jhanjeri Campus, Mohali, Punjab', type: 'campus' },
  { name: 'IISER Mohali Main Gate, Sector 81, Knowledge City, Mohali', type: 'campus' },
  { name: 'Thapar University (TIET) Main Gate, Bhadson Road, Patiala', type: 'campus' },
  { name: 'Punjabi University Main Campus, Patiala, Punjab', type: 'campus' },
  { name: 'Rajpura Junction Railway Station, Rajpura, Punjab', type: 'transit' },
  { name: 'Liberty Chowk / Eagle Motel, Rajpura, Punjab', type: 'place' },
  { name: 'Ambala Cantt Railway Station (Junction), Ambala, Haryana', type: 'transit' },
  { name: 'Ambala City Bus Stand, Ambala, Haryana', type: 'transit' },
  { name: 'Zirakpur VIP Road / Decathlon Chowk, Zirakpur, Punjab', type: 'place' },
  { name: 'Panchkula Sector 5 / Majri Chowk, Panchkula, Haryana', type: 'place' },
  { name: 'LPU Main Gate (Lovely Professional University), GT Road, Phagwara, Punjab', type: 'campus' },
  { name: 'NIT Jalandhar Main Gate, GT Road, Jalandhar, Punjab', type: 'campus' },
  { name: 'IIT Ropar Main Campus, Rupnagar, Punjab', type: 'campus' },

  // Delhi NCR Hubs & Universities
  { name: 'Delhi University North Campus (Vishwa Vidyalaya Metro), Delhi', type: 'campus' },
  { name: 'Delhi University South Campus (Durgabai Deshmukh Metro), New Delhi', type: 'campus' },
  { name: 'IIT Delhi Main Gate, Hauz Khas, New Delhi', type: 'campus' },
  { name: 'DTU (Delhi Technological University) Main Gate, Bawana Road, Shahbad Daulatpur, Delhi', type: 'campus' },
  { name: 'NSUT (Netaji Subhas University of Technology), Dwarka Sector 3, New Delhi', type: 'campus' },
  { name: 'IIIT Delhi, Okhla Industrial Estate Phase III, New Delhi', type: 'campus' },
  { name: 'Connaught Place (Rajiv Chowk Metro), Central Delhi', type: 'transit' },
  { name: 'Kashmere Gate ISBT, Mori Gate, Delhi', type: 'transit' },
  { name: 'Cyber Hub / DLF Cyber City, Phase 2, Gurugram, Haryana', type: 'place' },
  { name: 'Huda City Centre (Millennium City Centre Metro), Gurugram', type: 'transit' },
  { name: 'Amity University Noida Gate 2, Sector 125, Noida, UP', type: 'campus' },
  { name: 'Noida Electronic City Metro / Sector 62, Noida, UP', type: 'transit' },
  { name: 'Knowledge Park II & III (Colleges Hub), Greater Noida, UP', type: 'place' },
  { name: 'Shiv Nadar University, Dadri, Greater Noida, UP', type: 'campus' },

  // Bengaluru Hubs & Campuses
  { name: 'IISc Bengaluru Main Gate, CV Raman Road, Bengaluru', type: 'campus' },
  { name: 'IIM Bangalore Main Gate, Bannerghatta Road, Bengaluru', type: 'campus' },
  { name: 'PES University, Ring Road Campus, Banashankari, Bengaluru', type: 'campus' },
  { name: 'RV College of Engineering (RVCE), Mysore Road, Bengaluru', type: 'campus' },
  { name: 'BMS College of Engineering, Basavanagudi, Bengaluru', type: 'campus' },
  { name: 'Koramangala Sony World Signal / 5th Block, Bengaluru', type: 'place' },
  { name: 'Indiranagar 100ft Road / Metro Station, Bengaluru', type: 'place' },
  { name: 'Electronic City Toll Gate / Infosys Campus, Bengaluru', type: 'place' },
  { name: 'Whitefield ITPL Main Gate, Whitefield, Bengaluru', type: 'place' },
  { name: 'HSR Layout BDA Complex, Bengaluru', type: 'place' },
  { name: 'Majestic KSR Bengaluru City Railway Station, Bengaluru', type: 'transit' },

  // Mumbai & Pune Hubs
  { name: 'IIT Bombay Main Gate, Powai, Mumbai, Maharashtra', type: 'campus' },
  { name: 'ICT Mumbai / VJTI Main Gate, Matunga, Mumbai', type: 'campus' },
  { name: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra', type: 'place' },
  { name: 'Andheri Metro / Railway Station, Mumbai, Maharashtra', type: 'transit' },
  { name: 'COEP Technological University, Shivajinagar, Pune', type: 'campus' },
  { name: 'Symbiosis International University (SIU), Lavale, Pune', type: 'campus' },
  { name: 'MIT World Peace University (MIT-WPU), Kothrud, Pune', type: 'campus' },
  { name: 'Hinjewadi Phase 1 / Shivaji Chowk, Pune, Maharashtra', type: 'place' },
  { name: 'Viman Nagar / Phoenix Marketcity, Pune, Maharashtra', type: 'place' },
  { name: 'Pune Junction Railway Station, Agarkar Nagar, Pune', type: 'transit' },

  // Hyderabad Hubs
  { name: 'IIIT Hyderabad Main Gate, Gachibowli, Hyderabad', type: 'campus' },
  { name: 'IIT Hyderabad (IITH) Kandi Campus, Sangareddy, Telangana', type: 'campus' },
  { name: 'University of Hyderabad (HCU), Gachibowli, Hyderabad', type: 'campus' },
  { name: 'BITS Pilani Hyderabad Campus, Shameerpet, Hyderabad', type: 'campus' },
  { name: 'Hitec City Cyber Towers / Mindspace, Madhapur, Hyderabad', type: 'place' },
  { name: 'Gachibowli Stadium / Flyover, Hyderabad, Telangana', type: 'place' },
  { name: 'Secunderabad Railway Station, Secunderabad, Telangana', type: 'transit' },

  // Chennai & Tamil Nadu
  { name: 'IIT Madras Main Gate, Sardar Patel Road, Adyar, Chennai', type: 'campus' },
  { name: 'Anna University Main Campus, Guindy, Chennai', type: 'campus' },
  { name: 'VIT Chennai Campus, Vandalur-Kelambakkam Road, Chennai', type: 'campus' },
  { name: 'SRM Institute of Science and Technology (SRM IST), Kattankulathur, Chennai', type: 'campus' },
  { name: 'VIT Vellore Main Campus, Katpadi, Vellore, Tamil Nadu', type: 'campus' },
  { name: 'NIT Trichy Main Gate, Thuvakudi, Tiruchirappalli', type: 'campus' },
  { name: 'Chennai Central (MAS) Railway Station, Chennai', type: 'transit' },

  // Rajasthan & North/Central Hubs
  { name: 'BITS Pilani Main Campus, Vidya Vihar, Pilani, Rajasthan', type: 'campus' },
  { name: 'MNIT Jaipur Main Gate, Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur', type: 'campus' },
  { name: 'IIT Roorkee Main Gate, Roorkee, Uttarakhand', type: 'campus' },
  { name: 'IIT Kanpur Main Gate, Kalyanpur, Kanpur, UP', type: 'campus' },
  { name: 'IIT Kharagpur Main Gate, Kharagpur, West Bengal', type: 'campus' },
  { name: 'Jadavpur University Main Campus, Kolkata, West Bengal', type: 'campus' },
  { name: 'IIT BHU Main Gate, Banaras Hindu University, Varanasi, UP', type: 'campus' },
  { name: 'MANIT Bhopal Main Gate, Link Road No. 3, Bhopal, MP', type: 'campus' },
];

// Add all indian universities to the searchable index
INDIAN_UNIVERSITIES.forEach((uni) => {
  if (!POPULAR_INDIAN_LOCATIONS.some((loc) => loc.name.toLowerCase().includes(uni.toLowerCase()))) {
    POPULAR_INDIAN_LOCATIONS.push({
      name: `${uni} Main Campus`,
      type: 'campus',
    });
  }
});
