/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Firestore } from "@google-cloud/firestore";
const DB_FILE = path.join(process.cwd(), "db.json");
export function hashPassword(password) {
  const salt = "peoples_priorities_salt_9876";
  return crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
}
const DEFAULT_USERS = [
  {
    id: "user_mp_1",
    username: "mp@people.in",
    passwordHash: hashPassword("password123"),
    role: "mp",
    name: "Shri Pratap Chandra Sarangi",
    phoneNumber: "+91 98765 43210"
  },
  {
    id: "user_citizen_1",
    username: "citizen@people.in",
    passwordHash: hashPassword("password123"),
    role: "citizen",
    name: "Biswanath Mohanty",
    ward: "Ward 7 - Somanathpur",
    phoneNumber: "+91 99112 23344"
  },
  {
    id: "user_citizen_2",
    username: "lopamudra@people.in",
    passwordHash: hashPassword("password123"),
    role: "citizen",
    name: "Lopamudra Sahu",
    ward: "Ward 12 - Gopalgaon",
    phoneNumber: "+91 98888 77777"
  },
  {
    id: "user_citizen_3",
    username: "rashmi@people.in",
    passwordHash: hashPassword("password123"),
    role: "citizen",
    name: "Rashmi Ranjan Patra",
    ward: "Ward 4 - Station Road",
    phoneNumber: "+91 94444 33333"
  }
];
const DEFAULT_COMPLAINTS = [
  {
    id: "comp_1",
    entryNumber: "WD-07 / 0042",
    title: "Severe waterlogging near Somanathpur Industrial Estate",
    description: "Every monsoon, the drainage system near Somanathpur Industrial Estate collapses, leaving knee-deep water for days. Small manufacturing units are suffering, sewage water is entering basements, and there is a high risk of dengue. The main outlet to the Budhabalanga river is clogged with solid waste.",
    category: "Drainage & Sewage",
    priority: "HIGH",
    status: "PENDING",
    ward: "Ward 7 - Somanathpur",
    citizenId: "user_citizen_1",
    citizenName: "Biswanath Mohanty",
    date: "2026-06-20T10:30:00.000Z",
    upvotes: 45,
    upvotedBy: ["user_citizen_1", "user_citizen_2", "user_citizen_3"],
    aiSummary: "Persistent drainage collapse near Somanathpur Industrial Estate causing waterlogging, disruption to small industries, and public health hazards.",
    aiAnalysis: {
      urgencyScore: 9,
      estimatedImpact: 450,
      recommendedAction: "Immediate desiltation of the main Somanathpur industrial drain line, clearing plastic blockages, and expanding the culvert capacity before peak monsoon.",
      keyIssues: ["Clogged drainage lines", "Industrial estate flooding", "Sanitation and vector-borne risks"]
    }
  },
  {
    id: "comp_2",
    entryNumber: "WD-12 / 0105",
    title: "Unpaved road causing accidents on Gopalgaon bypass",
    description: "Heavy transport vehicles bypass the city and have completely destroyed the link road. Massive potholes are causing small vehicles and school buses to skid daily near the bypass junction. There are no streetlights along this stretch, making it extremely dangerous at night.",
    category: "Roads",
    priority: "HIGH",
    status: "IN_REVIEW",
    ward: "Ward 12 - Gopalgaon",
    citizenId: "user_citizen_2",
    citizenName: "Lopamudra Sahu",
    date: "2026-06-22T14:15:00.000Z",
    upvotes: 38,
    upvotedBy: ["user_citizen_2", "user_citizen_1"],
    aiSummary: "Severe pothole damage and link road structural failure on Gopalgaon bypass, worsened by dark patches due to missing streetlights.",
    aiAnalysis: {
      urgencyScore: 8,
      estimatedImpact: 350,
      recommendedAction: "Execute emergency asphalt patching of the 1.2km critical stretch, and install 5 solar LED streetlight poles at the sharp bypass curve.",
      keyIssues: ["Deep crater-like potholes", "Lack of functional street lighting", "High traffic accident frequency"]
    }
  },
  {
    id: "comp_3",
    entryNumber: "WD-04 / 0019",
    title: "Overcrowded Govt High School classrooms near Station Road",
    description: "There are over 70 students packed into each classroom for classes 8th and 9th. Students are sitting on the floor due to a lack of benches. We need additional desks immediately, and a long-term plan for building 2 more rooms using MPLAD (MP Local Area Development) funds.",
    category: "Education",
    priority: "MEDIUM",
    status: "RESOLVED",
    ward: "Ward 4 - Station Road",
    citizenId: "user_citizen_3",
    citizenName: "Rashmi Ranjan Patra",
    date: "2026-05-15T09:00:00.000Z",
    upvotes: 62,
    upvotedBy: ["user_citizen_3", "user_citizen_1", "user_citizen_2"],
    resolutionDetails: "Sanctioned \u20B912 Lakhs from MPLAD funds. Construction of 2 additional smart classrooms commenced on June 1, 2026. 50 new double-desk benches have been delivered and installed in classrooms.",
    resolutionDate: "2026-06-15T12:00:00.000Z",
    aiSummary: "Congested secondary school classrooms and critical student desk shortage near Station Road, Balasore.",
    aiAnalysis: {
      urgencyScore: 7,
      estimatedImpact: 140,
      recommendedAction: "Sanction MPLAD school building funds for new rooms and issue immediate procurement order for dual-desk benches.",
      keyIssues: ["Excessive student-to-teacher ratio", "Lack of basic furniture", "Inadequate classroom space"]
    }
  },
  {
    id: "comp_4",
    entryNumber: "WD-02 / 0087",
    title: "Absence of medical officer at Mallikashpur Primary Health Center",
    description: "The Mallikashpur PHC has been without a permanent medical officer for the last 3 months. Vulnerable pregnant women and elderly patients have to travel over 15km to the Balasore District Headquarters Hospital for basic medical consultation and vaccines.",
    category: "Healthcare",
    priority: "HIGH",
    status: "PENDING",
    ward: "Ward 2 - Mallikashpur",
    citizenId: "user_citizen_3",
    citizenName: "Rashmi Ranjan Patra",
    date: "2026-07-02T08:45:00.000Z",
    upvotes: 54,
    upvotedBy: ["user_citizen_3", "user_citizen_2"],
    aiSummary: "Absence of doctor/medical officer at Mallikashpur Primary Health Center (PHC), causing healthcare delivery breakdown and forcing residents to travel to Balasore DHH.",
    aiAnalysis: {
      urgencyScore: 9,
      estimatedImpact: 800,
      recommendedAction: "Deploy a temporary rotating doctor twice a week from Balasore District Headquarters Hospital while the state health commission processes permanent medical officer recruitment.",
      keyIssues: ["Staff shortage", "Primary healthcare access barrier", "Vulnerable maternal care risks"]
    }
  }
];
const DEFAULT_SCHEMES = [
  {
    id: "scheme_1",
    title: "Ama Odisha Nabin Odisha - Balasore Smart Grid",
    description: "A state-backed and MP-supported developmental initiative aimed at transforming rural-urban infrastructure, upgrading community centers, and providing modern amenities in Balasore Sadar.",
    targetAudience: "Rural and semi-urban communities of Balasore Sadar",
    benefits: "Upgradation of local temples, community halls, installation of high-mast solar streetlights, and creation of digital computer labs in panchayat high schools.",
    status: "ACTIVE",
    date: "2026-01-10T00:00:00.000Z",
    budgetAllocated: "\u20B945,00,000",
    ministry: "Panchayati Raj & Drinking Water Department, Odisha"
  },
  {
    id: "scheme_2",
    title: "Biju Swasthya Kalyan Yojana (BSKY) Smart Card Desk",
    description: "Setting up localized assistance counters across all Balasore wards to help citizens register, activate, and utilize cashless health assurance benefits under the BSKY scheme at empanelled private hospitals.",
    targetAudience: "Ration cardholders, BPL families, and economically vulnerable households across all 12 wards",
    benefits: "Providing instant smart card replacement, resolving biometric verification errors, and offering 24/7 helpdesk support for emergency cashless hospital admissions up to \u20B95 Lakhs per family (\u20B910 Lakhs for women).",
    status: "ACTIVE",
    date: "2026-03-15T00:00:00.000Z",
    budgetAllocated: "\u20B91,20,00,000",
    ministry: "Health & Family Welfare Department, Govt of Odisha"
  }
];
// Initialize Google Cloud Firestore using official server-side SDK
let firestore = null;
try {
  const customKeyPath = path.join(process.cwd(), "firebase-key.json");
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  const forceLocal = process.env.USE_LOCAL_DB === "true";
  
  if (forceLocal) {
    console.log("USE_LOCAL_DB is set to true. Bypassing Firestore and using local JSON database.");
  } else if (fs.existsSync(customKeyPath)) {
    // Automatically load user's custom Firestore credentials file if present locally
    const keyData = JSON.parse(fs.readFileSync(customKeyPath, "utf-8"));
    firestore = new Firestore({
      projectId: keyData.project_id,
      keyFilename: customKeyPath,
      databaseId: process.env.FIRESTORE_DATABASE_ID || "(default)"
    });
    console.log(`Successfully initialized Custom Firestore using local service account key file: ${customKeyPath} (Project: ${keyData.project_id})`);
  } else if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    firestore = new Firestore({
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId || "(default)"
    });
    console.log("Google Cloud Firestore successfully initialized in server db module.");
  } else {
    console.warn("Neither firebase-key.json nor firebase-applet-config.json was found. Database will use local JSON fallback.");
  }
} catch (e) {
  console.error("Failed to initialize Firestore in db module:", e);
}

