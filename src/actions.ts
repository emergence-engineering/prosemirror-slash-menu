import {
  findParent,
  getElementById,
  getFilteredItems,
  getNextItemId,
  getPreviousItemId,
} from "./utils";
import { SlashMenuMeta, SlashMenuState } from "./types";

export const openSubMenu = (state: SlashMenuState, meta: SlashMenuMeta) => {
  const menuElement = meta.element;
  if (menuElement?.type === "submenu") {
    return {
      ...state,
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
  const menuElement = meta.element;
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
export const filterItems = (state: SlashMenuState, filter: String) => {
  return { ...state, filter };
};
export const updateInput = (
  state: SlashMenuState,
  meta: SlashMenuMeta,
  initialState: SlashMenuState
) => {
  return {
    ...state,
    filteredElements: meta.filter
      ? getFilteredItems(initialState, meta.filter)
      : initialState.elements,
    filter: meta.filter || "",
  };
};
