// import { sql } from 'drizzle-orm';
// import { text, sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core';
const { sql } = require('drizzle-orm');
const { text, sqliteTable, integer, primaryKey } = require('drizzle-orm/sqlite-core');

const RegisteredUsers = sqliteTable('registeredUsers', {
    userId: text().primaryKey().notNull(),
    publicKey: text().notNull(),

    isAdministrator: integer({ mode: 'boolean' }).notNull().default(false),
});

const RegisterCodes = sqliteTable('registerCodes', {
    code: text().primaryKey().notNull(),
    createdAt: integer('createdAt')
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),

    userId: text().references(() => RegisteredUsers.userId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    usedAt: integer('usedAt'),

    isAdministrator: integer({ mode: 'boolean' }).notNull().default(false),
});

const EncryptedStorage = sqliteTable('encryptedStorage', {
    userId: text()
        .references(() => RegisteredUsers.userId, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .primaryKey()
        .notNull(),
    data: text().notNull(),
    username: text().notNull(),
});

const Posts = sqliteTable('posts', {
    uuid: text().primaryKey().notNull(),
    userId: text()
        .references(() => RegisteredUsers.userId, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .notNull(),

    title: text().notNull(),
    text: text().notNull(),
    createdAt: integer('createdAt')
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),

    signature: text().notNull(),
});

const Tags = sqliteTable(
    'tags',
    {
        uuid: text()
            .references(() => Posts.uuid, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            })
            .notNull(),
        tag: text().notNull(),
    },
    (table) => [primaryKey({ columns: [table.uuid, table.tag] })]
);

const Test = sqliteTable('test', {
    test: text().primaryKey().notNull(),
});

module.exports = {
    RegisteredUsers,
    RegisterCodes,
    EncryptedStorage,
    Posts,
    Tags,
    Test
};