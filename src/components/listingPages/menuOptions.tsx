"use client";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert"; 
import { styled } from "@mui/material";
import { ListingMenuItemType } from "@/types/structureTypes";
import { useRouter } from "next/navigation";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    minWidth: 180,

    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 21,
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1.5),
      },
    },
  },
}));
 
type Props = {
  menulist: ListingMenuItemType[];
};

const MenuOption = (props: Props) => {
  const { menulist } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
   const router = useRouter();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClickMenu = (link?:string) => {
    setAnchorEl(null);

    if(link){
      router.push(link);
    }
  };

  return (
    <div>
      <IconButton
        color="secondary"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={()=>setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {menulist.map((option) => (
          <MenuItem key={option.title} onClick={()=>handleClickMenu(option.link)}>
            {option.icon}
            {option.title}
          </MenuItem>
        ))}
      </StyledMenu>
    </div>
  );
};

export default MenuOption;
