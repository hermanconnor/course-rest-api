import { Hono } from 'hono';
import { CourseService } from '@/services/courseService';
import AppError from '@/utils/AppError';
import { authenticateUser } from '@/middleware/authenticateUser';
import {
  courseUpdateSchema,
  type CourseInput,
} from '@/utils/validationSchemas';

const app = new Hono();

// GET /courses
// Returns all courses with their associated user
app.get('/courses', async (c) => {
  const courses = await CourseService.getAllCourses();

  return c.json(
    {
      status: 'success',
      success: true,
      message: 'Courses fetched successfully',
      data: {
        courses,
      },
    },
    200,
  );
});

// GET /courses/:id
// Returns a specific course by ID with its associated user
app.get('/courses/:id', async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    throw new AppError('Invalid course ID format', 400);
  }

  const course = await CourseService.getCourseById(id);

  if (!course) {
    throw new AppError('Course Not Found', 404);
  }

  return c.json(
    {
      status: 'success',
      success: true,
      message: 'Course fetched successfully',
      data: {
        course,
      },
    },
    200,
  );
});

// POST /courses
// Creates a new course
app.post('/courses', authenticateUser, async (c) => {
  const authenticatedUser = c.get('currentUser');

  if (!authenticatedUser || !authenticatedUser.id) {
    throw new AppError('Authentication error: User ID not found', 401);
  }

  const courseData = await c.req.json();

  const newCourseData: CourseInput = {
    ...courseData,
    userId: authenticatedUser.id,
  };

  const newCourse = await CourseService.createCourse(newCourseData);

  c.header('Location', `/api/courses/${newCourse.id}`);

  return c.json(
    {
      status: 'success',
      success: true,
      message: 'Course created successfully',
      data: {
        course: newCourse,
      },
    },
    201,
  );
});

// PUT /courses/:id
// Updates a specific course by ID
app.put('/courses/:id', authenticateUser, async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    throw new AppError('Invalid course ID format', 400);
  }

  const body = await c.req.json();
  const updateData = courseUpdateSchema.parse(body);

  const existingCourse = await CourseService.getCourseById(id);

  if (!existingCourse) {
    throw new AppError('Course Not Found', 404);
  }

  const authenticatedUser = c.get('currentUser');

  if (!authenticateUser || existingCourse.userId !== authenticatedUser.id) {
    throw new AppError('Forbidden: You do not own this course', 403);
  }

  const updatedCourse = await CourseService.updateCourse(id, updateData);

  if (!updatedCourse) {
    throw new AppError('Failed to update course', 500);
  }

  return c.json(
    {
      status: 'success',
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
      },
    },
    200,
  );
});

// DELETE /courses/:id
// Deletes a specific course by ID
app.delete('/courses/:id', authenticateUser, async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    throw new AppError('Invalid course ID format', 400);
  }

  const existingCourse = await CourseService.getCourseById(id);
  if (!existingCourse) {
    throw new AppError('Course Not Found', 404);
  }

  const authenticatedUser = c.get('currentUser');

  if (!authenticatedUser || existingCourse.userId !== authenticatedUser.id) {
    throw new AppError('Forbidden: You do not own this course', 403);
  }

  const deletedCourse = await CourseService.deleteCourse(id);

  if (!deletedCourse) {
    throw new AppError('Failed to delete course', 500);
  }

  return c.json(
    {
      status: 'success',
      success: true,
      message: 'Course deleted successfully',
      data: {},
    },
    200,
  );
});

export default app;
