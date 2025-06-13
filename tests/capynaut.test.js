import { Capynaut } from "../dist/index.mjs";

const capynaut = new Capynaut();

capynaut.bind("s", () => { 
    alert("'s' is pressed"); 
});
capynaut.bind("ctrl+s", () => { 
    alert("'ctrl + s' is pressed"); 
});
capynaut.bind("ctrl+c|v", () => { 
    alert("'ctrl + c' or 'ctrl + v' is pressed"); 
});
capynaut.bind("ctrl+click", () => { 
    alert("'ctrl + click' is pressed"); 
});

capynaut.debug();

console.log(capynaut.docs(true));