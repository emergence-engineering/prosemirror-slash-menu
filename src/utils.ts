import { EditorView } from "prosemirror-view";
import { PluginKey } from "prosemirror-state";
import { ItemId, MenuElement, SlashMenuMeta, SlashMenuState } from "./types";

export const getElementIds = (item: MenuElement): ItemId[] => {
  if (item.type === "submenu")
    return [
      item.id,
      ...item.elements.map((item) => getElementIds(item)),
    ].flat();
  return [item.id];
};

export const getAllElementIds = (config: SlashMenuState) =>
  config.filteredElements.map((element) => getElementIds(element)).flat();

export const hasDuplicateIds = (config: SlashMenuState): boolean => {
  const ids = getAllElementIds(config);
  return ids.length !== new Set(ids).size;
};
const getElements = (item: MenuElement): MenuElement[] => {
  if (item.type === "submenu")
    return [item, ...item.elements.map((item) => getElements(item))].flat();
  return [item];
};
export const getAllElements = (state: SlashMenuState) =>
  state.elements.map((element) => getElements(element)).flat();

export const getElementById = (id: ItemId, state: SlashMenuState) => {
  return getAllElements(state).find((element) => element.id === id);
};
export const findParent = (
  id: ItemId,
  elements: MenuElement[],
  subMenu: ItemId | "root" = "root"
): ItemId | "root" => {
  let parentId: ItemId = "root";
  elements.forEach((item) => {
    if (item.type === "submenu") {
      if (item.id === id) parentId = subMenu;
      const elementIds = item.elements.map((item) => item.id);
      if (elementIds.includes(id)) {
        parentId = item.id;
      } else parentId = findParent(id, item.elements, item.id);
    }
    if (item.id === id) parentId = subMenu;
  });
  return parentId;
};
export const getNextItemId = (state: SlashMenuState): ItemId | undefined => {
  const parentId = findParent(state.selected, state.filteredElements);
  const parent = getElementById(parentId, state);
  if (parentId === "root") {
    const nextItemIndex =
      state.filteredElements.findIndex(
        (element) => element.id === state.selected
      ) + 1;
    if (nextItemIndex < state.filteredElements.length) {
      return state.filteredElements[nextItemIndex].id;
    }
  }
  if (parent && parent.type === "submenu") {
    const nextItemIndex =
      parent.elements.findIndex((element) => element.id === state.selected) + 1;
    if (nextItemIndex < parent.elements.length) {
      return parent.elements[nextItemIndex].id;
    }
  }
};
export const getPreviousItemId = (
  state: SlashMenuState
): ItemId | undefined => {
  const parentId = findParent(state.selected, state.filteredElements);
  const parent = getElementById(parentId, state);
  if (parentId === "root") {
    const prevItemIndex =
      state.filteredElements.findIndex(
        (element) => element.id === state.selected
      ) - 1;
    if (prevItemIndex >= 0) {
      return state.filteredElements[prevItemIndex].id;
    }
  }
  if (parent && parent.type === "submenu") {
    const prevItemIndex =
      parent.elements.findIndex((element) => element.id === state.selected) - 1;
    if (prevItemIndex >= 0) {
      return parent.elements[prevItemIndex].id;
    }
  }
};
export const dispatchWithMeta = (
  view: EditorView,
  key: PluginKey,
  meta: SlashMenuMeta
) => view.dispatch(view.state.tr.setMeta(key, meta));

export const getFilteredItems = (state: SlashMenuState, input: string) => {
  const regExp = new RegExp(`${input.toLowerCase().replace(/\s/g, "\\s")}`);
  return getAllElements(state)
    .map((el) => el)
    .filter(
      (element) =>
        element.label.toLowerCase().match(regExp) !== null &&
        element.type !== "submenu"
    );
};

export const defaultIgnoredKeys = [
  "Unidentified",
  "Alt",
  "AltGraph",
  "CapsLock",
  "Control",
  "Fn",
  "FnLock",
  "Hyper",
  "Meta",
  "NumLock",
  "PageDown",
  "PageUp",
  "Pause",
  "PrintScreen",
  "Redo",
  "ScrollLock",
  "Shift",
  "Super",
  "Symbol",
  "SymbolLock",
  "Enter",
  "Tab",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Backspace",
  "Clear",
  "Copy",
  "CrSel",
  "Cut",
  "Delete",
  "EraseEof",
  "ExSel",
  "Insert",
  "Paste",
  "Redo",
  "Undo",
  "Accept",
  "Again",
  "Attn",
  "Cancel",
  "ContextMenu",
  "Escape",
  "Execute",
  "Find",
  "Finish",
  "Help",
  "Pause",
  "Play",
  "Props",
  "Select",
  "ZoomIn",
  "ZoomOut",
  "BrightnessDown",
  "BrightnessUp",
  "Eject",
  "LogOff",
  "Power",
  "PowerOff",
  "PrintScreen",
  "Hibernate",
  "Standby",
  "WakeUp",
  "AllCandidates",
  "Alphanumeric",
  "CodeInput",
  "Compose",
  "Convert",
  "Dead",
  "FinalMode",
  "GroupFirst",
  "GroupLast",
  "GroupNext",
  "GroupPrevious",
  "ModeChange",
  "NextCandidate",
  "NonConvert",
  "PreviousCandidate",
  "Process",
  "SingleCandidate",
  "HangulMode",
  "HanjaMode",
  "JunjaMode",
  "Eisu",
  "Hankaku",
  "Hiragana",
  "HiraganaKatakana",
  "KanaMode",
  "KanjiMode",
  "Katakana",
  "Romaji",
  "Zenkaku",
  "ZenkakuHanaku",
];
