import { Hono } from 'hono';
import { authenticateUser } from '@/middleware/authenticateUser';
import { UserService } from '@/services/userService';
import { userSchema, userUpdateSchema } from '@/utils/validationSchemas';
import AppError from '@/utils/AppError';

const app = new Hono();

// GET route that returns the currently authenticated user
app.get('/users', authenticateUser, async (c) => {
  const currentUser = c.get('currentUser');

  if (!currentUser) {
    throw new AppError('Authenticated user not found in context', 401);
  }

  return c.json({
    status: 'success',
    message: 'Authenticated user fetched successfully',
    data: {
      user: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        emailAddress: currentUser.emailAddress,
      },
    },
  });
});

// POST route to create a new user (registration)
app.post('/users', async (c) => {
  const body = await c.req.json();

  const userData = userSchema.parse(body);

  const newUser = await UserService.createUser(userData);

  c.header('Location', '/');

  return c.json(
    {
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          emailAddress: newUser.emailAddress,
        },
      },
    },
    201,
  );
});

// PUT route to update an existing user by ID
app.put('/users/:id', authenticateUser, async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    throw new AppError('Invalid user ID provided', 400);
  }

  const currentUser = c.get('currentUser');

  if (!currentUser || currentUser.id !== id) {
    throw new AppError(
      'Forbidden: You can only update your own user profile.',
      403,
    );
  }

  const body = await c.req.json();

  const userDataToUpdate = userUpdateSchema.parse(body);

  const updatedUser = await UserService.updateUser(id, userDataToUpdate);

  if (!updatedUser) {
    throw new AppError('Failed to update user or user.', 500);
  }

  return c.json(
    {
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          emailAddress: updatedUser.emailAddress,
        },
      },
    },
    200,
  );
});

// DELETE route to delete an existing user by ID
app.delete('/users/:id', authenticateUser, async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    throw new AppError('Invalid user ID provided', 400);
  }

  const currentUser = c.get('currentUser');

  if (!currentUser || currentUser.id !== id) {
    throw new AppError(
      'Forbidden: You can only delete your own user profile.',
      403,
    );
  }

  const deletedUser = await UserService.deleteUser(id);

  if (!deletedUser) {
    throw new AppError('Failed to delete user', 500);
  }

  return c.json(
    {
      status: 'success',
      message: 'User deleted successfully',
      data: {},
    },
    200,
  );
});

export default app;
