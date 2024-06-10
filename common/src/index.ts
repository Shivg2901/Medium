import zod from "zod";

export const signupInput = zod.object({
    email: zod.string().email(),
    name: zod.string().min(6),
    password: zod.string().optional()
})

export const signinInput = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6)
})

export const createBlogInput = zod.object({
    title: zod.string(),
    description: zod.string(),
})

export const updateBlogInput = zod.object({
    title: zod.string(),
    description: zod.string(),
    id: zod.string()
})

export type SignupInput = zod.infer<typeof signupInput>
export type SigninInput = zod.infer<typeof signinInput>
export type CreateBlogInput = zod.infer<typeof createBlogInput>
export type UpdateBlogInput = zod.infer<typeof updateBlogInput>






