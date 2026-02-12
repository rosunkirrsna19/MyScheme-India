const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const User = require('./models/User');
const Scheme = require('./models/Scheme');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const SavedScheme = require('./models/SavedScheme');

// --- Helper Data ---
// Heavily biased towards Tamil Nadu as requested
const states = [
  'Tamil Nadu', 'Tamil Nadu', 'Tamil Nadu', 'Tamil Nadu', 'Tamil Nadu',
  'Maharashtra', 'Karnataka', 'Delhi', 'West Bengal', 'Kerala', 'Rajasthan', 'Gujarat'
];
const categories = ['General', 'OBC', 'SC', 'ST'];
const occupations = ['Student', 'Salaried', 'Self-Employed', 'Unemployed', 'Other'];
const genders = ['Male', 'Female'];
const deptsGovt = ['Ministry of Finance', 'Ministry of MSME', 'Ministry of Health', 'Govt. of Tamil Nadu', 'Ministry of Education', 'Ministry of Agriculture'];
const deptsPrivate = ['Private Trust', 'Empower Foundation', 'Tech for Good NGO', 'TNEF (Tamil Nadu Edu Foundation)', 'Chennai Health Initiative', 'Coimbatore Rural Trust'];

// Helper function to get a random item
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Main Seeder Function ---
const importData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeder...'.cyan);

    // 1. --- Clear All Existing Data ---
    await Application.deleteMany();
    await Notification.deleteMany();
    await SavedScheme.deleteMany();
    await Scheme.deleteMany();
    await User.deleteMany();
    console.log('Data Cleared...'.yellow);

    // 2. --- Create Users (56 total) ---
    const admin = new User({
      username: 'Admin User',
      email: 'admin@myscheme.com',
      password: 'admin123',
      role: 'Admin',
      profile: { firstName: 'Admin', lastName: 'User', age: 40, state: 'Delhi', gender: 'Female' },
    });
    await admin.save();

    const coordinators = [];
    for (let i = 1; i <= 5; i++) {
      const coord = new User({
        username: `Coordinator ${i}`,
        email: `coord${i}@myscheme.com`,
        password: 'coordinator123',
        role: 'Coordinator',
        profile: { firstName: `Coord`, lastName: `${i}`, age: 30 + i, state: randomItem(states), gender: (i % 2 === 0) ? 'Male' : 'Female' },
      });
      await coord.save();
      coordinators.push(coord);
    }
    
    const citizens = [];
    for (let i = 1; i <= 50; i++) {
      const citizen = new User({
        username: `Citizen ${i}`,
        email: `citizen${i}@myscheme.com`,
        password: 'citizen123',
        role: 'Citizen',
        profile: {
          firstName: `Citizen`,
          lastName: `${i}`,
          age: 18 + i, // Ages from 19 to 68
          state: randomItem(states),
          gender: randomItem(genders),
          occupation: randomItem(occupations),
          annualIncome: (Math.floor(Math.random() * 10) + 1) * 50000, // 50k to 500k
          casteCategory: randomItem(categories),
          isDisabed: (i % 10 === 0), // 5 citizens are disabled
          isBPL: (i % 5 === 0), // 10 citizens are BPL
          educationLevel: (i % 5) + 1, // Levels 1-5
        },
      });
      await citizen.save();
      citizens.push(citizen);
    }
    
    console.log(`Users (1 Admin, 5 Coords, 50 Citizens) Imported & Hashed...`.green);

    const adminId = admin._id;
    const coordinatorIds = coordinators.map(c => c._id);
    
    // 3. --- Create Schemes (200 total) ---
    const schemes = [];

    // A: 100 Private Schemes (Assigned to Coordinators)
    for (let i = 0; i < 100; i++) {
      const coordId = coordinatorIds[i % 5]; // Assign schemes evenly (20 each)
      const state = randomItem(states);
      const scheme = {
        title: `Private Grant ${i + 1} (${state})`,
        description: `A private grant for ${randomItem(occupations)} in ${state}.`,
        department: randomItem(deptsPrivate),
        schemeType: 'Private',
        assignedTo: coordId,
        eligibility: {
          ageMin: 18 + (i % 10),
          ageMax: 50 + (i % 10),
          state: state,
          annualIncomeMax: 100000 + (i * 5000),
          occupation: randomItem(occupations),
          requiresBPL: (i % 10 === 0),
          educationLevelMin: (i % 4),
        },
        formFields: [
          { label: 'Full Name', fieldType: 'text', required: true },
          { label: 'Reason for Application', fieldType: 'text', required: true },
          { label: `Proof of Residence (PDF)`, fieldType: 'file', required: (i % 2 === 0) },
        ],
        benefits: [`Benefit ${i+1}`, 'Benefit 2'],
        postedBy: adminId,
      };
      schemes.push(scheme);
    }

    // B: 100 Government Schemes
    for (let i = 0; i < 100; i++) {
      const state = randomItem(states);
      const scheme = {
        title: `National/State Scheme ${i + 1}`,
        description: `A government scheme for ${randomItem(categories)} category.`,
        department: randomItem(deptsGovt),
        schemeType: 'Government',
        officialLink: 'https://www.myscheme.gov.in/',
        eligibility: {
          ageMin: 18,
          ageMax: 60,
          state: (i % 3 === 0) ? state : 'Any', // Mix of state-specific and national
          casteCategory: randomItem(categories),
          requiresDisability: (i % 15 === 0)
        },
        formFields: [],
        benefits: ['Benefit A', 'Benefit B'],
        postedBy: adminId,
      };
      schemes.push(scheme);
    }
    
    const createdSchemes = await Scheme.insertMany(schemes);
    console.log('Schemes (100 Private, 100 Govt) Imported...'.green);

    // 4. --- Create "Demo Story" Applications (200 total) ---
    const applications = [];
    const notifications = [];
    
    const privateSchemes = createdSchemes.filter(s => s.schemeType === 'Private');
    
    // Helper to get schemes for a specific coordinator
    const getSchemesForCoord = (coordId) => privateSchemes.filter(s => s.assignedTo && s.assignedTo.equals(coordId));
    
    const coord1_schemes = getSchemesForCoord(coordinatorIds[0]);
    const coord2_schemes = getSchemesForCoord(coordinatorIds[1]);
    const coord3_schemes = getSchemesForCoord(coordinatorIds[2]);
    const coord4_schemes = getSchemesForCoord(coordinatorIds[3]);
    const coord5_schemes = getSchemesForCoord(coordinatorIds[4]);

    // --- Story Part 1: 70 PENDING applications for Coordinator 1 (coord1@myscheme.com) ---
    for (let i = 0; i < 70; i++) {
      const citizen = randomItem(citizens);
      const scheme = randomItem(coord1_schemes);
      if (scheme) {
        applications.push({
          citizen: citizen._id,
          scheme: scheme._id,
          formData: { "Full Name": citizen.username, "Reason": "Demo data for pending" },
          status: 'Pending',
        });
      }
    }

    // --- Story Part 2: 20 "More Info" applications for Coordinator 1 ---
    for (let i = 0; i < 20; i++) {
      const citizen = randomItem(citizens);
      const scheme = randomItem(coord1_schemes);
      if (scheme) {
        const app = {
          citizen: citizen._id,
          scheme: scheme._id,
          formData: { "Full Name": citizen.username, "Reason": "Demo data for more info" },
          status: 'More Info Required',
          reviewedBy: coordinatorIds[0],
          coordinatorNotes: 'Your document was blurry. Please upload again.'
        };
        applications.push(app);
        notifications.push({
          user: app.citizen,
          message: `More information is required for your application for "${scheme.title}".`,
          link: '/my-applications'
        });
      }
    }

    // --- Story Part 3: 60 APPROVED applications (for Admin chart) by Coords 2 & 3 ---
    for (let i = 0; i < 60; i++) {
      const citizen = randomItem(citizens);
      const scheme = (i % 2 === 0) ? randomItem(coord2_schemes) : randomItem(coord3_schemes);
      const coordId = (i % 2 === 0) ? coordinatorIds[1] : coordinatorIds[2];
      if (scheme) {
        const app = {
          citizen: citizen._id,
          scheme: scheme._id,
          formData: { "Full Name": citizen.username, "Reason": "Demo data for approved" },
          status: 'Approved',
          reviewedBy: coordId,
          coordinatorNotes: 'Approved.'
        };
        applications.push(app);
        notifications.push({
          user: app.citizen,
          message: `Your application for "${scheme.title}" has been Approved!`,
          link: '/my-applications'
        });
      }
    }

    // --- Story Part 4: 50 REJECTED applications (for Admin chart) by Coords 4 & 5 ---
    for (let i = 0; i < 50; i++) {
      const citizen = randomItem(citizens);
      const scheme = (i % 2 === 0) ? randomItem(coord4_schemes) : randomItem(coord5_schemes);
      const coordId = (i % 2 === 0) ? coordinatorIds[3] : coordinatorIds[4];
      if (scheme) {
        const app = {
          citizen: citizen._id,
          scheme: scheme._id,
          formData: { "Full Name": citizen.username, "Reason": "Demo data for rejected" },
          status: 'Rejected',
          reviewedBy: coordId,
          coordinatorNotes: 'Not eligible based on criteria.'
        };
        applications.push(app);
        notifications.push({
          user: app.citizen,
          message: `Your application for "${scheme.title}" has been Rejected.`,
          link: '/my-applications'
        });
      }
    }
    
    await Application.insertMany(applications);
    await Notification.insertMany(notifications);
    console.log(`Applications (${applications.length}) and Notifications (${notifications.length}) Imported...`.green);
    
    console.log('Data Imported Successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Application.deleteMany();
        await Notification.deleteMany();
        await SavedScheme.deleteMany();
        await Scheme.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}