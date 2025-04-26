import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { KanbanService } from '@/services/utils/kanban';
import KanbanTask from './task';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { KanbanColumnType, KanbanTasksType } from '@/modules/kanabn';

interface KanbanBoardProps {
  boardId?: string; // Optional if you're loading all kanban data
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId }) => {
  const queryClient = useQueryClient();
  
  // Fetch kanban data
  const { data: columns, isLoading, error } = useQuery(
    ['kanban', boardId], 
    () => KanbanService.fetchKanbanList(),
    {
      onError: () => {
        toast.error('Failed to load kanban data');
      }
    }
  );

  // Add a new task mutation
  const addTaskMutation = useMutation(
    ({ columnId, taskData }: { columnId: string; taskData: any }) => 
      KanbanService.createTask(columnId, taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['kanban', boardId]);
        toast.success('Task added successfully');
      },
      onError: () => {
        toast.error('Failed to add task');
      }
    }
  );

  // Move task mutation
  const moveTaskMutation = useMutation(
    ({ taskId, moveData }: { taskId: string; moveData: any }) => 
      KanbanService.moveTask(taskId, moveData),
    {
      // Use optimistic updates to avoid refetching
      onMutate: async ({ taskId, moveData }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['kanban', boardId]);
        
        // Snapshot the previous value
        const previousColumns = queryClient.getQueryData<KanbanColumnType[]>(['kanban', boardId]);
        
        // Optimistically update the UI
        if (previousColumns) {
          const newColumns = [...previousColumns];
          
          // Find source column and task
          const sourceColumnIndex = newColumns.findIndex(col => col.id === moveData.fromColumnId);
          if (sourceColumnIndex === -1) return { previousColumns };
          
          const sourceColumn = newColumns[sourceColumnIndex];
          const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
          if (taskIndex === -1) return { previousColumns };
          
          // Remove task from source column
          const [task] = sourceColumn.tasks.splice(taskIndex, 1);
          
          // Add to destination column
          const destColumnIndex = newColumns.findIndex(col => col.id === moveData.toColumnId);
          if (destColumnIndex === -1) return { previousColumns };
          
          // Update task properties
          task.column_id = moveData.toColumnId;
          task.displayOrder = moveData.displayOrder;
          
          // Insert at the right position
          newColumns[destColumnIndex].tasks.splice(moveData.displayOrder, 0, task);
          
          // Update display orders for all tasks in destination column
          newColumns[destColumnIndex].tasks.forEach((t, idx) => {
            t.displayOrder = idx;
          });
          
          // Update the cache
          queryClient.setQueryData(['kanban', boardId], newColumns);
        }
        
        return { previousColumns };
      },
      onError: (err, variables, context) => {
        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousColumns) {
          queryClient.setQueryData(['kanban', boardId], context.previousColumns);
        }
        toast.error('Failed to move task');
      },
      onSettled: () => {
        // Always refetch to ensure server/client sync
        queryClient.invalidateQueries(['kanban', boardId]);
      }
    }
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside the list or no movement
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    moveTaskMutation.mutate({
      taskId: draggableId,
      moveData: {
        fromColumnId: source.droppableId,
        toColumnId: destination.droppableId,
        displayOrder: destination.index
      }
    });
  };

  // Simple function to add a placeholder new task
  const handleAddTask = (columnId: string) => {
    addTaskMutation.mutate({
      columnId,
      taskData: {
        title: `New Task ${Math.floor(Math.random() * 1000)}`,
        description: 'Click to edit this task',
        tags: [] // Add default tags if needed
      }
    });
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading board</Typography>;
  if (!columns?.length) return <Typography>No columns found</Typography>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, p: 2 }}>
        {columns.map((column) => (
          <Box 
            key={column.id}
            sx={{ 
              width: 320,
              minWidth: 320,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 170px)'
            }}
          >
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">{column.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {column.tasks.length}
              </Typography>
            </Box>
            
            <Droppable  droppableId={column.id}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    p: 1,
                    flexGrow: 1,
                    overflowY: 'auto'
                  }}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable  key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 2,
                            transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                            transition: 'transform 0.2s'
                          }}
                        >
                          <KanbanTask task={task} />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
            
            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                startIcon={<AddIcon />}
                fullWidth
                onClick={() => handleAddTask(column.id)}
                sx={{ justifyContent: 'flex-start' }}
              >
                Add a task
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default KanbanBoard;