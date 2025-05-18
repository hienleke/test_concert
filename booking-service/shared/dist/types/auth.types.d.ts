export interface IUser {
    _id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ITokenPayload {
    userId: string;
    email: string;
    name: string;
}
export interface IAuthResponse {
    user: IUser;
    accessToken: string;
    refreshToken: string;
}
export interface ILoginResponse extends IAuthResponse {
}
export interface IRegisterInput {
    email: string;
    password: string;
    name: string;
}
export interface ILoginInput {
    email: string;
    password: string;
}
