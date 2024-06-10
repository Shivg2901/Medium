import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();

blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            //@ts-ignore
            c.set("userId", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch (e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});


blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = c.get('userId')

    const body = await c.req.json();
    const validatedBody = createBlogInput.safeParse(body)

    try {
        if (validatedBody.success) {
            const blog = await prisma.post.create({
                data: {
                    title: body.title,
                    description: body.description,
                    authorId: userId
                }
            })

            return c.json({
                id: blog.id
            })
        } else {
            return c.json({
                message: 'Wrong input types'
            })
        }
    } catch (err) {
        console.log(err);
        return c.json({
            message: "Internal error"
        })
    }
})


blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    const validatedBody = updateBlogInput.safeParse(body);

    try {
        if (validatedBody.success) {
            const blog = await prisma.post.update({
                where: {
                    id: body.id,
                },
                data: {
                    title: body.title,
                    description: body.description,
                }
            })

            return c.json({
                id: blog.id,
                title: blog.title,
                description: blog.description
            })
        } else {
            return c.json({
                message: 'Wrong input types'
            })
        }
    } catch (err) {
        console.log(err);
        return c.json({
            message: 'Internal Error'
        })
    }

})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const blogs = await prisma.post.findMany();
    return c.json(blogs)

})

blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const id = c.req.param('id');

    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: id
            }
        })
        return c.json({
            blog
        })
    } catch (err) {
        c.status(411)
        return c.json({
            message: 'Error while fetching blog post'
        })
    }
})

