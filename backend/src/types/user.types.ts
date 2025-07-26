export interface UserWithPassword {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  positionId: string | null;
  departmentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  last_login: Date | null;
  position?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}