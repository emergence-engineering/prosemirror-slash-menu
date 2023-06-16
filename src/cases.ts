import { EditorView } from "prosemirror-view";
import { getElementById, defaultIgnoredKeys } from "./utils";
import { OpeningConditions, SlashMenuState } from "./types";

export enum SlashCases {
  OpenMenu = "openMenu",
  CloseMenu = "closeMenu",
  Execute = "Execute",
  NextItem = "NextItem",
  PrevItem = "PrevItem",
  inputChange = "InputChange",
  addChar = "addChar",
  removeChar = "removeChar",
  Ignore = "Ignore",
}
const defaultConditions: OpeningConditions = {
  shouldOpen: (
    state: SlashMenuState,
    event: KeyboardEvent,
    view: EditorView
  ) => {
    const editorState = view.state;
    const resolvedPos =
      editorState.selection.from < 0 ||
      editorState.selection.from > editorState.doc.content.size
        ? null
        : editorState.doc.resolve(editorState.selection.from);

    const parentNode = resolvedPos?.parent;
    const inParagraph = parentNode?.type.name === "paragraph";
    const inEmptyPar = inParagraph && parentNode?.nodeSize === 2;
    const posInLine = editorState.selection.$head.parentOffset;
    const prevCharacter = editorState.selection.$head.parent.textContent.slice(
      posInLine - 1,
      posInLine
    );
    const spaceBeforePos =
      prevCharacter === " " || prevCharacter === "" || prevCharacter === " ";
    return (
      !state.open &&
      event.key === "/" &&
      inParagraph &&
      (inEmptyPar || spaceBeforePos)
    );
  },
  shouldClose: (state: SlashMenuState, event: KeyboardEvent) =>
    state.open &&
    (event.key === "/" ||
      event.key === "Escape" ||
      event.key === "Backspace") &&
    state.filter.length === 0,
};
export const getCase = (
  state: SlashMenuState,
  event: KeyboardEvent,
  view: EditorView,
  customConditions?: OpeningConditions
): SlashCases => {
  const condition = customConditions || defaultConditions;
  const selected = getElementById(state.selected, state);
  if (condition.shouldOpen(state, event, view)) {
    return SlashCases.OpenMenu;
  }
  if (condition.shouldClose(state, event, view)) {
    return SlashCases.CloseMenu;
  }
  if (state.open) {
    if (event.key === "ArrowDown") {
      return SlashCases.NextItem;
    }
    if (event.key === "ArrowUp") {
      return SlashCases.PrevItem;
    }
    if (
      event.key === "Enter" ||
      event.key === "Tab" ||
      (event.key === "ArrowRight" && selected?.type === "submenu")
    ) {
      return SlashCases.Execute;
    }
    if (
      event.key === "Escape" ||
      (event.key === "Backspace" && state.filter.length === 0) ||
      (event.key === "ArrowLeft" && state.subMenuId)
    ) {
      return SlashCases.CloseMenu;
    }
    if (state.filter.length > 0 && event.key === "Backspace") {
      return SlashCases.removeChar;
    }
    if (!defaultIgnoredKeys.includes(event.key)) {
      return SlashCases.addChar;
    }
  }

  return SlashCases.Ignore;
};
