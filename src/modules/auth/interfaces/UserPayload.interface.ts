export interface UserPayload {
    id: number;
    email: string;
    role: string;
    companyId: number;
    iat?: number;
    exp?: number;
}