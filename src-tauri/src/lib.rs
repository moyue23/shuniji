use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{MouseButton, TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

mod clipboard;
mod config;
mod db;
mod fs_ops;

pub struct AppState {
    pub db: Mutex<db::StickerDb>,
    pub config: Mutex<config::AppConfig>,
    pub app_data_dir: PathBuf,
}

#[tauri::command]
fn init_app(state: tauri::State<AppState>) -> Result<config::AppConfig, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(config.clone())
}

#[tauri::command]
fn get_stickers(state: tauri::State<AppState>, group_id: Option<i64>) -> Result<Vec<db::Sticker>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_stickers(group_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn search_stickers(state: tauri::State<AppState>, keyword: String, group_id: Option<i64>) -> Result<Vec<db::Sticker>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.search_stickers(&keyword, group_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_sticker(state: tauri::State<AppState>, source_path: String, tags: String, group_id: i64) -> Result<db::Sticker, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let dest_dir = PathBuf::from(&config.sticker_save_path);
    fs_ops::ensure_dir(&dest_dir)?;

    let new_path = fs_ops::copy_sticker_to_storage(&source_path, &dest_dir)?;
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let id = db.add_sticker(&new_path, &tags, group_id).map_err(|e| e.to_string())?;

    Ok(db::Sticker {
        id,
        image_path: new_path,
        tags,
        group_id,
        created_at: chrono::Local::now().to_rfc3339(),
        sort_order: 0,
    })
}

#[tauri::command]
fn update_sticker_name(state: tauri::State<AppState>, id: i64, new_name: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_sticker_name(id, &new_name).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_sticker_group(state: tauri::State<AppState>, id: i64, group_id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_sticker_group(id, group_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_sticker_sort_order(state: tauri::State<AppState>, id: i64, sort_order: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_sticker_sort_order(id, sort_order).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_sticker(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    if let Some(path) = db.delete_sticker(id).map_err(|e| e.to_string())? {
        fs_ops::delete_file(&path)?;
    }
    Ok(())
}

#[tauri::command]
fn get_groups(state: tauri::State<AppState>, exclude_zero: bool) -> Result<Vec<db::StickerGroup>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_groups(exclude_zero).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_group(state: tauri::State<AppState>, name: String) -> Result<db::StickerGroup, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let id = db.add_group(&name).map_err(|e| e.to_string())?;
    Ok(db::StickerGroup {
        id,
        name,
        icon_path: String::new(),
    })
}

#[tauri::command]
fn update_group_name(state: tauri::State<AppState>, id: i64, name: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_group_name(id, &name).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_group_icon(state: tauri::State<AppState>, id: i64, icon_path: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_group_icon(id, &icon_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_group(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_group(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn copy_sticker_to_clipboard(state: tauri::State<AppState>, id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let path = db.get_image_path(id).map_err(|e| e.to_string())?;
    clipboard::copy_image_to_clipboard(&path)
}

#[tauri::command]
fn import_folder(state: tauri::State<AppState>, folder_path: String, group_id: i64) -> Result<Vec<db::Sticker>, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let dest_dir = PathBuf::from(&config.sticker_save_path);
    fs_ops::ensure_dir(&dest_dir)?;

    let entries = std::fs::read_dir(&folder_path).map_err(|e| e.to_string())?;
    let valid_ext = ["png", "jpg", "jpeg", "bmp", "gif", "webp"];

    let mut stickers: Vec<db::Sticker> = Vec::new();
    let db = state.db.lock().map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if !path.is_file() { continue; }
        let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase();
        if !valid_ext.contains(&ext.as_str()) { continue; }

        let new_path = fs_ops::copy_sticker_to_storage(&path.to_string_lossy(), &dest_dir)?;
        let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("sticker");
        let id = db.add_sticker(&new_path, stem, group_id).map_err(|e| e.to_string())?;
        stickers.push(db::Sticker {
            id,
            image_path: new_path,
            tags: stem.to_string(),
            group_id,
            created_at: chrono::Local::now().to_rfc3339(),
            sort_order: 0,
        });
    }

    Ok(stickers)
}

#[tauri::command]
fn get_config(state: tauri::State<AppState>) -> Result<config::AppConfig, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(config.clone())
}

#[tauri::command]
fn save_config(state: tauri::State<AppState>, new_config: config::AppConfig) -> Result<(), String> {
    let app_data_dir = state.app_data_dir.clone();
    new_config.save(&app_data_dir).map_err(|e| e.to_string())?;
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    *config = new_config;
    Ok(())
}

#[tauri::command]
fn open_sticker_folder(state: tauri::State<AppState>) -> Result<(), String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let path = PathBuf::from(&config.sticker_save_path);
    fs_ops::ensure_dir(&path)?;
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn migrate_sticker_storage(state: tauri::State<AppState>, new_folder: String) -> Result<String, String> {
    let new_dir = PathBuf::from(&new_folder);
    fs_ops::ensure_dir(&new_dir)?;

    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    let old_dir = PathBuf::from(&config.sticker_save_path);

    let file_count = fs_ops::copy_dir_contents(&old_dir, &new_dir)?;

    let db = state.db.lock().map_err(|e| e.to_string())?;
    let updated = db.update_all_image_paths(&config.sticker_save_path, &new_folder).map_err(|e| e.to_string())?;

    config.sticker_save_path = new_folder;
    config.save(&state.app_data_dir).map_err(|e| e.to_string())?;

    Ok(format!("Copied {} files, updated {} database records", file_count, updated))
}

#[tauri::command]
fn cleanup_invalid_stickers(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let removed = db.cleanup_invalid_stickers().map_err(|e| e.to_string())?;
    Ok(format!("Removed {} missing sticker(s)", removed))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            let config = config::AppConfig::load(&app_data_dir);
            fs_ops::ensure_dir(&PathBuf::from(&config.sticker_save_path)).ok();

            let db = db::StickerDb::new(&PathBuf::from(&config.db_path)).map_err(|e| e.to_string())?;

            app.manage(AppState {
                db: Mutex::new(db),
                config: Mutex::new(config),
                app_data_dir: app_data_dir.clone(),
            });

            let show_item = MenuItemBuilder::with_id("show", "Open").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Exit").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show_item, &quit_item]).build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("shuniji")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(w) = app.get_webview_window("main") {
                                w.show().ok();
                                w.set_focus().ok();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::DoubleClick {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        if let Some(w) = tray.app_handle().get_webview_window("main") {
                            w.show().ok();
                            w.set_focus().ok();
                        }
                    }
                })
                .build(app)?;

            let app_handle = app.handle().clone();

            app.global_shortcut().on_shortcut("Ctrl+Shift+E", move |app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let state = app.state::<AppState>();
                    let hotkey_enabled = state.config.lock().unwrap().hotkey_enabled;
                    if hotkey_enabled {
                        if let Some(w) = app.get_webview_window("main") {
                            if w.is_visible().unwrap_or(false) {
                                w.hide().ok();
                            } else {
                                w.show().ok();
                                w.set_focus().ok();
                            }
                        }
                    }
                }
            })?;

            if let Some(w) = app_handle.get_webview_window("main") {
                let w2 = w.clone();
                w.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        let state = app_handle.state::<AppState>();
                        let tray_enabled = state.config.lock().unwrap().tray_enabled;
                        if tray_enabled {
                            api.prevent_close();
                            w2.hide().ok();
                        }
                    }
                });

            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            init_app,
            get_stickers,
            search_stickers,
            add_sticker,
            update_sticker_name,
            update_sticker_group,
            update_sticker_sort_order,
            delete_sticker,
            get_groups,
            add_group,
            update_group_name,
            update_group_icon,
            delete_group,
            copy_sticker_to_clipboard,
            import_folder,
            get_config,
            save_config,
            open_sticker_folder,
            migrate_sticker_storage,
            cleanup_invalid_stickers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
