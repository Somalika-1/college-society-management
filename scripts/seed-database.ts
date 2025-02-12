import { 
    createAnnouncement 
  } from '../src/firebase/services/announcements';
  import { 
    createEvent 
  } from '../src/firebase/services/event';
  import { 
    createSociety
  } from '../src/firebase/services/societies';
  import { 
    createUser
  } from '../src/firebase/services/users';
  import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
  import { app } from '../src/firebase/config';
  
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
        name: 'Admin User',
        email: 'admin@university.edu',
        role: 'admin',
        password: 'Password123!',
        createdAt: new Date(),
        isActive: true
      },
      {
        name: 'John Smith',
        email: 'john.smith@university.edu',
        role: 'society_head',
        societyId: 'tech-society',
        password: 'Password123!',
        createdAt: new Date(),
        isActive: true
      },
      {
        name: 'Emma Johnson',
        email: 'emma.johnson@university.edu',
        role: 'society_head',
        societyId: 'arts-society',
        password: 'Password123!',
        createdAt: new Date(),
        isActive: true
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@university.edu',
        role: 'member',
        societyId: 'tech-society',
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
  
        // Then create the user document in Firestore
        const { password, ...userWithoutPassword } = user;
        await createUser({
          ...userWithoutPassword,
          // The createUser function should handle the ID internally
        });
  
        console.log(`Created user: ${user.email} (Auth UID: ${userCredential.user.uid})`);
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
        name: 'Technology Society',
        description: 'A community for tech enthusiasts and innovators',
        headId: 'head1',
        members: ['member1'],
        events: ['event1'],
        createdAt: new Date(),
        status: 'active'
      },
      {
        name: 'Arts & Culture Society',
        description: 'Celebrating creativity and artistic expression',
        headId: 'head2',
        members: [],
        events: ['event2'],
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
        title: 'Coding Workshop',
        description: 'Learn the basics of web development',
        date: new Date(2025, 2, 15),
        venue: 'Computer Lab A',
        societyId: 'tech-society',
        maxParticipants: 30,
        registeredParticipants: ['member1'],
        status: 'upcoming',
        type: 'workshop',
        createdAt: new Date()
      },
      {
        title: 'Art Exhibition',
        description: 'Annual student art showcase',
        date: new Date(2025, 3, 1),
        venue: 'University Gallery',
        societyId: 'arts-society',
        maxParticipants: 100,
        registeredParticipants: [],
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
        title: 'Welcome to Spring Semester!',
        content: 'Join us for our upcoming events and activities.',
        societyId: 'tech-society',
        authorId: 'head1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        isPinned: true,
        status: 'published',
        priority: 'high',
        tags: ['welcome', 'spring-semester'],
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
        title: 'Art Exhibition Registration Open',
        content: 'Submit your artwork for the annual exhibition.',
        societyId: 'arts-society',
        authorId: 'head2',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        status: 'published',
        priority: 'medium',
        tags: ['exhibition', 'registration'],
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