import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanService } from '@/services/utils/kanban/index';
import { KanbanTaskType } from '@/modules/kanabn/index';

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: { 
      columnId: string, 
      taskData: Partial<KanbanTaskType> 
    }) => KanbanService.createTask(payload.columnId, payload.taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kanban-board', boardId]
      });
      // You can add toast notification here if needed
    },
    onError: (error: Error) => {
      console.error('Error creating task:', error);
      // Handle error (show toast, etc.)
    }
  });
};