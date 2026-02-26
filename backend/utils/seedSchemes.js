const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('../models/Scheme');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const schemes = [
  {
    name: 'Ladli Laxmi Yojana',
    description: 'Financial assistance scheme for girl child education and welfare in Madhya Pradesh.',
    department: 'Women & Child Development',
    eligibility: {
      ageMin: 0,
      ageMax: 21,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['Female'],
      occupations: ['All']
    },
    requiredDocuments: ['Birth Certificate', 'Aadhaar Card', 'Bank Passbook', 'Domicile Certificate'],
    lifeEvents: ['New Child', 'Student'],
    benefits: 'Financial assistance of Rs. 1,18,000 in installments for girl child education and marriage.',
    applyUrl: 'https://ladlilaxmi.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Kisan Kalyan Yojana',
    description: 'Financial assistance to farmers in Madhya Pradesh.',
    department: 'Agriculture',
    eligibility: {
      ageMin: 18,
      ageMax: 120,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Farmer']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Documents', 'Bank Passbook'],
    lifeEvents: ['Farmer'],
    benefits: 'Financial assistance of Rs. 4,000 per year to farmers.',
    applyUrl: 'https://pmkisan.gov.in/',
    isActive: true
  },
  {
    name: 'Sambal Yojana (Unorganized Workers)',
    description: 'Social security scheme for unorganized workers in Madhya Pradesh.',
    department: 'Labour',
    eligibility: {
      ageMin: 18,
      ageMax: 60,
      incomeMax: 12000,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Unemployed', 'Self-Employed', 'Other']
    },
    requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'Bank Passbook', 'BPL Card'],
    lifeEvents: ['General'],
    benefits: 'Accident insurance, education assistance, and maternity benefits.',
    applyUrl: 'https://sambal.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Medhavi Vidyarthi Yojana',
    description: 'Scholarship scheme for meritorious students in Madhya Pradesh.',
    department: 'Education',
    eligibility: {
      ageMin: 15,
      ageMax: 25,
      incomeMax: 600000,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Student']
    },
    requiredDocuments: ['Aadhaar Card', 'Educational Certificate', 'Income Certificate', 'Domicile Certificate'],
    lifeEvents: ['Student'],
    benefits: 'Full tuition fee waiver for higher education.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'Indira Gandhi National Old Age Pension Scheme',
    description: 'Monthly pension for senior citizens in Madhya Pradesh.',
    department: 'Social Welfare',
    eligibility: {
      ageMin: 60,
      ageMax: 120,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Retired', 'Unemployed', 'Other']
    },
    requiredDocuments: ['Aadhaar Card', 'Age Proof', 'Bank Passbook', 'Income Certificate'],
    lifeEvents: ['Senior Citizen'],
    benefits: 'Monthly pension of Rs. 300-500 based on age.',
    applyUrl: 'https://socialsecurity.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Tirth Darshan Yojana',
    description: 'Free pilgrimage tour for senior citizens of Madhya Pradesh.',
    department: 'Social Welfare',
    eligibility: {
      ageMin: 60,
      ageMax: 120,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['All']
    },
    requiredDocuments: ['Aadhaar Card', 'Age Proof', 'Domicile Certificate'],
    lifeEvents: ['Senior Citizen'],
    benefits: 'Free pilgrimage tour to religious places across India.',
    applyUrl: 'https://www.mpinfo.org/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Kanya Vivah Yojana',
    description: 'Financial assistance for marriage of girls from poor families.',
    department: 'Women & Child Development',
    eligibility: {
      ageMin: 18,
      ageMax: 40,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['Female'],
      occupations: ['All']
    },
    requiredDocuments: ['Aadhaar Card', 'Age Proof', 'Income Certificate', 'BPL Card'],
    lifeEvents: ['Marriage'],
    benefits: 'Financial assistance of Rs. 51,000 for marriage expenses.',
    applyUrl: 'https://mpvivahportal.nic.in/',
    isActive: true
  },
  {
    name: 'Bal Ashirwad Yojana',
    description: 'Support scheme for orphan children in Madhya Pradesh.',
    department: 'Women & Child Development',
    eligibility: {
      ageMin: 0,
      ageMax: 18,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Student']
    },
    requiredDocuments: ['Birth Certificate', 'Death Certificate', 'Aadhaar Card'],
    lifeEvents: ['New Child', 'Student'],
    benefits: 'Financial assistance and skill development training for orphan children.',
    applyUrl: 'https://www.mpinfo.org/',
    isActive: true
  },
  {
    name: 'Ayushman Bharat - Mahatma Gandhi Swasthya Bima Yojana',
    description: 'Health insurance scheme for all citizens of Madhya Pradesh.',
    department: 'Health',
    eligibility: {
      ageMin: 0,
      ageMax: 120,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['All']
    },
    requiredDocuments: ['Aadhaar Card', 'Samagra ID', 'Ration Card'],
    lifeEvents: ['Medical Emergency', 'General'],
    benefits: 'Free health insurance coverage up to Rs. 5 lakhs per family per year.',
    applyUrl: 'https://ayushmanbharat.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Gaon Ki Beti Yojana',
    description: 'Scholarship scheme for rural girl students in Madhya Pradesh.',
    department: 'Education',
    eligibility: {
      ageMin: 15,
      ageMax: 25,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['Female'],
      occupations: ['Student']
    },
    requiredDocuments: ['Aadhaar Card', 'Educational Certificate', 'Domicile Certificate', 'Bank Passbook'],
    lifeEvents: ['Student'],
    benefits: 'Scholarship of Rs. 500 per month for 10 months.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'SC/ST Scholarship Scheme',
    description: 'Post-matric scholarship for SC/ST students.',
    department: 'Social Welfare',
    eligibility: {
      ageMin: 15,
      ageMax: 30,
      incomeMax: 250000,
      casteCategories: ['SC', 'ST'],
      gender: ['All'],
      occupations: ['Student']
    },
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Educational Certificate', 'Income Certificate', 'Bank Passbook'],
    lifeEvents: ['Student'],
    benefits: 'Financial assistance for post-matric education.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'OBC Scholarship Scheme',
    description: 'Post-matric scholarship for OBC students.',
    department: 'Social Welfare',
    eligibility: {
      ageMin: 15,
      ageMax: 30,
      incomeMax: 100000,
      casteCategories: ['OBC'],
      gender: ['All'],
      occupations: ['Student']
    },
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Educational Certificate', 'Income Certificate', 'Bank Passbook'],
    lifeEvents: ['Student'],
    benefits: 'Financial assistance for post-matric education.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'Pradhan Mantri Matru Vandana Yojana',
    description: 'Maternity benefit scheme for pregnant and lactating women.',
    department: 'Women & Child Development',
    eligibility: {
      ageMin: 18,
      ageMax: 45,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['Female'],
      occupations: ['All']
    },
    requiredDocuments: ['Aadhaar Card', 'Bank Passbook', 'Pregnancy Certificate'],
    lifeEvents: ['New Child'],
    benefits: 'Cash incentive of Rs. 5,000 in three installments.',
    applyUrl: 'https://pmmvy-cas.nic.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Solar Pump Yojana',
    description: 'Subsidy scheme for solar pumps for farmers.',
    department: 'Agriculture',
    eligibility: {
      ageMin: 18,
      ageMax: 120,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Farmer']
    },
    requiredDocuments: ['Aadhaar Card', 'Land Documents', 'Bank Passbook'],
    lifeEvents: ['Farmer'],
    benefits: '90% subsidy on solar pump installation.',
    applyUrl: 'https://www.mpagrisnet.gov.in/',
    isActive: true
  },
  {
    name: 'Chief Minister Self Employment Scheme',
    description: 'Interest subsidy scheme for self-employment.',
    department: 'Rural Development',
    eligibility: {
      ageMin: 18,
      ageMax: 45,
      incomeMax: null,
      casteCategories: ['All'],
      gender: ['All'],
      occupations: ['Unemployed', 'Self-Employed']
    },
    requiredDocuments: ['Aadhaar Card', 'Domicile Certificate', 'Educational Certificate', 'Bank Passbook'],
    lifeEvents: ['General'],
    benefits: 'Interest subsidy on loans for self-employment projects.',
    applyUrl: 'https://msme.mponline.gov.in/',
    isActive: true
  }
];

const seedSchemes = async () => {
  try {
    await Scheme.deleteMany();
    await Scheme.insertMany(schemes);
    console.log('Schemes seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding schemes:', error);
    process.exit(1);
  }
};

seedSchemes();
