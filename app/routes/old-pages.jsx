import { redirect } from "react-router";

const redirectMap = {
    "stun-guide.html": "/stun-guide",
    "defense-reduction.html": "/defense-reduction",
    "sb-mg.html": "/sb-mg",
    "mythic-roles.html": "/mythic-categories",
    "mpregen.html": "/mp-regen",
    "atkspeed.html": "/attack-speed",
    "helpiamnew-quests.html": "/newbie-quests",
    "hell-mode-guide.html": "/hell-mode-basics",
    "hell-mode-gameplay-guide.html": "/hell-mode",
    "hell-mode-bosses.html": "/hell-mode-bosses",
    "magic-hell-build.html": "/magic-hell-build",
    "treasures.html": "/exclusive-treasures",
    "treasure-upgrade-costs.html": "/treasure-upgrade-costs",
    "how-to-upgrade-treasures.html": "/unlock-treasures",
    "safe-box-earnings.html": "/safe-box-table",
    "pet-list.html": "/pets",
    "daily-fortunes.html": "/daily-fortunes",
    "indy-treasures.html": "/indy-treasures",
    "unlock-order.html": "/unlock-order-hard",
    "immortal-guardians.html": "/immortal-guardians",
    "guardian-upgrade-costs.html": "/guardian-upgrade-costs",
};

export function loader({ params }) {
    const destination = redirectMap[params.page];
    if (destination) {
        return redirect(destination, 301);
    }
    return redirect("/404", 301);
}

export default function OldPages() {
    return null;
}
