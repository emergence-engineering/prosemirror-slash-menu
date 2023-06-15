# prosemirror-slash-menu

By Horváth Áron & [Viktor Váczi](https://emergence-engineering.com/cv/viktor) at [Emergence Engineering](https://emergence-engineering.com/)

Try it out at placeholder <https://emergence-engineering.com/blog/prosemirror-image-plugin>

# Features

A prosemirror plugin to handle the state of a slash menu. It is intended to be opened inline with `/`, searched and navigated by keyboard.
It can be used together with prosemirror-slash-menu-react (react) `Link placeholder` to provide a UI element for
this menu, or you could write your own.

# Usage

Simply add to your editor plugins with an initial array of menu elements. An example configuration can be imported from `prosemirror-slash-menu-react` TODO LINK.


# Menu Elements

A menu elements can either be a simple `CommandItem` that executes an action, or it can be a `SubMenu` that can be opened to show its elements. 
Sub menus can be nested into other sub menus as needed. 
NOTE: It is necessary to add unique ids to every menu element. 
```typescript

export type ItemId = string | "root";
export type ItemType = "command" | "submenu";

type MenuItem = {
  id: ItemId;
  label: string;
  type: ItemType;
};

interface CommandItem extends MenuItem {
 type: "command";
 command: (view: EditorView) => void;
 available: () => boolean;
}

interface SubMenu extends MenuItem {
    type: "submenu";
    elements: MenuElement[];
}
type MenuElement = CommandItem | SubMenu;


```
# Ignored Keys 

There is an option to provide an array of key codes that the slash menu will ignore while filtering the commands. This can be useful if you have a special key in your app
that you don't want the slash menu to capture. 
Note that there is an array of keys that are ignored by default (`defaultIgnoredKeys`), these are keys such as "Shift", "Control", "Home" etc. that have no use in filtering. 

# Behaviour

Demonstrated with prosemirror-slash-menu-react. 
TODO GIF

The menu opens when '/' is pressed in an empty paragraph or after a space and will prevent the actual character to be inserted into the doc. If the user wants to actually write the 
character '/', pressing the key again will close the menu and insert the character. 
It can also be closed with Backspace (in some cases) and Escape. 
Up and Down arrow keys are used for selecting menu elements and Tab and Enter can be used to execute them or open the sub menu if the element is one. Sub menus can also be opened with RightArrow.
While Escape always closes the menu, Backspace will only close the sub menu if the user is in one. 
Filtering can be done by simply typing while the menu is open and return any matches from the main menu elements and all submenu elements. While filtering Backspace will not close the menu but work as intended.
