<h1 align="center">Capynaut</h1>

<div align="center">
    <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript"></img>
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></img>
</div>

<br>

<div align="center">
    <img align="center" src="capynaut.png" alt="Capynaut" width="120"></img>
</div>

<br>

**Capynaut** is a simple library for handling keyboard and click shortcuts on a specific DOM element or the global document. Capynaut can be used in JavaScript and Typescript.

**Capynaut** is designed to make things simple: you can bind shortcuts, unbind them, rebind with new callbacks, enable or disable specific ones, and even create docs from a list of all active shortcuts in one place. You can also debug and destroy all shortcuts and cleans up event listeners.

**Capynaut** is useful when you want to make your app feel fast and responsive without handling events manually everywhere.

## Getting Started

1. Install **Capynaut** from `npm`
    ```bash
    npm install capynaut
    ```

2. Import **Capynaut** into your Javascript or Typescript file
    ```javascript
    // esm
    import { Capynaut } from "capynaut";

    // commonjs
    const { Capynaut } = require("capynaut");
    ```

3. Create an object from Capynaut constructor
    ```javascript
    const capynaut = new Capynaut();
    ```

4. Bind a new keyboard shortcut
    ```javascript
    capynaut.bind("s", () => { alert("'s' is pressed"); }, 'This is a description');
    ```

## Documentation

1. Bind or register a keyboard shortcut which can be a single key or a combination of keys using the `bind()` method. The argument for the `keys` parameter are the same for all methods, such as **single key**, **key combination**, **multiple keys**, and **key and click combination**
    ```javascript
    /**
     * bind(keys, callback, description = "", enabled = true);
    */

    // single key
    capynaut.bind("s", () => { alert("'s' is pressed"); }, 'This is a description');

    // key combination
    capynaut.bind("ctrl+s", () => { alert("'ctrl + s' is pressed"); });

    // multiple keys
    // 'ctrl+c|v' equal to 'ctrl+c' and 'ctrl+v'
    capynaut.bind("ctrl+c|v", () => { alert("'ctrl + c' or 'ctrl + v' is pressed"); });

    // key and click combination
    capynaut.bind("ctrl+click", () => { alert("'ctrl + click' is pressed"); });
    ```

2. If you want to rebind a registered shorcut, you can use the `rebind()` method
    ```javascript
    /**
     * rebind(keys, callback, description = "", enabled = true);
    */

    capynaut.rebind("ctrl+c", () => { alert("File copied!"); });
    ```

3. If you want to remove a registered shorcut, you can use the `unbind()` method
    ```javascript
    /**
     * unbind(keys);
    */

    capynaut.unbind("ctrl+c");
    ```

4. You can enable and disable a registered shortcut. By default, the shortcut is enable
    ```javascript
    /**
     * enable(keys);
     * desable(keys);
    */
    
    // enable shortcut
    capynaut.enable("ctrl+c");

    // disable shortcut
    capynaut.disable("ctrl+c");
    ```

5. You can print all key presses or mouse clicks by using the `debug()` method
    ```javascript
    /**
     * debug(enabled = true);
    */
    
    // enable debug mode
    capynaut.debug();

    // disable debug mode
    capynaut.debug(false);
    ```
    Output:
    ```bash
    ctrl
    ctrl + click
    ctrl + c
    ```

6. You can remove all shortcuts and cleans up event listeners by using the `destroy()` method
    ```javascript
    /**
     * destroy();
    */

    capynaut.destroy();
    ```

7. Instantly print docs from all registered shortcuts, the `readable` option can make docs easier to read
    ```javascript
    /**
     * docs(readable = false);
    */
    
    // readable is true
    console.log(capynaut.docs(true))

    // readable is false
    console.log(capynaut.docs())
    ```
    Output:
    - `readable` is `true`
        ```bash
        [
            {
                keys: 'ctrl',
                description: 'Control'
            },
            {
                keys: 'ctrl + v',
                description: 'To copy a file'
            }
        ]
        ```
    - `readable` is `false`
        ```bash
        [
            {
                keys: ['ctrl'],
                description: 'Control'
            },
            {
                keys: ['ctrl', 'v'],
                description: 'To copy a file'
            }
        ]
        ```

## Why Capynaut?
There are many similar libraries out there but Capynaut is different from them all, what are the differences?
- No external dependencies, no framework required.
- Easy to understand and use.
- Works with any keyboard layout
- YYou can create shortcuts with any key combination, such as `s`, `ctrl+s`, `ctrl+c|v`, `ctrl+click`, and more.
- Bind shortcuts, rebind shortcuts at any time, and unbind them when they are no longer needed.
- Enable and disable shortcuts whenever you want.
- Print the shortcuts you pressed with debug mode.
- Create docs instantly and implement it in your app.

## Try Capynaut
Download the repo and open `tests/capynaut.html` in your browser.