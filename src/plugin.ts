import { Plugin, PluginKey } from "prosemirror-state";
import {
  dispatchWithMeta,
  getElementById,
  getFilteredItems,
  hasDuplicateIds,
} from "./utils";
import { getCase, SlashCases } from "./cases";
import { closeSubMenu, nextItem, openSubMenu, prevItem } from "./actions";
import { SlashMenuMeta, SlashMenuState } from "./types";
import { SlashMetaTypes } from "./enums";

export const SlashMenuKey = new PluginKey<SlashMenuState>("slash-menu-plugin");

export const SlashMenuPlugin = (config: Partial<SlashMenuState>) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const initialState: SlashMenuState = {
    ...config,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    elements: config.filteredElements,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ignoredKeys: config.ignoredKeys,
  };
  if (hasDuplicateIds(initialState)) {
    throw new Error("Menu elements must have unique id's!");
  }
  return new Plugin<SlashMenuState>({
    key: SlashMenuKey,
    props: {
      handleKeyDown(view, event) {
        const editorState = view.state;
        const state = SlashMenuKey.getState(editorState);
        if (!state) return false;
        const slashCase = getCase(state, event, view);
        switch (slashCase) {
          case SlashCases.OpenMenu:
            dispatchWithMeta(view, SlashMenuKey, { type: SlashMetaTypes.open });
            return true;
          case SlashCases.CloseMenu: {
            const { subMenuId } = state;
            if (subMenuId) {
              dispatchWithMeta(view, SlashMenuKey, {
                type: SlashMetaTypes.closeSubMenu,
                element: getElementById(subMenuId, initialState),
              });
            } else if (event.key === "/") {
              view.dispatch(
                editorState.tr.insertText("/").setMeta(SlashMenuKey, {
                  type: SlashMetaTypes.close,
                })
              );
            } else
              dispatchWithMeta(view, SlashMenuKey, {
                type: SlashMetaTypes.close,
              });
            return true;
          }

          case SlashCases.Execute: {
            const menuElement = getElementById(state.selected, state);
            if (!menuElement) return false;
            if (menuElement.type === "command") {
              menuElement.command(view);
              dispatchWithMeta(view, SlashMenuKey, {
                type: SlashMetaTypes.execute,
              });
            }
            if (menuElement.type === "submenu") {
              dispatchWithMeta(view, SlashMenuKey, {
                type: SlashMetaTypes.openSubMenu,
                element: menuElement,
              });
            }

            return true;
          }
          case SlashCases.NextItem:
            dispatchWithMeta(view, SlashMenuKey, {
              type: SlashMetaTypes.nextItem,
            });
            return true;
          case SlashCases.PrevItem:
            dispatchWithMeta(view, SlashMenuKey, {
              type: SlashMetaTypes.prevItem,
            });
            return true;
          case SlashCases.addChar: {
            dispatchWithMeta(view, SlashMenuKey, {
              type: SlashMetaTypes.inputChange,
              filter: state.filter + event.key,
            });
            return true;
          }
          case SlashCases.removeChar: {
            const newFilter =
              state.filter.length === 1 ? "" : state.filter.slice(0, -1);
            dispatchWithMeta(view, SlashMenuKey, {
              type: SlashMetaTypes.inputChange,
              filter: newFilter,
            });
            return true;
          }

          default:
            return false;
        }
      },
    },

    state: {
      init() {
        return initialState;
      },
      apply(tr, state) {
        const meta: SlashMenuMeta = tr.getMeta(SlashMenuKey);
        switch (meta?.type) {
          case SlashMetaTypes.open:
            return { ...initialState, open: true };
          case SlashMetaTypes.close:
            return initialState;
          case SlashMetaTypes.execute:
            return initialState;
          case SlashMetaTypes.openSubMenu:
            return openSubMenu(state, meta);
          case SlashMetaTypes.closeSubMenu:
            return closeSubMenu(state, meta, initialState);
          case SlashMetaTypes.nextItem:
            return nextItem(state);
          case SlashMetaTypes.prevItem:
            return prevItem(state);
          case SlashMetaTypes.inputChange: {
            return {
              ...state,
              filteredElements: meta.filter
                ? getFilteredItems(initialState, meta.filter)
                : initialState.elements,
              filter: meta.filter || "",
            };
          }
          default:
            return state;
        }
      },
    },
    initialState,
  });
};
