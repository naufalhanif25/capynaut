/**
 * Type of key binding that represents a single key binding configuration.
 */
type keyBinding = {
    keys: string[];
    callback: (event: KeyboardEvent | MouseEvent) => void;
    description: string,
    enabled: boolean
}

/**
 * The type of the target DOM element to which keyboard and mouse event listeners can be attached.
 */
type HTMLElementOrDocument = Element | Document;

/**
 * Capynaut
 *
 * Capynaut helps you manage keyboard and click shortcuts on a specific DOM element or the global document.
 * It's designed to make things simple: you can bind shortcuts, unbind them, rebind with new callbacks, enable or disable specific ones,
 * and even list out all the active shortcuts in one place.
 *
 * It's useful when you want to make your app feel fast and responsive without handling events manually everywhere.
 */
export class Capynaut {
    /**
     * Internal storage for all registered shortcuts.
     *
     * @type {keyBinding[]}
     * @private
     */
    #bindings: keyBinding[];

    /**
     * The element where the shortcut listeners are attached.
     * Can be any DOM element or the document itself.
     *
     * @type {HTMLElementOrDocument}
     * @private
     */
    #element: HTMLElementOrDocument;

    /**
     * The bound event handler for keyboard and click events.
     * This is needed so we can properly remove listeners later.
     *
     * @type {(event: Event) => void}
     * @private
     */
    #boundHandleKeydown: (event: Event) => void;

    /**
     * If true, Capynaut will log shortcut presses in the console.
     * Useful for debugging or seeing what keys are being picked up.
     *
     * @type {boolean}
     * @private
     */
    #debug: boolean;

