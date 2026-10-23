# Obrazy do Kosmosu dla córki: źródła i uwagi

Pliki wrzuć do `kosmos_src/src/img/`. Klucz w `build.py` = nazwa pliku bez rozszerzenia.
Mapy księżyców (2:1, odwzorowanie równoodległościowe, 1024x512) działają z `globeOf()` tak samo jak mapy planet.
Pliki z przezroczystością (webp): `ingenuity`, `halley_nucleus`, `rings_photo`.

## Księżyce (mapy do globusów)
| Plik | Źródło | Uwagi |
|---|---|---|
| phobos.jpg | NASA-3D-Resources (Mars - Phobos) | mapa szara, kompletna |
| io.jpg | NASA-3D-Resources (Jupiter - Io A) | naturalne kolory; czarne luki przy biegunach zamalowane (inpainting) |
| deimos, europa, ganymedes, kallisto, tytan, enceladus, japetus, reja, dione, tytania, oberon, tryton, charon (.jpg) | Stellarium, katalog textures | wersje NASA mają białe/czarne luki (niezmapowane obszary), więc wziąłem kompletne mapy ze Stellarium; oryginał 512x256, powiększony 2x (Lanczos + wyostrzenie), więc detale są miękkie |

Tytan jest gładki, bo prawdziwa powierzchnia jest ukryta pod pomarańczową mgłą.
Mapy Tytanii, Oberona i Trytona mają uzupełnione obszary, których Voyager 2 nie sfotografował.

## Ciała główne
| Plik | Źródło | Uwagi |
|---|---|---|
| sun_photo.jpg | mapa fotosfery ze zdjęć Słońca (prawdziwe plamy), tarcza 640x640 | to NIE jest SDO/AIA 171 A; to obraz w świetle widzialnym, zabarwiony na pomarańczowo, z ciemnieniem brzegowym |
| sun_map.jpg | j.w., mapa 1024x512 | do obracanego globusa |
| halley_nucleus.webp | render modelu 3D jądra Halleya ze Stellarium (models/1682q1halley_MLfix.obj) | to model kształtu, nie zdjęcie z Giotto; pochodzenia modelu nie weryfikowałem |
| rings_photo.webp | pasek promieniowy pierścieni Saturna (repo threex.planets), rozwinięty w pierścień 600x600 | zakres promienia: od 1,11 R (pierścień D) do 2,27 R (zewnętrzny brzeg pierścienia A); skalibrowane na przerwach Cassiniego i Enckego; pierścień A jest ledwo widoczny, bo taki jest w danych |

## Sondy
| Plik | Źródło | Uwagi |
|---|---|---|
| ingenuity.webp | NASA-3D-Resources, render modelu 3D, przycięty, 640 px | |
| newhorizons | NIE ZNALEZIONO | w NASA-3D-Resources jest tylko model do druku 3D (części osobno); zostaje rysunek z probes.js |
| giotto | NIE ZNALEZIONO | brak w dostępnych źródłach (shell sięga tylko GitHuba); zostaje rysunek z probes.js |

## Galaktyki
| Plik | Źródło | Uwagi |
|---|---|---|
| milky_way.jpg | NASA/JPL-Caltech/R. Hurt (SSC/Caltech), artystyczna wizja widoku z góry, z pakietu mw-plot, 900x900 | to wizja artystyczna, nie zdjęcie (nikt nie sfotografował Drogi Mlecznej z góry) |
| andromeda.jpg | Stellarium, nebulae/default/m31.png, 800x800 | zdjęcie galaktyki M31; autora zdjęcia nie weryfikowałem |

## Licencje
Zasoby NASA są co do zasady w domenie publicznej. Pliki ze Stellarium (GPL) i z threex.planets (kod MIT, tekstury z zewnętrznych źródeł) mają własne warunki, a ich autorów nie sprawdzałem do końca. Przed publicznym udostępnieniem aplikacji warto to sprawdzić; do użytku prywatnego nie ma przeszkód.
