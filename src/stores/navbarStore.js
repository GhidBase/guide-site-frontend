const navbarMap = new Map();
let hydrated = false;
const listeners = new Set();

export function getNavbarMap(){
    return navbarMap;
}

export async function hydrateNavbar(api, gameId){
    if(hydrated){
        return;
    }

    const res = await fetch(api + "/navbar?gameId=" + gameId);
    const data = await res.json();

    navbarMap.clear()
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
    if (hydrated){
        callback();
    }
    
    return () => listeners.delete(callback);
}