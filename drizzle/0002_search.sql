-- Search: embeddings, a keyword index, and triggers that keep both in sync.
CREATE TABLE `entry_embeddings` (
	`entry_id` integer NOT NULL,
	`chunk` integer NOT NULL,
	`embedding` blob NOT NULL,
	PRIMARY KEY(`entry_id`, `chunk`)
);
--> statement-breakpoint
CREATE TRIGGER entry_embeddings_delete AFTER DELETE ON entries BEGIN
  DELETE FROM entry_embeddings WHERE entry_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER entry_embeddings_update AFTER UPDATE OF text ON entries BEGIN
  DELETE FROM entry_embeddings WHERE entry_id = old.id;
END;
--> statement-breakpoint
CREATE VIRTUAL TABLE entries_fts USING fts5(text, content='entries', content_rowid='id');
--> statement-breakpoint
CREATE TRIGGER entries_fts_insert AFTER INSERT ON entries BEGIN
  INSERT INTO entries_fts(rowid, text) VALUES (new.id, new.text);
END;
--> statement-breakpoint
CREATE TRIGGER entries_fts_delete AFTER DELETE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, text) VALUES ('delete', old.id, old.text);
END;
--> statement-breakpoint
CREATE TRIGGER entries_fts_update AFTER UPDATE OF text ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, text) VALUES ('delete', old.id, old.text);
  INSERT INTO entries_fts(rowid, text) VALUES (new.id, new.text);
END;
--> statement-breakpoint
-- Every word in the notes, for fixing typos in searches.
CREATE VIRTUAL TABLE entries_vocab USING fts5vocab(entries_fts, 'row');
--> statement-breakpoint
INSERT INTO entries_fts(entries_fts) VALUES ('rebuild');
