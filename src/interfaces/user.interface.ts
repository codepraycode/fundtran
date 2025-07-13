
export interface IUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    created_at: Date;
    updated_at?: Date;
    is_verified?: boolean;
    verification_token?: string | null;
    last_login?: Date;
}

export interface IUserCreate {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
}

export interface IUserLogin {
    email: string;
    password: string;
}