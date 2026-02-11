import { relations } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";


export const users = pg.pgTable("users", {
  id: pg
    .varchar({ length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => Bun.randomUUIDv7()),

  name: pg.varchar({ length: 255 }).notNull(),
  age: pg.integer().notNull(),

  email: pg.text().notNull()

});

export const posts = pg.pgTable("posts", {
  id: pg
    .varchar({ length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => Bun.randomUUIDv7()),


  title: pg.varchar({ length: 255 }).notNull(),
  description: pg.text().notNull(),

  createdAt: pg.timestamp().notNull().defaultNow(),

  userId: pg
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id)
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId], 
    references: [users.id]
  }),
}));