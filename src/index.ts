import { Elysia } from "elysia";
import z, { date, email } from "zod/v4";

import { and, eq, gt, gte, lt, lte, not, or } from "drizzle-orm";
import { db } from "./db";
import { users, posts } from "./schema";
import { tr } from "zod/locales";

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

const PostShema = z.object({
  title: z.string({
    message: "Введите заголовок",
  }),
  description: z.string({
    message: "Введите описание",
  }),
  userId: z
    .string({
      message: "Введите юзер id",
    })
    .min(1, "Хоть 1 символ"),
});

const userService = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    return await db.query.users.findMany();
  })
  .get("/:id", async ({ params, status }) => {
    const oneuser = await db.query.users.findFirst({
      where: eq(users.id, params.id),
    });

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
        id: Bun.randomUUIDv7(),
      });
    },
    {
      body: UserSchema,
    },
  )

  .put(
    "/:id",
    async ({ body, params }) => {
      await db.update(users).set(body).where(eq(users.id, params.id));
    },
    { body: UserSchema },
  )

  // Решил проверить обновление только 1 параметра, но по ощущениям сделал нерационально
  .put(
    "/email/:id",
    async ({ body, params }) => {
      await db
        .update(users)
        .set({
          email: body.email,
        })
        .where(eq(users.id, params.id));
    },
    {
      body: z.object({
        email: z.email(),
      }),
    },
  )

  .delete("/:id", async ({ params }) => {
    await db.delete(users).where(eq(users.id, params.id));
  });

const postService = new Elysia({ prefix: "/service" })
  .get("/", async () => {
    return await db.query.posts.findMany();
  })

  .get("/:id", async ({ params, status }) => {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, params.id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (post === undefined) {
      return status(404);
    }
    return post;
  })

  .post(
    "/",
    async ({ body }) => {
      await db.insert(posts).values({
        ...body,
        id: Bun.randomUUIDv7(),
        createdAt: new Date(),
      });
    },
    {
      body: PostShema,
    },
  )

  .put(
    "/:id",
    async ({ body, params }) => {
      await db.update(posts).set(body).where(eq(posts.id, params.id));
    },
    { body: PostShema },
  )

  .delete("/:id", async ({ params }) => {
    await db.delete(posts).where(eq(posts.id, params.id));
  });

new Elysia().use(userService).use(postService).listen(3000);

