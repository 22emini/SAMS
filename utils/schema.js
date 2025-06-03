import { boolean, int, mysqlTable, varchar, text } from "drizzle-orm/mysql-core";

export const GRADES=mysqlTable('grades',{
    id:int('id',{length:11}).autoincrement().primaryKey(),
    grade:varchar('grade',{length:10}).notNull(),
    clerkUserId: varchar('clerk_user_id', { length: 256 }) // Added for user association
});

export const STUDENTS=mysqlTable('students',{
    id:int('id',{length:11}).autoincrement().primaryKey(),
    name:varchar('name',{length:30}).notNull(),
    grade:varchar('grade',{length:10}).notNull(),
    address:varchar('address',{length:50}),
    contact:varchar('contact',{length:11}),
    clerkUserId: varchar('clerk_user_id', { length: 256 }),
    faceDescriptor: text('face_descriptor'),
    email: varchar('email', { length: 256 }),
});

export const ATTENDACE=mysqlTable('attendance',{
    id:int('id',{length:11}).autoincrement().primaryKey(),
    studentId:int('studentId',{length:11}).notNull(),
    present:boolean('present').default(false),
    day:int('day',{length:11}).notNull(),
    date:varchar('date',{length:20}).notNull() //05/2024
});

export const USERGMAIL=mysqlTable('usergmail',{
    id:int('id',{length:11}).autoincrement().primaryKey(),
    gmail:varchar('gmail', { length: 256 }).notNull(),
   gmailPassword:varchar('gmail_password', { length: 256 }).notNull(),
    clerkUserId: varchar('clerk_user_id', { length: 256 }) 
    
});

