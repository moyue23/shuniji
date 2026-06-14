use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub sticker_save_path: String,
    pub db_path: String,
    pub tray_enabled: bool,
    pub autostart_enabled: bool,
    pub hotkey_enabled: bool,
    pub theme_color: String,
    pub software_version: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            sticker_save_path: String::new(),
            db_path: String::new(),
            tray_enabled: true,
            autostart_enabled: false,
            hotkey_enabled: true,
            theme_color: "#004e27".to_string(),
            software_version: "0.1.0".to_string(),
        }
    }
}

impl AppConfig {
    pub fn load(app_data_dir: &PathBuf) -> Self {
        let config_path = app_data_dir.join("config.json");
        if config_path.exists() {
            match fs::read_to_string(&config_path) {
                Ok(content) => match serde_json::from_str::<AppConfig>(&content) {
                    Ok(mut config) => {
                        if config.sticker_save_path.is_empty() {
                            config.sticker_save_path = app_data_dir.join("stickers").to_string_lossy().to_string();
                        }
                        if config.db_path.is_empty() {
                            config.db_path = app_data_dir.join("stickers.db").to_string_lossy().to_string();
                        }
                        config
                    }
                    Err(_) => Self::with_defaults(app_data_dir),
                },
                Err(_) => Self::with_defaults(app_data_dir),
            }
        } else {
            Self::with_defaults(app_data_dir)
        }
    }

    pub fn with_defaults(app_data_dir: &PathBuf) -> Self {
        Self {
            sticker_save_path: app_data_dir.join("stickers").to_string_lossy().to_string(),
            db_path: app_data_dir.join("stickers.db").to_string_lossy().to_string(),
            ..Default::default()
        }
    }

    pub fn save(&self, app_data_dir: &PathBuf) -> Result<(), String> {
        let config_path = app_data_dir.join("config.json");
        let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(&config_path, content).map_err(|e| e.to_string())?;
        Ok(())
    }
}
