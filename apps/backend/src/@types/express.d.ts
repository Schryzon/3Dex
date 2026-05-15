import { Role } from "@prisma/client";

declare global {
    namespace Express {
        interface Auth_User {
            id: string;
            email: string;
            username: string;
            role: Role;
            show_nsfw: boolean;
        }

        interface Request {
            user?: Auth_User;
        }
    }
}

export { };