import type { Locale, TranslationKey } from "./types";

// English is the source of truth — every language must match its shape
const en = {
  // Common / shared
  "common.cancel": "Cancel",
  "common.create": "Create",
  "common.delete": "Delete",
  "common.rename": "Rename",
  "common.copy": "Copy",
  "common.back": "Back",
  "common.save": "Save",
  "common.error": "Error",
  "common.loading": "Loading...",
  "common.untitled": "Untitled",
  "common.gif": "GIF",
  "common.name": "Name",
  "common.copied": "Copied!",

  // App header
  "app.addSticker": "Sticker",
  "app.editMode": "Edit",
  "app.exitEditMode": "Exit",
  "app.searchPlaceholder": "Search stickers...",

  // Sidebar
  "sidebar.all": "All",
  "sidebar.newGroup": "New Group",
  "sidebar.settings": "Settings",
  "sidebar.errorCreateGroup": "Failed to create group. Name may already exist.",
  "sidebar.confirmDeleteGroup": "Delete this group and all its stickers? This cannot be undone.",
  "sidebar.confirmDeleteGroupTitle": "Delete Group",

  // Sticker grid
  "grid.empty": "No stickers yet. Drag images here or use \"+ Sticker\".",

  // Sticker item
  "item.confirmDelete": "Delete this sticker?",
  "item.confirmDeleteTitle": "Delete Sticker",

  // Detail page
  "detail.notFound": "Sticker not found.",
  "detail.imageError": "Image failed to load",
  "detail.saved": "Saved",
  "detail.tags": "Tags",
  "detail.noTags": "No tags yet",
  "detail.newTagPlaceholder": "New tag...",

  // Settings
  "settings.title": "Settings",
  "settings.paths": "Paths",
  "settings.stickerSavePath": "Sticker save path",
  "settings.chooseFolder": "Choose Folder",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.themeSystem": "System",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.language": "Language",
  "settings.window": "Window",
  "settings.enableTray": "Enable tray",
  "settings.autostart": "Auto-start on boot",
  "settings.hotkey": "Enable global hotkey (Ctrl+Shift+E)",
  "settings.about": "About",
  "settings.saveSettings": "Save Settings",
  "settings.confirmMigrate": "Move existing sticker files from the old location to the new folder?",
  "settings.confirmMigrateTitle": "Migrate files?",
  "settings.migrationFailed": "Migration failed: {0}",
  "settings.savePathUpdated": "Save path updated (files not moved).",

  // New Group dialog
  "newGroup.title": "New Group",
  "newGroup.namePlaceholder": "Group name",
  "newGroup.importFolder": "Import Folder",
  "newGroup.optional": "(optional)",
  "newGroup.chooseFolder": "Choose folder",

  // InlineEdit
  "inlineEdit.clickToRename": "Click to rename",
} as const;

// Simplified Chinese (zh-CN)
const zhCN: Record<TranslationKey, string> = {
  "common.cancel": "取消",
  "common.create": "创建",
  "common.delete": "删除",
  "common.rename": "重命名",
  "common.copy": "复制",
  "common.back": "返回",
  "common.save": "保存",
  "common.error": "错误",
  "common.loading": "加载中...",
  "common.untitled": "未命名",
  "common.gif": "GIF",
  "common.name": "名称",
  "common.copied": "已复制！",

  "app.addSticker": "表情",
  "app.editMode": "编辑",
  "app.exitEditMode": "退出",
  "app.searchPlaceholder": "搜索表情...",

  "sidebar.all": "全部",
  "sidebar.newGroup": "新建分组",
  "sidebar.settings": "设置",
  "sidebar.errorCreateGroup": "创建分组失败，名称可能已存在。",
  "sidebar.confirmDeleteGroup": "删除此分组及其所有表情？此操作无法撤销。",
  "sidebar.confirmDeleteGroupTitle": "删除分组",

  "grid.empty": "暂无表情。拖放图片到此处或点击「+ 表情」添加。",

  "item.confirmDelete": "删除此表情？",
  "item.confirmDeleteTitle": "删除表情",

  "detail.notFound": "未找到表情。",
  "detail.imageError": "图片加载失败",
  "detail.saved": "保存时间",
  "detail.tags": "标签",
  "detail.noTags": "暂无标签",
  "detail.newTagPlaceholder": "新建标签...",

  "settings.title": "设置",
  "settings.paths": "路径",
  "settings.stickerSavePath": "表情保存路径",
  "settings.chooseFolder": "选择文件夹",
  "settings.appearance": "外观",
  "settings.theme": "主题",
  "settings.themeSystem": "跟随系统",
  "settings.themeLight": "浅色",
  "settings.themeDark": "深色",
  "settings.language": "语言",
  "settings.window": "窗口",
  "settings.enableTray": "启用系统托盘",
  "settings.autostart": "开机自启",
  "settings.hotkey": "启用全局快捷键 (Ctrl+Shift+E)",
  "settings.about": "关于",
  "settings.saveSettings": "保存设置",
  "settings.confirmMigrate": "将现有表情文件从旧位置移动到新文件夹？",
  "settings.confirmMigrateTitle": "迁移文件？",
  "settings.migrationFailed": "迁移失败：{0}",
  "settings.savePathUpdated": "保存路径已更新（文件未移动）。",

  "newGroup.title": "新建分组",
  "newGroup.namePlaceholder": "分组名称",
  "newGroup.importFolder": "导入文件夹",
  "newGroup.optional": "（可选）",
  "newGroup.chooseFolder": "选择文件夹",

  "inlineEdit.clickToRename": "点击重命名",
};

