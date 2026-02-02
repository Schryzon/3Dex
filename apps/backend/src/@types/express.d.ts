import { Role } from "@prisma/client";

declare global{
    namespace Express{
        type Auth_User = {
            id: number;
            email: string;
            username: string;
            role: Role;
        };

        interface Request{
            user?: Auth_User;
        }
    }
}

export {};