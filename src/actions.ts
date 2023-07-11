import {
  findParent,
  getElementById,
  getNextItemId,
  getPreviousItemId,
} from "./utils";
import { SlashMenuMeta, SlashMenuState, SubMenu } from "./types";

export const closeMenu = (initialState: SlashMenuState) => {
  const callback = initialState.callbackOnClose;
  if (callback) {
    callback();
  }
  return initialState;
};
export const openSubMenu = (state: SlashMenuState, meta: SlashMenuMeta) => {
  const menuElement = meta.element;
  if (menuElement?.type === "submenu") {
    return {
      ...state,
      open: true,
      filteredElements: menuElement.elements,
      selected: menuElement.elements[0].id,
      subMenuId: menuElement.id,
    };
  }
  return state;
};

export const closeSubMenu = (
  state: SlashMenuState,
  meta: SlashMenuMeta,
  initialState: SlashMenuState
) => {
  const menuElement = meta.element as SubMenu;
  const callback = menuElement.callbackOnClose;
  if (callback) {
    callback();
  }
  if (menuElement?.type === "submenu") {
    const parentId = findParent(menuElement.id, initialState.filteredElements);
    if (parentId === "root") {
      return { ...initialState, open: true };
    }
    const parent = getElementById(parentId, initialState);
    if (parent?.type !== "submenu") return state;
    return {
      ...state,
      filteredElements: parent.elements,
      selected: parent.elements[0].id,
      subMenuId: parentId,
    };
  }
  return state;
};

export const nextItem = (state: SlashMenuState) => {
  const nextId = getNextItemId(state);
  if (!nextId) return state;
  return { ...state, selected: nextId };
};

export const prevItem = (state: SlashMenuState) => {
  const prevId = getPreviousItemId(state);
  if (!prevId) return state;
  return { ...state, selected: prevId };
};
export const filterItems = (state: SlashMenuState, filter: string) => {
  return { ...state, filter };
};
