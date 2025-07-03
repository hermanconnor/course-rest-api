import 'hono';
import { UserType } from '../../db/schema.ts';

declare module 'hono' {
  interface ContextVariableMap {
    currentUser: UserType;
  }
}
