import { Hono } from 'hono';
import { authenticateUser } from '@/middleware/authenticateUser';
import { UserService } from '@/services/userService';
import { userSchema } from '@/utils/validationSchemas';
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

export default app;