class LocalDatabase {
  data = {
    users: [],
    complaints: [],
    schemes: [],
    complaintCounter: {}
  };

  async init() {
    if (!firestore) {
      console.warn("Firestore not initialized. Using local JSON fallback database.");
      this.loadLocalFallback();
      return;
    }

    try {
      console.log("Syncing database with Firestore collections...");

      // Fetch users
      const usersSnap = await firestore.collection("users").get();
      const usersList = [];
      usersSnap.forEach((doc) => {
        usersList.push(doc.data());
      });

      // Fetch complaints
      const complaintsSnap = await firestore.collection("complaints").get();
      const complaintsList = [];
      complaintsSnap.forEach((doc) => {
        complaintsList.push(doc.data());
      });

      // Fetch schemes
      const schemesSnap = await firestore.collection("schemes").get();
      const schemesList = [];
      schemesSnap.forEach((doc) => {
        schemesList.push(doc.data());
      });

      // Fetch metadata/counters
      const countersDoc = await firestore.collection("metadata").doc("counters").get();
      let complaintCounter = {};
      if (countersDoc.exists) {
        complaintCounter = countersDoc.data().complaintCounter || {};
      }

      // If Firestore is empty or has stale data, seed/migrate it with defaults
      const hasOldData = usersList.some(u => u.name === "Shri R. K. Sharma" || u.ward?.includes("Civil Lines")) || 
                          complaintsList.some(c => c.ward?.includes("Civil Lines"));

      if ((usersList.length === 0 && complaintsList.length === 0 && schemesList.length === 0) || hasOldData) {
        console.log("Firestore database is empty or has stale schema. Seeding/Migrating default registry datasets for Balasore, Odisha...");

        // If there's old data, delete it first to prevent duplicates
        if (hasOldData) {
          console.log("Cleaning stale collections...");
          for (const u of usersList) {
            try { await firestore.collection("users").doc(u.id).delete(); } catch(e){}
          }
          for (const c of complaintsList) {
            try { await firestore.collection("complaints").doc(c.id).delete(); } catch(e){}
          }
          for (const s of schemesList) {
            try { await firestore.collection("schemes").doc(s.id).delete(); } catch(e){}
          }
          usersList.length = 0;
          complaintsList.length = 0;
          schemesList.length = 0;
        }

        for (const u of DEFAULT_USERS) {
          await firestore.collection("users").doc(u.id).set(u);
          usersList.push(u);
        }

        for (const c of DEFAULT_COMPLAINTS) {
          await firestore.collection("complaints").doc(c.id).set(c);
          complaintsList.push(c);
        }

        for (const s of DEFAULT_SCHEMES) {
          await firestore.collection("schemes").doc(s.id).set(s);
          schemesList.push(s);
        }

        complaintCounter = {
          "Ward 7 - Somanathpur": 42,
          "Ward 12 - Gopalgaon": 105,
          "Ward 4 - Station Road": 19,
          "Ward 2 - Mallikashpur": 87
        };
        await firestore.collection("metadata").doc("counters").set({ complaintCounter });
      }

      this.data = {
        users: usersList,
        complaints: complaintsList,
        schemes: schemesList,
        complaintCounter
      };
      console.log(`Firestore synchronized successfully. Loaded ${usersList.length} users, ${complaintsList.length} complaints, ${schemesList.length} schemes.`);
      
      // Keep local JSON in sync as a hot fallback
      this.saveLocalFallback();
    } catch (e) {
      console.error("Firestore sync error, reverting to local fallback:", e);
      this.loadLocalFallback();
    }
  }

