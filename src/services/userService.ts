import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import AppError from '@/utils/AppError';
import { db } from '@/db';
import { users, type UserType } from '@/db/schema';
import { userSchema, type UserInput } from '@/utils/validationSchemas';

export class UserService {
  static async createUser(userData: UserInput): Promise<UserType> {
    const { emailAddress, password, firstName, lastName } =
      userSchema.parse(userData);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.emailAddress, emailAddress))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AppError('Email already exists, try logging in', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertedUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        emailAddress,
        password: hashedPassword,
      })
      .returning();

    return insertedUser;
  }

  static async findUserByEmail(email: string): Promise<UserType | undefined> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.emailAddress, email))
      .limit(1);

    return user[0];
  }

  static async verifyPassword(
    candidatePassword: string,
    hashedPasswordFromDb: string,
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, hashedPasswordFromDb);
  }

  static async getUserById(id: number): Promise<UserType | undefined> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return user[0];
  }
}
