import { ReactElement, ReactNode } from "react";
import { SvgIconProps, SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from "@mui/material/OverridableComponent";

export type NavigationMenuType = {

    title: string,
    icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>,
    link: string,
    childs?: NavigationMenuType[];

}


export type ListingMenuItemType = {
    title: string;
    icon: React.ReactElement, 
    link?:string,
}


export type StepperFormType = {
    label: string,
    componentPage: ReactNode, 
    icon?: ReactNode

}

export type SelectDataTypes = {
    value: any;
    labelText: any;

}


export type ServiceRegistryCall="Manager"|"Department" |"WorkPosition" |"Shift" |"ContractType";