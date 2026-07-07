// src/services/seedData.js
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.js';

// Default Users
const DEFAULT_USERS = [
  {
    id: 'user_mp_1',
    username: 'mp@people.in',
    passwordHash: '5d7b4e8f3a6c9d1e2f8a4b3c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    role: 'mp',
    name: 'Shri Pratap Chandra Sarangi',
    phoneNumber: '+91 98765 43210'
  },
  {
    id: 'user_citizen_1',
    username: 'citizen@people.in',
    passwordHash: '5d7b4e8f3a6c9d1e2f8a4b3c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    role: 'citizen',
    name: 'Biswanath Mohanty',
    ward: 'Ward 7 - Somanathpur',
    phoneNumber: '+91 99112 23344'
  },
  {
    id: 'user_citizen_2',
    username: 'lopamudra@people.in',
    passwordHash: '5d7b4e8f3a6c9d1e2f8a4b3c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    role: 'citizen',
    name: 'Lopamudra Sahu',
    ward: 'Ward 12 - Gopalgaon',
    phoneNumber: '+91 98888 77777'
  },
  {
    id: 'user_citizen_3',
    username: 'rashmi@people.in',
    passwordHash: '5d7b4e8f3a6c9d1e2f8a4b3c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    role: 'citizen',
    name: 'Rashmi Ranjan Patra',
    ward: 'Ward 4 - Station Road',
    phoneNumber: '+91 94444 33333'
  }
];

// Default Complaints
const DEFAULT_COMPLAINTS = [
  {
    id: 'comp_1',
    entryNumber: 'WD-07 / 0042',
    title: 'Severe waterlogging near Somanathpur Industrial Estate',
    description: 'Every monsoon, the drainage system near Somanathpur Industrial Estate collapses, leaving knee-deep water for days. Small manufacturing units are suffering, sewage water is entering basements, and there is a high risk of dengue.',
    category: 'Drainage & Sewage',
    priority: 'HIGH',
    status: 'PENDING',
    ward: 'Ward 7 - Somanathpur',
    citizenId: 'user_citizen_1',
    citizenName: 'Biswanath Mohanty',
    date: '2026-06-20T10:30:00.000Z',
    upvotes: 45,
    upvotedBy: ['user_citizen_1', 'user_citizen_2', 'user_citizen_3'],
    aiSummary: 'Persistent drainage collapse near Somanathpur Industrial Estate',
    aiAnalysis: {
      urgencyScore: 9,
      estimatedImpact: 450,
      recommendedAction: 'Immediate desiltation of the main Somanathpur industrial drain line.',
      keyIssues: ['Clogged drainage lines', 'Industrial estate flooding']
    }
  },
  {
    id: 'comp_2',
    entryNumber: 'WD-12 / 0105',
    title: 'Unpaved road causing accidents on Gopalgaon bypass',
    description: 'Heavy transport vehicles have completely destroyed the link road. Massive potholes are causing small vehicles to skid daily.',
    category: 'Roads',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    ward: 'Ward 12 - Gopalgaon',
    citizenId: 'user_citizen_2',
    citizenName: 'Lopamudra Sahu',
    date: '2026-06-22T14:15:00.000Z',
    upvotes: 38,
    upvotedBy: ['user_citizen_2', 'user_citizen_1'],
    aiSummary: 'Severe pothole damage on Gopalgaon bypass',
    aiAnalysis: {
      urgencyScore: 8,
      estimatedImpact: 350,
      recommendedAction: 'Emergency asphalt patching of the 1.2km critical stretch.',
      keyIssues: ['Deep potholes', 'Missing streetlights']
    }
  },
  {
    id: 'comp_3',
    entryNumber: 'WD-04 / 0019',
    title: 'Overcrowded Govt High School classrooms near Station Road',
    description: 'Over 70 students packed into each classroom. Students sitting on the floor due to lack of benches.',
    category: 'Education',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    ward: 'Ward 4 - Station Road',
    citizenId: 'user_citizen_3',
    citizenName: 'Rashmi Ranjan Patra',
    date: '2026-05-15T09:00:00.000Z',
    upvotes: 62,
    upvotedBy: ['user_citizen_3', 'user_citizen_1', 'user_citizen_2'],
    resolutionDetails: 'Sanctioned ₹12 Lakhs from MPLAD funds. Construction of 2 additional classrooms commenced.',
    resolutionDate: '2026-06-15T12:00:00.000Z',
    aiSummary: 'Congested school classrooms near Station Road',
    aiAnalysis: {
      urgencyScore: 7,
      estimatedImpact: 140,
      recommendedAction: 'Sanction MPLAD funds for new classrooms.',
      keyIssues: ['Overcrowded classrooms', 'Lack of furniture']
    }
  },
  {
    id: 'comp_4',
    entryNumber: 'WD-02 / 0087',
    title: 'Absence of medical officer at Mallikashpur Primary Health Center',
    description: 'No permanent medical officer for the last 3 months. Patients travel 15km for basic medical consultation.',
    category: 'Healthcare',
    priority: 'HIGH',
    status: 'PENDING',
    ward: 'Ward 2 - Mallikashpur',
    citizenId: 'user_citizen_3',
    citizenName: 'Rashmi Ranjan Patra',
    date: '2026-07-02T08:45:00.000Z',
    upvotes: 54,
    upvotedBy: ['user_citizen_3', 'user_citizen_2'],
    aiSummary: 'No doctor at Mallikashpur PHC',
    aiAnalysis: {
      urgencyScore: 9,
      estimatedImpact: 800,
      recommendedAction: 'Deploy temporary rotating doctor twice a week.',
      keyIssues: ['Staff shortage', 'Healthcare access barrier']
    }
  }
];

