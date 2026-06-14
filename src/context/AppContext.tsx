import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { Sticker, StickerGroup, AppSettings } from "../types";
import * as api from "../utils/tauri";

interface AppState {
  groups: StickerGroup[];
  currentGroupId: number | null;
  stickers: Sticker[];
  editMode: boolean;
  searchKeyword: string;
  settings: AppSettings | null;
  loading: boolean;
  detailStickerId: number | null;
}

type Action =
  | { type: "SET_GROUPS"; payload: StickerGroup[] }
  | { type: "SET_CURRENT_GROUP"; payload: number | null }
  | { type: "SET_STICKERS"; payload: Sticker[] }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "SET_SEARCH_KEYWORD"; payload: string }
  | { type: "SET_SETTINGS"; payload: AppSettings }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_GROUP"; payload: StickerGroup }
  | { type: "REMOVE_GROUP"; payload: number }
  | { type: "UPDATE_GROUP"; payload: StickerGroup }
  | { type: "ADD_STICKER"; payload: Sticker }
  | { type: "REMOVE_STICKER"; payload: number }
  | { type: "UPDATE_STICKER"; payload: Sticker }
  | { type: "SET_DETAIL_STICKER"; payload: number | null };

const initialState: AppState = {
  groups: [],
  currentGroupId: null,
  stickers: [],
  editMode: false,
  searchKeyword: "",
  settings: null,
  loading: false,
  detailStickerId: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_GROUPS":
      return { ...state, groups: action.payload };
    case "SET_CURRENT_GROUP":
      return { ...state, currentGroupId: action.payload, searchKeyword: "" };
    case "SET_STICKERS":
      return { ...state, stickers: action.payload };
    case "TOGGLE_EDIT_MODE":
      return { ...state, editMode: !state.editMode };
    case "SET_SEARCH_KEYWORD":
      return { ...state, searchKeyword: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "ADD_GROUP":
      return { ...state, groups: [...state.groups, action.payload] };
    case "REMOVE_GROUP":
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
      };
    case "UPDATE_GROUP":
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case "ADD_STICKER":
      return { ...state, stickers: [action.payload, ...state.stickers] };
    case "REMOVE_STICKER":
      return {
        ...state,
        stickers: state.stickers.filter((s) => s.id !== action.payload),
      };
    case "UPDATE_STICKER":
      return {
        ...state,
        stickers: state.stickers.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case "SET_DETAIL_STICKER":
      return { ...state, detailStickerId: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadGroups: () => Promise<void>;
  loadStickers: (groupId?: number) => Promise<void>;
  searchStickers: (keyword: string, groupId?: number) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadGroups = useCallback(async () => {
    const groups = await api.getGroups();
    dispatch({ type: "SET_GROUPS", payload: groups });
  }, []);

  const loadStickers = useCallback(async (groupId?: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const stickers = await api.getStickers(groupId);
    dispatch({ type: "SET_STICKERS", payload: stickers });
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const searchStickers = useCallback(async (keyword: string, groupId?: number) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const stickers = await api.searchStickers(keyword, groupId);
    dispatch({ type: "SET_STICKERS", payload: stickers });
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const refreshAll = useCallback(async () => {
    await loadGroups();
    await loadStickers(state.currentGroupId ?? undefined);
  }, [loadGroups, loadStickers, state.currentGroupId]);

  return (
    <AppContext.Provider
      value={{ state, dispatch, loadGroups, loadStickers, searchStickers, refreshAll }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
