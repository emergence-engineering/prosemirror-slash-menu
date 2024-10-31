import { Plugin, PluginKey } from "prosemirror-state";
import {
  dispatchWithMeta,
  getElementById,
  getFilteredItems,
  hasDuplicateIds,
  defaultIgnoredKeys,
} from "./utils";
import { getCase, SlashCases } from "./cases";
import {
  closeMenu,
  closeSubMenu,
  nextItem,
  openSubMenu,
  prevItem,
} from "./actions";
import {
  MenuElement,
  OpeningConditions,
  SlashMenuMeta,
  SlashMenuState,
  SubMenu,
} from "./types";
import { SlashMetaTypes } from "./enums";

export const SlashMenuKey = new PluginKey<SlashMenuState>("slash-menu-plugin");
export const SlashMenuPlugin = (
  menuElements: MenuElement[],
  ignoredKeys?: string[],
  customConditions?: OpeningConditions,
  openInSelection?: boolean
) => {
  const initialState: SlashMenuState = {
    selected: menuElements[0].id,
    open: false,
    filter: "",
    ignoredKeys: ignoredKeys
      ? [...defaultIgnoredKeys, ...ignoredKeys]
      : defaultIgnoredKeys,
    filteredElements: menuElements.filter((element) => !element.locked),
    elements: menuElements,
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
        const slashCase = getCase(
          state,
          event,
          view,
          initialState.ignoredKeys,
          customConditions,
          openInSelection
        );
        console.log({ slashCase });
        switch (slashCase) {
          case SlashCases.OpenMenu:
            dispatchWithMeta(view, SlashMenuKey, { type: SlashMetaTypes.open });
            return true;
          case SlashCases.CloseMenu: {
            const { subMenuId } = state;

            if (subMenuId) {
              const submenu = getElementById(
                subMenuId,
                initialState
              ) as SubMenu;
              const callback = submenu?.callbackOnClose;
              if (!submenu?.locked) {
                if (callback) {
                  callback();
                }
                dispatchWithMeta(view, SlashMenuKey, {
                  type: SlashMetaTypes.closeSubMenu,
                  element: getElementById(subMenuId, initialState),
                });
              } else
                dispatchWithMeta(view, SlashMenuKey, {
                  type: SlashMetaTypes.close,
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
              dispatchWithMeta(view, SlashMenuKey, {
                type: SlashMetaTypes.execute,
              });
              menuElement.command(view);
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
          case SlashCases.Catch: {
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
        console.log("slashMenuPlugin", { meta, state });
        switch (meta?.type) {
          case SlashMetaTypes.open:
            return { ...initialState, open: true };
          case SlashMetaTypes.close:
            return closeMenu(initialState);
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
            const newElements = meta.filter
              ? getFilteredItems(state, meta.filter)
              : initialState.elements;
            const selectedId = newElements?.[0]?.id;
            return {
              ...state,
              selected: selectedId || state.selected,
              filteredElements: newElements,
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
