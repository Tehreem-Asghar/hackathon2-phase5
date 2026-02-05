import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
    // Better Auth uses this secret for all signing, including JWTs.
    // It must match the backend's SECRET_KEY.
    secret: process.env.NEXT_PUBLIC_JWT_SECRET || "NDUKy9s9fo2pDo4EytYIdpleBpWCWCdU",
    plugins: [
        jwt({
            jwt: {
                expirationTime: "30m",
            },
        }),
    ],
});




