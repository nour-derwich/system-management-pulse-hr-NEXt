import { configureStore } from '@reduxjs/toolkit';
import kanbanReducer from './kanban';
import authReducer from '@/middleware/auth'; // You'll need to create this file

// Define your root state type
export interface RootState {
  kanban: ReturnType<typeof kanbanReducer>;
  auth: ReturnType<typeof authReducer>;
}

export const store = configureStore({
  reducer: {
    kanban: kanbanReducer,
    auth: authReducer // Add your auth reducer here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;