// Traditional Chinese (zh-TW)
const zhTW: Record<TranslationKey, string> = {
  "common.cancel": "取消",
  "common.create": "建立",
  "common.delete": "刪除",
  "common.rename": "重新命名",
  "common.copy": "複製",
  "common.back": "返回",
  "common.save": "儲存",
  "common.error": "錯誤",
  "common.loading": "載入中...",
  "common.untitled": "未命名",
  "common.gif": "GIF",
  "common.name": "名稱",
  "common.copied": "已複製！",

  "app.addSticker": "表情",
  "app.editMode": "編輯",
  "app.exitEditMode": "退出",
  "app.searchPlaceholder": "搜尋表情...",

  "sidebar.all": "全部",
  "sidebar.newGroup": "新增群組",
  "sidebar.settings": "設定",
  "sidebar.errorCreateGroup": "建立群組失敗，名稱可能已存在。",
  "sidebar.confirmDeleteGroup": "刪除此群組及其所有表情？此操作無法復原。",
  "sidebar.confirmDeleteGroupTitle": "刪除群組",

  "grid.empty": "暫無表情。拖放圖片到此處或點選「+ 表情」新增。",

  "item.confirmDelete": "刪除此表情？",
  "item.confirmDeleteTitle": "刪除表情",

  "detail.notFound": "找不到表情。",
  "detail.imageError": "圖片載入失敗",
  "detail.saved": "儲存時間",
  "detail.tags": "標籤",
  "detail.noTags": "尚無標籤",
  "detail.newTagPlaceholder": "新增標籤...",

  "settings.title": "設定",
  "settings.paths": "路徑",
  "settings.stickerSavePath": "表情儲存路徑",
  "settings.chooseFolder": "選擇資料夾",
  "settings.appearance": "外觀",
  "settings.theme": "主題",
  "settings.themeSystem": "跟隨系統",
  "settings.themeLight": "淺色",
  "settings.themeDark": "深色",
  "settings.language": "語言",
  "settings.window": "視窗",
  "settings.enableTray": "啟用系統匣",
  "settings.autostart": "開機自動啟動",
  "settings.hotkey": "啟用全域快捷鍵 (Ctrl+Shift+E)",
  "settings.about": "關於",
  "settings.saveSettings": "儲存設定",
  "settings.confirmMigrate": "將現有表情檔案從舊位置移動到新資料夾？",
  "settings.confirmMigrateTitle": "遷移檔案？",
  "settings.migrationFailed": "遷移失敗：{0}",
  "settings.savePathUpdated": "儲存路徑已更新（檔案未移動）。",

  "newGroup.title": "新增群組",
  "newGroup.namePlaceholder": "群組名稱",
  "newGroup.importFolder": "匯入資料夾",
  "newGroup.optional": "（可選）",
  "newGroup.chooseFolder": "選擇資料夾",

  "inlineEdit.clickToRename": "點擊重新命名",
};

