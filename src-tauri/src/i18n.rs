pub fn tray_open(lang: &str) -> &'static str {
    match lang {
        "zh-CN" => "打开",
        "zh-TW" => "開啟",
        "ja" => "開く",
        "ko" => "열기",
        _ => "Open",
    }
}

pub fn tray_exit(lang: &str) -> &'static str {
    match lang {
        "zh-CN" => "退出",
        "zh-TW" => "結束",
        "ja" => "終了",
        "ko" => "종료",
        _ => "Exit",
    }
}

pub fn migrate_result(lang: &str, files: usize, updated: usize) -> String {
    match lang {
        "zh-CN" => format!("已复制 {files} 个文件，更新了 {updated} 条数据库记录"),
        "zh-TW" => format!("已複製 {files} 個檔案，更新了 {updated} 條資料庫記錄"),
        "ja" => format!("{files} ファイルをコピーし、{updated} 件のデータベースレコードを更新しました"),
        "ko" => format!("파일 {files}개 복사, 데이터베이스 레코드 {updated}개 업데이트"),
        _ => format!("Copied {files} files, updated {updated} database records"),
    }
}

pub fn cleanup_result(lang: &str, removed: usize) -> String {
    match lang {
        "zh-CN" => format!("已移除 {removed} 个缺失的表情"),
        "zh-TW" => format!("已移除 {removed} 個缺失的表情"),
        "ja" => format!("{removed} 個の欠落したスタンプを削除しました"),
        "ko" => format!("누락된 스티커 {removed}개 제거"),
        _ => format!("Removed {removed} missing sticker(s)"),
    }
}
