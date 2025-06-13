import Capynaut from "capynaut";

// ----------------------------------------------------------------------------
// Capynaut Unit Tests
// ----------------------------------------------------------------------------
// This suite covers all core functionality of Capynaut:
// - Binding and triggering shortcuts
// - Unbinding, rebinding, disabling, and enabling shortcuts
// - Cleanup, debug, and docs methods
// ----------------------------------------------------------------------------

describe("Capynaut unit test", () => {
    let capynaut: Capynaut;

    // ----------------------------------------------------------------------------
    // Set up a fresh Capynaut instance and a clean DOM before each test
    // ----------------------------------------------------------------------------
    beforeEach(() => {
        capynaut = new Capynaut();
        document.body.innerHTML = "<div id='foo'></div>";
    });

    // ----------------------------------------------------------------------------
    // Tear down Capynaut and clear the DOM after each test
    // ----------------------------------------------------------------------------
    afterEach(() => {
        capynaut.destroy();
        document.body.innerHTML = "";
    });

    // ----------------------------------------------------------------------------
    // Tests if a single key binding executes the callback on keydown
    // ----------------------------------------------------------------------------
    test("Should bind a single key and call the callback on keydown", () => {
        const callback = jest.fn();
        capynaut.bind("s", callback, "press s");

        const event = new KeyboardEvent("keydown", { key: "s" });
        document.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    // ----------------------------------------------------------------------------
    // Tests if a combination of keys executes the callback when pressed together
    // ----------------------------------------------------------------------------
    test("Should bind key combination (like ctrl+s) and call the callback", () => {
        const callback = jest.fn();
        capynaut.bind("ctrl+s", callback, "press ctrl + s");

        const event = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
        document.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    // ----------------------------------------------------------------------------
    // Tests if multiple combinations (like ctrl+c|v) all execute the callback
    // ----------------------------------------------------------------------------
    test("Should bind multiple key combination (such as ctrl+c|v) and call the callback", () => {
        const callback = jest.fn();
        capynaut.bind("ctrl+c|v", callback, "press ctrl + c or ctrl + v");

        let event: KeyboardEvent; 

        event = new KeyboardEvent("keydown", { key: "c", ctrlKey: true });
        document.dispatchEvent(event);
        event = new KeyboardEvent("keydown", { key: "v", ctrlKey: true });
        document.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(2);
    });

    // ----------------------------------------------------------------------------
    // Tests if a combination of a key and a mouse click event executes the callback
    // ----------------------------------------------------------------------------
    test("Should bind key and click combination (like ctrl+click) and call the callback", () => {
        const callback = jest.fn();
        capynaut.bind("ctrl+click", callback, "press ctrl + click");

        const event = new MouseEvent("click", { ctrlKey: true });
        document.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    // ----------------------------------------------------------------------------
    // Tests if unbind successfully removes a previously bound shortcut
    // ----------------------------------------------------------------------------
    test("Should allow unbind to release the event handler", () => {
        const callback = jest.fn();
        capynaut.bind("s", callback, "press s");
        capynaut.unbind("s");

        const event = new KeyboardEvent("keydown", { key: "s" });
        document.dispatchEvent(event);

        expect(callback).not.toHaveBeenCalled();
    });

    // ----------------------------------------------------------------------------
    // Tests if rebind replaces a previously bound callback
    // ----------------------------------------------------------------------------
    test("Should allow rebind to update registered shortcut", () => {
        const callback = jest.fn();
        capynaut.bind("s", () => { alert("Press s") }, "press s");
        capynaut.rebind("s", callback, "press s");

        const event = new KeyboardEvent("keydown", { key: "s" });
        document.dispatchEvent(event);

        expect(callback).toHaveBeenCalledTimes(1);
    });

    // ----------------------------------------------------------------------------
    // Tests disabling and then enabling a shortcut
    // ----------------------------------------------------------------------------
    test("Should disable and enable shortcut", () => {
        const callback = jest.fn();

        capynaut.bind("s", callback, "press s");
        capynaut.disable("s");
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));

        expect(callback).toHaveBeenCalledTimes(0);

        capynaut.enable("s");
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));

        expect(callback).toHaveBeenCalledTimes(1);
    });

    // ----------------------------------------------------------------------------
    // Tests destroy to clear all shortcuts and detach handlers
    // ----------------------------------------------------------------------------
    test("Should destroy all shortcuts and cleans up event listeners", () => {
        const callback = jest.fn();

        capynaut.bind("s", callback, "press s");
        capynaut.destroy();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));

        expect(callback).toHaveBeenCalledTimes(0);
    });

    // ----------------------------------------------------------------------------
    // Tests docs() to return both readable and non-readable format
    // ----------------------------------------------------------------------------
    test("Should return docs correctly in readable and non-readable form", () => {
        capynaut.bind("s", () => {}, "press s");
        const readable = capynaut.docs(true);

        expect(readable[0].keys).toEqual("s");

        const nonReadable = capynaut.docs(false);

        expect(nonReadable[0].keys).toEqual(["s"]);
        expect(readable.length).toEqual(1);
        expect(nonReadable.length).toEqual(1);
    });

    // ----------------------------------------------------------------------------
    // Tests debug prints all key events to console when turned on
    // ----------------------------------------------------------------------------
    test("Should print all keys pressed to the console if debug mode is on", () => {
        console.log = jest.fn();

        capynaut.debug();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));

        expect((console.log as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    });
});
