import { 
  createAnnouncement 
} from '../src/firebase/services/announcements';
import { 
  createEvent 
} from '../src/firebase/services/event';
import { 
  createSociety
} from '../src/firebase/services/societies';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../src/firebase/config';

// Import types
import type { Announcement } from '../src/types/announcement';
import type { User, Event, Society } from '../src/types/index';

type UserCreate = Omit<User, 'id'> & { password: string };
type SocietyCreate = Omit<Society, 'id'>;
type EventCreate = Omit<Event, 'id'>;
type AnnouncementCreate = Omit<Announcement, 'id'>;

const auth = getAuth(app);

const generateUsers = async () => {
  const users: UserCreate[] = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@university.edu',
      role: 'admin',
      password: 'Password123!',
      createdAt: new Date(),
      isActive: true
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@university.edu',
      role: 'society_head',
      societyId: 'tech-society',
      password: 'Password123!',
      createdAt: new Date(),
      isActive: true
    },
    {
      name: 'Aarav Patel',
      email: 'aarav.patel@university.edu',
      role: 'society_head',
      societyId: 'arts-society',
      password: 'Password123!',
      createdAt: new Date(),
      isActive: true
    },
    {
      name: 'Ananya Singh',
      email: 'ananya.singh@university.edu',
      role: 'member',
      societyId: 'tech-society',
      password: 'Password123!',
      createdAt: new Date(),
      isActive: true
    },
    {
      name: 'Vikram Reddy',
      email: 'vikram.reddy@university.edu',
      role: 'member',
      societyId: 'arts-society',
      password: 'Password123!',
      createdAt: new Date(),
      isActive: true
    }
  ];

  for (const user of users) {
    try {
      // First create the auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      // Get the UID from Firebase Authentication
      const uid = userCredential.user.uid;

      // Prepare user data without password
      const { password, ...userWithoutPassword } = user;
      
      // Create user document in Firestore with the same UID
      await setDoc(doc(db, 'users', uid), {
        ...userWithoutPassword,
        id: uid, // Explicitly set the ID to match Firebase Auth UID
        email: user.email, // Ensure email is included
      });

      console.log(`Created user: ${user.email} (Auth UID: ${uid})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`User ${user.email} already exists, skipping...`);
      } else {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
  }
};

const generateSocieties = async () => {
  const societies: SocietyCreate[] = [
    {
      name: 'Technology Innovation Society',
      description: 'A community for tech enthusiasts and innovators',
      headId: 'priya.sharma@university.edu', // Using email as identifier
      members: ['ananya.singh@university.edu'],
      events: ['tech-workshop'],
      createdAt: new Date(),
      status: 'active'
    },
    {
      name: 'Arts & Culture Collective',
      description: 'Celebrating creativity and artistic expression',
      headId: 'aarav.patel@university.edu', // Using email as identifier
      members: ['vikram.reddy@university.edu'],
      events: ['art-exhibition'],
      createdAt: new Date(),
      status: 'active'
    }
  ];

  for (const society of societies) {
    try {
      await createSociety(society);
      console.log(`Created society: ${society.name}`);
    } catch (error) {
      console.error(`Error creating society ${society.name}:`, error);
    }
  }
};

const generateEvents = async () => {
  const events: EventCreate[] = [
    {
      title: 'Tech Innovation Workshop',
      description: 'Advanced coding and innovation techniques',
      date: new Date(2025, 2, 15),
      venue: 'Computer Lab A',
      societyId: 'tech-society',
      maxParticipants: 30,
      registeredParticipants: ['ananya.singh@university.edu'],
      status: 'upcoming',
      type: 'workshop',
      createdAt: new Date()
    },
    {
      title: 'Cultural Arts Exhibition',
      description: 'Showcasing student artistic talents',
      date: new Date(2025, 3, 1),
      venue: 'University Gallery',
      societyId: 'arts-society',
      maxParticipants: 100,
      registeredParticipants: ['vikram.reddy@university.edu'],
      status: 'upcoming',
      type: 'social',
      createdAt: new Date()
    }
  ];

  for (const event of events) {
    try {
      await createEvent(event);
      console.log(`Created event: ${event.title}`);
    } catch (error) {
      console.error(`Error creating event ${event.title}:`, error);
    }
  }
};

const generateAnnouncements = async () => {
  const announcements: AnnouncementCreate[] = [
    {
      title: 'Welcome to Tech Innovation Society!',
      content: 'Join our upcoming workshop and explore cutting-edge technologies.',
      societyId: 'tech-society',
      authorId: 'priya.sharma@university.edu',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      isPinned: true,
      status: 'published',
      priority: 'high',
      tags: ['welcome', 'tech', 'innovation'],
      targetAudience: {
        roles: ['member', 'society_head'],
        societies: ['tech-society'],
        years: [1, 2, 3, 4]
      },
      metadata: {
        views: 0,
        likes: 0,
        comments: 0
      }
    },
    {
      title: 'Arts & Culture Exhibition Registration',
      content: 'Submit your artwork for our upcoming cultural exhibition.',
      societyId: 'arts-society',
      authorId: 'aarav.patel@university.edu',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      status: 'published',
      priority: 'medium',
      tags: ['exhibition', 'arts', 'culture'],
      targetAudience: {
        roles: ['member'],
        societies: ['arts-society'],
        years: [1, 2, 3, 4]
      },
      metadata: {
        views: 0,
        likes: 0,
        comments: 0
      }
    }
  ];

  for (const announcement of announcements) {
    try {
      await createAnnouncement(announcement);
      console.log(`Created announcement: ${announcement.title}`);
    } catch (error) {
      console.error(`Error creating announcement ${announcement.title}:`, error);
    }
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    await generateUsers();
    console.log('Users created successfully');
    
    await generateSocieties();
    console.log('Societies created successfully');
    
    await generateEvents();
    console.log('Events created successfully');
    
    await generateAnnouncements();
    console.log('Announcements created successfully');
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Execute the seeding
seedDatabase();