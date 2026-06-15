import { invoke } from "@tauri-apps/api/core";
import { open, confirm, message } from "@tauri-apps/plugin-dialog";
import type { Sticker, StickerGroup, AppSettings } from "../types";

export const initApp = () => invoke<AppSettings>("init_app");

export const getStickers = (groupId?: number) =>
  invoke<Sticker[]>("get_stickers", { groupId });

export const searchStickers = (keyword: string, groupId?: number) =>
  invoke<Sticker[]>("search_stickers", { keyword, groupId });

export const addSticker = (sourcePath: string, tags: string, groupId: number) =>
  invoke<Sticker>("add_sticker", { sourcePath, tags, groupId });

export const updateStickerName = (id: number, newName: string) =>
  invoke("update_sticker_name", { id, newName });

export const updateStickerGroup = (id: number, groupId: number) =>
  invoke("update_sticker_group", { id, groupId });

export const updateStickerSortOrder = (id: number, sortOrder: number) =>
  invoke("update_sticker_sort_order", { id, sortOrder });

export const deleteSticker = (id: number) => invoke("delete_sticker", { id });

export const getGroups = (excludeZero = false) =>
  invoke<StickerGroup[]>("get_groups", { excludeZero });

export const addGroup = (name: string) =>
  invoke<StickerGroup>("add_group", { name });

export const updateGroupName = (id: number, name: string) =>
  invoke("update_group_name", { id, name });

export const updateGroupIcon = (id: number, iconPath: string) =>
  invoke("update_group_icon", { id, iconPath });

export const deleteGroup = (id: number) => invoke("delete_group", { id });

export const copyStickerToClipboard = (id: number) =>
  invoke("copy_sticker_to_clipboard", { id });

export const importFolder = (folderPath: string, groupId: number) =>
  invoke<Sticker[]>("import_folder", { folderPath, groupId });

export const getConfig = () => invoke<AppSettings>("get_config");

export const saveConfig = (newConfig: AppSettings) =>
  invoke("save_config", { newConfig });

export const openStickerFolder = () => invoke("open_sticker_folder");

export const migrateStickerStorage = (newFolder: string) =>
  invoke<string>("migrate_sticker_storage", { newFolder });

export const confirmDialog = (message: string, title: string) =>
  confirm(message, title);

export const alertDialog = (msg: string, title: string) =>
  message(msg, title);

export const cleanupInvalidStickers = () =>
  invoke<string>("cleanup_invalid_stickers");

export const openImageDialog = async () => {
  const result = await open({
    multiple: true,
    filters: [
      { name: "Images", extensions: ["png", "jpg", "jpeg", "bmp", "gif", "webp"] },
    ],
  });
  return result as string[] | null;
};

export const openFolderDialog = async () => {
  const result = await open({
    directory: true,
    multiple: false,
  });
  return result as string | null;
};
