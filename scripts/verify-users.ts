import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

interface User {
  id: string;
  email: string;
  role: string;
}

async function verifyUsers() {
  const auth = getAuth();
  const db = getFirestore();
  
  try {
    // Instead of listUsers, fetch users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email || '',
        role: userData.role || 'user'
      });
    });

    console.log('Users in the system:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

verifyUsers().catch(console.error);