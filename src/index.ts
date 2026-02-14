import { Elysia } from "elysia";
import z, { date, email } from "zod/v4";

import { and, eq, gt, gte, lt, lte, not, or } from "drizzle-orm";
import { db } from "./db";
import { users, posts } from "./schema";

const UserSchema = z.object({
    name: z
        .string({
            message: "Введите имя",
        })
        .min(3, "Имя должно быть длиннее чем 3 символа"),
    age: z
        .number({
            message: "Введите возраст",
        })
        .nonnegative("Возраст должен быть положительным"),
    email: z.email({
        message: "Введите почту",
    }),
});

const PostService = z.object({
    title: z.string({
        message: "Введите заголовок",
    }),
    description: z.string({
        message: "Введите описание",
    }),
});

type User = z.infer<typeof UserSchema> & { id: string };
type Service = z.infer<typeof PostService> & { id: string } & { data: Date };

const userService = new Elysia({ prefix: "/users" })
    .get("/", async () => {
        return await db.query.users.findMany();
    })
    .get("/:id", async ({ params, status }) => {
        const oneuser = await db.query.users.findFirst({
            where: eq(users.id, params.id)

        })

        if (oneuser === undefined) {
            return status(404);
        }
        return oneuser;
    })
    .post(
        "/",
        async ({ body }) => {
            await db.insert(users).values({
                ...body,
                id: Bun.randomUUIDv7()
            });
        },
        {
            body: UserSchema,
        }
    )


    .put(
        "/:id",
        async ({ body, params }) => {
            await db
                .update(users)
                .set(body)
                .where(eq(users.id, params.id));
        },
        { body: UserSchema }
    )

    // Решил проверить обновление только 1 параметра, но по ощущениям сделал нерационально
    .put(
        "/email/:id",
        async ({ body, params }) => {
            await db
                .update(users)
                .set({
                    ...body,
                    email: body.email
                }     
                )
                .where(eq(users.id, params.id));
        },
        { body: UserSchema }
    )

    .delete("/:id", async ({ params }) => {
        await db.delete(users)
            .where(eq(users.id, params.id))
    });

const postService = new Elysia({ prefix: "/service" })
    .get("/", async () => {
        return await db.query.posts.findMany();
    })

    .get("/:id", async({ params, status }) => {

        const post = await db.query.posts.findFirst({
            where: eq(posts.id, params.id)
        })

        if (post === undefined) {
            return status(404);
        }
        return post;
    })

    // .post(
    //     "/",
    //     async ({ body }) => {
    //     await db.insert(posts).values({
    //         ...body,
    //         id: Bun.randomUUIDv7(),
    //         createdAt: new Date()
    //     })
    // },
    // {
    //     body: PostService
    // })
        
    .put(
        "/:id",
        async ({ body, params }) => {
            await db
                .update(posts)
                .set(body)
                .where(eq(posts.id, params.id));
        },
        { body: PostService }
    )

    .delete("/:id", async ({ params }) => {
        await db.delete(posts)
        .where(eq(posts.id, params.id))
    });
    



new Elysia()
    .use(userService)
    .get("/", () => {
        return "Денис меганайт";
    })

    .get("/test", () => {
        return {
            name: "Aleksey",
        };
    })


    .listen(3000);