// File: src/components/modals/cardModal/types.ts
// Define types used in CardModal components

export interface Card {
    id: string;
    title: string;
    description?: string;
    images?: string[];
    members?: CardMember[];
    labels?: Label[];
    checklists?: Checklist[];
    comments?: Comment[];
    attachments?: Attachment[];
    dueDate?: string;
    number: number;
    updatedAt?: string;
  }
  
  export interface User {
    id: string;
    email: string;
  }
  
  export interface Label {
    id: string;
    text: string;
    color: string;
  }
  
  export interface Checklist {
    id: string;
    title: string;
    items: ChecklistItem[];
  }
  
  export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
  }
  
  export interface Comment {
    id: string;
    text: string;
    userId: string;
    userEmail: string;
    createdAt: string;
  }
  
  export interface CardMember {
    id: string;
    email: string;
  }
  
  export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: string;
  }
  