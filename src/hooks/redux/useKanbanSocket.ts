// hooks/useKanbanSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { handleSocketTaskMoved, setUserTaskSelection } from '@/hooks/redux/kanban';

let socket: Socket | null = null;

interface UseKanbanSocketProps {
  boardId: string;
}

export const useKanbanSocket = ({ boardId }: UseKanbanSocketProps) => {
  const [connected, setConnected] = useState(false);
  const dispatch = useDispatch();
  

  useEffect(() => {
    // Initialize socket connection only once
    if (!socket) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        socket?.emit('join-board', boardId);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
      });

      // Application-specific events
      socket.on('board-joined', (data: { boardId: string }) => {
        console.log(`Joined board room: ${data.boardId}`);
      });

      socket.on('task-moved', (data) => {
        console.log('Remote task movement:', data);
        dispatch(handleSocketTaskMoved(data));
      });

      socket.on('task-selected', (data) => {
        dispatch(setUserTaskSelection({
          userId: data.userId,
          taskId: data.taskId
        }));
      });

      socket.on('task-deselected', (data) => {
        dispatch(setUserTaskSelection({
          userId: data.userId,
          taskId: null
        }));
      });
    }

    // Join board room when boardId changes
    if (connected && boardId) {
      socket.emit('join-board', boardId);
    }

    // Cleanup function
    return () => {
      if (socket) {
        // Leave board room if boardId exists
        if (boardId) {
          socket.emit('leave-board', boardId);
        }
        
        // Remove specific listeners to prevent duplicates
        socket.off('task-selected');
        socket.off('task-deselected');
        socket.off('task-moved');
        socket.off('board-joined');
        
        // Only disconnect if you want to completely kill the connection
        // socket.disconnect();
      }
    };
  }, [boardId, dispatch, connected]);

  // Function to emit task selection events
  const emitTaskSelection = (taskId: string, userId: string) => {
    socket?.emit('task-selected', {
      boardId,
      taskId,
      userId
    });
  };

  // Function to emit task deselection events
  const emitTaskDeselection = (userId: string) => {
    socket?.emit('task-deselected', {
      boardId,
      userId
    });
  };

  return { 
    connected,
    socket,
    emitTaskSelection,
    emitTaskDeselection
  };
};