import { Elysia } from "elysia";
import z, { date } from "zod/v4";

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
type Service = z.infer<typeof PostService> & { id: string } & { data: Date};

const userService = new Elysia({ prefix: "/users" })
    .get("/", async () => {
        return await db.query.users.findMany();
    })
    // .get("/:id", ({ params, status }) => {
    //     const user = users.find((user) => {
    //         return user.id === params.id;
    //     });
    //     if (user === undefined) {
    //         return status(404);
    //     }
    //     return user;
    // })
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
    );

    
    // .put(
    //     "/:id",
    //     ({ body, params }) => {
    //         users = users.map((user) => {
    //             if (user.id === params.id) {
    //                 return {
    //                     ...body,
    //                     id: params.id,
    //                 };
    //             }
    //             return user;
    //         });
    //     },
    //     { body: UserSchema },
    // )
    // .delete("/:id", ({ params }) => {
    //     users = users.filter((user) => {
    //         return user.id !== params.id;
    //     });
    // });

// const postService = new Elysia({ prefix: "/service" })
//     .get("/", () => {
//         return services;
//     })
//     .get("/:id", ({ params, status }) => {
//         const service = services.find((service) => {
//             return service.id === params.id;
//         });
//         if (service === undefined) {
//             return status(404);
//         }
//     })
//     .post(
//         "/",
//         ({ body }) => {
//             services.push({ ...body, id: Bun.randomUUIDv7(), data: new Date()});
//         },
//         {
//             body: PostService,
//         },
//     )
//     .put(
//         "/:id",
//         ({ body, params }) => {
//             services = services.map((service) => {
//                 if (service.id === params.id) {
//                     return {
//                         ...service,
//                         ...body,
//                         id: params.id,
//                     };
//                 }
//                 return service;
//             });
//         },
//         { body: PostService },
//     )
//     .delete("/:id", ({ params }) => {
//         services = services.filter((service) => {
//             return service.id !== params.id;
//         });
//     });

    

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