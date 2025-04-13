import {sql} from 'drizzle-orm';
import {text, sqliteTable, integer, primaryKey} from 'drizzle-orm/sqlite-core';

export const RegisteredUsers = sqliteTable('registeredUsers', {
    userId: text().primaryKey().notNull(),
    publicKey: text().notNull(),

    isAdministrator: integer({mode: 'boolean'}).notNull().default(false),
});

export const RegisterCodes = sqliteTable('registerCodes', {
    code: text().primaryKey().notNull(),
    createdAt: integer('createdAt')
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),

    userId: text().references(() => RegisteredUsers.userId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    usedAt: integer('usedAt'),

    isAdministrator: integer({mode: 'boolean'}).notNull().default(false),
});

export const EncryptedStorage = sqliteTable('encryptedStorage', {
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

export const Posts = sqliteTable('posts', {
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

export const Tags = sqliteTable(
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
    (table) => [primaryKey({columns: [table.uuid, table.tag]})]
);

export const Comments = sqliteTable('comments', {
    uuid: text().primaryKey().notNull(),
    userId: text()
        .references(() => RegisteredUsers.userId, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .notNull(),
    postUuid: text()
        .references(() => Posts.uuid, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .notNull(),
    replyCommentUuid: text() // A comment can be a reply to another comment but does not have to be
        .references(() => Comments.uuid, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),

    text: text().notNull(),
    createdAt: integer('createdAt')
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),

    signature: text().notNull(),
});

/*
Notification Types:
* Someone follows you [userId, followerUserId]
* Someone likes your post [userId, likerUserId, postUuid]
* Someone comments on your post [userId, commenterUserId, postUuid]
* Someone replies to your comment [userId, replierUserId, postUuid, replyCommentUuid]
* Someone shares your post [userId, sharerUserId, postUuid]
* Someone mentions you in a post [userId, mentionerUserId, postUuid]
*/

export const Notifications = sqliteTable('notifications', {
    uuid: text()
        .primaryKey()
        .notNull(),
    userId: text()
        .references(() => RegisteredUsers.userId, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .notNull(),
    notificationType: text()
        .notNull(), // follow, like, comment, reply, mention, share
    createdAt: integer('createdAt')
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
    isRead: integer({mode: 'boolean'})
        .notNull()
        .default(false),


    otherUserId: text()
        .references(() => RegisteredUsers.userId, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    postUuid: text()
        .references(() => Posts.uuid, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    commentUuid: text()
        .references(() => Comments.uuid, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    commentResponseUuid: text()
        .references(() => Comments.uuid, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
});

export const Likes = sqliteTable('likes', {
        userId: text()
            .references(() => RegisteredUsers.userId, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            })
            .notNull(),
        postUuid: text()
            .references(() => Posts.uuid, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            })
            .notNull(),
        likedAt: integer('createdAt')
            .default(sql`(strftime('%s', 'now'))`)
            .notNull(),
        signature: text()
            .notNull(),
    },
    (table) => [primaryKey({columns: [table.userId, table.postUuid]})]
);

export const Test = sqliteTable('test', {
    test: text().primaryKey().notNull(),
});