    /**
     * A static map of key aliases.
     * These help unify shortcut strings like "esc" → "escape".
     *
     * Note: aliases are only used when parsing strings, not during event comparison.
     *
     * @type {Record<string, string>}
     * @private
     * @static
     */
    static #KEY_ALIAS: Record<string, string> = {
        esc: "escape",
        del: "delete",
        space: " ",
        control: "ctrl",
        alt: "alt",
        shift: "shift",
        meta: "meta",
    };

    /**
     * Creates a new instance of Capynaut and attaches shortcut listeners.
     *
     * @param {HTMLElementOrDocument} [element=document] - The element to attach listeners to.
     * @throws {TypeError} If the given element is invalid.
     */
    constructor(element: HTMLElementOrDocument = document) {
        if (!(element instanceof Element) && !(element instanceof Document)) {
            throw new TypeError(`'element' must be an instance of 'Element' or 'Document'`);
        }

        this.#bindings = [];
        this.#element = element;
        this.#debug = false;
        this.#boundHandleKeydown = this.#handleKeydown.bind(this);

        this.#element.addEventListener("keydown", this.#boundHandleKeydown);
        this.#element.addEventListener("click", this.#boundHandleKeydown);
    }

    /**
     * Parses a shortcut string into an array of key sequences.
     *
     * Example: - "ctrl+s"     → [["ctrl", "s"]]
     *          - "ctrl+c|v"   → [["ctrl", "c"], ["ctrl", "v"]]
     *          - "ctrl+click" → [["ctrl", "click"]]
     *
     * @private
     * @param {string} keys - A shortcut string like `"s"`, `"ctrl+s"`, `"ctrl+c|v"`, or `"ctrl+click"`.
     * @returns {string[][]} Parsed key sequences.
     * @throws {TypeError} If the input format is invalid or empty.
     */
    #parseKeys(keys: string): string[][] {
        const keyParts = keys.toLowerCase().split("+").map(key => key.trim());
        const keysBase: string[] = [];
        const keysSplit: string[] = [];

        keyParts.forEach(part => {
            if (part.includes("|")) {
                part.split("|").forEach(key => {
                    keysSplit.push(Capynaut.#KEY_ALIAS[key] || key);
                });
            } else {
                keysBase.push(Capynaut.#KEY_ALIAS[part] || part);
            }
        });

        if (keysSplit.length !== 0) {
            const keysMerged: string[][] = [];

            keysSplit.forEach(key => {
                if (key.trim()) {
                    keysMerged.push([...keysBase, key])
                }
            });

            if (keysMerged.length === 0) {
                throw new TypeError("'keys' is not defined correctly")
            }

            return keysMerged;
        }

        return [keysBase];
    }

    /**
     * Registers a new shortcut.
     *
     * If the shortcut already exists, it won’t be added again.
     *
     * @param {string} keys - Shortcut string to bind (e.g., `"s"`, `"ctrl+s"`, `"ctrl+a|b"`, or `"ctrl+click"`).
     * @param {(event: KeyboardEvent | MouseEvent) => void} callback - Function to run when triggered.
     * @param {string} [description=""] - Optional description.
     * @param {boolean} [enabled=true] - Start enabled or not.
     * @throws {TypeError} If arguments are invalid.
     */
    bind(
        keys: string,
        callback: (event: KeyboardEvent | MouseEvent) => void,
        description: string = "",
        enabled: boolean = true
    ): void {
        if (typeof keys !== "string" || !keys.trim()) {
            throw new TypeError("'keys' must be a string and cannot be empty");
        }
        if (typeof callback !== "function") {
            throw new TypeError("'callback' must be a function and cannot be empty");
        }
        if (typeof description !== "string") {
            throw new TypeError("'description' must be a string");
        }
        if (typeof enabled !== "boolean") {
            throw new TypeError("'enabled' must be a boolean");
        }

        const parsedKeys = this.#parseKeys(keys);

        parsedKeys.forEach(keys => {
            const keysJoin = keys.join("+");

            if (!this.#bindings.some(binding => binding.keys.join("+") === keysJoin)) {
                this.#bindings.push({
                    keys,
                    callback,
                    description,
                    enabled,
                });
            } else {
                console.warn(`Shortcut '${keysJoin}' is already registered`);
            }
        });
    }

    /**
     * Removes an existing shortcut.
     *
     * If the shortcut is not found, a warning is shown.
     *
     * @param {string} keys - Shortcut string to unbind (e.g., `"s"`, `"ctrl+s"`, `"ctrl+a|b"`, or `"ctrl+click"`).
     * @throws {TypeError} If input is invalid.
     */
    unbind(keys: string): void {
        if (typeof keys !== "string" || !keys.trim()) {
            throw new TypeError("'keys' must be a string and cannot be empty");
        }

        const parsedKeys = this.#parseKeys(keys);

        parsedKeys.forEach(keys => {
            const keysJoin = keys.join("+");
            const bindingsLength = this.#bindings.length;

            this.#bindings = this.#bindings.filter(binding => {
                return binding.keys.join("+") !== keysJoin;
            });

            if (this.#bindings.length === bindingsLength) {
                console.warn(`Shortcut '${keysJoin}' is not registered`);
            }
        });
    }

    /**
     * Replaces an existing shortcut with a new callback or description.
     *
     * If the shortcut isn’t found, a warning is shown.
     *
     * @param {string} keys - Shortcut string to rebind (e.g., `"s"`, `"ctrl+s"`, `"ctrl+a|b"`, or `"ctrl+click"`).
     * @param {(event: KeyboardEvent | MouseEvent) => void} callback - New callback function.
     * @param {string} [description=""] - Optional description.
     * @param {boolean} [enabled=true] - Enable or not after rebinding.
     * @throws {TypeError} If arguments are invalid.
     */
    rebind(
        keys: string,
        callback: (event: KeyboardEvent | MouseEvent) => void,
        description: string = "",
        enabled: boolean = true
    ): void {
        if (typeof keys !== "string" || !keys.trim()) {
            throw new TypeError("'keys' must be a string and cannot be empty");
        }
        if (typeof callback !== "function") {
            throw new TypeError("'callback' must be a function and cannot be empty");
        }
        if (typeof description !== "string") {
            throw new TypeError("'description' must be a string");
        }
        if (typeof enabled !== "boolean") {
            throw new TypeError("'enabled' must be a boolean");
        }

        const parsedKeys = this.#parseKeys(keys);

        parsedKeys.forEach(keys => {
            const keysJoin = keys.join("+");
            const bindingsLength = this.#bindings.length;

            this.#bindings = this.#bindings.filter(binding => {
                return keysJoin !== binding.keys.join("+");
            });

            if (this.#bindings.length < bindingsLength) {
                this.#bindings.push({
                    keys,
                    callback,
                    description,
                    enabled,
                });
            } else {
                console.warn(`Shortcut '${keysJoin}' is not registered`);
            }
        });
    }

    /**
     * Enables a specific shortcut.
     *
     * @param {string} keys - Shortcut string to enable (e.g., `"s"`, `"ctrl+s"`, `"ctrl+a|b"`, or `"ctrl+click"`).
     * @throws {TypeError} If input is invalid.
     */
    enable(keys: string): void {
        if (typeof keys !== "string" || !keys.trim()) {
            throw new TypeError("'keys' must be a string and cannot be empty");
        }

        this.#toggle(keys);
    }

    /**
     * Disables a specific shortcut.
     *
     * @param {string} keys - Shortcut string to disable (e.g., `"s"`, `"ctrl+s"`, `"ctrl+a|b"`, or `"ctrl+click"`).
     * @throws {TypeError} If input is invalid.
     */
    disable(keys: string): void {
        if (typeof keys !== "string" || !keys.trim()) {
            throw new TypeError("'keys' must be a string and cannot be empty");
        }

        this.#toggle(keys, false);
    }

    /**
     * Internally toggles a shortcut on or off.
     * 
     * If the shortcut isn’t found, a warning is shown.
     *
     * @private
     * @param {string} keys - Shortcut string to toggle.
     * @param {boolean} [enabled=true] - Whether to enable or disable.
     */
    #toggle(keys: string, enabled: boolean = true): void {
        const parsedKeys = this.#parseKeys(keys);

        parsedKeys.forEach(keys => {
            const keysJoin = keys.join("+");
            let found = false;

            this.#bindings.forEach(binding => {
                if (binding.keys.join("+") === keysJoin) {
                    binding.enabled = enabled;
                    found = true;
                }
            });

            if (!found) {
                console.warn(`Shortcut '${keysJoin}' is not registered and cannot be ${enabled ? "enabled" : "disabled"}`);
            }
        });
    }

    /**
     * Handles keydown and click events.
     * If a matching active shortcut is found, its callback is called.
     *
     * @private
     * @param {Event} event - The triggered event
     */
    #handleKeydown(event: Event): void {
        const pressed = [];

        if (event instanceof KeyboardEvent || event instanceof MouseEvent) {
            if (event.ctrlKey) pressed.push("ctrl");
            if (event.altKey) pressed.push("alt");
            if (event.shiftKey) pressed.push("shift");
            if (event.metaKey) pressed.push("meta");

            if (event instanceof MouseEvent) {
                pressed.push("click");
            } else {
                const keyPressed = event.key.toLowerCase();

                if (!Capynaut.#KEY_ALIAS[keyPressed]) {
                    pressed.push(keyPressed);
                }
            }
        } else {
            return;
        }

        for (const binding of this.#bindings) {
            const sortedBinding = [...binding.keys].sort().join("+");
            const sortedPressed = [...pressed].sort().join("+");

            if (sortedBinding === sortedPressed && binding.enabled) {
                event.preventDefault?.();
                binding.callback(event as KeyboardEvent | MouseEvent);

                break;
            }
        }

        if (this.#debug) {
            console.log(pressed.join(" + "));
        }
    }

    /**
     * Turns debug mode on or off.
     * When enabled, every key/click press will be logged to the console.
     *
     * @param {boolean} [enabled=true]
     */
    debug(enabled: boolean = true): void {
        this.#debug = enabled;
    }

    /**
     * Removes all shortcuts and cleans up event listeners.
     */
    destroy(): void {
        this.#element.removeEventListener("keydown", this.#boundHandleKeydown);
        this.#element.removeEventListener("click", this.#boundHandleKeydown);

        this.#bindings = [];
    }

    /**
     * Returns a list of all registered shortcuts and their descriptions.
     *
     * @param {boolean} [readable=false] - If true, returns shortcuts as strings (e.g., "ctrl+s"); otherwise, returns arrays.
     * @returns {{ keys: string | string[], description: string }[]} - Registered shortcuts and their descriptions.
     * @throws {TypeError} If argument is not boolean.
     */
    docs(readable: boolean = false): { keys: string[] | string; description: string }[] {
        if (typeof readable !== "boolean") {
            throw new TypeError("'readable' must be a boolean");
        }

        try {
            return this.#bindings.map(({ keys, description }) => ({
                keys: readable
                    ? keys.join(" + ")
                    : keys,
                description
            }));
        } catch {
            throw new TypeError("'keys' is not defined correctly");
        }
    }
}
