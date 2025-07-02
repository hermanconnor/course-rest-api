import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  emailAddress: text('email_address').notNull().unique(),
  password: text('password').notNull(),
});

export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  estimatedTime: text('estimated_time'),
  materialsNeeded: text('materials_needed'),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

// --- Relations ---
// User to Courses (one-to-many)
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses, { relationName: 'userCourses' }),
}));

// Course to User (many-to-one)
export const coursesRelations = relations(courses, ({ one }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
    relationName: 'userCourses',
  }),
}));

// --- Export Drizzle-inferred Types for convenience ---
export type NewUser = typeof users.$inferInsert;
export type UserType = typeof users.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type CourseType = typeof courses.$inferSelect;
