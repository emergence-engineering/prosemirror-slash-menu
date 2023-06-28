import { EditorView } from "prosemirror-view";

import { SlashMetaTypes } from "./enums";

export type ItemId = string | "root";
export type ItemType = "command" | "submenu";
export type MenuItem = {
  id: ItemId;
  label: string;
  type: ItemType;
  available: (view: EditorView) => boolean;
  hidden?: boolean;
};

export interface CommandItem extends MenuItem {
  type: "command";
  command: (view: EditorView) => void;
}

// eslint-disable-next-line no-use-before-define
export type MenuElement = CommandItem | SubMenu;

export interface SubMenu extends MenuItem {
  type: "submenu";
  elements: MenuElement[];
  callbackOnClose?: () => void;
  locked?: boolean;
}

export type SlashMenuState = {
  selected: ItemId;
  filteredElements: MenuElement[];
  open: boolean;
  subMenuId?: ItemId;
  filter: string;
  elements: MenuElement[];
  ignoredKeys: string[];
  callbackOnClose?: () => void;
};

export interface SlashMenuMeta {
  type: SlashMetaTypes;
  element?: MenuElement;
  filter?: string;
}
export interface OpeningConditions {
  shouldOpen: (
    state: SlashMenuState,
    event: KeyboardEvent,
    view: EditorView
  ) => boolean;
  shouldClose: (
    state: SlashMenuState,
    event: KeyboardEvent,
    view: EditorView
  ) => boolean;
}
