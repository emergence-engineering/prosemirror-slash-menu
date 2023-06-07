import { dispatchWithMeta, getElementById } from "./utils";
import { SlashMenuKey, SlashMetaTypes } from "./plugin";
import { EditorView } from "prosemirror-view";
import { SlashMenuState } from "./types";

const execute = (view: EditorView, state: SlashMenuState) => {
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
};

const closeMenu = (
  view: EditorView,
  state: SlashMenuState,
  initialState: SlashMenuState,
  event: KeyboardEvent
) => {
  const subMenuId = state.subMenuId;
  if (subMenuId) {
    dispatchWithMeta(view, SlashMenuKey, {
      type: SlashMetaTypes.closeSubMenu,
      element: getElementById(subMenuId, initialState),
    });
  } else if (event.key === "/") {
    view.dispatch(
      view.state.tr.insertText("/").setMeta(SlashMenuKey, {
        type: SlashMetaTypes.close,
      })
    );
  } else
    dispatchWithMeta(view, SlashMenuKey, {
      type: SlashMetaTypes.close,
    });
  return true;
};

export const keyHandlers = {
  execute: execute,
  closeMenu: closeMenu,
};
