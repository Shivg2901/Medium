import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
    Bindings: {
        JWT_SECRET: string,
        DATABASE_URL: string
    }
}>();

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())


    const body = await c.req.json();
    const validatedBody = signupInput.safeParse(body)

    try {
        if (validatedBody.success) {
            const user = await prisma.user.create({
                data: {
                    email: body.email,
                    name: body.name,
                    password: body.password,
                }
            })

            const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
            console.log(c.env.JWT_SECRET);
            console.log(jwt)
            return c.json({
                token: jwt
            })
        } else {
            return c.json({
                message: 'Wrong input type'
            });
        }
    } catch (err: any) {
        c.status(411);
        return c.json({});
    }

})

userRouter.post('/signin', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    const validatedBody = signinInput.safeParse(body);


    try {
        if (validatedBody.success) {
            const user = await prisma.user.findFirst({
                where: {
                    email: body.email,
                    password: body.password
                }
            })

            if (!user) {
                c.status(403);
                return c.text('Unauthorized');
            }

            const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
            return c.json({
                token: jwt
            })
        } else {
            return c.json({
                message: 'Wrong input type'
            })
        }
    } catch (err) {
        console.log(err);
        c.status(411);
        return c.text('Invalid')
    }
})
