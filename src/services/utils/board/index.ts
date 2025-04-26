import { useMutation, useQuery, useQueryClient } from "react-query";
import { KanbanService } from "./../kanban/index";
import { toast } from "react-toastify";
import { KanbanColumnType, KanbanTaskType } from "@/modules/kanabn";

// Query keys
const QUERY_KEYS = {
  BOARDS: "kanban-boards",
  BOARD: (id: string) => [`kanban-board`, id],
  COLUMNS: (boardId: string) => [`kanban-columns`, boardId],
  TASKS: (columnId: string) => [`kanban-tasks`, columnId],
  TAGS: "kanban-tags",
  KANBAN_LIST: (boardId?: string) => boardId ? [`kanban-list`, boardId] : "kanban-list"
};

// Board hooks
export const useBoards = () => {
  return useQuery(QUERY_KEYS.BOARDS, () => KanbanService.fetchBoards());
};

export const useBoard = (boardId: string) => {
  return useQuery(QUERY_KEYS.BOARD(boardId), () => KanbanService.fetchBoardById(boardId));
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (boardData: any) => KanbanService.createBoard(boardData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.BOARDS);
        toast.success("Board created successfully");
      },
      onError: () => {
        toast.error("Failed to create board");
      }
    }
  );
};

export const useUpdateBoard = (boardId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (boardData: any) => KanbanService.updateBoard(boardId, boardData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.BOARD(boardId));
        queryClient.invalidateQueries(QUERY_KEYS.BOARDS);
        toast.success("Board updated successfully");
      },
      onError: () => {
        toast.error("Failed to update board");
      }
    }
  );
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (boardId: string) => KanbanService.deleteBoard(boardId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.BOARDS);
        toast.success("Board deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete board");
      }
    }
  );
};

// Column hooks
export const useColumns = (boardId: string) => {
  return useQuery(QUERY_KEYS.COLUMNS(boardId), () => KanbanService.fetchColumns(boardId));
};

export const useCreateColumn = (boardId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (columnData: any) => KanbanService.createColumn(boardId, columnData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.COLUMNS(boardId));
        queryClient.invalidateQueries(QUERY_KEYS.KANBAN_LIST(boardId));
        toast.success("Column created successfully");
      },
      onError: () => {
        toast.error("Failed to create column");
      }
    }
  );
};

// Task hooks
export const useTasks = (columnId: string) => {
  return useQuery(QUERY_KEYS.TASKS(columnId), () => KanbanService.fetchTasks(columnId));
};

export const useCreateTask = (columnId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (taskData: any) => KanbanService.createTask(columnId, taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.TASKS(columnId));
        if (boardId) {
          queryClient.invalidateQueries(QUERY_KEYS.KANBAN_LIST(boardId));
        }
        toast.success("Task created successfully");
      },
      onError: () => {
        toast.error("Failed to create task");
      }
    }
  );
};

export const useUpdateTask = (taskId: string, columnId: string, boardId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (taskData: any) => KanbanService.updateTask(taskId, taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.TASKS(columnId));
        if (boardId) {
          queryClient.invalidateQueries(QUERY_KEYS.KANBAN_LIST(boardId));
        }
        toast.success("Task updated successfully");
      },
      onError: () => {
        toast.error("Failed to update task");
      }
    }
  );
};

export const useMoveTask = (boardId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ 
      taskId, 
      fromColumnId, 
      toColumnId, 
      displayOrder 
    }: { 
      taskId: string; 
      fromColumnId: string; 
      toColumnId: string; 
      displayOrder: number 
    }) => 
      KanbanService.moveTask(taskId, { fromColumnId, toColumnId, displayOrder }),
    {
      onSuccess: (_, variables) => {
        // Invalidate affected column queries
        queryClient.invalidateQueries(QUERY_KEYS.TASKS(variables.fromColumnId));
        queryClient.invalidateQueries(QUERY_KEYS.TASKS(variables.toColumnId));
        
        // Invalidate the overall kanban list if boardId is provided
        if (boardId) {
          queryClient.invalidateQueries(QUERY_KEYS.KANBAN_LIST(boardId));
        }
        
        toast.success("Task moved successfully");
      },
      onError: () => {
        toast.error("Failed to move task");
      }
    }
  );
};

// Kanban List hook (combined columns and tasks)
export const useKanbanList = (boardId?: string) => {
  return useQuery(
    QUERY_KEYS.KANBAN_LIST(boardId), 
    () => KanbanService.fetchKanbanList(boardId)
  );
};

// Optimistic update for task movement
export const useOptimisticMoveTask = (boardId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ 
      taskId, 
      fromColumnId, 
      toColumnId, 
      displayOrder 
    }: { 
      taskId: string; 
      fromColumnId: string; 
      toColumnId: string; 
      displayOrder: number 
    }) => 
      KanbanService.moveTask(taskId, { fromColumnId, toColumnId, displayOrder }),
    {
      // Handle optimistic update
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(QUERY_KEYS.KANBAN_LIST(boardId));
        
        // Snapshot the previous value
        const previousKanban = queryClient.getQueryData(QUERY_KEYS.KANBAN_LIST(boardId));
        
        // Optimistically update to the new value
        queryClient.setQueryData<KanbanColumnType[]>(
          QUERY_KEYS.KANBAN_LIST(boardId), 
          (old:any) => {
            if (!old) return old;
            
            const newColumns = [...old];
            const sourceColumnIndex = newColumns.findIndex(col => col.id === variables.fromColumnId);
            const destColumnIndex = newColumns.findIndex(col => col.id === variables.toColumnId);
            
            if (sourceColumnIndex === -1 || destColumnIndex === -1) return old;
            
            // Find and remove the task from source column
            const sourceColumn = { ...newColumns[sourceColumnIndex] };
            const taskIndex = sourceColumn.tasks?.findIndex(task => task.id === variables.taskId);
            
            if (taskIndex === undefined || taskIndex === -1 || !sourceColumn.tasks) return old;
            
            const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
            
            // Update source column task order
            sourceColumn.tasks.forEach((task:string, idx) => {
              task.displayOrder = idx;
            });
            
            newColumns[sourceColumnIndex] = sourceColumn;
            
            // Add task to destination column
            const destColumn = { ...newColumns[destColumnIndex] };
            const updatedTask = {
              ...movedTask,
              column_id: variables.toColumnId,
              displayOrder: variables.displayOrder
            };
            
            if (!destColumn.tasks) {
              destColumn.tasks = [updatedTask];
            } else {
              destColumn.tasks.push(updatedTask);
              // Sort tasks by display order
              destColumn.tasks.sort((a, b) => a.displayOrder - b.displayOrder);
              // Update display orders
              destColumn.tasks.forEach((task, idx) => {
                task.displayOrder = idx;
              });
            }
            
            newColumns[destColumnIndex] = destColumn;
            
            return newColumns;
          }
        );
        
        return { previousKanban };
      },
      
      // If the mutation fails, roll back to the previous value
      onError: (err, variables, context) => {
        if (context?.previousKanban) {
          queryClient.setQueryData(
            QUERY_KEYS.KANBAN_LIST(boardId), 
            context.previousKanban
          );
        }
        toast.error("Failed to move task");
      },
      
      // On success, invalidate queries to refetch from server
      onSuccess: (_, variables) => {
        toast.success("Task moved successfully");
      },
      
      // Always refetch after error or success
      onSettled: () => {
        queryClient.invalidateQueries(QUERY_KEYS.KANBAN_LIST(boardId));
      }
    }
  );
};