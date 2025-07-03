import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  courses,
  type CourseType,
  type NewCourse,
  type UserType,
} from '@/db/schema';
import { courseSchema, type CourseInput } from '@/utils/validationSchemas';

export class CourseService {
  static async createCourse(courseData: CourseInput): Promise<CourseType> {
    const { description, title, userId, estimatedTime, materialsNeeded } =
      courseSchema.parse(courseData);

    const [insertedCourse] = await db
      .insert(courses)
      .values({ description, title, userId, estimatedTime, materialsNeeded })
      .returning();

    return insertedCourse;
  }

  static async getAllCourses(): Promise<CourseType[]> {
    return await db.select().from(courses);
  }

  static async getCourseById(
    courseId: number,
  ): Promise<(CourseType & { user?: Omit<UserType, 'password'> }) | undefined> {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        user: {
          columns: {
            password: false,
          },
        },
      },
    });

    return course;
  }

  static async getCoursesByUser(userId: number): Promise<CourseType[]> {
    const userCourses = await db.query.courses.findMany({
      where: eq(courses.userId, userId),
    });

    return userCourses;
  }

  static async updateCourse(
    courseId: number,
    updateData: Partial<NewCourse>,
  ): Promise<CourseType | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, courseId))
      .returning();

    return updatedCourse;
  }

  static async deleteCourse(courseId: number): Promise<CourseType | undefined> {
    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.id, courseId))
      .returning();

    return deletedCourse;
  }
}
