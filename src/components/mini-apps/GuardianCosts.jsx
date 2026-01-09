import { Fragment, useState } from "react";
import { usePage } from "../../contexts/PageProvider";

export default function GuardianCosts() {
    const [fromLevel, setFromLevel] = useState(1);
    const [toLevel, setToLevel] = useState(2);
    const [rarity, setRarity] = useState("mythic");

    const { setTitle } = usePage();
    setTitle("Upgrade Costs");

    const upgradeCosts = {
        immortal: {
            1: {
                stones: 0,
                gold: 0,
            },
            2: {
                stones: 5,
                gold: 2000,
            },
            3: {
                stones: 10,
                gold: 4000,
            },
            4: {
                stones: 20,
                gold: 8000,
            },
            5: {
                stones: 30,
                gold: 12000,
            },
            6: {
                stones: 50,
                gold: 20000,
            },
            7: {
                stones: 70,
                gold: 28000,
            },
            8: {
                stones: 100,
                gold: 40000,
            },
            9: {
                stones: 130,
                gold: 52000,
            },
            10: {
                stones: 170,
                gold: 68000,
            },
            11: {
                stones: 210,
                gold: 84000,
            },
            12: {
                stones: 260,
                gold: 104000,
            },
            13: {
                stones: 310,
                gold: 124000,
            },
            14: {
                stones: 360,
                gold: 144000,
            },
            15: {
                stones: 430,
                gold: 172000,
            },
        },
        mythic: {
            1: {
                stones: 0,
                gold: 0,
            },
            2: {
                stones: 5,
                gold: 1000,
            },
            3: {
                stones: 10,
                gold: 2000,
            },
            4: {
                stones: 20,
                gold: 4000,
            },
            5: {
                stones: 30,
                gold: 6000,
            },
            6: {
                stones: 50,
                gold: 10000,
            },
            7: {
                stones: 70,
                gold: 14000,
            },
            8: {
                stones: 100,
                gold: 20000,
            },
            9: {
                stones: 130,
                gold: 26000,
            },
            10: {
                stones: 170,
                gold: 34000,
            },
            11: {
                stones: 210,
                gold: 42000,
            },
            12: {
                stones: 260,
                gold: 52000,
            },
            13: {
                stones: 310,
                gold: 62000,
            },
            14: {
                stones: 360,
                gold: 72000,
            },
            15: {
                stones: 430,
                gold: 86000,
            },
        },
        legendary: {
            1: {
                duplicates: 0,
                gold: 0,
            },
            2: {
                duplicates: 2,
                gold: 1000,
            },
            3: {
                duplicates: 3,
                gold: 2000,
            },
            4: {
                duplicates: 4,
                gold: 4000,
            },
            5: {
                duplicates: 10,
                gold: 6000,
            },
            6: {
                duplicates: 15,
                gold: 10000,
            },
            7: {
                duplicates: 20,
                gold: 14000,
            },
            8: {
                duplicates: 30,
                gold: 20000,
            },
            9: {
                duplicates: 40,
                gold: 26000,
            },
            10: {
                duplicates: 50,
                gold: 34000,
            },
            11: {
                duplicates: 65,
                gold: 42000,
            },
            12: {
                duplicates: 80,
                gold: 52000,
            },
            13: {
                duplicates: 95,
                gold: 62000,
            },
            14: {
                duplicates: 110,
                gold: 72000,
            },
            15: {
                duplicates: 130,
                gold: 86000,
            },
        },
        epic: {
            1: {
                duplicates: 0,
                gold: 0,
            },
            2: {
                duplicates: 3,
                gold: 1000,
            },
            3: {
                duplicates: 4,
                gold: 2000,
            },
            4: {
                duplicates: 8,
                gold: 4000,
            },
            5: {
                duplicates: 12,
                gold: 6000,
            },
            6: {
                duplicates: 20,
                gold: 10000,
            },
            7: {
                duplicates: 30,
                gold: 14000,
            },
            8: {
                duplicates: 40,
                gold: 20000,
            },
            9: {
                duplicates: 50,
                gold: 26000,
            },
            10: {
                duplicates: 70,
                gold: 34000,
            },
            11: {
                duplicates: 85,
                gold: 42000,
            },
            12: {
                duplicates: 105,
                gold: 52000,
            },
            13: {
                duplicates: 125,
                gold: 62000,
            },
            14: {
                duplicates: 145,
                gold: 72000,
            },
            15: {
                duplicates: 170,
                gold: 86000,
            },
        },
        rare: {
            1: {
                duplicates: 0,
                gold: 0,
            },
            2: {
                duplicates: 3,
                gold: 1000,
            },
            3: {
                duplicates: 6,
                gold: 2000,
            },
            4: {
                duplicates: 10,
                gold: 3000,
            },
            5: {
                duplicates: 20,
                gold: 5000,
            },
            6: {
                duplicates: 30,
                gold: 8000,
            },
            7: {
                duplicates: 40,
                gold: 12000,
            },
            8: {
                duplicates: 60,
                gold: 17000,
            },
            9: {
                duplicates: 80,
                gold: 22000,
            },
            10: {
                duplicates: 100,
                gold: 28000,
            },
            11: {
                duplicates: 130,
                gold: 35000,
            },
            12: {
                duplicates: 160,
                gold: 43000,
            },
            13: {
                duplicates: 190,
                gold: 52000,
            },
            14: {
                duplicates: 220,
                gold: 60000,
            },
            15: {
                duplicates: 260,
                gold: 72000,
            },
        },
        common: {
            1: {
                duplicates: 0,
                gold: 0,
            },
            2: {
                duplicates: 5,
                gold: 500,
            },
            3: {
                duplicates: 10,
                gold: 1000,
            },
            4: {
                duplicates: 20,
                gold: 2000,
            },
            5: {
                duplicates: 30,
                gold: 3000,
            },
            6: {
                duplicates: 50,
                gold: 5000,
            },
            7: {
                duplicates: 70,
                gold: 7000,
            },
            8: {
                duplicates: 100,
                gold: 10000,
            },
            9: {
                duplicates: 130,
                gold: 13000,
            },
            10: {
                duplicates: 170,
                gold: 17000,
            },
            11: {
                duplicates: 210,
                gold: 21000,
            },
            12: {
                duplicates: 260,
                gold: 26000,
            },
            13: {
                duplicates: 310,
                gold: 31000,
            },
            14: {
                duplicates: 360,
                gold: 36000,
            },
            15: {
                duplicates: 430,
                gold: 43000,
            },
        },
    };

    let totalGold = 0;
    let totalDuplicates = 0;
    let totalStones = 0;
    let costMessage = "";

    if (rarity === "mythic" || rarity === "immortal") {
        for (let i = Number(fromLevel) + 1; i <= Number(toLevel); i++) {
            totalStones += upgradeCosts[rarity][i].stones;
            totalGold += upgradeCosts[rarity][i].gold;
        }
        if (totalGold > 1000) {
            totalGold = totalGold / 1000 + "k";
        }
        costMessage = (
            <p>
                Total Stones: {totalStones} <br /> Total Gold: {totalGold}
            </p>
        );
    } else {
        for (let i = Number(fromLevel) + 1; i <= Number(toLevel); i++) {
            totalDuplicates += upgradeCosts[rarity][i].duplicates;
            totalGold += upgradeCosts[rarity][i].gold;
        }
        if (totalGold > 1000) {
            totalGold = totalGold / 1000 + "k";
        }
        costMessage = (
            <p>
                Total Duplicates: {totalDuplicates}
                <br />
                Total Gold:{totalGold}
            </p>
        );
    }

    return (
        <Fragment>
            <div class="content-block self-center text-left px-4 w-full lg:px-10">
                <h2>
                    <u>Upgrade Costs</u>
                </h2>
                <p>
                    This is a list of all the upgrade costs for all units in the
                    game.
                </p>
                <p>Choose a rarity to see costs:</p>

                <form action="">
                    <label for="rarity-selector">Rarity: </label>
                    <select
                        name="rarity-selector"
                        id="rarity-selector"
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value)}
                    >
                        <option value="mythic">Mythic</option>
                        <option value="immortal">Immortal</option>
                        <option value="legendary">Legendary</option>
                        <option value="epic">Epic</option>
                        <option value="rare">Rare</option>
                        <option value="common">Common</option>
                    </select>
                    <label for="from-level">  From: </label>
                    <select
                        name="from-level"
                        id="from-level"
                        value={fromLevel}
                        onChange={(e) => {
                            const value =
                                +e.target.value < +toLevel
                                    ? +e.target.value
                                    : +toLevel - 1;
                            setFromLevel(value);
                        }}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                    </select>
                    <label for="to-level">  To: </label>
                    <select
                        name="to-level"
                        id="to-level"
                        value={toLevel}
                        onChange={(e) => {
                            const value =
                                +e.target.value > +fromLevel
                                    ? +e.target.value
                                    : +fromLevel + 1;
                            setToLevel(value);
                        }}
                    >
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                    </select>
                </form>
                {costMessage}
            </div>

            <div class="content-block">
                {rarity == "mythic" && (
                    <div class="rarity-table" id="mythic">
                        <h2>
                            <u>Mythic (Short Version)</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level Range</th>
                                    <th>Mythic Stones</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 6</td>
                                    <td>115 stones</td>
                                    <td>23,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 12</td>
                                    <td>940 stones</td>
                                    <td>188,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 15</td>
                                    <td>1,100 stones</td>
                                    <td>220,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                        <h2>
                            <u>Mythic</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Mythic Stones</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 2</td>
                                    <td>5 stones</td>
                                    <td>1,000 gold</td>
                                </tr>
                                <tr>
                                    <td>2 → 3</td>
                                    <td>10 stones</td>
                                    <td>2,000 gold</td>
                                </tr>
                                <tr>
                                    <td>3 → 4</td>
                                    <td>20 stones</td>
                                    <td>4,000 gold</td>
                                </tr>
                                <tr>
                                    <td>4 → 5</td>
                                    <td>30 stones</td>
                                    <td>6,000 gold</td>
                                </tr>
                                <tr>
                                    <td>5 → 6</td>
                                    <td>50 stones</td>
                                    <td>10,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 7</td>
                                    <td>70 stones</td>
                                    <td>14,000 gold</td>
                                </tr>
                                <tr>
                                    <td>7 → 8</td>
                                    <td>100 stones</td>
                                    <td>20,000 gold</td>
                                </tr>
                                <tr>
                                    <td>8 → 9</td>
                                    <td>130 stones</td>
                                    <td>26,000 gold</td>
                                </tr>
                                <tr>
                                    <td>9 → 10</td>
                                    <td>170 stones</td>
                                    <td>34,000 gold</td>
                                </tr>
                                <tr>
                                    <td>10 → 11</td>
                                    <td>210 stones</td>
                                    <td>42,000 gold</td>
                                </tr>
                                <tr>
                                    <td>11 → 12</td>
                                    <td>260 stones</td>
                                    <td>52,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 13</td>
                                    <td>310 stones</td>
                                    <td>62,000 gold</td>
                                </tr>
                                <tr>
                                    <td>13 → 14</td>
                                    <td>360 stones</td>
                                    <td>72,000 gold</td>
                                </tr>
                                <tr>
                                    <td>14 → 15</td>
                                    <td>430 stones</td>
                                    <td>86,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {rarity == "immortal" && (
                    <div class="rarity-table hide" id="immortal">
                        <h2>
                            <u>Immortal (Short Version)</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level Range</th>
                                    <th>Immortal Stones</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 6</td>
                                    <td>115 stones</td>
                                    <td>46,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 12</td>
                                    <td>940 stones</td>
                                    <td>376,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 15</td>
                                    <td>1,100 stones</td>
                                    <td>440,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                        <h2>
                            <u>Immortal</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Immortal Stones</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 2</td>
                                    <td>5 stones</td>
                                    <td>2,000 gold</td>
                                </tr>
                                <tr>
                                    <td>2 → 3</td>
                                    <td>10 stones</td>
                                    <td>4,000 gold</td>
                                </tr>
                                <tr>
                                    <td>3 → 4</td>
                                    <td>20 stones</td>
                                    <td>8,000 gold</td>
                                </tr>
                                <tr>
                                    <td>4 → 5</td>
                                    <td>30 stones</td>
                                    <td>12,000 gold</td>
                                </tr>
                                <tr>
                                    <td>5 → 6</td>
                                    <td>50 stones</td>
                                    <td>20,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 7</td>
                                    <td>70 stones</td>
                                    <td>28,000 gold</td>
                                </tr>
                                <tr>
                                    <td>7 → 8</td>
                                    <td>100 stones</td>
                                    <td>40,000 gold</td>
                                </tr>
                                <tr>
                                    <td>8 → 9</td>
                                    <td>130 stones</td>
                                    <td>52,000 gold</td>
                                </tr>
                                <tr>
                                    <td>9 → 10</td>
                                    <td>170 stones</td>
                                    <td>68,000 gold</td>
                                </tr>
                                <tr>
                                    <td>10 → 11</td>
                                    <td>210 stones</td>
                                    <td>84,000 gold</td>
                                </tr>
                                <tr>
                                    <td>11 → 12</td>
                                    <td>260 stones</td>
                                    <td>104,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 13</td>
                                    <td>310 stones</td>
                                    <td>124,000 gold</td>
                                </tr>
                                <tr>
                                    <td>13 → 14</td>
                                    <td>360 stones</td>
                                    <td>144,000 gold</td>
                                </tr>
                                <tr>
                                    <td>14 → 15</td>
                                    <td>430 stones</td>
                                    <td>172,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {rarity == "legendary" && (
                    <div class="rarity-table hide" id="legendary">
                        <h2>
                            <u>Legendary</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Duplicates</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 2</td>
                                    <td>2 duplicates</td>
                                    <td>1,000 gold</td>
                                </tr>
                                <tr>
                                    <td>2 → 3</td>
                                    <td>3 duplicates</td>
                                    <td>2,000 gold</td>
                                </tr>
                                <tr>
                                    <td>3 → 4</td>
                                    <td>4 duplicates</td>
                                    <td>4,000 gold</td>
                                </tr>
                                <tr>
                                    <td>4 → 5</td>
                                    <td>10 duplicates</td>
                                    <td>6,000 gold</td>
                                </tr>
                                <tr>
                                    <td>5 → 6</td>
                                    <td>15 duplicates</td>
                                    <td>10,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 7</td>
                                    <td>20 duplicates</td>
                                    <td>14,000 gold</td>
                                </tr>
                                <tr>
                                    <td>7 → 8</td>
                                    <td>30 duplicates</td>
                                    <td>20,000 gold</td>
                                </tr>
                                <tr>
                                    <td>8 → 9</td>
                                    <td>40 duplicates</td>
                                    <td>26,000 gold</td>
                                </tr>
                                <tr>
                                    <td>9 → 10</td>
                                    <td>50 duplicates</td>
                                    <td>34,000 gold</td>
                                </tr>
                                <tr>
                                    <td>10 → 11</td>
                                    <td>65 duplicates</td>
                                    <td>42,000 gold</td>
                                </tr>
                                <tr>
                                    <td>11 → 12</td>
                                    <td>80 duplicates</td>
                                    <td>52,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 13</td>
                                    <td>95 duplicates</td>
                                    <td>62,000 gold</td>
                                </tr>
                                <tr>
                                    <td>13 → 14</td>
                                    <td>110 duplicates</td>
                                    <td>72,000 gold</td>
                                </tr>
                                <tr>
                                    <td>14 → 15</td>
                                    <td>130 duplicates</td>
                                    <td>86,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {rarity == "epic" && (
                    <div class="rarity-table hide" id="epic">
                        <h2>
                            <u>Epic</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Duplicates</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 2</td>
                                    <td>3 duplicates</td>
                                    <td>1,000 gold</td>
                                </tr>
                                <tr>
                                    <td>2 → 3</td>
                                    <td>4 duplicates</td>
                                    <td>2,000 gold</td>
                                </tr>
                                <tr>
                                    <td>3 → 4</td>
                                    <td>8 duplicates</td>
                                    <td>4,000 gold</td>
                                </tr>
                                <tr>
                                    <td>4 → 5</td>
                                    <td>12 duplicates</td>
                                    <td>6,000 gold</td>
                                </tr>
                                <tr>
                                    <td>5 → 6</td>
                                    <td>20 duplicates</td>
                                    <td>10,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 7</td>
                                    <td>30 duplicates</td>
                                    <td>14,000 gold</td>
                                </tr>
                                <tr>
                                    <td>7 → 8</td>
                                    <td>40 duplicates</td>
                                    <td>20,000 gold</td>
                                </tr>
                                <tr>
                                    <td>8 → 9</td>
                                    <td>50 duplicates</td>
                                    <td>26,000 gold</td>
                                </tr>
                                <tr>
                                    <td>9 → 10</td>
                                    <td>70 duplicates</td>
                                    <td>34,000 gold</td>
                                </tr>
                                <tr>
                                    <td>10 → 11</td>
                                    <td>85 duplicates</td>
                                    <td>42,000 gold</td>
                                </tr>
                                <tr>
                                    <td>11 → 12</td>
                                    <td>105 duplicates</td>
                                    <td>52,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 13</td>
                                    <td>125 duplicates</td>
                                    <td>62,000 gold</td>
                                </tr>
                                <tr>
                                    <td>13 → 14</td>
                                    <td>145 duplicates</td>
                                    <td>72,000 gold</td>
                                </tr>
                                <tr>
                                    <td>14 → 15</td>
                                    <td>170 duplicates</td>
                                    <td>86,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {rarity == "rare" && (
                    <div class="rarity-table hide" id="rare">
                        <h2>
                            <u>Rare</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Duplicates</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 2</td>
                                    <td>3 duplicates</td>
                                    <td>1,000 gold</td>
                                </tr>
                                <tr>
                                    <td>2 → 3</td>
                                    <td>6 duplicates</td>
                                    <td>2,000 gold</td>
                                </tr>
                                <tr>
                                    <td>3 → 4</td>
                                    <td>10 duplicates</td>
                                    <td>3,000 gold</td>
                                </tr>
                                <tr>
                                    <td>4 → 5</td>
                                    <td>20 duplicates</td>
                                    <td>5,000 gold</td>
                                </tr>
                                <tr>
                                    <td>5 → 6</td>
                                    <td>30 duplicates</td>
                                    <td>8,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 7</td>
                                    <td>40 duplicates</td>
                                    <td>12,000 gold</td>
                                </tr>
                                <tr>
                                    <td>7 → 8</td>
                                    <td>60 duplicates</td>
                                    <td>17,000 gold</td>
                                </tr>
                                <tr>
                                    <td>8 → 9</td>
                                    <td>80 duplicates</td>
                                    <td>22,000 gold</td>
                                </tr>
                                <tr>
                                    <td>9 → 10</td>
                                    <td>100 duplicates</td>
                                    <td>28,000 gold</td>
                                </tr>
                                <tr>
                                    <td>10 → 11</td>
                                    <td>130 duplicates</td>
                                    <td>35,000 gold</td>
                                </tr>
                                <tr>
                                    <td>11 → 12</td>
                                    <td>160 duplicates</td>
                                    <td>43,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 13</td>
                                    <td>190 duplicates</td>
                                    <td>52,000 gold</td>
                                </tr>
                                <tr>
                                    <td>13 → 14</td>
                                    <td>220 duplicates</td>
                                    <td>60,000 gold</td>
                                </tr>
                                <tr>
                                    <td>14 → 15</td>
                                    <td>260 duplicates</td>
                                    <td>72,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {rarity == "common" && (
                    <div class="rarity-table hide" id="common">
                        <h2>
                            <u>Common</u>
                        </h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Level</th>
                                    <th>Duplicates</th>
                                    <th>Gold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1 → 2</td>
                                    <td>5 duplicates</td>
                                    <td>500 gold</td>
                                </tr>
                                <tr>
                                    <td>2 → 3</td>
                                    <td>10 duplicates</td>
                                    <td>1,000 gold</td>
                                </tr>
                                <tr>
                                    <td>3 → 4</td>
                                    <td>20 duplicates</td>
                                    <td>2,000 gold</td>
                                </tr>
                                <tr>
                                    <td>4 → 5</td>
                                    <td>30 duplicates</td>
                                    <td>3,000 gold</td>
                                </tr>
                                <tr>
                                    <td>5 → 6</td>
                                    <td>50 duplicates</td>
                                    <td>5,000 gold</td>
                                </tr>
                                <tr>
                                    <td>6 → 7</td>
                                    <td>70 duplicates</td>
                                    <td>7,000 gold</td>
                                </tr>
                                <tr>
                                    <td>7 → 8</td>
                                    <td>100 duplicates</td>
                                    <td>10,000 gold</td>
                                </tr>
                                <tr>
                                    <td>8 → 9</td>
                                    <td>130 duplicates</td>
                                    <td>13,000 gold</td>
                                </tr>
                                <tr>
                                    <td>9 → 10</td>
                                    <td>170 duplicates</td>
                                    <td>17,000 gold</td>
                                </tr>
                                <tr>
                                    <td>10 → 11</td>
                                    <td>210 duplicates</td>
                                    <td>21,000 gold</td>
                                </tr>
                                <tr>
                                    <td>11 → 12</td>
                                    <td>260 duplicates</td>
                                    <td>26,000 gold</td>
                                </tr>
                                <tr>
                                    <td>12 → 13</td>
                                    <td>310 duplicates</td>
                                    <td>31,000 gold</td>
                                </tr>
                                <tr>
                                    <td>13 → 14</td>
                                    <td>360 duplicates</td>
                                    <td>36,000 gold</td>
                                </tr>
                                <tr>
                                    <td>14 → 15</td>
                                    <td>430 duplicates</td>
                                    <td>43,000 gold</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
