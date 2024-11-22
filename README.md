# prosemirror-slash-menu

[![made by Emergence Engineering](https://emergence-engineering.com/ee-logo.svg)](https://emergence-engineering.com)

[**Made by Emergence-Engineering**](https://emergence-engineering.com/)

A ProseMirror plugin to handle the state of a slash menu. It is intended to be opened inline with `/`, searched and navigated by keyboard.
It can be used together with [prosemirror-slash-menu-react](https://github.com/emergence-engineering/prosemirror-slash-menu-react) to provide a UI element for
the plugin, or you could write your own.

By Horváth Áron & [Viktor Váczi](https://emergence-engineering.com/cv/viktor) at [Emergence Engineering](https://emergence-engineering.com/)

Try it out at <https://emergence-engineering.com/blog/prosemirror-slash-menu>

![alt text](https://github.com/emergence-engineering/prosemirror-slash-menu-react/blob/main/public/prosemirror-slash-menu.gif?raw=true)

# Features

- Opening the menu with `/` in an empty paragraph or after a space by default
- Option to add custom opening conditions
- Navigation and selection with keyboard
- Commands can be easily added to the menu as a `MenuElement[]`
- Filtering commands simply by typing while menu is open
- Nested sub menus

# Usage

Add to your editor plugins with an initial array of menu elements. You can import an example list of MenuElements from [prosemirror-slash-menu-react](https://github.com/emergence-engineering/prosemirror-slash-menu-react).

```
 plugins: [
    ...
        SlashMenuPlugin(defaultElements),
    ...
      ],
```

### With tiptap

For usage with tiptap simply create an extension with the plugin.

```typescript
Extension.create({
  name: "SlashMenuPlugin",
  addProseMirrorPlugins() {
    return [SlashMenuPlugin(defaultElements)];
  },
});
```

# Arguments

```typescript
SlashMenuPlugin = (
    menuElements: MenuElement[],
    ignoredKeys?: string[],
    customConditions?: OpeningConditions,
    openInSelection?: boolean
) => void;
```

### Menu Elements

A menu elements can either be a simple `CommandItem` that executes an action, or it can be a `SubMenu` that can be opened to show its elements.
You can nest submenus into other submenus as needed.
The `locked` property can be used to hide a menu element from the user. The main idea behind it is to have a `SubMenu` that can only be opened by sending a transaction with `openSubMenu` meta.
Once opened it behaves like a second, hidden slash menu. For eg. you can have a command that needs approval or rejection after execution, you could open the slash menu with just these two options that are otherwise hidden.
The `group` property can be used to group elements together in the menu. It is used to separate elements in the UI. It is not necessary to group elements, but it can be useful for better organization.

NOTE: It is necessary to add unique ids to every menu element.

```typescript
export type ItemId = string | "root";
export type ItemType = "command" | "submenu";

type MenuItem = {
  id: ItemId;
  label: string;
  type: ItemType;
  available: () => boolean;
  locked?: boolean;
  group?: string;
};

interface CommandItem extends MenuItem {
  type: "command";
  command: (view: EditorView) => void;
}

interface SubMenu extends MenuItem {
  type: "submenu";
  elements: MenuElement[];
}
type MenuElement = CommandItem | SubMenu;
```

### Ignored Keys

There is an option to provide an array of key codes that the slash menu will ignore while filtering the commands.
This can be useful if you have a special key in your app
that you don't want the slash menu to capture.
Note that there is an array of keys that are ignored by default (`defaultIgnoredKeys`), these are keys such as "Shift", "Control", "Home" etc. that have no use in filtering. Your custom keys will be appended to this array, not replace it.

### Opening Conditions

You can pass your own conditions on when should the menu open or close with `customConditions`.

```typescript
interface OpeningConditions {
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
```

### Open in selection

You have the option to open the menu even if you have something selected.

`openInSelection: boolean`

# Behaviour

- The menu opens when '/' is pressed in an empty paragraph or after a space and will prevent the actual character to be inserted into the doc.
- If you want to actually write the character '/', pressing the key again will close the menu and insert the character.
- You can also close it with Backspace (in some cases) and Escape.
- Up and Down arrow keys are used for selecting menu elements.
- You can use Tab and Enter to execute commands or open the submenu. You can also open submenus with right arrow.
- While Escape always closes the menu, Backspace will only close the sub menu if you are in one.
- You can filter by simply typing while the menu is open, the menu will return any matches from the main menu elements and from all submenu elements. While filtering Backspace will not close the menu but work as intended.
