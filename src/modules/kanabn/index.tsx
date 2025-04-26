// export type KanbanColumnType = {

//     id: number,
//     title: string,
//    tasks?: KanbanTasksType[],
// }

export type KanbanTasksType = {

    id: number,
    column_id: number,
    title: string, 
    tags: KanbanTaskTagsType[],
    displayOrder:number


}

export type KanbanTaskTagsType = {
    title: string,
    color: "primary"| "secondary" | "error" | "warning" | "info" | "success",
 

}
// backend new models updated



export interface KanbanUserType {
  id: string;
  name: string;
  lastName?: string;
  avatar?: string;
  email?: string;
}

export interface KanbanTagType {
  id: string;
  title: string;
  color?: string;
}

export interface KanbanTaskType {
  id: string;
  title: string;
  description?: string;
  displayOrder: number;
  column_id: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: KanbanUserType;
  tags?: KanbanTagType[];
  createdBy?: string;
}

export interface KanbanColumnType {
  id: string;
  title: string;
  board?: string;
  order: number;
  tasks?: KanbanTaskType[];
}

export interface KanbanBoardType {
  id: string;
  name: string;
  description?: string;
  department?: string;
  members?: KanbanUserType[];
  createdBy?: KanbanUserType;
  createdAt?: string;
}