// Default Schemes
const DEFAULT_SCHEMES = [
  {
    id: 'scheme_1',
    title: 'Ama Odisha Nabin Odisha - Balasore Smart Grid',
    description: 'State-backed developmental initiative transforming rural-urban infrastructure in Balasore Sadar.',
    targetAudience: 'Rural and semi-urban communities of Balasore Sadar',
    benefits: 'Upgradation of community halls, solar streetlights, and computer labs.',
    status: 'ACTIVE',
    date: '2026-01-10T00:00:00.000Z',
    budgetAllocated: '₹45,00,000',
    ministry: 'Panchayati Raj Department, Odisha'
  },
  {
    id: 'scheme_2',
    title: 'Biju Swasthya Kalyan Yojana (BSKY) Smart Card Desk',
    description: 'Setting up assistance counters to help citizens register for cashless health benefits.',
    targetAudience: 'BPL families across all 12 wards',
    benefits: 'Cashless hospital admissions up to ₹5 Lakhs per family',
    status: 'ACTIVE',
    date: '2026-03-15T00:00:00.000Z',
    budgetAllocated: '₹1,20,00,000',
    ministry: 'Health Department, Govt of Odisha'
  }
];

export async function seedDataIfEmpty() {
  try {
    console.log('🔍 Checking if database needs seeding...');
    
    const complaintsSnapshot = await getDocs(collection(db, 'complaints'));
    if (!complaintsSnapshot.empty) {
      console.log('✅ Database already has data. Skipping seed.');
      return;
    }
    
    console.log('📦 Seeding database...');
    
    for (const user of DEFAULT_USERS) {
      await setDoc(doc(db, 'users', user.id), user);
    }
    
    for (const complaint of DEFAULT_COMPLAINTS) {
      await setDoc(doc(db, 'complaints', complaint.id), complaint);
    }
    
    for (const scheme of DEFAULT_SCHEMES) {
      await setDoc(doc(db, 'schemes', scheme.id), scheme);
    }
    
    const counterData = {
      complaintCounter: {
        'Ward 7 - Somanathpur': 42,
        'Ward 12 - Gopalgaon': 105,
        'Ward 4 - Station Road': 19,
        'Ward 2 - Mallikashpur': 87
      }
    };
    await setDoc(doc(db, 'metadata', 'counters'), counterData);
    
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
}