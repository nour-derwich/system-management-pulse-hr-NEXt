
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import LocationOnTwoToneIcon from "@mui/icons-material/LocationOnTwoTone";
import { JobOffer } from "@/modules/JobOffer";


const SingleJobGrid = ({single}:{single:JobOffer}) => {
  return ( <Stack sx={{width:"100%"}} spacing={2}>
    <Box>
      <Typography variant="body1">
        {single?.short_description} 
      </Typography>
    </Box>
    <Box>
      {
        single?.tags.map((tag, index) => (
          <Chip key={index} variant="outlined" size="small" color="secondary" label={tag} />
        ))
      }
 
    </Box>
    <Stack direction={"row"} justifyContent={"space-between"}>
      <Stack direction={"row"}>
        <LocationOnTwoToneIcon color="success" />
        <Typography variant="body1">{single?.location}</Typography>
      </Stack>

      <Box>
        <Typography variant="body2">Posté depuis 2 jours</Typography>
      </Box>
    </Stack>

    <Divider />
    <Box>
      <Typography>Candidatures:</Typography>

      <Stack spacing={1}>
        <Stack spacing={4} direction={"row"} alignItems={"center"}>
          <Typography variant="body1" color={"secondary"}>
            Total
          </Typography>
          <Divider sx={{ flex: 1 }} />

          <Typography variant="body1" fontSize={20} color={"primary"}>
            15
          </Typography>
        </Stack>
        <Stack spacing={4} direction={"row"} alignItems={"center"}>
          <Typography variant="body1" color={"secondary"}>
            Présélectionné
          </Typography>
          <Divider sx={{ flex: 1 }} />

          <Typography variant="body1" fontSize={20} color={"success"}>
            2
          </Typography>
        </Stack>

        <Stack spacing={4} direction={"row"} alignItems={"center"}>
          <Typography variant="body1" color={"secondary"}>
            Refusées
          </Typography>
          <Divider sx={{ flex: 1 }} />

          <Typography variant="body1" fontSize={20} color={"error"}>
            10
          </Typography>
        </Stack>
      </Stack>
    </Box>
  </Stack>);
};


export default SingleJobGrid;
