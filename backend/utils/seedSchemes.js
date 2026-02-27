const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scheme = require('../models/Scheme');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const schemes = [
  {
    name: 'Ladli Laxmi Yojana',
    description: 'Ladli Laxmi Yojana is a flagship welfare scheme of the Madhya Pradesh government launched in 2007 to promote the birth and education of girl children, particularly from economically weaker sections. The scheme aims to change negative social attitudes towards girls, reduce female foeticide, improve sex ratio, enhance educational levels, and empower girls financially. Under this scheme, the government deposits Rs. 6,000 per year for 5 years (totalling Rs. 30,000) in National Savings Certificates in the girl\'s name, which matures over time. Scholarship amounts are additionally released at key educational milestones — Class 6, Class 9, Class 11, and Class 12 — to ensure continued schooling. On turning 21, the girl receives a lump-sum amount of Rs. 1,18,000 for higher education or marriage, provided she has passed Class 12 and is unmarried before 18. Over 45 lakh girls have benefited from this scheme since inception.',
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
    benefits: 'Total financial benefit of Rs. 1,18,000 disbursed in installments tied to educational milestones (Class 6, 9, 11, 12) and a final lump sum of Rs. 1,00,000 at age 21 for higher education/marriage. Scholarship of Rs. 2,000 at Class 6 enrolment, Rs. 4,000 at Class 9, Rs. 6,000 at Class 11, and Rs. 6,000 at Class 12. Promotes girl child education and reduces school drop-out rates.',
    applyUrl: 'https://ladlilaxmi.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Kisan Kalyan Yojana',
    description: 'Mukhyamantri Kisan Kalyan Yojana is a state-level agricultural support scheme launched by the Madhya Pradesh government to complement the Central Government\'s PM-KISAN scheme. The scheme provides additional direct income support of Rs. 4,000 per year (in two installments of Rs. 2,000 each) to registered farmers over and above the Rs. 6,000/year provided under PM-KISAN, effectively making the total support Rs. 10,000 per year per farmer family. The scheme targets all small and marginal farmers who own cultivable land in Madhya Pradesh and are registered in the PM-KISAN database. Funds are transferred directly to the farmer\'s bank account via Direct Benefit Transfer (DBT), eliminating middlemen. As of 2024, over 80 lakh farmers in Madhya Pradesh have benefited from this scheme. The state also provides financial support in case of crop loss due to natural calamities through linked relief programs.',
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
    benefits: 'Rs. 4,000 per year in two equal installments of Rs. 2,000 each directly credited to bank account via DBT. Combined with PM-KISAN, total annual support becomes Rs. 10,000 per farmer family. Linked relief available during crop failure due to natural disasters.',
    applyUrl: 'https://pmkisan.gov.in/',
    isActive: true
  },
  {
    name: 'Sambal Yojana (Unorganized Workers)',
    description: 'Sambal Yojana, officially the Mukhyamantri Jan Kalyan (Sambal) Yojana, is a comprehensive social security scheme for unorganized sector workers in Madhya Pradesh. Launched in 2018, it provides a safety net covering multiple life events — from birth to death. The scheme covers daily wage labourers, domestic workers, street vendors, auto-rickshaw drivers, self-employed individuals, and other informally employed workers with annual household income up to Rs. 12,000. Key benefits include antim sanskar (last rites) assistance, accident insurance, education support for children, and maternity support for women workers. Registered workers and their families also get free electricity (up to 100 units/month) and preferential admission in government hospitals. The scheme is registered through Samagra ID and Aadhaar linkage, making enrollment seamless via Gram Panchayats and Jan Seva Kendras.',
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
    benefits: 'Accidental death/disability insurance of Rs. 4 lakh; maternity benefit of Rs. 16,000; education assistance up to Rs. 8,000 per year per child; last rites support of Rs. 5,000; free electricity up to 100 units/month; preferential healthcare access.',
    applyUrl: 'https://sambal.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Medhavi Vidyarthi Yojana',
    description: 'Mukhyamantri Medhavi Vidyarthi Yojana (MMVY) is a merit-cum-means scholarship scheme launched by the Government of Madhya Pradesh in 2017 to support academically bright students from financially weaker backgrounds in pursuing higher education. Under this scheme, students who score 70% or above in Class 12 (CBSE/ICSE) or 85% and above in MPBSE are eligible for full tuition fee waivers at government and select private colleges and universities. The scheme covers graduation, post-graduation, professional courses like MBBS, B.E., B.Tech, and law. Fees are directly paid to the institution on behalf of the student. This eliminates the risk of dropout due to financial constraints and promotes meritocracy in the state\'s education system. Students are required to maintain minimum grade thresholds each year for continued benefit.',
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
    benefits: 'Full tuition fee waiver paid directly to institution for UG/PG/professional courses (MBBS, B.E., B.Tech, Law). Covers admission fees, tuition fees, and development fees. Annual renewal subject to academic performance.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'Indira Gandhi National Old Age Pension Scheme',
    description: 'The Indira Gandhi National Old Age Pension Scheme (IGNOAPS) is a centrally-sponsored social pension scheme administered in Madhya Pradesh under the National Social Assistance Programme (NSAP). It provides monthly financial assistance to elderly citizens aged 60 and above who belong to Below Poverty Line (BPL) households or have little to no regular income. The scheme was significantly enhanced in Madhya Pradesh under the Mukhyamantri Pension Yojana umbrella, which merged multiple pension programs into a single, unified platform. Pension is disbursed monthly via Direct Benefit Transfer to beneficiary accounts linked to Aadhaar. The state government adds its own top-up amount over the Central contribution. Eligible applicants can register at the nearest Gram Panchayat, Ward Office, or online through the MP Samagra portal.',
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
    benefits: 'Monthly pension of Rs. 300 (60–79 years) and Rs. 500 (80+ years) from Central Government, plus additional state contribution. Total monthly payout ranges from Rs. 600 to Rs. 1,000 depending on age and state top-up. Paid directly to bank account every month.',
    applyUrl: 'https://socialsecurity.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Tirth Darshan Yojana',
    description: 'Mukhyamantri Tirth Darshan Yojana is a unique pilgrimage welfare scheme exclusively for senior citizens of Madhya Pradesh aged 60 and above. Launched in 2012, the scheme enables elderly citizens from economically weaker sections to undertake free pilgrimage tours to major religious destinations across India — including Varanasi, Ayodhya, Tirupati, Shirdi, Amritsar (Golden Temple), Velankanni, Char Dham, and more. The Government of MP arranges dedicated trains (Tirth Darshan Express), providing free rail travel, accommodation, food, and escort services. Medical personnel accompany each group for on-trip health support. Each beneficiary is allowed to take one companion (spouse or caretaker) at a 50% concession. The scheme is managed through the MP Dharmasva Vibhag and applications are accepted through Gram Panchayats and Urban Local Bodies.',
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
    benefits: 'Completely free pilgrimage tour including train travel (Tirth Darshan Express), accommodation, meals, and on-trip medical support. Covers 15+ major religious destinations across India. One companion (spouse/caretaker) allowed at 50% concession. No income limit — open to all senior citizens of MP.',
    applyUrl: 'https://www.mpinfo.org/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Kanya Vivah Yojana',
    description: 'Mukhyamantri Kanya Vivah Yojana is a state-sponsored scheme by the Government of Madhya Pradesh to provide financial and material assistance for the marriage of girls from poor, BPL, or economically weaker families. Launched with the aim to reduce the burden of marriage expenses on low-income families and discourage the practice of dowry, the scheme provides a total assistance package of Rs. 51,000 per girl. The amount includes cash deposited in the bride\'s bank account, household items, and other gifts presented at mass marriage events (Mukhyamantri Samuhik Vivah Samaroh) organized by local bodies and Gram Panchayats. The bride must be a minimum of 18 years old and the groom at least 21 years old. The scheme has also been extended to widows and abandoned women wishing to remarry. Over 2.5 lakh women have benefited since the scheme\'s launch.',
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
    benefits: 'Total assistance of Rs. 51,000 per girl: Rs. 43,000 in household items/gifts, Rs. 5,000 cash deposited in bride\'s bank account, and Rs. 3,000 for mass marriage ceremony expenses. Widows and abandoned women also eligible for remarriage assistance.',
    applyUrl: 'https://mpvivahportal.nic.in/',
    isActive: true
  },
  {
    name: 'Bal Ashirwad Yojana',
    description: 'Bal Ashirwad Yojana is a Madhya Pradesh government welfare scheme designed to support children who have lost both parents (orphans) or whose parents are unable to care for them due to extreme poverty or disability. The scheme provides monthly financial assistance, skill training support, and educational facilities for beneficiary children up to the age of 18. Children in the 6–18 age group living in Child Care Institutions (CCIs) or with relatives/foster families are eligible. The scheme was revamped in 2022, increasing the monthly assistance and adding an aftercare component for youth aged 18–21 who have just left state care, helping them transition into self-sufficient adults with vocational training support and a one-time startup grant.',
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
    benefits: 'Monthly financial assistance of Rs. 1,500–2,000 for orphan children aged 0–18. Post-18 aftercare support: one-time vocational training grant of Rs. 5,000 and startup assistance of Rs. 1,00,000 for youth aged 18–21. Free enrollment in government schools and hostels.',
    applyUrl: 'https://www.mpinfo.org/',
    isActive: true
  },
  {
    name: 'Ayushman Bharat - Mahatma Gandhi Swasthya Bima Yojana',
    description: 'Ayushman Bharat – Mahatma Gandhi Swasthya Bima Yojana (AB-MGSBY) is the Madhya Pradesh implementation of the national PM-JAY health insurance scheme, merged with the state\'s Mukhyamantri Swasthya Bima Yojana. This mega health scheme provides free secondary and tertiary healthcare coverage to eligible families through a network of empanelled government and private hospitals across the state and the country. Each registered family is covered for up to Rs. 5 lakh per year for hospitalisation, surgeries, ICU care, day-care procedures, and follow-up. Coverage is cashless and paperless — beneficiaries simply show their Aadhaar card or Ayushman card at any empanelled hospital. As of 2024, over 1,200 hospitals in MP are empanelled, and more than 1,500 benefit packages covering cancer, heart disease, organ transplants, orthopaedic care, and more are available under the scheme.',
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
    benefits: 'Cashless health insurance of up to Rs. 5 lakh per family per year at 1,200+ empanelled hospitals. Covers 1,500+ medical packages including cancer treatment, cardiac surgery, organ transplant, dialysis, and maternity care. Pre-existing conditions covered from day one. No premium to be paid by the beneficiary.',
    applyUrl: 'https://ayushmanbharat.mp.gov.in/',
    isActive: true
  },
  {
    name: 'Gaon Ki Beti Yojana',
    description: 'Gaon Ki Beti Yojana is a targeted scholarship scheme by the Government of Madhya Pradesh specifically designed to encourage girl students from rural areas to pursue higher education. The scheme recognises that girls in villages often discontinue education after Class 12 due to financial and cultural barriers. Under this scheme, any girl student who passes Class 12 from a village (as registered in Samagra) and secures 60% or above marks is eligible for a monthly scholarship of Rs. 500 for 10 months per year throughout her undergraduate education. The scholarship is credited directly to the student\'s bank account. The scheme is linked with the Higher Education Department\'s scholarship portal and can be applied for online. It has been a crucial enabler for thousands of first-generation rural women to access college education.',
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
    benefits: 'Monthly scholarship of Rs. 500 for 10 months per academic year (Rs. 5,000/year) credited directly to bank account. Available throughout undergraduate education for rural girls scoring 60%+ in Class 12. Can be availed alongside other non-overlapping scholarships.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'SC/ST Scholarship Scheme',
    description: 'The SC/ST Post-Matric Scholarship Scheme is a flagship welfare initiative of the Government of India and Madhya Pradesh to support students from Scheduled Caste (SC) and Scheduled Tribe (ST) communities in pursuing post-matriculation (Class 11 onwards) education. The scheme covers course fees, maintenance allowance, and study expenses for students enrolled in government, aided, or recognised private institutions across a wide range of disciplines — from diploma courses and B.Ed to engineering, medical, and doctorate programs. Madhya Pradesh has one of the highest SC/ST scholarship disbursements in India. Amounts vary by course type, institution level, and whether the student is a day scholar or hosteller. The scheme is administered through the MP Tribes Finance Development Corporation and SC Welfare Department.',
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
    benefits: 'Maintenance allowance: Rs. 380–1,200/month (day scholar) and Rs. 550–1,500/month (hosteller) based on course. Full tuition and course fees reimbursed. Study tour, thesis, and dissertation charges covered. Ad hoc allowance for books and stationery.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'OBC Scholarship Scheme',
    description: 'The OBC Post-Matric Scholarship Scheme is a government initiative to ensure that students from Other Backward Classes (OBC) in Madhya Pradesh are not denied higher education due to financial constraints. The scheme provides maintenance allowance, tuition fees, and miscellaneous study-related financial support for OBC students enrolled in post-matric (Class 11 and above) courses in government and approved private educational institutions. Annual family income must be below Rs. 1,00,000 to be eligible. The scheme is applied for online through the MP Scholarship Portal, and disbursement is done via DBT directly to student bank accounts after document verification by the district welfare office. Students can benefit from this scheme alongside other schemes as long as the total does not exceed prescribed limits.',
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
    benefits: 'Maintenance allowance up to Rs. 1,000/month; full tuition fees reimbursed for courses in government institutions; partial fee reimbursement for approved private colleges. Annual disbursement directly to bank account. Renewable each year subject to academic progress.',
    applyUrl: 'https://scholarshipportal.mp.nic.in/',
    isActive: true
  },
  {
    name: 'Pradhan Mantri Matru Vandana Yojana',
    description: 'Pradhan Mantri Matru Vandana Yojana (PMMVY) is a maternity benefit programme under the National Food Security Act, implemented across Madhya Pradesh by the Women & Child Development Department. The scheme provides direct cash incentives to pregnant and lactating women to compensate for wage loss during pregnancy and to meet enhanced nutritional needs. It is available to all pregnant women for their first live birth in the family. The cash is disbursed in three installments tied to specific health benchmarks — registration of pregnancy, ante-natal check-up, and immunisation of the newborn. In MP, PMMVY is also linked with the Janani Suraksha Yojana (JSY) and the PM Poshan scheme, creating a holistic maternal and child nutrition support system. The scheme strongly encourages institutional delivery and vaccination coverage.',
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
    benefits: 'Cash incentive of Rs. 5,000 in 3 installments: Rs. 1,000 on pregnancy registration, Rs. 2,000 after first ante-natal check-up, Rs. 2,000 after childbirth and first vaccination cycle. Additional Rs. 1,000 available for those who deliver at government hospitals (via JSY). Total potential benefit: Rs. 6,000.',
    applyUrl: 'https://pmmvy-cas.nic.in/',
    isActive: true
  },
  {
    name: 'Mukhyamantri Solar Pump Yojana',
    description: 'Mukhyamantri Solar Pump Yojana is a state government initiative under the MP New & Renewable Energy Department aimed at providing irrigation support to farmers through solar-powered water pumps. Launched to reduce dependence on expensive electricity and diesel for irrigation, the scheme offers 90% subsidy on the installation of solar pumps ranging from 1 HP to 10 HP capacity, with the remaining 10% borne by the farmer (further reduced to 5% for SC/ST farmers). The scheme is especially beneficial for farmers in areas with unreliable electricity supply. Applications are registered online, and solar pumps are installed by empanelled vendors. The scheme not only reduces the cost of irrigation but also provides clean energy, reduces CO2 emissions, and improves crop yield through reliable water supply. Over 1.5 lakh solar pumps have been installed across MP under this scheme.',
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
    benefits: '90% subsidy on solar pump installation (5 HP: up to Rs. 2.5 lakh subsidy; 7.5 HP: up to Rs. 3.5 lakh). SC/ST farmers pay only 5% of cost. Available in 1 HP, 2 HP, 3 HP, 5 HP, 7.5 HP, and 10 HP variants. Reduces electricity bill to zero. 5-year maintenance warranty by vendor.',
    applyUrl: 'https://www.mpagrisnet.gov.in/',
    isActive: true
  },
  {
    name: 'Chief Minister Self Employment Scheme',
    description: 'The Chief Minister Self Employment Scheme (Mukhyamantri Swarozgar Yojana) is a flagship employment generation programme of the Government of Madhya Pradesh targeting unemployed youth, artisans, and small entrepreneurs from all communities. The scheme aims to reduce unemployment by providing concessional bank loans coupled with government interest subsidies and margin money support for setting up small businesses, manufacturing units, or service enterprises. Eligible applicants can avail loans ranging from Rs. 50,000 to Rs. 10 lakh for general category and up to Rs. 25 lakh for SC/ST/OBC, women, and specially-abled applicants. The scheme is administered through the MP State Co-operative Scheduled Caste Finance & Development Corporation and district industry centres. Loan linkage is through nationalised and co-operative banks, and the interested subsidy reduces the effective cost of borrowing significantly.',
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
    benefits: 'Loans from Rs. 50,000 to Rs. 25 lakh at concessional interest rates. Interest subsidy of 5% for general category and 6% for SC/ST/OBC/Women/Divyang applicants. Margin money (capital subsidy) up to 15–30% of project cost. No collateral required for loans up to Rs. 1 lakh.',
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
