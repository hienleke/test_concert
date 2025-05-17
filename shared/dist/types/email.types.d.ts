export interface IEmailOptions {
    to: string;
    subject: string;
    body: string;
    userId: string;
    concertId: string;
    seatType: string;
    action: 'book' | 'cancel';
}
export interface IEmailJob {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    data: IEmailOptions;
    createdAt: Date;
    updatedAt: Date;
    error?: string;
}
export interface IEmailTemplate {
    subject: string;
    html: string;
}
