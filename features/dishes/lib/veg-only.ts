/** Root class that hides every egg and non-veg dish element (`[data-diet]`, see app/globals.css). */
export const vegOnlyClass = 'veg-only';

/** Device-local preference; members get a server-side diet default in P3 (E4-5). */
export const vegOnlyStorageKey = 'fdn-veg-only';

/** Runs before hydration (root layout `<Script strategy="beforeInteractive">`) so hidden dishes never flash. */
export const vegOnlyBootScript = `(function(){try{if(localStorage.getItem("${vegOnlyStorageKey}")==="1")document.documentElement.classList.add("${vegOnlyClass}")}catch(e){}})()`;
