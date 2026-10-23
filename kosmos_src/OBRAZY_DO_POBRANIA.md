# Obrazy do pobrania (NASA/ESA)

Lista obiektów, które są obecnie **rysowane proceduralnie**, a powinny mieć prawdziwe zdjęcia.
Pliiki wrzuć do `kosmos_src/src/img/` — `build.py` osadzi je automatycznie jako data URI
(klucz = nazwa pliku bez rozszerzenia, np. `io.jpg` → `io`).

Zalecany format: JPG lub WebP, ok. 200–400 px na stronę (każdy plik ~50–150 KB,
żeby finalny HTML nie urosł zbytnio ponad obecne ~1,9 MB).

## Księżyce planet (rysowane kulkami z gradientem — największy priorytet)

| Plik docelowy | Obiekt | Rodzic | Sugerowane źródło |
|---|---|---|---|
| `phobos.jpg` | Fobos | Mars | Viking 1, MGS |
| `deimos.jpg` | Deimos | Mars | Viking 1 |
| `io.jpg` | Io | Jowisz | Voyager 1, Galileo |
| `europa.jpg` | Europa | Jowisz | Galileo |
| `ganymedes.jpg` | Ganimedes | Jowisz | Galileo |
| `kallisto.jpg` | Kallisto | Jowisz | Voyager 1, Galileo |
| `tytan.jpg` | Tytan | Saturn | Cassini |
| `enceladus.jpg` | Enceladus | Saturn | Cassini |
| `japetus.jpg` | Japet | Saturn | Cassini |
| `reja.jpg` | Reja | Saturn | Cassini |
| `dione.jpg` | Dione | Saturn | Cassini |
| `tytania.jpg` | Tytania | Uran | Voyager 2 |
| `oberon.jpg` | Oberon | Uran | Voyager 2 |
| `tryton.jpg` | Tryton | Neptun | Voyager 2 |
| `charon.jpg` | Charon | Pluton | New Horizons |

## Ciała główne

| Plik docelowy | Obiekt | Sugerowane źródło |
|---|---|---|
| `sun_photo.jpg` | Słońce (obecnie proceduralny granulat) | SDO/AIA 171 Å |
| `halley_nucleus.jpg` | Jądro komety Halleya (obecnie rysowane) | Giotto (ESA), 1986 |
| `rings_photo.jpg` | Pierścienie Saturna (obecnie rysowane elipsy) | Cassini |

Pas planetoid (`belt`) może zostać proceduralny.

## Sondy rysowane kodem (zamiast zdjęcia)

| Plik docelowy | Sonda | Sugerowane źródło |
|---|---|---|
| `newhorizons.jpg` | New Horizons | NASA/JHUAPL |
| `giotto.jpg` | Giotto | ESA |
| `ingenuity.jpg` | Ingenuity (helikopter Marsa) | NASA/JPL |

## Poziomy galaktyczne

| Plik docelowy | Obiekt | Sugerowane źródło |
|---|---|---|
| `milky_way.jpg` | Droga Mleczna (obecnie proceduralna spirala) | NASA/JPL-Caltech (R. Hurt) albo ESA/Gaia |
| `andromeda.jpg` | Galaktyka Andromedy (obecnie przyciemniany obraz Drogi Mlecznej) | Hubble PHAT / GALEX |

## Mają już obrazy (nic nie trzeba)

Merkury, Wenus (chmury + powierzchnia), Ziemia, Księżyc, Mars, Ceres, Jowisz,
Saturn, Uran, Neptun, Pluton, oraz sondy: ISS, Parker, MESSENGER, Magellan,
MRO, Dawn, Juno, Cassini, Voyager, Perseverance.

---

Po wrzuceniu plików zrobię integrację: tekstury księżyców (obracane globusy jak
przy planetach), zdjęcia sond zamiast rysunków w `probes.js` oraz prawdziwą
Drogę Mleczną zamiast proceduralnej spirali w `core.js`.
