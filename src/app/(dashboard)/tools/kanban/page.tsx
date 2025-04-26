// components/pages/kanban/KanbanPage.tsx
"use client";
import React, { useEffect } from "react";
import { Box, Stack, CircularProgress, Alert } from "@mui/material";
import PerfectScrollbar from "react-perfect-scrollbar";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import KanbanColumns from "@/components/pages/kanban/columns";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "@/hooks/redux/index"; // Update import path
import { fetchKanbanData, moveTask, setCurrentBoard } from "@/hooks/redux/kanban";
import { useKanbanSocket } from "@/hooks/redux/useKanbanSocket";

const KanbanPage = ({ params }: { params: { boardId: string } }) => {
  const { kanbanData, isLoading, error } = useSelector((state: RootState) => state.kanban);
  const dispatch = useDispatch<AppDispatch>();
   const state = useSelector((state: RootState) => state);
  useEffect(() => {
    console.log('Current Redux state:', state);
  }, [state.kanban]); 
  
  const boardId = params.boardId || "1";
  const { connected } = useKanbanSocket({ boardId });

  useEffect(() => {
    dispatch(setCurrentBoard(boardId));
    dispatch(fetchKanbanData());
  }, [dispatch, boardId]);

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    if (!destination || (source.droppableId === destination.droppableId && 
        source.index === destination.index)) {
      return;
    }
    
    dispatch(moveTask({
      currentTask: draggableId,
      sourceColumn: source.droppableId,
      destinationColumn: destination.droppableId,
      newOrder: destination.index
    }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
   
<Box sx={{ 
  mb: 2,
  p: 1,
  backgroundColor: connected ? 'success.light' : 'error.light',
  borderRadius: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1
}}>
  {connected ? (
    <>
      <div style={{
        width: 10,
        height: 10,
        backgroundColor: 'green',
        borderRadius: '50%'
      }} />
      <span>Real-time collaboration active</span>
    </>
  ) : (
    <>
      <div style={{
        width: 10,
        height: 10,
        backgroundColor: 'red',
        borderRadius: '50%'
      }} />
      <span>Working offline - changes won't sync</span>
      <button 
        onClick={() => window.location.reload()}
        style={{ marginLeft: 8, cursor: 'pointer' }}
      >
        Retry
      </button>
    </>
  )}
</Box>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <PerfectScrollbar dir="horizontal">
          <Stack direction="row" spacing={4}>
            {kanbanData?.map((column:any) => (
              <Droppable droppableId={column.id} key={column.id} type="TASK">
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef}>
                    <KanbanColumns column={column} tasks={column?.tasks || []} />
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            ))}
          </Stack>
        </PerfectScrollbar>
      </DragDropContext>
    </>
  );
};

export default KanbanPage;