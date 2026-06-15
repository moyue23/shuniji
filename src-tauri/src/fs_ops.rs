use std::fs;
use std::path::{Path, PathBuf};

pub fn ensure_dir(path: &PathBuf) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn copy_sticker_to_storage(source: &str, dest_dir: &PathBuf) -> Result<String, String> {
    let source_path = Path::new(source);
    if !source_path.exists() {
        return Err("Source file does not exist".to_string());
    }

    let ext = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png");
    let stem = source_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("sticker");

    let mut dest_path = dest_dir.join(format!("{}.{}" , stem, ext));
    let mut counter = 1;
    while dest_path.exists() {
        dest_path = dest_dir.join(format!("{}_{}.{}" , stem, counter, ext));
        counter += 1;
    }

    fs::copy(source, &dest_path).map_err(|e| e.to_string())?;

    Ok(dest_path.to_string_lossy().to_string())
}

pub fn delete_file(path: &str) -> Result<(), String> {
    let p = Path::new(path);
    if p.exists() {
        fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn copy_dir_contents(src_dir: &PathBuf, dest_dir: &PathBuf) -> Result<usize, String> {
    ensure_dir(dest_dir)?;
    copy_dir_recursive(src_dir, src_dir, dest_dir)
}

fn copy_dir_recursive(base: &Path, current: &Path, dest_base: &Path) -> Result<usize, String> {
    let mut count = 0;
    let entries = fs::read_dir(current).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_dir() {
            count += copy_dir_recursive(base, &path, dest_base)?;
        } else if path.is_file() {
            let relative = path.strip_prefix(base).map_err(|e| e.to_string())?;
            let target_dir = if let Some(parent) = relative.parent() {
                dest_base.join(parent)
            } else {
                dest_base.to_path_buf()
            };
            ensure_dir(&target_dir)?;
            copy_sticker_to_storage(&path.to_string_lossy(), &target_dir)?;
            count += 1;
        }
    }

    Ok(count)
}