// Japanese (ja)
const ja: Record<TranslationKey, string> = {
  "common.cancel": "キャンセル",
  "common.create": "作成",
  "common.delete": "削除",
  "common.rename": "名前変更",
  "common.copy": "コピー",
  "common.back": "戻る",
  "common.save": "保存",
  "common.error": "エラー",
  "common.loading": "読み込み中...",
  "common.untitled": "無題",
  "common.gif": "GIF",
  "common.name": "名前",
  "common.copied": "コピーしました！",

  "app.addSticker": "スタンプ",
  "app.editMode": "編集",
  "app.exitEditMode": "終了",
  "app.searchPlaceholder": "スタンプを検索...",

  "sidebar.all": "すべて",
  "sidebar.newGroup": "新規グループ",
  "sidebar.settings": "設定",
  "sidebar.errorCreateGroup": "グループの作成に失敗しました。名前が既に存在する可能性があります。",
  "sidebar.confirmDeleteGroup": "このグループとすべてのスタンプを削除しますか？この操作は元に戻せません。",
  "sidebar.confirmDeleteGroupTitle": "グループの削除",

  "grid.empty": "スタンプがありません。画像をここにドラッグするか「+ スタンプ」をクリックしてください。",

  "item.confirmDelete": "このスタンプを削除しますか？",
  "item.confirmDeleteTitle": "スタンプの削除",

  "detail.notFound": "スタンプが見つかりません。",
  "detail.imageError": "画像の読み込みに失敗しました",
  "detail.saved": "保存日時",
  "detail.tags": "タグ",
  "detail.noTags": "タグなし",
  "detail.newTagPlaceholder": "新しいタグ...",

  "settings.title": "設定",
  "settings.paths": "パス",
  "settings.stickerSavePath": "スタンプ保存先",
  "settings.chooseFolder": "フォルダを選択",
  "settings.appearance": "外観",
  "settings.theme": "テーマ",
  "settings.themeSystem": "システム",
  "settings.themeLight": "ライト",
  "settings.themeDark": "ダーク",
  "settings.language": "言語",
  "settings.window": "ウィンドウ",
  "settings.enableTray": "トレイを有効化",
  "settings.autostart": "起動時に自動開始",
  "settings.hotkey": "グローバルホットキーを有効化 (Ctrl+Shift+E)",
  "settings.about": "について",
  "settings.saveSettings": "設定を保存",
  "settings.confirmMigrate": "既存のスタンプファイルを古い場所から新しいフォルダに移動しますか？",
  "settings.confirmMigrateTitle": "ファイルを移行しますか？",
  "settings.migrationFailed": "移行に失敗しました：{0}",
  "settings.savePathUpdated": "保存パスを更新しました（ファイルは移動されていません）。",

  "newGroup.title": "新規グループ",
  "newGroup.namePlaceholder": "グループ名",
  "newGroup.importFolder": "フォルダをインポート",
  "newGroup.optional": "（任意）",
  "newGroup.chooseFolder": "フォルダを選択",

  "inlineEdit.clickToRename": "クリックで名前変更",
};

// Korean (ko)
const ko: Record<TranslationKey, string> = {
  "common.cancel": "취소",
  "common.create": "만들기",
  "common.delete": "삭제",
  "common.rename": "이름 변경",
  "common.copy": "복사",
  "common.back": "뒤로",
  "common.save": "저장",
  "common.error": "오류",
  "common.loading": "로딩 중...",
  "common.untitled": "제목 없음",
  "common.gif": "GIF",
  "common.name": "이름",
  "common.copied": "복사됨!",

  "app.addSticker": "스티커",
  "app.editMode": "편집",
  "app.exitEditMode": "종료",
  "app.searchPlaceholder": "스티커 검색...",

  "sidebar.all": "전체",
  "sidebar.newGroup": "새 그룹",
  "sidebar.settings": "설정",
  "sidebar.errorCreateGroup": "그룹 생성 실패. 이름이 이미 존재할 수 있습니다.",
  "sidebar.confirmDeleteGroup": "이 그룹과 모든 스티커를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
  "sidebar.confirmDeleteGroupTitle": "그룹 삭제",

  "grid.empty": "스티커가 없습니다. 이미지를 여기에 드래그하거나 \"+ 스티커\"를 클릭하세요.",

  "item.confirmDelete": "이 스티커를 삭제하시겠습니까?",
  "item.confirmDeleteTitle": "스티커 삭제",

  "detail.notFound": "스티커를 찾을 수 없습니다.",
  "detail.imageError": "이미지 로드 실패",
  "detail.saved": "저장됨",
  "detail.tags": "태그",
  "detail.noTags": "태그 없음",
  "detail.newTagPlaceholder": "새 태그...",

  "settings.title": "설정",
  "settings.paths": "경로",
  "settings.stickerSavePath": "스티커 저장 경로",
  "settings.chooseFolder": "폴더 선택",
  "settings.appearance": "외관",
  "settings.theme": "테마",
  "settings.themeSystem": "시스템",
  "settings.themeLight": "라이트",
  "settings.themeDark": "다크",
  "settings.language": "언어",
  "settings.window": "창",
  "settings.enableTray": "트레이 활성화",
  "settings.autostart": "시작 시 자동 실행",
  "settings.hotkey": "전역 단축키 활성화 (Ctrl+Shift+E)",
  "settings.about": "정보",
  "settings.saveSettings": "설정 저장",
  "settings.confirmMigrate": "기존 스티커 파일을 이전 위치에서 새 폴더로 이동하시겠습니까?",
  "settings.confirmMigrateTitle": "파일을 이전하시겠습니까?",
  "settings.migrationFailed": "이전 실패: {0}",
  "settings.savePathUpdated": "저장 경로가 업데이트되었습니다 (파일은 이동되지 않았습니다).",

  "newGroup.title": "새 그룹",
  "newGroup.namePlaceholder": "그룹 이름",
  "newGroup.importFolder": "폴더 가져오기",
  "newGroup.optional": "(선택사항)",
  "newGroup.chooseFolder": "폴더 선택",

  "inlineEdit.clickToRename": "클릭하여 이름 변경",
};

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: en as Record<TranslationKey, string>,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
  ko,
};

export { en };
