import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  Tooltip,
  Badge
} from "@mui/material";
import ChatTwoToneIcon from "@mui/icons-material/ChatTwoTone";
import FilePresentTwoToneIcon from "@mui/icons-material/FilePresentTwoTone";
import { KanbanTasksType } from "@/types/structureTypes";
import React from "react";
import { KanbanService } from "@/services/utils/kanban";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/hooks/redux";
import { setUserTaskSelection, clearUserTaskSelection } from "@/hooks/redux/kanban";
import { useKanbanSocket } from "@/hooks/redux/useKanbanSocket";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type KanbanTaskProps = {
  task: KanbanTasksType;
  onEdit?: (task: KanbanTasksType) => void;
};

const KanbanTask = ({ task, onEdit }: KanbanTaskProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const selectedTasks = useSelector((state: RootState) => state.kanban.selectedTasks);
  const boardId = useSelector((state: RootState) => state.kanban.currentBoardId);
  
  const { socket, connected, emitTaskSelection, emitTaskDeselection } = useKanbanSocket({ boardId });
  
  // Get users currently viewing this task (excluding current user)
  const viewers = Object.entries(selectedTasks)
    .filter(([userId, taskId]) => userId !== currentUser?.id && taskId === task.id)
    .map(([userId]) => userId);

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    () => KanbanService.deleteTask(task.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['kanban']);
        toast.success('Task deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete task');
      }
    }
  );

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate();
    }
  };

  const handleTaskFocus = () => {
    if (connected && currentUser) {
      dispatch(setUserTaskSelection({
        userId: currentUser.id,
        taskId: task.id
      }));
      emitTaskSelection(task.id, currentUser.id);
    }
  };

  const handleTaskBlur = () => {
    if (connected && currentUser) {
      dispatch(clearUserTaskSelection({ userId: currentUser.id }));
      emitTaskDeselection(currentUser.id);
    }
  };

  // Format date if it exists
  const formattedDate = task.dueDate 
    ? format(new Date(task.dueDate), 'dd MMM yyyy', { locale: fr }) 
    : null;

  return (
    <Badge
      color="secondary"
      badgeContent={viewers.length}
      invisible={viewers.length === 0}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Card
        variant="elevation"
        sx={{
          width: 300,
          maxWidth: 300,
          userSelect: "none",
          border: viewers.length > 0 ? '2px solid #ffeb3b' : undefined,
          position: 'relative',
          '&:hover': {
            boxShadow: 3,
            cursor: 'pointer'
          }
        }}
        onClick={handleEditClick}
        onFocus={handleTaskFocus}
        onBlur={handleTaskBlur}
        tabIndex={0}
      >
        {/* Viewer avatars floating overlay */}
        {viewers.length > 0 && (
          <Box sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            display: 'flex',
            flexDirection: 'row-reverse'
          }}>
            {viewers.map(userId => (
              <Tooltip key={userId} title={`Viewing by user ${userId}`}>
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24,
                    border: '2px solid white',
                    marginLeft: -1
                  }}
                  // src={users[userId]?.avatar} - You'll need user data in your store
                />
              </Tooltip>
            ))}
          </Box>
        )}

        <CardContent>
          <Stack spacing={2}>
            <Stack direction={"row"} sx={{ flexWrap: "wrap" }} gap={2}>
              {task.tags?.map((tag, index) => (
                <Chip key={index} label={tag.title} variant="lightone" color={tag.color} />
              ))}
            </Stack>
            
            <Box>
              <Typography fontWeight={500} variant="body1">
                {task.title}
              </Typography>
              {task.description && (
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
              )}
            </Box>

            <Stack direction="row" justifyContent="space-between">
              <Stack alignItems={"center"} spacing={2} direction={"row"}>
                <FilePresentTwoToneIcon color="secondary" fontSize="small" />
                <Stack spacing={1} direction={"row"} alignItems={"center"}>
                  <ChatTwoToneIcon color="secondary" fontSize="small" />
                  <Typography color={"secondary"} variant="body2">
                    2
                  </Typography>
                </Stack>
              </Stack>
              
              {formattedDate && (
                <Chip 
                  label={formattedDate} 
                  size="small" 
                  color={task.dueDate && new Date(task.dueDate) < new Date() ? 'error' : 'default'}
                />
              )}
            </Stack>

            <Box>
              <Divider />
              <Stack
                spacing={2}
                direction={"row"}
                alignItems={"center"}
                sx={{ mt: 1 }}
              >
                <Avatar src="/utils/goat.jpg" sx={{ height: 30, width: 30 }} />
                <Typography variant="body2" color="textSecondary">
                  <b>Assigned to:</b> <br />
                  <span>Shaheen Jawadi</span>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Badge>
  );
};

export default KanbanTask;