/* ---------- sfera niebieska: prawdziwe gwiazdy i konstelacje ----------
 * Współrzędne równikowe (J2000, rektascensja w godzinach, deklinacja w
 * stopniach) przeliczone na kierunki w układzie ekliptycznym — oś X ku
 * punktowi równonocy wiosennej, płaszczyzna XY to płaszczyzna ekliptyki.
 */

const SKY_EPSILON = 23.44 * Math.PI / 180;

function skyDirection(raHours, decDeg) {
 const alpha = raHours * 15 * Math.PI / 180;
 const delta = decDeg * Math.PI / 180;
 const x = Math.cos(delta) * Math.cos(alpha);
 const y = Math.cos(delta) * Math.sin(alpha);
 const z = Math.sin(delta);
 return {
  x,
  y: y * Math.cos(SKY_EPSILON) + z * Math.sin(SKY_EPSILON),
  z: -y * Math.sin(SKY_EPSILON) + z * Math.cos(SKY_EPSILON)
 };
}

/* [nazwa, RA (godz.), Dec (°)] — najjaśniejsze gwiazdy nieba + gwiazdy konstelacji */
const SKY_NAMED = [
 ['Syriusz', 6.75, -16.7, true], ['Kanopus', 6.4, -52.7, true], ['Arktur', 14.27, 19.2, true],
 ['Wega', 18.62, 38.8, true], ['Kapella', 5.28, 46.0, true], ['Rigel', 5.24, -8.2, true],
 ['Procjon', 7.66, 5.2, true], ['Betelgeza', 5.92, 7.4, true], ['Aldebaran', 4.6, 16.5, true],
 ['Spica', 13.42, -11.2, false], ['Antares', 16.49, -26.4, true], ['Fomalhaut', 22.96, -29.6, false],
 ['Deneb', 20.69, 45.3, true], ['Regulus', 10.14, 12.0, false], ['Pollux', 7.76, 28.0, false],
 ['Kastor', 7.58, 31.9, false],
 /* Wielki Wóz (fragment Wielkiej Niedźwiedzicy) */
 ['Dubhe', 11.07, 61.8, false], ['Merak', 11.03, 56.4, false], ['Phecda', 11.9, 53.7, false],
 ['Megrez', 12.25, 57.0, false], ['Alioth', 12.9, 55.9, false], ['Mizar', 13.4, 54.9, false],
 ['Alkaid', 13.8, 49.3, false],
 /* Kasjopea */
 ['Schedar', 0.68, 56.5, false], ['Caph', 0.15, 59.2, false], ['Gamma Kasjopei', 0.95, 60.7, false],
 ['Ruchbah', 1.43, 60.2, false], ['Segin', 1.9, 63.7, false],
 /* Orion */
 ['Bellatrix', 5.42, 6.3, false], ['Mintaka', 5.53, -0.3, false], ['Alnilam', 5.6, -1.2, false],
 ['Alnitak', 5.68, -1.9, false], ['Saiph', 5.8, -9.7, false],
 /* Łabędź */
 ['Sadr', 20.37, 40.3, false], ['Albireo', 19.51, 28.0, false], ['Gienah', 20.77, 34.0, false],
 ['Delta Łabędzia', 19.75, 45.1, false],
 /* Skorpion */
 ['Graffias', 16.08, -19.8, false], ['Dschubba', 16.0, -22.6, false], ['Shaula', 17.57, -37.1, false],
 ['Sargas', 17.62, -43.0, false], ['Lesath', 17.5, -39.0, false]
];

const SKY_STARS = SKY_NAMED.map(([name, ra, dec, bright]) => {
 const direction = skyDirection(ra, dec);
 return {...direction, name, size: bright ? 2.4 : 1.6, alpha: bright ? .95 : .8, bright};
});

/* słabsze gwiazdy tła — losowe, równomiernie na całej sferze */
for (let index = 0; index < 320; index++) {
 const z = Math.random() * 2 - 1;
 const angle = Math.random() * Math.PI * 2;
 const ring = Math.sqrt(1 - z * z);
 SKY_STARS.push({x: ring * Math.cos(angle), y: ring * Math.sin(angle), z, name: null, size: .7 + Math.random() * .8, alpha: .22 + Math.random() * .45, bright: false});
}

/* linie konstelacji jako pary indeksów gwiazd z SKY_STARS */
const SKY_CONSTELLATIONS = [
 {name: 'Wielki Wóz', lines: [[16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22]]},
 {name: 'Kasjopea', lines: [[23, 24], [24, 25], [25, 26], [26, 27]]},
 {name: 'Orion', lines: [[7, 28], [28, 29], [29, 30], [30, 31], [31, 32], [32, 5]]},
 {name: 'Łabędź', lines: [[12, 33], [33, 34], [33, 35], [33, 36]]},
 {name: 'Skorpion', lines: [[37, 38], [38, 10], [10, 39], [39, 41], [10, 40]]}
];
