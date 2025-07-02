import bcrypt from 'bcrypt';
import { db } from './db';
import { users, courses, type NewUser } from '@/db/schema';
import * as seedData from './seedData.json';
import pinoLogger from './utils/logger';

async function seed() {
  pinoLogger.info('Starting database seeding...');

  try {
    pinoLogger.info('Deleting existing courses...');
    await db.delete(courses);
    pinoLogger.info('Deleting existing users...');
    await db.delete(users);
    pinoLogger.info('Existing data cleared.');

    pinoLogger.info('Inserting users...');
    const insertedUsers: NewUser[] = [];
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [user] = await db
        .insert(users)
        .values({
          firstName: userData.firstName,
          lastName: userData.lastName,
          emailAddress: userData.emailAddress,
          password: hashedPassword,
        })
        .returning();

      insertedUsers.push(user);

      pinoLogger.info(
        `Inserted user: ${user.emailAddress} with ID: ${user.id}`,
      );
    }

    pinoLogger.info('Inserting courses...');
    for (const courseData of seedData.courses) {
      const actualUserId = courseData.userId;

      const [course] = await db
        .insert(courses)
        .values({
          title: courseData.title,
          description: courseData.description,
          estimatedTime: courseData.estimatedTime || null,
          materialsNeeded: courseData.materialsNeeded || null,
          userId: actualUserId,
        })
        .returning();

      pinoLogger.info(
        `Inserted course: ${course.title} (User ID: ${course.userId})`,
      );
    }

    pinoLogger.info('Database seeding completed successfully!');
  } catch (error) {
    pinoLogger.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
