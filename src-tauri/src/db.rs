use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sticker {
    pub id: i64,
    pub image_path: String,
    pub tags: String,
    pub group_id: i64,
    pub created_at: String,
    pub sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StickerGroup {
    pub id: i64,
    pub name: String,
    pub icon_path: String,
}

pub struct StickerDb {
    conn: Connection,
}

impl StickerDb {
    pub fn new(db_path: &PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let db = Self { conn };
        db.init_tables()?;
        db.ensure_default_group()?;
        db.cleanup_invalid_stickers()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                icon_path TEXT DEFAULT ''
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS stickers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_path TEXT NOT NULL,
                tags TEXT DEFAULT '',
                group_id INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )",
            [],
        )?;

        Ok(())
    }

    fn ensure_default_group(&self) -> Result<()> {
        // Migrate: rename old "Ungrouped" to "My Stickers"
        self.conn.execute(
            "UPDATE groups SET name = 'My Stickers' WHERE id = 0 AND name = 'Ungrouped'",
            [],
        )?;
        self.conn.execute(
            "INSERT OR IGNORE INTO groups (id, name, icon_path) VALUES (0, 'My Stickers', '')",
            [],
        )?;
        Ok(())
    }

    fn cleanup_invalid_stickers(&self) -> Result<()> {
        let mut stmt = self.conn.prepare("SELECT id, image_path FROM stickers")?;
        let rows = stmt.query_map([], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
        })?;

        for row in rows {
            let (id, path): (i64, String) = row?;
            if !std::path::Path::new(&path).exists() {
                self.conn.execute("DELETE FROM stickers WHERE id = ?1", params![id])?;
            }
        }

        Ok(())
    }

    pub fn get_stickers(&self, group_id: Option<i64>) -> Result<Vec<Sticker>> {
        let sql = if let Some(gid) = group_id {
            if gid == 0 {
                "SELECT id, image_path, tags, group_id, created_at, sort_order FROM stickers ORDER BY sort_order ASC, created_at DESC"
                    .to_string()
            } else {
                "SELECT id, image_path, tags, group_id, created_at, sort_order FROM stickers WHERE group_id = ?1 ORDER BY sort_order ASC, created_at DESC"
                    .to_string()
            }
        } else {
            "SELECT id, image_path, tags, group_id, created_at, sort_order FROM stickers ORDER BY sort_order ASC, created_at DESC"
                .to_string()
        };

        let mut stmt = self.conn.prepare(&sql)?;
        let rows = if let Some(gid) = group_id {
            if gid == 0 {
                stmt.query_map([], Self::map_sticker)?
            } else {
                stmt.query_map(params![gid], Self::map_sticker)?
            }
        } else {
            stmt.query_map([], Self::map_sticker)?
        };

        rows.collect()
    }

    fn map_sticker(row: &rusqlite::Row) -> Result<Sticker> {
        Ok(Sticker {
            id: row.get(0)?,
            image_path: row.get(1)?,
            tags: row.get(2)?,
            group_id: row.get(3)?,
            created_at: row.get(4)?,
            sort_order: row.get(5)?,
        })
    }

    pub fn search_stickers(&self, keyword: &str, group_id: Option<i64>) -> Result<Vec<Sticker>> {
        let like = format!("%{}%", keyword);
        let sql = if let Some(gid) = group_id {
            if gid == 0 {
                "SELECT id, image_path, tags, group_id, created_at, sort_order FROM stickers WHERE tags LIKE ?1 ORDER BY sort_order ASC, created_at DESC".to_string()
            } else {
                "SELECT id, image_path, tags, group_id, created_at, sort_order FROM stickers WHERE tags LIKE ?1 AND group_id = ?2 ORDER BY sort_order ASC, created_at DESC".to_string()
            }
        } else {
            "SELECT id, image_path, tags, group_id, created_at, sort_order FROM stickers WHERE tags LIKE ?1 ORDER BY sort_order ASC, created_at DESC".to_string()
        };

        let mut stmt = self.conn.prepare(&sql)?;
        let rows = if let Some(gid) = group_id {
            if gid == 0 {
                stmt.query_map(params![&like], Self::map_sticker)?
            } else {
                stmt.query_map(params![&like, gid], Self::map_sticker)?
            }
        } else {
            stmt.query_map(params![&like], Self::map_sticker)?
        };

        rows.collect()
    }

    pub fn add_sticker(&self, image_path: &str, tags: &str, group_id: i64) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO stickers (image_path, tags, group_id, sort_order) VALUES (?1, ?2, ?3, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM stickers WHERE group_id = ?3))",
            params![image_path, tags, group_id],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn update_sticker_name(&self, id: i64, new_name: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE stickers SET tags = ?1 WHERE id = ?2",
            params![new_name, id],
        )?;
        Ok(())
    }

    pub fn update_sticker_group(&self, id: i64, group_id: i64) -> Result<()> {
        self.conn.execute(
            "UPDATE stickers SET group_id = ?1 WHERE id = ?2",
            params![group_id, id],
        )?;
        Ok(())
    }

    pub fn update_sticker_sort_order(&self, id: i64, sort_order: i64) -> Result<()> {
        self.conn.execute(
            "UPDATE stickers SET sort_order = ?1 WHERE id = ?2",
            params![sort_order, id],
        )?;
        Ok(())
    }

    pub fn delete_sticker(&self, id: i64) -> Result<Option<String>> {
        let mut stmt = self
            .conn
            .prepare("SELECT image_path FROM stickers WHERE id = ?1")?;
        let path: Result<String> = stmt.query_row(params![id], |row| row.get(0));

        self.conn
            .execute("DELETE FROM stickers WHERE id = ?1", params![id])?;

        match path {
            Ok(p) => Ok(Some(p)),
            Err(_) => Ok(None),
        }
    }

    pub fn get_groups(&self, exclude_zero: bool) -> Result<Vec<StickerGroup>> {
        let sql = if exclude_zero {
            "SELECT id, name, icon_path FROM groups WHERE id != 0 ORDER BY id"
        } else {
            "SELECT id, name, icon_path FROM groups ORDER BY id"
        };

        let mut stmt = self.conn.prepare(sql)?;
        let rows = stmt.query_map([], |row| {
            Ok(StickerGroup {
                id: row.get(0)?,
                name: row.get(1)?,
                icon_path: row.get(2)?,
            })
        })?;

        rows.collect()
    }

    pub fn add_group(&self, name: &str) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO groups (name, icon_path) VALUES (?1, '')",
            params![name],
        )?;
        Ok(self.conn.last_insert_rowid())
    }

    pub fn update_group_name(&self, id: i64, name: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE groups SET name = ?1 WHERE id = ?2",
            params![name, id],
        )?;
        Ok(())
    }

    pub fn update_group_icon(&self, id: i64, icon_path: &str) -> Result<()> {
        self.conn.execute(
            "UPDATE groups SET icon_path = ?1 WHERE id = ?2",
            params![icon_path, id],
        )?;
        Ok(())
    }

    pub fn delete_group(&self, id: i64) -> Result<()> {
        self.conn.execute(
            "UPDATE stickers SET group_id = 0 WHERE group_id = ?1",
            params![id],
        )?;
        self.conn
            .execute("DELETE FROM groups WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn get_image_path(&self, id: i64) -> Result<String> {
        self.conn
            .query_row("SELECT image_path FROM stickers WHERE id = ?1", params![id], |row| {
                row.get(0)
            })
    }

    pub fn get_groups_simple(&self) -> Result<Vec<(i64, String)>> {
        let mut stmt = self.conn.prepare("SELECT id, name FROM groups")?;
        let rows = stmt.query_map([], |row| Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?)))?;
        rows.collect()
    }
}
