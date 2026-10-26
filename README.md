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
- **Ciągłe oddalanie do galaktyki** (przyciski ➖/➕, kółko myszy lub pinch):
  jeden zoom, bez przełączania poziomów — Układ Słoneczny płynnie przechodzi
  w obraz Drogi Mlecznej (Ramię Oriona, Andromeda, sondy Voyager 1 i 2)
- **Jedna kamera orbitalna**: przeciąganie zawsze zmienia azymut i wysokość
  (planeta, księżyce, sondy i pierścienie obracają się spójnie)
- **47 zadań (minigry), po jednym na każde odkrycie** (14 ciał, 12 sond, 15
  księżyców, 6 obiektów galaktycznych; liczniki „Odkryto” i „Zadania” są
  równe). Styl zadań jest dziecięcy i śmieszny (buzie, postacie), a widok
  ogólny — naukowy. Przykłady: pory roku na dużej Ziemi z prawdziwą mapą
  i Polską malowaną porą roku, lodowe kostki uciekające do krateru Merkurego,
  serce Plutona, łowienie kosmicznych rybek na Europie, pizza-Io z wulkanami,
  parasol dla Tytana, łaskotanie Enceladusa, dwie buzie Japetusa, Tryton pod
  prąd, taniec Plutona z Charonem, mieszanie Drogi Mlecznej, przytulenie
  Andromedy, kolorowe kable w Voyagerze 1, antena Voyagera 2 na Ziemię,
  kolejność planet (obiekt „Nasz Układ Słoneczny”) i 12 zadań z częściami sond
- **Widok startowy**: Słońce i planety wewnętrzne (do pasa planetoid);
  przycisk „Cały układ” pokazuje cały Układ Słoneczny
- **Ostrzeżenie dla rodzica**: gdy urządzenie nie ma polskiego głosu, ekran
  startowy podpowiada, jak go doinstalować (iPad, Android, Windows, Mac)
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
    activities.js              silniki zadań i zadania ciał niebieskich
    tasks2.js                  zadania księżyców i obiektów galaktycznych
                               (wstawiane przez build.py w znaczniku //__TASKS_MORE__)
    controls.js                przyciski, klawiatura, pętla animacji (zamyka plik)
    img/                       tekstury planet i zdjęcia sond
  tests/
    e2e_test.js                test w przeglądarce (Playwright): 47/47 zadań, galaktyka, kamera
  archive/                     stare wersje (v1, backup v2) — nie są częścią buildu
```

## Build i testy (dla dewelopera)

```
python3 kosmos_src/build.py        # buduje kosmos_src/kosmos_dla_corki.html
node kosmos_src/tests/e2e_test.js    # wymaga Playwright (npm i playwright)
```

## Historia projektu

Wszystkie prace scalone przez MR #1–#6: dokończenie v2 (activities.js,
head.html, build.py), smoke test, suwak prędkości, listy postępów z mgławicą,
wydłużona orbita komety + przycisk „Cały układ” w rogu, a następnie pełna
rozbudowa (efekty dźwiękowe, Księżyc-planeta, Ingenuity, muzyka, 3 nowe
zadania, poprawione Słońce i kometa, sfera niebieska, księżyce planet,
klikalne pierścienie Saturna, poziomy galaktyczne).
