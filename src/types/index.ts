export interface Sticker {
  id: number;
  image_path: string;
  tags: string;
  group_id: number;
  created_at: string;
  sort_order: number;
}

export interface StickerGroup {
  id: number;
  name: string;
  icon_path: string;
}

export interface AppSettings {
  sticker_save_path: string;
  db_path: string;
  tray_enabled: boolean;
  autostart_enabled: boolean;
  hotkey_enabled: boolean;
  theme_color: string;
  software_version: string;
}
