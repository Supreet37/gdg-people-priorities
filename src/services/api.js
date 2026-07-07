// src/services/api.js
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  query, where, getDoc, setDoc 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';
import { seedDataIfEmpty } from './seedData.js';

function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentUser() {
  const token = localStorage.getItem('peoples_priorities_token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export const api = {
  auth: {
    login: async (username, password) => {
  try {
    await seedDataIfEmpty();
    
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    const user = userCredential.user;
    
    // 🔥 Find user by email in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User profile not found');
    }
    
    let userData = null;
    querySnapshot.forEach(doc => {
      userData = doc.data();
    });
    
    const token = btoa(JSON.stringify({ uid: user.uid, ...userData }));
    localStorage.setItem('peoples_priorities_token', token);
    
    return { ...userData, uid: user.uid };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
},

    googleLogin: async (payload) => {
      try {
        await seedDataIfEmpty();
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let userData;
        
        if (!userDoc.exists()) {
          // Create new user
          userData = {
            id: user.uid,
            username: user.email,
            name: user.displayName || 'Google User',
            role: 'citizen',
            ward: 'Ward 7 - Somanathpur',
            phoneNumber: user.phoneNumber || '',
            email: user.email,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', user.uid), userData);
        } else {
          userData = userDoc.data();
        }
        
        const token = btoa(JSON.stringify({ uid: user.uid, ...userData }));
        localStorage.setItem('peoples_priorities_token', token);
        
        return userData;
      } catch (error) {
        console.error('Google login error:', error);
        throw new Error(error.message || 'Google login failed');
      }
    },

    register: async (payload) => {
      try {
        await seedDataIfEmpty();
        
        const userCredential = await createUserWithEmailAndPassword(auth, payload.username, payload.password);
        const user = userCredential.user;
        
        const userData = {
          id: user.uid,
          username: payload.username,
          name: payload.name,
          role: payload.role || 'citizen',
          ward: payload.ward || 'Ward 7 - Somanathpur',
          phoneNumber: payload.phoneNumber || '',
          email: payload.username,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        
        const token = btoa(JSON.stringify({ uid: user.uid, ...userData }));
        localStorage.setItem('peoples_priorities_token', token);
        
        return userData;
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed');
      }
    },

    me: async () => {
      const token = localStorage.getItem('peoples_priorities_token');
      if (!token) throw new Error('No token found');
      try {
        return JSON.parse(atob(token));
      } catch {
        throw new Error('Invalid token');
      }
    },

    logout: () => {
      localStorage.removeItem('peoples_priorities_token');
      firebaseSignOut(auth).catch(console.error);
    }
  },

  complaints: {
    submit: async (complaint) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('Not authenticated');
        
        // Get ward counter
        const counterRef = doc(db, 'metadata', 'counters');
        const counterDoc = await getDoc(counterRef);
        let counter = counterDoc.exists() ? counterDoc.data() : { complaintCounter: {} };
        
        const wardName = complaint.ward || currentUser.ward || 'Ward 7 - Somanathpur';
        const currentCount = (counter.complaintCounter?.[wardName] || 0) + 1;
        
        // Generate entry number
        const wardMatch = wardName.match(/Ward (\d+)/i);
        const wardCode = wardMatch ? wardMatch[1].padStart(2, '0') : '00';
        const entryNumber = `WD-${wardCode} / ${String(currentCount).padStart(4, '0')}`;
        
        const newComplaint = {
          ...complaint,
          id: generateId(),
          entryNumber,
          status: 'PENDING',
          citizenId: currentUser.uid || currentUser.id,
          citizenName: currentUser.name,
          ward: wardName,
          date: new Date().toISOString(),
          upvotes: 0,
          upvotedBy: [],
          aiSummary: `AI analysis pending for ${complaint.category} issue in ${wardName}`,
          aiAnalysis: {
            urgencyScore: Math.floor(Math.random() * 3) + 5,
            estimatedImpact: Math.floor(Math.random() * 200) + 50,
            recommendedAction: 'Review and assign to appropriate department for assessment.',
            keyIssues: [complaint.category, 'Infrastructure', 'Community concern']
          }
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'complaints', newComplaint.id), newComplaint);
        
        // Update counter
        counter.complaintCounter = counter.complaintCounter || {};
        counter.complaintCounter[wardName] = currentCount;
        await setDoc(counterRef, counter);
        
        return newComplaint;
      } catch (error) {
        console.error('Submit complaint error:', error);
        throw new Error(error.message || 'Failed to submit complaint');
      }
    },

    getMine: async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('Not authenticated');
        
        const q = query(
          collection(db, 'complaints'),
          where('citizenId', '==', currentUser.uid || currentUser.id)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data());
      } catch (error) {
        console.error('Get my complaints error:', error);
        return [];
      }
    },

    edit: async (id, updates) => {
      try {
        const docRef = doc(db, 'complaints', id);
        await updateDoc(docRef, updates);
        return { id, ...updates };
      } catch (error) {
        console.error('Edit complaint error:', error);
        throw new Error(error.message || 'Failed to update complaint');
      }
    },

    delete: async (id) => {
      try {
        await deleteDoc(doc(db, 'complaints', id));
        return { success: true };
      } catch (error) {
        console.error('Delete complaint error:', error);
        throw new Error(error.message || 'Failed to delete complaint');
      }
    },

    upvote: async (id) => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('Not authenticated');
        
        const docRef = doc(db, 'complaints', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Complaint not found');
        
        const data = docSnap.data();
        const upvotedBy = data.upvotedBy || [];
        const userId = currentUser.uid || currentUser.id;
        
        let newUpvotes = data.upvotes || 0;
        let newUpvotedBy = [...upvotedBy];
        
        if (upvotedBy.includes(userId)) {
          newUpvotes = Math.max(0, newUpvotes - 1);
          newUpvotedBy = upvotedBy.filter(id => id !== userId);
        } else {
          newUpvotes = newUpvotes + 1;
          newUpvotedBy.push(userId);
        }
        
        await updateDoc(docRef, {
          upvotes: newUpvotes,
          upvotedBy: newUpvotedBy
        });
        
        return { upvotes: newUpvotes, upvotedBy: newUpvotedBy };
      } catch (error) {
        console.error('Upvote error:', error);
        throw new Error(error.message || 'Failed to upvote');
      }
    }
  },

  mp: {
    getAllComplaints: async () => {
      try {
        const snapshot = await getDocs(collection(db, 'complaints'));
        return snapshot.docs.map(doc => doc.data());
      } catch (error) {
        console.error('Get all complaints error:', error);
        return [];
      }
    },

    updateStatus: async (id, status, resolutionDetails) => {
      try {
        const docRef = doc(db, 'complaints', id);
        const updates = { status };
        if (status === 'RESOLVED') {
          updates.resolutionDetails = resolutionDetails || 'Resolved by MP Office';
          updates.resolutionDate = new Date().toISOString();
        }
        await updateDoc(docRef, updates);
        return { id, ...updates };
      } catch (error) {
        console.error('Update status error:', error);
        throw new Error(error.message || 'Failed to update status');
      }
    },

    getDashboardStats: async () => {
      try {
        const snapshot = await getDocs(collection(db, 'complaints'));
        const complaints = snapshot.docs.map(doc => doc.data());
        
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'PENDING').length;
        const review = complaints.filter(c => c.status === 'IN_REVIEW').length;
        const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
        
        // Category stats
        const categoryStats = {};
        complaints.forEach(c => {
          const cat = c.category || 'Uncategorized';
          if (!categoryStats[cat]) categoryStats[cat] = { total: 0, resolved: 0 };
          categoryStats[cat].total++;
          if (c.status === 'RESOLVED') categoryStats[cat].resolved++;
        });
        
        return { total, pending, review, resolved, categoryStats };
      } catch (error) {
        console.error('Get stats error:', error);
        return { total: 0, pending: 0, review: 0, resolved: 0, categoryStats: {} };
      }
    },

    generateReport: async () => {
      try {
        const snapshot = await getDocs(collection(db, 'complaints'));
        return snapshot.docs.map(doc => doc.data());
      } catch (error) {
        console.error('Generate report error:', error);
        return [];
      }
    }
  },

  schemes: {
    getAll: async () => {
      try {
        const snapshot = await getDocs(collection(db, 'schemes'));
        return snapshot.docs.map(doc => doc.data());
      } catch (error) {
        console.error('Get schemes error:', error);
        return [];
      }
    },

    create: async (scheme) => {
      try {
        const newScheme = {
          ...scheme,
          id: generateId(),
          date: new Date().toISOString(),
          status: scheme.status || 'ACTIVE'
        };
        await setDoc(doc(db, 'schemes', newScheme.id), newScheme);
        return newScheme;
      } catch (error) {
        console.error('Create scheme error:', error);
        throw new Error(error.message || 'Failed to create scheme');
      }
    },

    update: async (id, updates) => {
      try {
        const docRef = doc(db, 'schemes', id);
        await updateDoc(docRef, updates);
        return { id, ...updates };
      } catch (error) {
        console.error('Update scheme error:', error);
        throw new Error(error.message || 'Failed to update scheme');
      }
    },

    delete: async (id) => {
      try {
        await deleteDoc(doc(db, 'schemes', id));
        return { success: true };
      } catch (error) {
        console.error('Delete scheme error:', error);
        throw new Error(error.message || 'Failed to delete scheme');
      }
    }
  }
};