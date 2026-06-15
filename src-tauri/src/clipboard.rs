use std::path::Path;
use std::process::Command;

pub fn copy_image_to_clipboard(path: &str) -> Result<(), String> {
    let ext = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    if ext == "gif" {
        copy_gif_to_clipboard(path)
    } else if ext == "webp" {
        copy_webp_to_clipboard(path)
    } else {
        copy_static_image_to_clipboard(path)
    }
}

fn copy_static_image_to_clipboard(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let ps_script = format!(
            "Add-Type -AssemblyName System.Windows.Forms; \
             $img = [System.Drawing.Image]::FromFile('{}'); \
             [System.Windows.Forms.Clipboard]::SetImage($img); \
             $img.Dispose();",
            path.replace("'", "''")
        );
        let output = Command::new("powershell")
            .args(["-Command", &ps_script])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .args(["-e", &format!(
                "set the clipboard to (read (POSIX file \"{}\") as TIFF picture)",
                path
            )])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("xclip")
            .args(["-selection", "clipboard", "-t", "image/png", "-i", path])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    Ok(())
}

fn copy_gif_to_clipboard(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let ps_script = format!(
            "Add-Type -AssemblyName System.Windows.Forms; \
             $img = [System.Drawing.Image]::FromFile('{}'); \
             [System.Windows.Forms.Clipboard]::SetImage($img); \
             $img.Dispose();",
            path.replace("'", "''")
        );
        let output = Command::new("powershell")
            .args(["-Command", &ps_script])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .args(["-e", &format!(
                "set the clipboard to POSIX file \"{}\"",
                path
            )])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("xclip")
            .args(["-selection", "clipboard", "-t", "text/uri-list", path])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    Ok(())
}

fn copy_webp_to_clipboard(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let ps_script = format!(
            "Add-Type -AssemblyName System.Windows.Forms; \
             $col = New-Object System.Collections.Specialized.StringCollection; \
             $col.Add('{}'); \
             [System.Windows.Forms.Clipboard]::SetFileDropList($col);",
            path.replace("'", "''")
        );
        let output = Command::new("powershell")
            .args(["-Command", &ps_script])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .args(["-e", &format!(
                "set the clipboard to POSIX file \"{}\"",
                path
            )])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("xclip")
            .args(["-selection", "clipboard", "-t", "text/uri-list", path])
            .output()
            .map_err(|e| e.to_string())?;
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
    }

    Ok(())
}
