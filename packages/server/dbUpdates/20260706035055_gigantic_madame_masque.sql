CREATE TYPE "public"."back_behavior" AS ENUM('restart_track', 'previous_track');--> statement-breakpoint
CREATE TYPE "public"."repeat_mode" AS ENUM('off', 'all', 'one');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('pending', 'running', 'complete', 'failed');--> statement-breakpoint
CREATE TABLE "album" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"album_artist_id" uuid,
	"is_compilation" boolean DEFAULT false NOT NULL,
	"cover_image" text,
	"year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "album_name_album_artist_unique" UNIQUE NULLS NOT DISTINCT("name","album_artist_id")
);
--> statement-breakpoint
CREATE TABLE "artist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"biography" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artist_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "genre_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "genre_edge" (
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	CONSTRAINT "genre_edge_parent_id_child_id_pk" PRIMARY KEY("parent_id","child_id")
);
--> statement-breakpoint
CREATE TABLE "play_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"song_id" uuid NOT NULL,
	"played_at" timestamp with time zone NOT NULL,
	"ms_played" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playback_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"cursor" integer,
	"position_ms" integer,
	"shuffled" boolean DEFAULT false NOT NULL,
	"repeat" "repeat_mode" DEFAULT 'off' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue" (
	"user_id" text PRIMARY KEY NOT NULL,
	"song_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"play_order" uuid[]
);
--> statement-breakpoint
CREATE TABLE "scan_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "scan_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"new_count" integer DEFAULT 0 NOT NULL,
	"moved_count" integer DEFAULT 0 NOT NULL,
	"missing_count" integer DEFAULT 0 NOT NULL,
	"total_scanned" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text collate "C" NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"mtime" bigint NOT NULL,
	"missing" boolean DEFAULT false NOT NULL,
	"missing_at" timestamp with time zone,
	"name" text,
	"track_number" integer,
	"disc_number" integer,
	"duration_ms" integer,
	"artist_id" uuid,
	"album_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "song_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "song_genre" (
	"song_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL,
	CONSTRAINT "song_genre_song_id_genre_id_pk" PRIMARY KEY("song_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "user_library_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"folder_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_library_source_user_folder_unique" UNIQUE("user_id","folder_path")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"back_behavior" "back_behavior" DEFAULT 'previous_track' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"widget_type" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "album" ADD CONSTRAINT "album_album_artist_id_artist_id_fk" FOREIGN KEY ("album_artist_id") REFERENCES "public"."artist"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genre_edge" ADD CONSTRAINT "genre_edge_parent_id_genre_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genre_edge" ADD CONSTRAINT "genre_edge_child_id_genre_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_event" ADD CONSTRAINT "play_event_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_event" ADD CONSTRAINT "play_event_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_state" ADD CONSTRAINT "playback_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue" ADD CONSTRAINT "queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song" ADD CONSTRAINT "song_artist_id_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song" ADD CONSTRAINT "song_album_id_album_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."album"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_genre" ADD CONSTRAINT "song_genre_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_genre" ADD CONSTRAINT "song_genre_genre_id_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_library_source" ADD CONSTRAINT "user_library_source_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget" ADD CONSTRAINT "widget_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "play_event_user_played_at_idx" ON "play_event" USING btree ("user_id","played_at");--> statement-breakpoint
CREATE INDEX "play_event_user_song_idx" ON "play_event" USING btree ("user_id","song_id");--> statement-breakpoint
CREATE INDEX "song_content_hash_idx" ON "song" USING btree ("content_hash");