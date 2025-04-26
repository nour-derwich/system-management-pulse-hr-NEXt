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

export interface KanbanTasksType {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  displayOrder: number;
  dueDate?: string | Date; // Can be ISO string or Date object
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  createdAt: string | Date;
  updatedAt?: string | Date;
  tags: KanbanTagType[];
  comments?: KanbanCommentType[]; // If you have comments
  attachments?: KanbanAttachmentType[]; // If you have file attachments
  // Add any other task-specific fields you need
}

// Supporting types
export interface KanbanTagType {
  id: string;
  title: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  // or string if you want custom colors
}

export interface KanbanCommentType {
  id: string;
  text: string;
  userId: string;
  createdAt: string | Date;
}

export interface KanbanAttachmentType {
  id: string;
  name: string;
  url: string;
  type: string; // 'image' | 'pdf' | 'doc' etc.
  uploadedBy: string;
  createdAt: string | Date;
}

export type ServiceRegistryCall="Manager"|"Department" |"WorkPosition" |"Shift" |"ContractType";