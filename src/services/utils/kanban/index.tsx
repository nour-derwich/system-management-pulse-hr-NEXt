import { KanbanColumnType, KanbanTaskType, KanbanBoardType, KanbanTagType } from "@/modules/kanabn";
import { CoreApi } from "@/utils/apiCore";
import { API_SECTIONS } from "@/utils/apiEndpoints";

class KanbanServiceClass {
  protected service;
  protected boardService;
  protected columnService;
  protected taskService;
  protected tagService;

  constructor() {
    // Assuming your CoreApi can take different endpoints
    this.service = new CoreApi(API_SECTIONS.utils.kanban);
    this.boardService = new CoreApi(API_SECTIONS.utils.kanban + '/boards');
    this.columnService = new CoreApi(API_SECTIONS.utils.kanban + '/columns');
    this.taskService = new CoreApi(API_SECTIONS.utils.kanban + '/tasks');
    this.tagService = new CoreApi(API_SECTIONS.utils.kanban + '/tags');
  }

  // Board operations
  fetchBoards = async () => {
    const response = await this.boardService.list();
    return response?.data as KanbanBoardType[];
  };

  fetchBoardById = async (boardId: string) => {
    const response = await this.boardService.get(boardId);
    return response?.data as KanbanBoardType;
  };

  createBoard = async (boardData: Partial<KanbanBoardType>) => {
    const response = await this.boardService.create(boardData);
    return response;
  };

  updateBoard = async (boardId: string, boardData: Partial<KanbanBoardType>) => {
    const response = await this.boardService.update(boardId, boardData);
    return response;
  };

  deleteBoard = async (boardId: string) => {
    const response = await this.boardService.delete(boardId);
    return response;
  };

  // Column operations
  fetchColumns = async (boardId: string) => {
    const response = await this.boardService.customGet(`${boardId}/columns`);
    return response?.data as KanbanColumnType[];
  };

  createColumn = async (boardId: string, columnData: Partial<KanbanColumnType>) => {
    const response = await this.boardService.customPost(`${boardId}/columns`, columnData);
    return response;
  };

  updateColumn = async (columnId: string, columnData: Partial<KanbanColumnType>) => {
    const response = await this.columnService.update(columnId, columnData);
    return response;
  };

  deleteColumn = async (columnId: string) => {
    const response = await this.columnService.delete(columnId);
    return response;
  };

  // Task operations
  fetchTasks = async (columnId: string) => {
    const response = await this.columnService.customGet(`${columnId}/tasks`);
    return response?.data as KanbanTaskType[];
  };

  createTask = async (columnId: string, taskData: Partial<KanbanTaskType>) => {
    const response = await this.columnService.customPost(`${columnId}/tasks`, taskData);
    return response;
  };

  updateTask = async (taskId: string, taskData: Partial<KanbanTaskType>) => {
    const response = await this.taskService.update(taskId, taskData);
    return response;
  };

  moveTask = async (taskId: string, moveData: { 
    fromColumnId: string, 
    toColumnId: string, 
    displayOrder: number 
  }) => {
    const response = await this.taskService.customPost(`${taskId}/move`, moveData);
    return response;
  };

  deleteTask = async (taskId: string) => {
    const response = await this.taskService.delete(taskId);
    return response;
  };

  // Tag operations
  fetchTags = async () => {
    const response = await this.tagService.list();
    return response?.data as KanbanTagType[];
  };

  createTag = async (tagData: Partial<KanbanTagType>) => {
    const response = await this.tagService.create(tagData);
    return response;
  };

  updateTag = async (tagId: string, tagData: Partial<KanbanTagType>) => {
    const response = await this.tagService.update(tagId, tagData);
    return response;
  };

  deleteTag = async (tagId: string) => {
    const response = await this.tagService.delete(tagId);
    return response;
  };

  // Composite operations
  fetchKanbanList = async (boardId?: string) => {
    if (!boardId) {
      // Fallback to your original implementation if no boardId is provided
      const list = await this.service.list();
      return list?.data as KanbanColumnType[];
    }
    
    // Fetch columns for the specific board
    const columns = await this.fetchColumns(boardId);
    
    // For each column, fetch its tasks
    const columnsWithTasks = await Promise.all(
      columns.map(async (column) => {
        const tasks = await this.fetchTasks(column.id);
        return {
          ...column,
          tasks
        };
      })
    );
    
    return columnsWithTasks;
  };

  update = async (data: any) => {
    const response = await this.service.update(data);
    return response;
  };
}

const KanbanService = new KanbanServiceClass();
export { KanbanService };