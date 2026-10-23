# Kosmos-HTML — „Mój Kosmos"

Interaktywna aplikacja edukacyjna dla dziecka (5 lat) — pojedynczy plik HTML,
działa offline w przeglądarce (także na telefonie). Polski interfejs, lektor
(Web Speech API), efekty dźwiękowe i delikatna muzyka w tle.

## Finalny produkt

👉 **[kosmos_src/kosmos_dla_corki.html](kosmos_src/kosmos_dla_corki.html)** —
otwórz w przeglądarce. Nie wymaga internetu ani instalacji.

## Co potrafi aplikacja

- **Układ Słoneczny**: Słońce, 8 planet, Ceres, Pluton, kometa Halleya
  (z jądrem, comą i dwoma ogonami odsłońcowymi) — wszystko klikalne,
  z ciekawostkami czytanymi na głos
- **Księżyc jako pełna planeta**: własna orbita wokół Ziemi, 5 ciekawostek,
  zadanie „znajdź 5 różnic”
- **Naturalne księżyce planet**: Fobos i Deimos (Mars), Io / Europa /
  Ganimedes / Kallisto (Jowisz), Tytan / Enceladus / Japetus / Reja / Dione
  (Saturn), Tytania / Oberon (Uran), Tryton (Neptun) — każdy klikalny,
  z własną orbitą i opisami
- **Znajdźki (sondy i satelity)**: MSK, Parker, MESSENGER, Magellan, MRO,
  Dawn, Juno, Cassini, Voyager 2, New Horizons, helikopter Ingenuity, Giotto
- **Pierścienie Saturna** — klikalne, z opisem (lód i skały, nie lita obręcz)
- **Sfera niebieska**: prawdziwe gwiazdy (Wielki Wóz, Kasjopea, Orion,
  Łabędź, Skorpion), obracające się razem z kamerą
- **2 poziomy galaktyczne** (przyciski ➖/➕, kółko myszy lub pinch):
  - *Ramię Oriona* — Układ Słoneczny na ramieniu Drogi Mlecznej
  - *Droga Mleczna + Andromeda + sondy Voyager 1 i 2*
- **27 zadań (minigry)**: znajdź część, latarka, wycieranie pyłu,
  różnice na Księżycu, przeciągnij Urana i kometę, ułóż planety po kolei,
  pory roku na orbicie Ziemi, złap księżyce Galileusza
- **Dzienniczek i lista zadań** (📓/⭐): ukryte rzeczy pod animowaną mgławicą
- **Ustawienia dla rodzica**: głos lektora, tempo, wysokość, efekty
  dźwiękowe, muzyka w tle

## Struktura repozytorium

```
README.md                      ten plik
kosmos_src/
  kosmos_dla_corki.html        ← FINALNY PRODUKT (zbudowany, gotowy do otwarcia)
  build.py                     skleja src/ w jeden plik HTML (obrazy jako data URI)
  src/                         aktywne źródła modułowe
    head.html                  szablon strony (style + DOM + otwarcie <script>)
    consts.js                  stałe i funkcje pomocnicze (localStorage, clamp…)
    fx.js                      efekty dźwiękowe (Web Audio, syntezowane)
    music.js                   muzyka w tle (pad C-Am-F-G + gwiazdki)
    assets.js                  obrazy jako data URI (wypełniane przez build.py)
    sky.js                     sfera niebieska: gwiazdy (RA/Dec J2000) + konstelacje
    data.js                    planety, sondy, księżyce, obiekty galaktyczne, PARTS
    core.js                    silnik: kamera, rysowanie, gesty, poziomy galaktyczne
                               (w środku znaczniki //__SPEECH__ i //__UI__)
    speech.js                  lektor (Web Speech API, wybór polskiego głosu)
    ui.js                      panel info, dzienniczek, listy, ustawienia
    probes.js                  rysowane sondy (New Horizons, Giotto, Ingenuity)
    activities.js              silnik 27 zadań (minigry)
    controls.js                przyciski, klawiatura, pętla animacji (zamyka plik)
    img/                       tekstury planet i zdjęcia sond
  tests/
    smoke_test.js              test end-to-end: 27/27 zadań + poziomy galaktyczne
  archive/                     stare wersje (v1, backup v2) — nie są częścią buildu
```

## Build i testy (dla dewelopera)

```
python3 kosmos_src/build.py        # buduje kosmos_src/kosmos_dla_corki.html
node kosmos_src/tests/smoke_test.js  # test: wszystkie zadania + poziomy galaktyczne
```

## Historia projektu

Wszystkie prace scalone przez MR #1–#6: dokończenie v2 (activities.js,
head.html, build.py), smoke test, suwak prędkości, listy postępów z mgławicą,
wydłużona orbita komety + przycisk „Cały układ” w rogu, a następnie pełna
rozbudowa (efekty dźwiękowe, Księżyc-planeta, Ingenuity, muzyka, 3 nowe
zadania, poprawione Słońce i kometa, sfera niebieska, księżyce planet,
klikalne pierścienie Saturna, poziomy galaktyczne).
