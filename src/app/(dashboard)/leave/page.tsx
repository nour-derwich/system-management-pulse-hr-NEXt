"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PagerHeader from "@/components/listingPages/pageHeader";
import AttachmentIcon from "@mui/icons-material/Attachment";
import CardListing from "@/components/listingPages/cardsListing";
import { SelectField } from "@/components/utils/SelectField";
import { SelectDataTypes } from "@/types/structureTypes";
import { useDialogAction } from "@/components/dialog/dialog.context";

const LeavePage = () => {
  const orderByList: SelectDataTypes[] = [
    {
      labelText: "Plus récent",
      value: 0,
    },
    {
      labelText: "Plus ancien",
      value: 1,
    },
  ];
  return (
    <Stack spacing={3}>
      <PagerHeader title="Demande de congé" />

      <Stack
        direction={"row"}
        divider={<Divider orientation="horizontal" />}
        justifyContent={"space-between"}
        alignItems={"center"}
        spacing={2}
      >
        <Box minWidth={200}> 
          
            <SelectField size="small" label={"Trier par"} selectData={orderByList} />
        
        </Box>

        <ButtonGroup variant="outlined">
          <Button variant="contained" color="warning">
          En attente
          </Button>
          <Button color="success">Approuvée</Button>
          <Button color="error">Rejetée</Button>
          <Button color="secondary">Toutes</Button>
        </ButtonGroup>
      </Stack>

      <Stack
        className="topContent"
        spacing={2}
        direction={"row"}
        justifyContent={"flex-end"}
      ></Stack>
      <Box>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => {
            return (
              <Grid item xs={3}>
                <CardListing
                  title={"Nom & prenom"}
                  subTitle={
                    <>
                      departement <br />
                      poste
                    </>
                  }
                  notReverse={true}
                  avatar="/utils/goat.jpg"
                  /*   approuver, rejeter */
                  customAction={
                    <Chip
                      color="warning"
                      variant={"outlined"}
                      label={"En attente"}
                    />
                  }
                >
                  <CardItemContent />
                </CardListing>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
};

const CardItemContent = () => {

    const { openDialog } = useDialogAction();

 

    const openLeaveInfo = () => {

       openDialog("PROCESS_LEAVE", { id: 1 } , "sm");
    }
  return (
    <>
      <Stack spacing={2}>
        <Stack direction={"row"} alignItems={"center"} spacing={1}>
          <Typography variant="body2">Type de congée :</Typography>
          <Typography variant="body1" color={"secondary"}>
            Maladie
          </Typography>
        </Stack>

        <Stack direction={"row"} alignItems={"center"} spacing={1}>
          <Typography variant="body2">Période:</Typography>
          <Typography color={"secondary"}>12/12/2022 </Typography>
          <PlayArrowIcon color="secondary" sx={{ fontSize: 18 }} />
          <Typography color={"secondary"}>01/01/2023</Typography>
        </Stack>

 
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <IconButton color={"success"}>
            <AttachmentIcon />
          </IconButton>
          <Typography color={"success"}>
            Avec fichiers joints
            {/*       Sans fichiers joints */}
          </Typography>
        </Stack>
      </Stack>

      <Divider />

      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box>
          <Typography> demandé il y'a 2 jours </Typography>
        </Box>
        <Button onClick={openLeaveInfo} color="primary" variant="contained">
          Traiter
        </Button>
      </Stack>
    </>
  );
};

export default LeavePage;
