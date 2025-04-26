import { kanbanColumn } from '@/data/kanbanFakeData';
import { KanbanService } from '@/services/utils/kanban';
import { KanbanTasksType, KanbanColumnType, KanbanTaskType } from '@/modules/kanabn';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer';
import { toast } from "react-toastify";

// Save data to backend
const saveData = (data: KanbanColumnType[]) => {
  KanbanService.update(data).then((res) => {
    if(res.success){
      toast.success("Kanban updated successfully");
    } else {
      toast.error("Error updating kanban");
    }
  }).catch((err) => {
    toast.error("Error updating kanban");
    console.error("Update error:", err);
  });
};

interface MoveTaskPayload {
  currentTask: string;
  destinationColumn: string;
  sourceColumn: string;
  newOrder: number;
  emitSocket?: boolean;
}

interface TaskMovedPayload {
  taskId: string;
  fromColumn: string;
  toColumn: string;
  order: number;
}

interface UserTaskSelectionPayload {
  userId: string;
  taskId: string | null;
}

interface KanbanState {
  kanbanData: KanbanColumnType[];
  currentBoardId: string;
  isLoading: boolean;
  error: string | null;
  selectedTasks: Record<string, string | null>; // { [userId]: taskId }
}
interface KanbanState {
  kanbanData: KanbanColumnType[];
  currentBoardId: string;
  selectedTasks: Record<string, string | null>;
  isLoading: boolean;
  error: string | null;
}


export const fetchKanbanData = createAsyncThunk(
  'kanban/fetchKanbanData', 
  async () => {
    try {
      return await KanbanService.fetchKanbanList();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }
);

const initialState: KanbanState = {
  kanbanData: kanbanColumn as KanbanColumnType[],
  currentBoardId: '1',
  isLoading: false,
  error: null,
  selectedTasks: {}
};

export const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    moveTask: (state, action: PayloadAction<MoveTaskPayload>) => {
      const { currentTask, destinationColumn, sourceColumn, newOrder, emitSocket = true } = action.payload;
      
      const sourceCol = state.kanbanData.find(col => col.id === sourceColumn);
      const destCol = state.kanbanData.find(col => col.id === destinationColumn);
      
      if (!sourceCol || !destCol) {
        console.error('Invalid column IDs');
        return;
      }

      const taskIndex = sourceCol.tasks?.findIndex(t => t.id === currentTask) ?? -1;
      if (taskIndex === -1) return;
      
      const [movedTask] = sourceCol.tasks?.splice(taskIndex, 1) ?? [];
      if (!movedTask) return;

      movedTask.column_id = destinationColumn;
      movedTask.displayOrder = newOrder;
      destCol.tasks?.splice(newOrder, 0, movedTask);

      // Update display orders
      sourceCol.tasks?.forEach((task, index) => {
        task.displayOrder = index;
      });
      
      destCol.tasks?.forEach((task, index) => {
        task.displayOrder = index;
      });

      if (emitSocket) {
        saveData(state.kanbanData);
        
        if (typeof window !== 'undefined' && (window as any).socket) {
          const socket = (window as any).socket;
          socket.emit('move-task', {
            boardId: state.currentBoardId,
            taskId: currentTask,
            fromColumn: sourceColumn,
            toColumn: destinationColumn,
            order: newOrder
          });
        }
      }
    },
    
    setUserTaskSelection: (state, action: PayloadAction<UserTaskSelectionPayload>) => {
      const { userId, taskId } = action.payload;
      state.selectedTasks[userId] = taskId;
    },
    
    clearUserTaskSelection: (state, action: PayloadAction<{userId: string}>) => {
      const { userId } = action.payload;
      delete state.selectedTasks[userId];
    },
    
    handleSocketTaskMoved: (state, action: PayloadAction<TaskMovedPayload>) => {
      kanbanSlice.caseReducers.moveTask(state, {
        type: action.type,
        payload: {
          currentTask: action.payload.taskId,
          sourceColumn: action.payload.fromColumn,
          destinationColumn: action.payload.toColumn,
          newOrder: action.payload.order,
          emitSocket: false,
            
        }
        
      });
      console.log('Reducer handling task move:', action.payload);
    },
    
    setCurrentBoard: (state, action: PayloadAction<string>) => {
      state.currentBoardId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKanbanData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKanbanData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kanbanData = action.payload;
      })
      .addCase(fetchKanbanData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch kanban data';
      });
  }
});

export const { 
  moveTask,
  setUserTaskSelection,
  clearUserTaskSelection,
  handleSocketTaskMoved,
  setCurrentBoard
} = kanbanSlice.actions;

export default kanbanSlice.reducer;