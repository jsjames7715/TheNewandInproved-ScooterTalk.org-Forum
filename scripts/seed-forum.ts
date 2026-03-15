import {
  categoryStorage,
  boardStorage,
  threadStorage,
  postStorage,
  userStorage,
} from '../src/server/rpc/forum/storage.ts';
import { hashPassword } from '../src/server/lib/crypto.ts';

async function seedForum() {
  console.log('🛴 Seeding ScooterTalk Forum...');

  try {
    // Create admin user
    const adminUser = await userStorage.create({
      username: 'admin',
      email: 'admin@scootertalk.org',
      passwordHash: hashPassword('admin123'),
      emailVerified: true,
      role: 'admin',
      postCount: 0,
      lastActive: Date.now(),
      createdAt: Date.now(),
    });
    console.log('✅ Created admin user');

    // Create main categories
    const generalCat = await categoryStorage.create({
      name: 'General Discussion',
      slug: 'general',
      description: 'General discussions about electric scooters',
      icon: 'scooter-icon',
      order: 1,
      createdAt: Date.now(),
    });

    const technicalCat = await categoryStorage.create({
      name: 'Technical',
      slug: 'technical',
      description: 'Technical discussions, repairs, and modifications',
      icon: 'wrench-icon',
      order: 2,
      createdAt: Date.now(),
    });

    const brandsCat = await categoryStorage.create({
      name: 'Brand Specific',
      slug: 'brands',
      description: 'Discussions about specific scooter brands',
      icon: 'brand-icon',
      order: 3,
      createdAt: Date.now(),
    });

    console.log('✅ Created categories');

    // Create boards
    const generalBoard = await boardStorage.create({
      categoryId: generalCat.id,
      name: 'General Chat',
      slug: 'general-chat',
      description: 'General discussions about electric scooters, riding tips, and community chat',
      moderators: [adminUser.id],
      postCount: 0,
      threadCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      order: 1,
      isArchived: false,
      createdAt: Date.now(),
    });

    const newbieBoard = await boardStorage.create({
      categoryId: generalCat.id,
      name: 'Newbie Corner',
      slug: 'newbie-corner',
      description: 'New to electric scooters? Ask your questions here!',
      moderators: [adminUser.id],
      postCount: 0,
      threadCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      order: 2,
      isArchived: false,
      createdAt: Date.now(),
    });

    const motorsBoard = await boardStorage.create({
      categoryId: technicalCat.id,
      name: 'Electric Motors and Wheels',
      slug: 'electric-motors-wheels',
      description: 'Discussions about motors, wheels, and related components',
      moderators: [adminUser.id],
      postCount: 0,
      threadCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      order: 1,
      isArchived: false,
      createdAt: Date.now(),
    });

    const batteriesBoard = await boardStorage.create({
      categoryId: technicalCat.id,
      name: 'Batteries and Charging',
      slug: 'batteries-charging',
      description: 'Everything about batteries, chargers, and power management',
      moderators: [adminUser.id],
      postCount: 0,
      threadCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      order: 2,
      isArchived: false,
      createdAt: Date.now(),
    });

    const xiaomiBoard = await boardStorage.create({
      categoryId: brandsCat.id,
      name: 'Xiaomi',
      slug: 'xiaomi',
      description: 'Discussions about Xiaomi electric scooters',
      moderators: [adminUser.id],
      postCount: 0,
      threadCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      order: 1,
      isArchived: false,
      createdAt: Date.now(),
    });

    const birdBoard = await boardStorage.create({
      categoryId: brandsCat.id,
      name: 'Bird / Lime / Shared Scooters',
      slug: 'shared-scooters',
      description: 'Discussions about shared scooter services and modifications',
      moderators: [adminUser.id],
      postCount: 0,
      threadCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      order: 2,
      isArchived: false,
      createdAt: Date.now(),
    });

    console.log('✅ Created boards');

    // Create some sample threads
    const sampleThread1 = await threadStorage.create({
      boardId: generalBoard.id,
      title: 'Welcome to the new ScooterTalk!',
      slug: 'welcome-to-new-scootertalk',
      authorId: adminUser.id,
      authorUsername: adminUser.username,
      content: 'Welcome to the new and improved ScooterTalk forum! We have rebuilt the entire platform with modern technology while preserving the community spirit of the original site.',
      isPinned: true,
      isLocked: false,
      isArchived: false,
      tags: ['announcement', 'welcome'],
      postCount: 1,
      viewCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const sampleThread2 = await threadStorage.create({
      boardId: newbieBoard.id,
      title: 'New to electric scooters - what should I buy?',
      slug: 'new-electric-scooters-what-buy',
      authorId: adminUser.id,
      authorUsername: adminUser.username,
      content: 'I am new to electric scooters and looking for recommendations. What should a beginner look for when buying their first scooter?',
      isPinned: false,
      isLocked: false,
      isArchived: false,
      tags: ['beginner', 'buying-guide'],
      postCount: 1,
      viewCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const sampleThread3 = await threadStorage.create({
      boardId: motorsBoard.id,
      title: 'Xiaomi M365 motor specifications',
      slug: 'xiaomi-m365-motor-specifications',
      authorId: adminUser.id,
      authorUsername: adminUser.username,
      content: 'I am looking for detailed motor specifications for the Xiaomi M365. Does anyone have information about the stator core material, rotor core material, and coil materials?',
      isPinned: false,
      isLocked: false,
      isArchived: false,
      tags: ['xiaomi', 'm365', 'motor', 'specifications'],
      postCount: 1,
      viewCount: 0,
      lastPostAt: Date.now(),
      lastPostBy: adminUser.username,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('✅ Created sample threads');

    console.log('🎉 Forum seeded successfully!');
    console.log('📧 Admin login: admin@scootertalk.org / admin123');
    
  } catch (error) {
    console.error('❌ Failed to seed forum:', error);
    process.exit(1);
  }
}

// Run the seed script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedForum();
}