const navbarMap = new Map();
let hydrated = false;
const listeners = new Set();

export function getNavbarMap(){
    return navbarMap;
}

export async function hydrateNavbar(api){
    if(hydrated){
        return;
    }

    const res = await fetch(api + "/navbar");
    const data = await res.json();

    navbarMap.clear() // clearing the map for safety before hydrating
    data.forEach(game => {
        game.sections.forEach(section => {
            navbarMap.set(section.id, section)
        })
    });

    hydrated = true;
    listeners.forEach(listener => listener());
    console.log("navbar complete : ", navbarMap);
}

export function onHydrateNavbar(callback){
    listeners.add(callback);
    if (hydrated){ // meaning map creation complete 
        callback();
    }
    
    // sends this to the force render as a cleanup fn
    return () => listeners.delete(callback);

}