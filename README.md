# Kosmos-HTML

Interaktywna aplikacja edukacyjna "Mój Kosmos" dla dziecka (5 lat) — pojedynczy
plik HTML, działa offline w przeglądarce (także na telefonie).

## Struktura

```
kosmos_src/
  src/            aktywne źródła modułowe (sklejane przez build.py)
    head.html     szablon strony (style + struktura DOM + otwarcie <script>)
    consts.js     stałe i pomocnicze funkcje
    assets.js     obrazy jako data URI (wypełniane przez build.py) + globusy
    data.js       dane planet, sond i części sond (PARTS)
    core.js       silnik: kamera, rysowanie, gesty (w środku znaczniki //__SPEECH__ i //__UI__)
    speech.js     lektor (Web Speech API)
    ui.js         panel informacyjny, dzienniczek, ustawienia
    probes.js     rysowane sondy (New Horizons, Giotto)
    activities.js silnik zadań (minigry dla każdego obiektu)
    controls.js   przyciski, klawiatura, pętla animacji (zamyka IIFE i dokument)
    img/          tekstury planet i zdjęcia sond
  archive/        stare wersje i pliki wzorcowe (nie są częścią buildu)
  build.py        skleja src/ w jeden plik kosmos_dla_corki.html
```

## Build

```
python3 kosmos_src/build.py
```

Wynik: `kosmos_src/kosmos_dla_corki.html` — otwórz go w przeglądarce.

## Zadania

Każdy obiekt (12 ciał niebieskich + 11 sond = 23) ma jedno zadanie:
znajdź część, latarka, wycieranie, różnice, przeciąganie. Postęp zapisywany
w localStorage.
