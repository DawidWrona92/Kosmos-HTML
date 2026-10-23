KOSMOS DLA CORKI - stan prac (modułowe źródła)

GOTOWE:
 consts.js, assets.js, data.js (fakty zwalidowane, 4-5 kart na obiekt, PARTS = części sond),
 speech.js (lektor), core.js (rysowanie, zoom, globusy, sondy), ui.js, controls.js, probes.js
 (rysowane New Horizons i Giotto), act_moon_scene.js (scena Księżyca, wycięta ze starej wersji),
 img/ (mapy planet, zdjęcia sond, Perseverance; ok. 1,4 MB)

BRAKUJE:
 1. activities.js - silnik zadań. Wymagane przez resztę kodu:
    - const activityOverlay = byId('activity'); let activeActivity = null;
    - openActivity(item), closeActivity()   (item = obiekt z bodies[] lub finds[])
    - aktywność: {title, lead, width, height, start, onDown, onMove, onUp, frame?(dt, now)}
    - zadania wg body.activity: sunspots, mercury, venus, moon, rover, ceres, jupiter, saturn,
      uranus, neptune, heart, tail; dla sond: PARTS[find.sprite || find.draw]
    - stara wersja wzorcowa: activities_old.js (łazik, serce, Księżyc)
 2. head.html - usunąć #prev #next #focusBtn #sound #nextFact i .chips; dodać #gear,
    #settings (id: voiceSelect, voiceInfo, rateRange, pitchRange, soundToggle, voiceTest,
    resetNotebook, settingsClose), #start z #startButton, #actSay, a #readAgain z
    <span class="ico"> i <span class="lbl">
 3. build.py - sklejenie w kolejności:
    head.html, consts.js, assets.js, data.js, core.js (znacznik //__SPEECH__ -> speech.js,
    //__UI__ -> ui.js), probes.js, activities.js, controls.js
    oraz wstawienie obrazów z img/ jako data URI w assets.js w miejsce /*ASSET_DATA*/{}
    (klucze = nazwa pliku bez rozszerzenia).

DZIAŁAJĄCA WCZEŚNIEJSZA WERSJA: ../kosmos_dla_corki_v2_backup.html