  loadLocalFallback() {
    try {
      // Force refresh fallback db file if it contains old data
      let forceReset = false;
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (parsed.users?.some(u => u.name === "Shri R. K. Sharma") || parsed.complaints?.some(c => c.ward?.includes("Civil Lines"))) {
          forceReset = true;
          console.log("Stale local fallback db.json detected. Forcing reset to Balasore, Odisha defaults.");
        } else {
          this.data = parsed;
          console.log("Loaded fallback database from local db.json");
          return;
        }
      }
      
      if (!fs.existsSync(DB_FILE) || forceReset) {
        this.data = {
          users: DEFAULT_USERS,
          complaints: DEFAULT_COMPLAINTS,
          schemes: DEFAULT_SCHEMES,
          complaintCounter: {
            "Ward 7 - Somanathpur": 42,
            "Ward 12 - Gopalgaon": 105,
            "Ward 4 - Station Road": 19,
            "Ward 2 - Mallikashpur": 87
          }
        };
        this.saveLocalFallback();
        console.log("Created fresh fallback database in local db.json with Balasore, Odisha defaults.");
      }
    } catch (e) {
      console.error("Local fallback database load failed:", e);
    }
  }

  saveLocalFallback() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Local fallback database save failed:", e);
    }
  }

  getUsers() {
    return this.data.users;
  }

  getComplaints() {
    return this.data.complaints;
  }

  getSchemes() {
    return this.data.schemes;
  }

  addUser(user) {
    this.data.users.push(user);
    this.saveLocalFallback();
    if (firestore) {
      firestore.collection("users").doc(user.id).set(user)
        .catch(err => console.error("Firestore error writing user:", err));
    }
  }

  addComplaint(complaint, wardName) {
    const currentCounter = (this.data.complaintCounter[wardName] || 0) + 1;
    this.data.complaintCounter[wardName] = currentCounter;
    const wardMatch = wardName.match(/Ward (\d+)/i);
    const wardCode = wardMatch ? wardMatch[1].padStart(2, "0") : "00";
    const paddedCounter = String(currentCounter).padStart(4, "0");
    const entryNumber = `WD-${wardCode} / ${paddedCounter}`;
    const newComplaint = {
      ...complaint,
      id: "comp_" + Math.random().toString(36).substr(2, 9),
      entryNumber
    };
    this.data.complaints.push(newComplaint);
    this.saveLocalFallback();

    if (firestore) {
      firestore.collection("complaints").doc(newComplaint.id).set(newComplaint)
        .catch(err => console.error("Firestore error writing complaint:", err));
      firestore.collection("metadata").doc("counters").set({ complaintCounter: this.data.complaintCounter })
        .catch(err => console.error("Firestore error writing counters:", err));
    }
    return newComplaint;
  }

  updateComplaint(id, updates) {
    const idx = this.data.complaints.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.complaints[idx] = { ...this.data.complaints[idx], ...updates };
    this.saveLocalFallback();

    if (firestore) {
      firestore.collection("complaints").doc(id).set(this.data.complaints[idx])
        .catch(err => console.error("Firestore error updating complaint:", err));
    }
    return true;
  }

  deleteComplaint(id) {
    const lenBefore = this.data.complaints.length;
    this.data.complaints = this.data.complaints.filter((c) => c.id !== id);
    if (this.data.complaints.length === lenBefore) return false;
    this.saveLocalFallback();

    if (firestore) {
      firestore.collection("complaints").doc(id).delete()
        .catch(err => console.error("Firestore error deleting complaint:", err));
    }
    return true;
  }

  addScheme(scheme) {
    const newScheme = {
      ...scheme,
      id: "scheme_" + Math.random().toString(36).substr(2, 9)
    };
    this.data.schemes.push(newScheme);
    this.saveLocalFallback();

    if (firestore) {
      firestore.collection("schemes").doc(newScheme.id).set(newScheme)
        .catch(err => console.error("Firestore error writing scheme:", err));
    }
    return newScheme;
  }

  updateScheme(id, updates) {
    const idx = this.data.schemes.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.schemes[idx] = { ...this.data.schemes[idx], ...updates };
    this.saveLocalFallback();

    if (firestore) {
      firestore.collection("schemes").doc(id).set(this.data.schemes[idx])
        .catch(err => console.error("Firestore error updating scheme:", err));
    }
    return true;
  }

  deleteScheme(id) {
    const lenBefore = this.data.schemes.length;
    this.data.schemes = this.data.schemes.filter((s) => s.id !== id);
    if (this.data.schemes.length === lenBefore) return false;
    this.saveLocalFallback();

    if (firestore) {
      firestore.collection("schemes").doc(id).delete()
        .catch(err => console.error("Firestore error deleting scheme:", err));
    }
    return true;
  }
}
export const db = new LocalDatabase();
export { WARDS_LIST, COMPLAINT_CATEGORIES } from "./constants";
