export declare enum Role {
    EMPLOYEE = "employee",
    MANAGER = "manager",
    ADMIN = "admin"
}
export declare class UpdateUserDto {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    role?: Role;
    positionId?: string;
    departmentId?: string;
    hireDate?: string;
    contractType?: string;
    salary?: number;
    status?: string;
    benefits?: string;
}
