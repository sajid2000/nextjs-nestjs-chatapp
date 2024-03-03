CREATE TABLE IF NOT EXISTS "conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"isGroup" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"messageContent" text NOT NULL,
	"senderId" integer NOT NULL,
	"conversationId" integer NOT NULL,
	"replyId" integer,
	"messageType" varchar(20) NOT NULL,
	"messageStatus" varchar(20) NOT NULL,
	"sentDate" timestamp with time zone DEFAULT now() NOT NULL,
	"deleteAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"phone" integer NOT NULL,
	"avatar" varchar(255),
	"password" varchar(255) NOT NULL,
	"isOnline" boolean NOT NULL,
	"lastSeen" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userContact" (
	"userId" integer NOT NULL,
	"contactId" integer NOT NULL,
	CONSTRAINT "userContact_userId_contactId_pk" PRIMARY KEY("userId","contactId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userConversation" (
	"userId" integer NOT NULL,
	"conversationId" integer NOT NULL,
	"isDeleted" boolean DEFAULT false,
	CONSTRAINT "userConversation_userId_conversationId_pk" PRIMARY KEY("userId","conversationId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userContact" ADD CONSTRAINT "userContact_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userContact" ADD CONSTRAINT "userContact_contactId_user_id_fk" FOREIGN KEY ("contactId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userConversation" ADD CONSTRAINT "userConversation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userConversation" ADD CONSTRAINT "userConversation_conversationId_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
