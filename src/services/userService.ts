import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import AppError from '@/utils/AppError';
import { db } from '@/db';
import { users, type UserType } from '@/db/schema';
import { type UserInput } from '@/utils/validationSchemas';

export class UserService {
  static async createUser(userData: UserInput): Promise<UserType> {
    const { emailAddress, password, firstName, lastName } = userData;

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

  static async updateUser(
    id: number,
    userData: Partial<UserInput>,
  ): Promise<UserType | undefined> {
    const { emailAddress, password, firstName, lastName } = userData;
    const updateFields: Partial<UserType> = {};

    const existingUser = await UserService.getUserById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    if (emailAddress && emailAddress !== existingUser.emailAddress) {
      const existingUserByEmail = await db
        .select()
        .from(users)
        .where(eq(users.emailAddress, emailAddress))
        .limit(1);

      if (existingUserByEmail.length > 0) {
        throw new AppError(
          'Email address already in use by another account',
          409,
        );
      }

      updateFields.emailAddress = emailAddress;
    }

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    if (firstName) {
      updateFields.firstName = firstName;
    }
    if (lastName) {
      updateFields.lastName = lastName;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  static async deleteUser(id: number): Promise<UserType | undefined> {
    const existingUser = await UserService.getUserById(id);

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return deletedUser;
  }
}
