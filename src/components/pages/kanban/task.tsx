import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material"; 
import ChatTwoToneIcon from "@mui/icons-material/ChatTwoTone";
import FilePresentTwoToneIcon from "@mui/icons-material/FilePresentTwoTone";
import { KanbanTasksType } from "@/types/kanbanTypes";
import React, { useRef } from "react";
 
type KanbanTaskProps ={
  task: KanbanTasksType; 
}


const KanbanTask = ( {task}:KanbanTaskProps ) => {
 


  return (
    <Card   variant="elevation" sx={{ width: 300, maxWidth: 300 , userSelect:"none" }}  >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={"row"} sx={{ flexWrap: "wrap" }} gap={2}>
            {task.tags.map((tag, index) => (
              <Chip key={index} label={tag.title} variant="lightone" color={tag.color} />
            ))}
          </Stack>
          <Box>
            <Typography fontWeight={500} variant="body1">
              {task.title}
            </Typography>
          </Box>
          <Stack alignItems={"center"} spacing={2} direction={"row"}>
            <Stack>
              <FilePresentTwoToneIcon color="secondary" fontSize="small" />
            </Stack>
            <Stack spacing={1} direction={"row"} alignItems={"center"}>
              <ChatTwoToneIcon color="secondary" fontSize="small" />
              <Typography color={"secondary"} variant="body2">
                2
              </Typography>
            </Stack>
          </Stack>
          <Box>
            <Divider />
            <Stack
              spacing={2}
              alignSelf={"center"}
              direction={"row"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Avatar src="/utils/goat.jpg" sx={{ height: 30, width: 30 }} />
              <Typography variant="body2" color="textSecondary">
                <b>Attribué par:</b> <br />
                <span>Shaheen Jawadi</span>
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
    
  );
};

export default KanbanTask;
