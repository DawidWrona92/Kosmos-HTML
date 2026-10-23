/* ---------- dane ---------- */

const bodies = [
 {id: 'sun', kind: 'star', name: 'Słońce', type: 'Nasza gwiazda', color: '#ffb43a', radius: 25, activity: 'sunspots', activity2: 'order',
  facts: [
   'Słońce to gwiazda, czyli wielka kula gorącego gazu. Świeci własnym światłem i daje nam ciepło. Dzięki niemu na Ziemi jest dzień, rosną rośliny i żyją zwierzęta. Wszystkie planety krążą wokół Słońca.',
   'Słońce jest ogromne. Zmieściłoby się w nim ponad milion Ziem! Gdyby Ziemia była wielkości piłeczki do ping-ponga, Słońce miałoby ponad cztery metry szerokości. To tyle, co duży pokój.',
   'Światło ze Słońca leci do nas około ośmiu minut. Widzimy więc Słońce takie, jakie było osiem minut temu! Nic we wszechświecie nie leci szybciej niż światło, a i tak musi trochę lecieć.',
   'Na powierzchni Słońca jest około 5500 stopni Celsjusza. To dużo, dużo goręcej niż w piekarniku. Czasem na Słońcu widać ciemne plamy. Są trochę chłodniejsze niż reszta powierzchni.',
   'Słońce ma około czterech i pół miliarda lat. Będzie świecić jeszcze przez około pięć miliardów lat. Nigdy nie wolno patrzeć prosto na Słońce, bo to bardzo szkodzi oczom.'
  ]},
 {id: 'mercury', kind: 'planet', name: 'Merkury', type: 'Pierwsza planeta od Słońca', color: '#9b8d7a', radius: 4, orbit: 70, period: 88, startPhase: .8, texture: 'mercury', activity: 'mercury',
  facts: [
   'Merkury jest najmniejszą planetą w Układzie Słonecznym i leży najbliżej Słońca. Jest tylko trochę większy od naszego Księżyca. Jego szara powierzchnia jest cała pokryta kraterami.',
   'Merkury pędzi wokół Słońca szybciej niż wszystkie inne planety. Jeden rok trwa tam tylko 88 dni. Za to od jednego wschodu Słońca do następnego mija tam aż 176 dni, więc dzień trwa dłużej niż rok!',
   'W dzień na Merkurym jest bardzo gorąco, nawet około 430 stopni. W nocy robi się strasznie zimno, około 180 stopni mrozu. Prawie nie ma tam powietrza, które mogłoby zatrzymać ciepło.',
   'Na biegunach Merkurego są głębokie kratery, do których nigdy nie zagląda Słońce. Jest tam tak zimno, że leży w nich lód! Znalazła go sonda MESSENGER. Lód na planecie tuż przy Słońcu to wielka niespodzianka.'
  ]},
 {id: 'venus', kind: 'planet', name: 'Wenus', type: 'Druga planeta od Słońca', color: '#d7a75d', radius: 7, orbit: 106, period: 225, startPhase: 2.4, texture: 'venus_clouds', activity: 'venus',
  facts: [
   'Wenus jest najgorętszą planetą w Układzie Słonecznym. Jest tam około 465 stopni, czyli dużo goręcej niż w piekarniku. Jest gorętsza nawet od Merkurego, chociaż leży dalej od Słońca.',
   'Wenus otacza bardzo gruba atmosfera, jak ciężka kołdra. Zatrzymuje ciepło i nie wypuszcza go w kosmos. Chmury na Wenus składają się z kwasu, więc nikt nie chciałby tam latać bez specjalnego statku.',
   'Wenus kręci się w drugą stronę niż prawie wszystkie planety. Dlatego Słońce wschodzi tam na zachodzie! Jeden obrót trwa 243 ziemskie dni, a rok tylko 225 dni. Obrót trwa więc dłużej niż rok.',
   'Wenus jest prawie tak duża jak Ziemia, więc nazywa się ją siostrą Ziemi. Na niebie widać ją wieczorem albo rano jako bardzo jasny punkt. Ludzie nazywają ją Gwiazdą Wieczorną, ale to wcale nie gwiazda, tylko planeta.'
  ]},
 {id: 'earth', surface: 'earth', kind: 'planet', name: 'Ziemia', type: 'Trzecia planeta od Słońca', color: '#268de0', radius: 8, orbit: 145, period: 365.25, startPhase: 4.1, texture: 'earth_photo', photo: true, activity2: 'seasons',
  facts: [
   'Ziemia to nasz dom! To jedyne miejsce, na którym znamy życie: ludzi, zwierzęta i rośliny. Mamy tu powietrze do oddychania i wodę do picia. Ziemia jest w sam raz daleko od Słońca, więc nie jest ani za gorąca, ani za zimna.',
   'Z kosmosu Ziemia wygląda jak niebieska kula. Aż 71 procent jej powierzchni pokrywa woda. Widać też białe chmury i brązowe lądy. Dlatego mówimy na nią Błękitna Planeta.',
   'Ziemia kręci się wokół własnej osi. Jeden obrót trwa 24 godziny, czyli jedną dobę. Dzięki temu jest dzień i noc. Wokół Słońca Ziemia okrąża się raz na rok, czyli w 365 dni.',
   'Wokół Ziemi krąży Księżyc. To nasz jedyny naturalny księżyc. Zawsze pokazuje nam tę samą stronę. W 1969 roku stanęli na nim pierwsi ludzie.',
   'Ziemię chroni atmosfera, czyli warstwa powietrza. Większość małych skał, które lecą z kosmosu, spala się w niej wysoko nad nami. My widzimy to jako spadające gwiazdy. Możesz wtedy pomyśleć życzenie!'
  ]},
 {id: 'moon', kind: 'moon', parentId: 'earth', name: 'Księżyc', type: 'Nasz księżyc', intro: 'Księżyc.', color: '#b9b9c4', radius: 3, orbit: 145, moonOrbit: 26, period: 27.3, startPhase: .5, texture: 'moon_photo', photo: true, activity: 'moon',
  facts: [
   'Księżyc to nasz najbliższy sąsiad w kosmosie. Krąży wokół Ziemi raz na około 27 dni. Zawsze pokazuje nam tę samą stronę — jakby patrzył na nas jednym okiem!',
   'Na Księżycu nie ma powietrza, wiatru ani deszczu. Niebo jest tam czarne nawet w dzień. Astronauci musieli mieć specjalne skafandry, żeby móc tam oddychać.',
   'W 1969 roku wylądowali na Księżycu pierwsi ludzie — Neil Armstrong i Buzz Aldrin. Neil powiedział słynne słowa: „To mały krok dla człowieka, a wielki skok dla ludzkości”.',
   'Księżyc nie świeci sam z siebie — odbija światło Słońca, dlatego świeci na niebie. Gdy Ziemia zasłania Słońce, Księżyc robi się ciemny — to zaćmienie Księżyca.',
   'Księżyc przyciąga wodę w oceanach. Dzięki temu mamy przypływy i odpływy — morze podnosi się i opada dwa razy na dobę!'
  ]},
 {id: 'mars', surface: 'mars', kind: 'planet', name: 'Mars', type: 'Czwarta planeta od Słońca', color: '#d75a36', radius: 6, orbit: 184, period: 687, startPhase: 5.5, texture: 'mars', activity: 'rover',
  facts: [
   'Mars jest czerwony, bo jego skały i piasek zawierają dużo żelaza, które zardzewiało. Dlatego nazywamy go Czerwoną Planetą. Mars jest mniej więcej o połowę mniejszy od Ziemi.',
   'Na Marsie stoi Olympus Mons, największy wulkan w całym Układzie Słonecznym. Jest dwa i pół razy wyższy niż Mount Everest, najwyższa góra na Ziemi. Dawno temu wybuchał, a dziś jest spokojny.',
   'Mars ma dwa małe księżyce: Fobosa i Deimosa. Wyglądają jak powyginane ziemniaki. Fobos okrąża Marsa w niecałe osiem godzin, więc w ciągu jednego marsjańskiego dnia robi około trzech okrążeń.',
   'Po Marsie jeżdżą łaziki, czyli roboty badacze. Jednym z nich jest Perseverance, który szuka śladów dawnego życia. Razem z nim poleciał mały helikopter Ingenuity. Był pierwszym helikopterem, który latał na innej planecie!',
   'Dawno temu na Marsie płynęły rzeki i były jeziora. Dziś jest tam sucho i bardzo zimno, średnio około 60 stopni mrozu. Niebo w dzień jest tam różowo-brązowe, a zachód Słońca jest niebieski.'
  ]},
 {id: 'ceres', surface: 'ceres', kind: 'dwarf', name: 'Ceres', type: 'Planeta karłowata w pasie planetoid', color: '#9a948c', radius: 2.5, orbit: 223, period: 1682, startPhase: .5, texture: 'ceres', activity: 'ceres',
  facts: [
   'Ceres to największe ciało w pasie planetoid. Jest też jedyną planetą karłowatą, która leży tak blisko nas. Ma około 940 kilometrów szerokości, więc jest dużo mniejsza od naszego Księżyca.',
   'Pas planetoid to miliony skał krążących między Marsem a Jowiszem. Choć jest ich tak dużo, wszystkie razem ważą mniej niż nasz Księżyc. Między skałami jest mnóstwo miejsca, więc sondy mogą spokojnie przelatywać.',
   'Ceres odkrył 1 stycznia 1801 roku włoski astronom Giuseppe Piazzi. Najpierw ogłoszono, że to nowa planeta. Potem znaleziono podobne skały i Ceres nazwano planetoidą. Dziś mówimy o niej planeta karłowata.',
   'Na Ceres są jasne plamy w kraterze o nazwie Occator. To sól, która została po wyparowaniu słonej wody. Naukowcy znaleźli pod powierzchnią Ceres zbiornik słonej wody. Woda dostała się kiedyś na wierzch i wyschła.'
  ]},
 {id: 'jupiter', surface: 'jupiter', kind: 'planet', name: 'Jowisz', type: 'Piąta planeta od Słońca', color: '#d5b18a', radius: 22, orbit: 260, period: 4333, startPhase: 1.3, texture: 'jupiter', activity: 'jupiter', activity2: 'galilean',
  facts: [
   'Jowisz jest największą planetą. Zmieściłoby się w nim ponad tysiąc Ziem! Jest cięższy niż wszystkie inne planety razem wzięte. Mimo to jest bardzo daleko, więc na niebie wygląda jak jasny punkt.',
   'Jowisz nie ma twardej powierzchni. To wielka kula z gazu, czyli gazowy olbrzym. Nie da się na nim wylądować, bo nie ma gdzie stanąć. Jego chmury układają się w kolorowe pasy.',
   'Na Jowiszu jest Wielka Czerwona Plama. To burza wielka jak cała Ziemia! Ludzie obserwują ją od ponad 150 lat. Wiatr w tej burzy wieje szybciej niż w najsilniejszym huraganie na Ziemi.',
   'Jowisz ma ponad 90 księżyców. Cztery największe odkrył w 1610 roku Galileusz: Io, Europę, Ganimedesa i Kallisto. Ganimedes jest największym księżycem w Układzie Słonecznym. Jest nawet większy niż planeta Merkury!',
   'Jowisz kręci się szybciej niż wszystkie inne planety. Jeden dzień trwa tam niecałe 10 godzin. Dlatego Jowisz jest trochę spłaszczony, jak lekko ściśnięta piłka.'
  ]},
 {id: 'saturn', surface: 'saturn', kind: 'planet', name: 'Saturn', type: 'Szósta planeta od Słońca', color: '#d9bd83', radius: 18, orbit: 340, period: 10759, startPhase: 3.2, texture: 'saturn', activity: 'saturn',
  ring: {angle: -.25, photoKey: 'rings_photo', bands: [{scale: 1.34, width: .2, color: 'rgba(150,128,96,.55)'}, {scale: 1.74, width: .46, color: 'rgba(222,200,150,.92)'}, {scale: 2.17, width: .26, color: 'rgba(190,168,124,.82)'}, {scale: 2.33, width: .03, color: 'rgba(210,190,150,.55)'}]},
  ringInfo: {id: 'saturn_rings', parentId: 'saturn', name: 'Pierścienie Saturna', type: 'Pierścienie planety', intro: 'Pierścienie Saturna.',
   facts: [
    'Pierścienie Saturna to miliardy kawałków lodu i skał — od ziarenek piasku po bryły wielkości domu!',
    'Wyglądają jak ogromne, płaskie pierścienie wokół planety, ale nie są jedną litą obręczą. To jak miliardy malutkich księżyców krążących razem.',
    'Pierścienie są bardzo cienkie — mają zaledwie kilkanaście metrów grubości, a rozciągają się na setki tysięcy kilometrów!'
   ]},
  facts: [
   'Saturn ma wspaniałe pierścienie. Składają się z miliardów kawałków lodu i skał. Są wśród nich ziarenka wielkości piasku i bryły wielkie jak dom.',
   'Pierścienie Saturna są ogromne, ale bardzo cienkie. Sięgają na setki tysięcy kilometrów, a grube są tylko na około 10 metrów. Gdy Ziemia ustawia się równo z pierścieniami, prawie ich nie widać.',
   'Saturn jest bardzo lekki. Ma najmniejszą gęstość ze wszystkich planet, mniejszą niż woda. Gdyby istniała wanna wielka jak Saturn, pływałby w niej jak kaczuszka!',
   'Saturn ma ponad 270 księżyców. Największy z nich to Tytan, który ma gęstą atmosferę i jeziora z ciekłego gazu, zwanego metanem. Mały księżyc Enceladus wyrzuca w kosmos fontanny wody z lodu.',
   'Jeden rok na Saturnie trwa prawie 30 naszych lat. Za to dzień jest tam krótki, trwa około 10 i pół godziny. Saturn jest drugą co do wielkości planetą, zaraz po Jowiszu.'
  ]},
 {id: 'uranus', kind: 'planet', name: 'Uran', type: 'Siódma planeta od Słońca', color: '#7ed9e5', radius: 13, orbit: 420, period: 30687, startPhase: 5, texture: 'uranus', activity: 'uranus',
  ring: {angle: -1.2, bands: [{scale: 1.55, width: .05, color: 'rgba(171,231,245,.5)'}, {scale: 1.78, width: .04, color: 'rgba(171,231,245,.38)'}]},
  facts: [
   'Uran leży na boku! Obraca się wokół Słońca jak toczona piłka, a nie jak bąk. Naukowcy myślą, że dawno temu coś wielkiego w niego uderzyło i go przewróciło.',
   'Uran jest błękitno-zielony. Gaz zwany metanem pochłania w nim czerwone światło i zostaje niebieskozielony kolor. Uran ma też 13 cienkich, ciemnych pierścieni.',
   'Atmosfera Urana jest najzimniejsza w całym Układzie Słonecznym. Jest w niej nawet około 224 stopni poniżej zera. Brrr!',
   'Uran był pierwszą planetą odkrytą przez teleskop. W 1781 roku znalazł go William Herschel. Wcześniej ludzie znali tylko planety, które widać gołym okiem.',
   'Rok na Uranie trwa 84 nasze lata. Każda pora roku ciągnie się tam ponad 20 lat! Uran ma 28 znanych księżyców, a nazwano je od bohaterów sztuk Szekspira.'
  ]},
 {id: 'neptune', kind: 'planet', name: 'Neptun', type: 'Ósma planeta od Słońca', color: '#356ce0', radius: 12, orbit: 500, period: 60190, startPhase: .3, texture: 'neptune', activity: 'neptune',
  facts: [
   'Neptun jest najdalszą planetą od Słońca. Światło Słońca leci do niego około 4 godzin. Jest ciemnoniebieski i bardzo zimny. Z Ziemi nie widać go gołym okiem.',
   'Na Neptunie wieją najsilniejsze wiatry w Układzie Słonecznym. Wieją nawet z prędkością około 2000 kilometrów na godzinę. To szybciej niż leci samolot pasażerski!',
   'Neptuna najpierw wyliczyli matematycy, a dopiero potem zobaczono go w teleskopie. To było w 1846 roku. To tak, jakby znaleźć planetę samym ołówkiem i kartką papieru!',
   'Neptun ma księżyc Trytona, który krąży w odwrotną stronę niż sama planeta. Tryton jest bardzo zimny, a mimo to ma gejzery, które wyrzucają w górę lodowy pył. Neptun ma w sumie 16 znanych księżyców.',
   'Rok na Neptunie trwa 165 naszych lat. W 2011 roku skończył pierwsze okrążenie Słońca od czasu swojego odkrycia. Odwiedziła go tylko jedna sonda, Voyager 2.'
  ]},
 {id: 'pluto', surface: 'pluto', kind: 'dwarf', name: 'Pluton', type: 'Planeta karłowata', color: '#c8a98c', radius: 3, orbit: 570, period: 90560, startPhase: 3.6, texture: 'pluto', activity: 'heart',
  facts: [
   'Pluton ma na powierzchni wielkie serce! To jasny obszar o nazwie Tombaugh Regio. Lewa część serca to równina z zamarzniętego azotu. Azot to gaz, który jest też w naszym powietrzu, ale na Plutonie jest tak zimno, że zamarzł.',
   'Plutona odkrył w 1930 roku młody astronom Clyde Tombaugh. Miał wtedy 24 lata. Nazwę Pluton wymyśliła 11-letnia dziewczynka z Anglii, Venetia Burney. Serce nazwano na cześć odkrywcy.',
   'W 2006 roku naukowcy uznali Plutona za planetę karłowatą. Jest mniejszy niż nasz Księżyc i krąży wśród wielu podobnych lodowych światów. Dla wielu ludzi Pluton i tak zawsze będzie wyjątkowy!',
   'W lipcu 2015 roku sonda New Horizons przeleciała tuż obok Plutona. Zrobiła zdjęcia serca, gór z lodu i niebieskiej mgiełki w atmosferze. To był pierwszy raz, kiedy zobaczyliśmy Plutona z bliska.',
   'Największy księżyc Plutona nazywa się Charon. Jest tak duży, że Pluton i Charon krążą wokół wspólnego punktu, jak w tańcu. Pluton ma w sumie pięć księżyców. Jeden rok na Plutonie trwa 248 naszych lat.'
  ]},
 {id: 'belt', kind: 'belt', name: 'Pas planetoid', type: 'Pierścień skał między Marsem a Jowiszem', intro: 'Pas planetoid.', color: '#a7a5a1', radius: 9, orbit: 223, period: 1682, startPhase: 2.9, activity: 'belt',
  facts: [
   'Pas planetoid to miliony skał krążących między Marsem a Jowiszem. Największa z nich to Ceres — planeta karłowata, którą możesz tu kliknąć!',
   'Choć skał jest bardzo dużo, wszystkie razem ważą mniej niż nasz Księżyc. Między skałami jest mnóstwo miejsca, więc sondy przelatują przez pas bez obawy.',
   'Skały w pasie to pozostałości z czasów, gdy rodził się Układ Słoneczny. Planeta z nich nie powstała, bo pobliski Jowisz ciągnął je swoją wielką siłą i rozproszył.',
   'Największe skały mają własne imiona. Oprócz Ceres to też Westa i Palas — każda jest inna i naukowcy badają je jak kosmiczne skarby.'
  ]},
 {id: 'halley', kind: 'comet', name: 'Kometa Halleya', type: 'Kometa', intro: 'Kometa Halleya.', color: '#dff1ff', radius: 2.5, period: 27759, startAnomaly: 5.68, semiMajor: 850, eccentricity: .85, perihelionAngle: 2.2, activity: 'tail',
  facts: [
   'Kometa to wielka, brudna kula z lodu i pyłu. Czasem nazywa się ją brudną śnieżką. Gdy zbliża się do Słońca, lód paruje i robi się z niego jasny ogon.',
   'Ogon komety zawsze wskazuje od Słońca, bo odpycha go wiatr słoneczny. Kiedy kometa odlatuje od Słońca, ogon jest przed nią! Ogon może mieć miliony kilometrów długości.',
   'Kometa Halleya wraca co około 76 lat. Ostatnio było ją widać w 1986 roku. Następnym razem zobaczymy ją w 2061 roku. Niektórzy ludzie widzą ją dwa razy w życiu.',
   'Kometę nazwano na cześć Edmonda Halleya. W 1705 roku wyliczył on, że kometa, którą widziano w różnych latach, to ciągle ta sama. Ludzie obserwują ją od ponad 2000 lat.',
   'Blisko Słońca kometa pędzi bardzo szybko, a daleko od Słońca zwalnia. Dlatego większość czasu spędza w zimnej, ciemnej dali. Zobacz to na jej bardzo wydłużonej orbicie!'
  ]}
];

const finds = [
 {id: 'iss', parentId: 'earth', name: 'Międzynarodowa Stacja Kosmiczna', type: 'Stacja kosmiczna', intro: 'Międzynarodowa Stacja Kosmiczna.', sprite: 'iss', activity: 'parts',
  facts: [
   'To Międzynarodowa Stacja Kosmiczna, czyli dom w kosmosie. Mieszkają i pracują na niej astronauci z wielu krajów. Krąży wokół Ziemi na wysokości około 400 kilometrów.',
   'Stacja okrąża całą Ziemię co półtorej godziny. Pędzi z prędkością około 28 tysięcy kilometrów na godzinę. Astronauci widzą więc około 16 wschodów i zachodów Słońca każdego dnia!',
   'Na stacji ludzie mieszkają bez przerwy od 2000 roku. Astronauci unoszą się w powietrzu, bo razem ze stacją cały czas spadają wokół Ziemi. Śpią w specjalnych workach przypiętych do ściany, żeby nie odpłynęli!'
  ]},
 {id: 'parker', parentId: 'sun', name: 'Sonda Parker Solar Probe', type: 'Sonda kosmiczna', intro: 'Sonda Parker Solar Probe.', sprite: 'parker', activity: 'parts',
  facts: [
   'Sonda Parker Solar Probe leci prosto do Słońca. Jako pierwsza w historii weszła do atmosfery Słońca, zwanej koroną. Nigdy żadna sonda nie była tak blisko Słońca.',
   'To najszybszy obiekt zbudowany przez ludzi. Pędzi z prędkością około 690 tysięcy kilometrów na godzinę. Okrążyłaby całą Ziemię w niecałe 4 minuty!',
   'Przed gorącem chroni ją gruba tarcza cieplna. Z przodu tarcza nagrzewa się do ponad tysiąca stopni. A za nią, w jej cieniu, jest tylko około 30 stopni, jak w ciepły letni dzień.'
  ]},
 {id: 'messenger', parentId: 'mercury', name: 'Sonda MESSENGER', type: 'Sonda kosmiczna', intro: 'Sonda MESSENGER.', sprite: 'messenger', activity: 'parts',
  facts: [
   'Sonda MESSENGER wystartowała w 2004 roku. Jako pierwsza okrążała Merkurego, w latach 2011–2015. Leciała tam ponad 6 lat, bo wybrała okrężną drogę. Przelatywała obok Ziemi, Wenus i Merkurego, żeby wyhamować.',
   'Sonda zrobiła ponad 200 tysięcy zdjęć i narysowała mapę całej planety. Znalazła też lód w kraterach na biegunach Merkurego, do których nie zagląda Słońce.',
   'Na koniec misji, w 2015 roku, skończyło się sondzie paliwo. Sonda opadła na Merkurego i rozbiła się o jego powierzchnię. Tak zakończyła swoją pracę.'
  ]},
 {id: 'magellan', parentId: 'venus', name: 'Sonda Magellan', type: 'Sonda kosmiczna', intro: 'Sonda Magellan.', sprite: 'magellan', activity: 'parts',
  facts: [
   'Przez grube chmury Wenus nie widać powierzchni. Dlatego sonda Magellan użyła radaru, który „widzi” przez chmury. Radar wysyłał fale i sprawdzał, jak wracają.',
   'Dzięki niej mamy mapę prawie całej powierzchni Wenus, aż 98 procent! Widać na niej wulkany, góry i kratery.',
   'Sonda wystartowała w 1989 roku z promu kosmicznego Atlantis. Przy Wenus pracowała od 1990 do 1994 roku. Na koniec wleciała w atmosferę planety i spłonęła.'
  ]},
 {id: 'mro', parentId: 'mars', name: 'Sonda Mars Reconnaissance Orbiter', type: 'Sonda kosmiczna', intro: 'Sonda Mars Reconnaissance Orbiter.', sprite: 'mro', activity: 'parts',
  facts: [
   'Sonda Mars Reconnaissance Orbiter krąży wokół Marsa od 2006 roku. Robi bardzo dokładne zdjęcia z góry. Jej kamera dostrzega rzeczy wielkości stołu.',
   'Zdjęcia z tej sondy pomagają wybierać bezpieczne miejsca do lądowania dla łazików. Sonda znalazła też ślady, że dawno temu na Marsie płynęła woda.',
   'Sonda pełni też rolę kosmicznej poczty. Łazik wysyła do niej wiadomości, a ona przekazuje je dalej na Ziemię.'
  ]},
 {id: 'dawn', parentId: 'ceres', name: 'Sonda Dawn', type: 'Sonda kosmiczna', intro: 'Sonda Dawn.', sprite: 'dawn', activity: 'parts',
  facts: [
   'Sonda Dawn jako pierwsza okrążała dwa różne ciała w pasie planetoid. Najpierw badała planetoidę Westę, a potem Ceres. Wystartowała w 2007 roku.',
   'Napędzały ją silniki jonowe. Dają tylko bardzo delikatne pchnięcie, ale potrafią pracować latami i rozpędzić sondę do ogromnej prędkości.',
   'Dzięki sondzie Dawn zobaczyliśmy jasne plamy na Ceres. W 2018 roku skończyło jej się paliwo. Sonda została na orbicie Ceres i krąży tam do dziś jak cichy, sztuczny księżyc.'
  ]},
 {id: 'juno', parentId: 'jupiter', name: 'Sonda Juno', type: 'Sonda kosmiczna', intro: 'Sonda Juno.', sprite: 'juno', activity: 'parts',
  facts: [
   'Sonda Juno krąży wokół Jowisza od 2016 roku. Zagląda pod jego chmury i bada, co jest w środku. Zrobiła też wiele pięknych zdjęć tej planety.',
   'Juno zasilają trzy wielkie panele słoneczne. Słońce świeci tam 25 razy słabiej niż u nas. Dlatego panele muszą być takie ogromne.',
   'Na pokładzie Juno lecą trzy figurki z klocków LEGO. Przedstawiają Galileusza, rzymskiego boga Jowisza i jego żonę Junonę. To od niej sonda wzięła imię.'
  ]},
 {id: 'cassini', parentId: 'saturn', name: 'Sonda Cassini', type: 'Sonda kosmiczna', intro: 'Sonda Cassini.', sprite: 'cassini', activity: 'parts',
  facts: [
   'Sonda Cassini badała Saturna przez 13 lat, od 2004 do 2017 roku. Zrobiła mnóstwo zdjęć planety, pierścieni i księżyców.',
   'Zawiozła też mały lądownik Huygens. W 2005 roku wylądował on na księżycu Tytanie. To było pierwsze lądowanie tak daleko od Ziemi, w zewnętrznej części Układu Słonecznego.',
   'Cassini odkryła fontanny wody na księżycu Enceladus. Na koniec misji zanurzyła się w atmosferze Saturna i spłonęła, żeby nie zanieczyścić jego księżyców.'
  ]},
 {id: 'voyager2', parentId: 'uranus', name: 'Sonda Voyager 2', type: 'Sonda kosmiczna', intro: 'Sonda Voyager 2.', sprite: 'voyager', activity: 'parts',
  facts: [
   'Sonda Voyager 2 wystartowała w 1977 roku. To jedyna sonda, która odwiedziła Urana w 1986 roku i Neptuna w 1989 roku. Dzięki niej zobaczyliśmy te dalekie planety z bliska.',
   'Na pokładzie sondy jest złota płyta z dźwiękami i obrazami z Ziemi. Są na niej śpiew ptaków, odgłosy fal, muzyka i powitania w 55 językach. Płytę zostawiono na wypadek, gdyby ktoś kiedyś ją znalazł.',
   'Od 2018 roku Voyager 2 jest już poza Układem Słonecznym, w przestrzeni między gwiazdami. Wciąż wysyła do nas wiadomości. Sygnał leci do nas wiele godzin.'
  ]},
 {id: 'newhorizons', parentId: 'pluto', name: 'Sonda New Horizons', type: 'Sonda kosmiczna', intro: 'Sonda New Horizons.', sprite: null, draw: 'newhorizons', activity: 'parts',
  facts: [
   'Sonda New Horizons wystartowała w 2006 roku i leciała do Plutona prawie 9 i pół roku. Jako pierwsza w historii odwiedziła Plutona.',
   'W lipcu 2015 roku przeleciała tuż obok Plutona z prędkością około 50 tysięcy kilometrów na godzinę. Zrobiła zdjęcie serca Plutona i znalazła góry z lodu.',
   'Potem poleciała dalej, w stronę lodowych światów na krańcach Układu Słonecznego. W 2019 roku odwiedziła lodowo-skalny obiekt Arrokoth, który wygląda jak bałwanek z dwóch kul.'
  ]},
 {id: 'ingenuity', parentId: 'mars', name: 'Helikopter Ingenuity', type: 'Znajdźka: mały helikopter', intro: 'Helikopter Ingenuity.', sprite: 'ingenuity', draw: 'ingenuity', activity: 'parts',
  facts: [
   'Ingenuity to mały helikopter, który poleciał razem z łazikiem Perseverance. Był pierwszym helikopterem, który latał na innej planecie!',
   'Na Marsie powietrze jest bardzo cienkie, więc łopatki Ingenuity musiały kręcić się bardzo, bardzo szybko — ponad 2500 razy na minutę!',
   'Ingenuity był planowany na 5 lotów, a zrobił ich aż 72! Pracował prawie 3 lata.'
  ]},
 {id: 'giotto', parentId: 'halley', name: 'Sonda Giotto', type: 'Sonda kosmiczna', intro: 'Sonda Giotto.', sprite: null, draw: 'giotto', activity: 'parts',
  facts: [
   'W 1986 roku europejska sonda Giotto podleciała do jądra komety Halleya. Zbliżyła się do niego na około 600 kilometrów.',
   'Jądro okazało się ciemne jak węgiel i ma kształt ziemniaka, długiego na około 15 kilometrów. Z jego powierzchni tryskały strumienie gazu i pyłu.',
   'Pył uderzył w sondę i trochę nią zakręcił, ale po pół godziny Giotto znów mogła do nas wysyłać dane. Nazwano ją od malarza Giotta, który namalował kometę na obrazie.'
  ]}
];

/* części sond do dotykania: współrzędne względem obrazka (x, y od 0 do 1, promień względem szerokości) */
const PARTS = {
 iss: {image: 'iss', parts: [
  {name: 'Panele słoneczne', ask: 'Gdzie są panele słoneczne? To wielkie, niebieskie skrzydła.', hint: 'Szukaj niebieskich, prostokątnych skrzydeł.', ok: 'To panele słoneczne. Zamieniają światło Słońca na prąd dla całej stacji.', hits: [[.07, .25, .1], [.18, .2, .09], [.1, .65, .1], [.2, .65, .09], [.78, .28, .1], [.9, .28, .1], [.75, .7, .1], [.88, .7, .1], [.5, .08, .1]]},
  {name: 'Moduły', ask: 'Gdzie mieszkają astronauci? Dotknij szarych walców w środku stacji.', hint: 'Szukaj grubych, szarych walców pośrodku.', ok: 'To moduły. W nich astronauci mieszkają, śpią i pracują.', hits: [[.45, .56, .13], [.5, .7, .08]]}
 ]},
 parker: {image: 'parker', parts: [
  {name: 'Tarcza cieplna', ask: 'Gdzie jest tarcza cieplna? To wielki, biały talerz z przodu.', hint: 'Szukaj wielkiego, białego, płaskiego talerza z prawej strony.', ok: 'To tarcza cieplna. Chroni sondę przed ogromnym gorącem Słońca.', hits: [[.88, .58, .19]]},
  {name: 'Panele słoneczne', ask: 'Teraz znajdź panele słoneczne. To małe, niebieskie skrzydełka.', hint: 'Szukaj niebieskich skrzydełek.', ok: 'To panele słoneczne. Schowane w cieniu tarczy, dają sondzie prąd.', hits: [[.5, .76, .1], [.8, .1, .08]]}
 ]},
 messenger: {image: 'messenger', parts: [
  {name: 'Osłona przed Słońcem', ask: 'Gdzie jest osłona przed Słońcem? To złota tarcza po środku sondy.', hint: 'Szukaj złotej, wypukłej tarczy pośrodku.', ok: 'To osłona przed Słońcem. Merkury jest tuż przy Słońcu, więc sonda musiała się przed nim chować.', hits: [[.45, .45, .15]]},
  {name: 'Panele słoneczne', ask: 'Teraz znajdź panele słoneczne. To duże, płaskie skrzydła po bokach.', hint: 'Szukaj płaskich skrzydeł po lewej i prawej stronie.', ok: 'To panele słoneczne. Zamieniają światło na prąd.', hits: [[.12, .5, .13], [.68, .35, .1]]}
 ]},
 magellan: {image: 'magellan', parts: [
  {name: 'Antena radaru', ask: 'Gdzie jest antena radaru? To wielki talerz na górze.', hint: 'Szukaj wielkiego, białego talerza na samej górze.', ok: 'To antena. Wysyłała fale radaru przez chmury Wenus i odbierała odpowiedź.', hits: [[.52, .15, .19]]},
  {name: 'Panele słoneczne', ask: 'Teraz znajdź panele słoneczne. To płaskie skrzydła po bokach.', hint: 'Szukaj płaskich skrzydeł po lewej i prawej stronie.', ok: 'To panele słoneczne. Dają sondzie prąd.', hits: [[.1, .72, .13], [.85, .5, .12]]}
 ]},
 mro: {image: 'mro', parts: [
  {name: 'Antena', ask: 'Gdzie jest antena? To okrągły talerz na górze.', hint: 'Szukaj dużego, okrągłego talerza na górze.', ok: 'To antena. Dzięki niej sonda rozmawia z Ziemią i przekazuje wiadomości od łazików.', hits: [[.57, .28, .19]]},
  {name: 'Panele słoneczne', ask: 'Teraz znajdź panele słoneczne. To ciemne, kwadratowe skrzydła.', hint: 'Szukaj ciemnych skrzydeł po lewej i prawej stronie.', ok: 'To panele słoneczne. Dają sondzie prąd.', hits: [[.2, .8, .16], [.82, .72, .15]]}
 ]},
 dawn: {image: 'dawn', parts: [
  {name: 'Panele słoneczne', ask: 'Gdzie są panele słoneczne? To dwa bardzo długie skrzydła po bokach.', hint: 'Szukaj bardzo długich, ciemnych skrzydeł.', ok: 'To panele słoneczne. Są tak długie, jak spory autobus. Zasilają silniki jonowe sondy.', hits: [[.2, .5, .19], [.8, .3, .19]]},
  {name: 'Korpus sondy', ask: 'Teraz znajdź środek sondy. To mały korpus pomiędzy skrzydłami.', hint: 'Szukaj małej, jasnej części pośrodku.', ok: 'To korpus sondy. W nim są kamery, komputer i silniki.', hits: [[.54, .42, .08]]}
 ]},
 juno: {image: 'juno', parts: [
  {name: 'Panele słoneczne', ask: 'Sonda Juno ma trzy wielkie panele słoneczne. Dotknij ich wszystkich!', hint: 'Szukaj trzech długich, brązowych skrzydeł wokół sondy.', ok: 'To panele słoneczne. Są trzy, bo Słońce przy Jowiszu świeci bardzo słabo.', hits: [[.2, .5, .17], [.6, .2, .15], [.75, .7, .17]], count: 3},
  {name: 'Antena', ask: 'Teraz znajdź antenę. To biała kopuła na środku.', hint: 'Szukaj białej kopuły pośrodku sondy.', ok: 'To antena. Dzięki niej Juno wysyła zdjęcia i wyniki na Ziemię.', hits: [[.53, .36, .1]]}
 ]},
 cassini: {image: 'cassini', parts: [
  {name: 'Antena', ask: 'Gdzie jest antena? To wielki biały talerz na górze.', hint: 'Szukaj wielkiego, białego talerza.', ok: 'To antena. Dzięki niej Cassini wysyłała zdjęcia Saturna na Ziemię.', hits: [[.75, .28, .15]]},
  {name: 'Wysięgnik', ask: 'Teraz znajdź długi wysięgnik. To ramię z lewej strony.', hint: 'Szukaj długiego ramienia z lewej strony.', ok: 'To wysięgnik. Trzyma przyrząd daleko od sondy, żeby dobrze mierzył pole magnetyczne.', hits: [[.5, .2, .1]]},
  {name: 'Przyrządy i kamery', ask: 'Na koniec znajdź przyrządy i kamery. To złoty korpus na dole.', hint: 'Szukaj złotego, pomarszczonego korpusu na dole.', ok: 'To przyrządy i kamery. Nimi Cassini badała Saturna i jego księżyce.', hits: [[.76, .65, .15]]}
 ]},
 voyager: {image: 'voyager', parts: [
  {name: 'Antena', ask: 'Gdzie jest antena? To duży, biały talerz.', hint: 'Szukaj dużego, białego talerza z prawej strony.', ok: 'To antena. Sygnał z niej leci do Ziemi wiele godzin.', hits: [[.74, .45, .14]]},
  {name: 'Długi wysięgnik', ask: 'Teraz znajdź bardzo długi wysięgnik. To cienkie ramię, które sięga w lewy górny róg.', hint: 'Szukaj cienkiej, długiej belki po skosie.', ok: 'To wysięgnik. Trzyma przyrząd, który mierzy pole magnetyczne, z dala od sondy.', hits: [[.1, .1, .07], [.2, .25, .07], [.3, .37, .07], [.45, .55, .07]]},
  {name: 'Kamery', ask: 'Na koniec znajdź kamery. Siedzą na małej platformie po prawej stronie.', hint: 'Szukaj małej platformy na samym brzegu po prawej.', ok: 'To kamery. Zrobiły zdjęcia Urana i Neptuna.', hits: [[.95, .62, .09]]}
 ]},
 newhorizons: {draw: 'newhorizons', parts: [
  {name: 'Antena', ask: 'Gdzie jest antena? To duży, biały talerz.', hint: 'Szukaj dużego, białego talerza na górze.', ok: 'To antena. Dzięki niej sonda wysłała na Ziemię zdjęcia Plutona.', hits: [[.5, .27, .17]]},
  {name: 'Generator prądu', ask: 'Teraz znajdź generator prądu. To szary walec z boku.', hint: 'Szukaj szarego walca z prawej strony.', ok: 'To generator prądu. Przy Plutonie Słońce prawie nie świeci, więc sonda nie ma paneli, tylko taki mały generator.', hits: [[.82, .55, .12]]}
 ]},
 ingenuity: {draw: 'ingenuity', parts: [
  {name: 'Wirniki', ask: 'Gdzie są wirniki? To dwa duże śmigła na górze.', hint: 'Szukaj dwóch dużych, białych kół na górze.', ok: 'To wirniki — dwa śmigła kręcące się w przeciwnych stronach. Dzięki nim helikopter unosi się w cienkim marsjańskim powietrzu.', hits: [[.28, .18, .16], [.72, .18, .16]]},
  {name: 'Kadłub', ask: 'Teraz znajdź kadłub. To małe pudełko na dole.', hint: 'Szukaj małego, biało-pomarańczowego pudełka pod wirnikami.', ok: 'To kadłub. W środku są kamery i komputer. Ingenuity jest wielkości pudełka na chusteczki!', hits: [[.5, .68, .18]]},
  {name: 'Nóżki', ask: 'Na koniec znajdź nóżki. To cienkie patyczki na dole.', hint: 'Szukaj cienkich czarnych patyczków pod kadłubem.', ok: 'To nóżki. Dzięki nim Ingenuity ląduje na kamieniach i piasku Marsa.', hits: [[.38, .92, .08], [.62, .92, .08]]}
 ]},
 giotto: {draw: 'giotto', parts: [
  {name: 'Antena', ask: 'Gdzie jest antena? To okrągły talerz na górze.', hint: 'Szukaj okrągłego talerza na górze.', ok: 'To antena. Dzięki niej Giotto przesłała zdjęcia komety.', hits: [[.5, .2, .15]]},
  {name: 'Tarcza przed pyłem', ask: 'Teraz znajdź tarczę przed pyłem. To płaski dysk na dole sondy.', hint: 'Szukaj płaskiego dysku na samym dole.', ok: 'To tarcza przed pyłem. Chroniła sondę przed drobinkami pyłu z komety.', hits: [[.5, .82, .17]]}
 ]}
};

/* naturalne księżyce planet — pokazane przy zbliżeniu planety, osobno od sond.
 * moonOrbit: promień orbity w jednostkach promienia planety (wizualizacja
 * poglądowa, nie dokładne proporcje). period w dniach, startPhase w radianach.
 * Księżyc Ziemi jest osobno w bodies[] (kind 'moon') i ma własne zadanie. */
const MOONS = {
 mars: [
  {id: 'phobos', parentId: 'mars', name: 'Fobos', type: 'Księżyc Marsa', intro: 'Fobos.', color: '#a08a76', texture: 'phobos', size: .38, moonOrbit: 2.6, period: .32, startPhase: 1.2, tilt: .5,
   facts: [
    'Fobos to jeden z dwóch księżyców Marsa. Okrąża planetę bardzo szybko — prawie trzy razy na dobę!',
    'Jest też znacznie mniejszy od naszego Księżyca — wygląda jak wielki, szary kartofel.',
    'Fobos powoli spada na Marsa. Za miliony lat może się na niego rozbić albo rozsypać w pierścień!'
   ]},
  {id: 'deimos', parentId: 'mars', name: 'Deimos', type: 'Księżyc Marsa', intro: 'Deimos.', color: '#8f8072', texture: 'deimos', size: .3, moonOrbit: 3.6, period: 1.26, startPhase: 4, tilt: -.4,
   facts: [
    'Deimos to drugi, mniejszy księżyc Marsa. Jest tak mały, że wygląda jak ziarenko piasku przy planecie.',
    'Okrąża Marsa wolniej niż Fobos — potrzebuje na to ponad dnia.',
    'Jego powierzchnia jest gładka, bo pokrywa ją gruba warstwa pyłu, jak materac na piasku.'
   ]}
 ],
 jupiter: [
  {id: 'io', parentId: 'jupiter', name: 'Io', type: 'Księżyc Jowisza', intro: 'Io.', color: '#e8c07a', texture: 'io', size: .3, moonOrbit: 2.2, period: 1.77, startPhase: .5, tilt: .3,
   facts: [
    'Io to księżyc Jowisza, który ma ponad 400 wulkanów! Wyrzucają one siarkę, która maluje Io na żółto i pomarańczowo.',
    'To najbardziej wulkaniczne miejsce w całym Układzie Słonecznym.',
    'Wulkany Io wypluwają lawę tak gorącą, że na zdjęciach z sondy świeci ona w ciemności!'
   ]},
  {id: 'europa', parentId: 'jupiter', name: 'Europa', type: 'Księżyc Jowisza', intro: 'Europa.', color: '#d8e4f0', texture: 'europa', size: .27, moonOrbit: 2.9, period: 3.55, startPhase: 2.1, tilt: -.35,
   facts: [
    'Europa jest pokryta grubą skorupą lodu — pod nią może być ocean wody!',
    'Naukowcy myślą, że w tym oceanie mogą żyć małe stworzenia. Jeszcze ich nie znaleźliśmy!',
    'Lód na Europie pęka i przesuwa się, dlatego jej powierzchnia wygląda jak popękana skorupka jajka.'
   ]},
  {id: 'ganymedes', parentId: 'jupiter', name: 'Ganimedes', type: 'Księżyc Jowisza', intro: 'Ganimedes.', color: '#b09a7a', texture: 'ganymedes', size: .42, moonOrbit: 3.7, period: 7.15, startPhase: 4, tilt: .25,
   facts: [
    'Ganimedes to największy księżyc w całym Układzie Słonecznym — większy nawet od planety Merkury!',
    'Ma własne pole magnetyczne, jak Ziemia. To jedyny księżyc, który je ma!',
    'Na jego powierzchni są ciemne plamy i jasne, poprzecinane rowy — wygląda jak stary, zamarznięty tort.'
   ]},
  {id: 'kallisto', parentId: 'jupiter', name: 'Kallisto', type: 'Księżyc Jowisza', intro: 'Kallisto.', color: '#8a7a66', texture: 'kallisto', size: .4, moonOrbit: 4.6, period: 16.7, startPhase: 1.2, tilt: -.2,
   facts: [
    'Kallisto jest cały pokryty kraterami — to jeden z najstarszych księżyców Jowisza.',
    'Jego największy krater nazywa się Valhalla. Ma wielkość Polski!',
    'Kallisto jest daleko od Jowisza, więc nie jest tak mocno rozgrzewany — to zimny, spokojny świat.'
   ]}
 ],
 saturn: [
  {id: 'tytan', parentId: 'saturn', name: 'Tytan', type: 'Księżyc Saturna', intro: 'Tytan.', color: '#d9a55b', texture: 'tytan', size: .5, moonOrbit: 2.6, period: 15.9, startPhase: 2.8, tilt: .8,
   facts: [
    'Tytan to największy księżyc Saturna — większy od planety Merkury!',
    'Ma gęstą, pomarańczową atmosferę i prawdziwe jeziora. Tylko że zamiast wody płynie w nich ciekły gaz!',
    'Sonda Huygens wylądowała na Tytanie w 2005 roku. To był pierwszy lądownik na księżycu innej planety!'
   ]},
  {id: 'enceladus', parentId: 'saturn', name: 'Enceladus', type: 'Księżyc Saturna', intro: 'Enceladus.', color: '#eef4fa', texture: 'enceladus', size: .22, moonOrbit: 1.9, period: 1.37, startPhase: .8, tilt: -.6,
   facts: [
    'Enceladus to mały, ale niezwykły księżyc — jest cały pokryty świeżym, białym lodem.',
    'Z jego południowego bieguna tryskają w kosmos gejzery wody! Sonda Cassini przeleciała przez te strumienie.',
    'Pod lodem Enceladusa też może być ocean. To jedno z najlepszych miejsc do szukania życia!'
   ]},
  {id: 'japetus', parentId: 'saturn', name: 'Japetus', type: 'Księżyc Saturna', intro: 'Japetus.', color: '#6e5f50', texture: 'japetus', size: .28, moonOrbit: 3.4, period: 79.3, startPhase: 4.6, tilt: 1.4,
   facts: [
    'Japetus ma dwie twarze — jedna połowa jest biała jak śnieg, a druga czarna jak węgiel!',
    'Ciemna strona zbiera pył z pierścieni Saturna. Dlatego wygląda jak księżyc pomalowany na pół.',
    'Na równiku Japetusa biegnie wielki grzbiet — jak szew na piłce. Naukowcy wciąż nie wiedzą, skąd się wziął!'
   ]},
  {id: 'reja', parentId: 'saturn', name: 'Reja', type: 'Księżyc Saturna', intro: 'Reja.', color: '#c8ccd4', texture: 'reja', size: .3, moonOrbit: 2.1, period: 4.52, startPhase: 1.9, tilt: -.3,
   facts: [
    'Reja to drugi co do wielkości księżyc Saturna. Jest szara i pełna kraterów.',
    'Reja może mieć własne, słabe pierścienie! To pierwszy księżyc, przy którym je znaleziono.',
    'Krąży blisko Saturna, więc okrąża go w niecałe 5 dni.'
   ]},
  {id: 'dione', parentId: 'saturn', name: 'Dione', type: 'Księżyc Saturna', intro: 'Dione.', color: '#dde2ea', texture: 'dione', size: .28, moonOrbit: 2.8, period: 2.74, startPhase: 5.4, tilt: .5,
   facts: [
    'Dione wygląda jak lodowa kula z wielkimi, białymi urwiskami — to klify z lodu!',
    'Jedna jej połowa jest gładka, a druga pełna kraterów. Dlaczego tak jest? Naukowcy wciąż się zastanawiają.',
    'Dione okrąża Saturna szybciej niż nasz Księżyc okrąża Ziemię.'
   ]}
 ],
 uranus: [
  {id: 'tytania', parentId: 'uranus', name: 'Tytania', type: 'Księżyc Urana', intro: 'Tytania.', color: '#9fb4c0', texture: 'tytania', size: .5, moonOrbit: 2.8, period: 8.7, startPhase: 1.6, tilt: .9,
   facts: [
    'Tytania to największy księżyc Urana — ma prawie połowę średnicy naszego Księżyca.',
    'Na jej powierzchni są ogromne kaniony — głębsze niż Wielki Kanion na Ziemi!',
    'Uran i jego księżyce są bardzo daleko od Słońca, więc jest tam strasznie zimno — około minus 200 stopni!'
   ]},
  {id: 'oberon', parentId: 'uranus', name: 'Oberon', type: 'Księżyc Urana', intro: 'Oberon.', color: '#7d8f9a', texture: 'oberon', size: .42, moonOrbit: 3.8, period: 13.5, startPhase: 3.9, tilt: -.7,
   facts: [
    'Oberon to najdalszy wielki księżyc Urana. Jest ciemny i pokryty kraterami.',
    'Ma na sobie górę wysoką na 11 kilometrów — wyższą niż Mount Everest!',
    'Oberon okrąża Urana w prawie dwa tygodnie.'
   ]}
 ],
 neptune: [
  {id: 'tryton', parentId: 'neptune', name: 'Tryton', type: 'Księżyc Neptuna', intro: 'Tryton.', color: '#e8d8e0', texture: 'tryton', size: .55, moonOrbit: 2.7, period: -5.88, startPhase: 2.2, tilt: .6,
   facts: [
    'Tryton to największy księżyc Neptuna. Krąży w przeciwną stronę niż planeta się obraca!',
    'Ma lodowe gejzery, które wyrzucają azot wysoko w niebo — na wysokość ośmiu kilometrów!',
    'Tryton powoli zbliża się do Neptuna. Za miliony lat może się rozpaść i zrobić pierścień wokół planety.'
   ]}
 ],
 pluto: [
  {id: 'charon', parentId: 'pluto', name: 'Charon', type: 'Księżyc Plutona', intro: 'Charon.', color: '#b8b0aa', texture: 'charon', size: .5, moonOrbit: 2.4, period: 6.39, startPhase: 1.1, tilt: .3,
   facts: [
    'Charon to największy księżyc Plutona. Jest tak duży, że Pluton i Charon krążą razem wokół wspólnego punktu — jak w tańcu!',
    'Charon ma na sobie wielki ciemny obszar na biegunie. Naukowcy nazwali go Mordorem — tak jak złośliwą krainę z bajki!',
    'Na Charonie jest wielki kanion. Gdyby przeciągnąć go dalej, okrążyłby cały księżyc. Zrobiła go wielka szczelina w lodzie.'
   ]}
 ]
};

/* obiekty poziomów galaktycznych (view.level: -1 Ramię Oriona, -2 Droga Mleczna) */
const GALAXY_OBJECTS = {
 orion_arm: [
  {id: 'solar_system', name: 'Nasz Układ Słoneczny', type: 'Układ planetarny', intro: 'Nasz Układ Słoneczny.', emoji: '☀️',
   facts: [
    'To nasz dom w kosmosie! Słońce to gwiazda, a wokół niego krąży osiem planet — w tym nasza Ziemia.',
    'Nasz Układ Słoneczny leży w Ramieniu Oriona — jednym z wielkich ramion naszej galaktyki, Drogi Mlecznej.',
    'Światło ze Słońca leci do Ziemi osiem minut. Do najbliższej gwiazdy leciałoby ponad cztery lata!'
   ]},
  {id: 'orion_arm', name: 'Ramię Oriona', type: 'Ramię spiralne galaktyki', intro: 'Ramię Oriona.', emoji: '🌌',
   facts: [
    'Ramię Oriona to jedno z wielkich ramion Drogi Mlecznej — naszej galaktyki. Ma kształt długiej, zakrzywionej wstęgi pełnej gwiazd.',
    'Mieszkają w nim miliardy gwiazd — w tym nasze Słońce. Między gwiazdami unoszą się wielkie obłoki gazu i pyłu, w których rodzą się nowe gwiazdy.',
    'Układ Słoneczny nie jest w centrum galaktyki — leży bliżej jej brzegu, w spokojnym zakątku Ramienia Oriona.'
   ]}
 ],
 milky_way: [
  {id: 'milky_way', name: 'Droga Mleczna', type: 'Nasza galaktyka', intro: 'Droga Mleczna.', emoji: '🌌',
   facts: [
    'Droga Mleczna to nasza galaktyka — ogromny wir z setkami miliardów gwiazd! Nasze Słońce i cały Układ Słoneczny są jej częścią.',
    'Gdybyś mogła spojrzeć na Drogę Mleczną z boku, wyglądałaby jak wielki, płaski naleśnik z wypukłością w środku.',
    'Nazwa „Droga Mleczna" wzięła się stąd, że na nocnym niebie widać jasny, mleczny pas — to nasza galaktyka patrzona od środka!',
    'Słońce okrąża centrum Drogi Mlecznej. Jedna taka podróż trwa aż 230 milionów lat!'
   ]},
  {id: 'andromeda', name: 'Galaktyka Andromedy', type: 'Sąsiednia galaktyka', intro: 'Galaktyka Andromedy.', emoji: '🌀',
   facts: [
    'Andromeda to sąsiednia galaktyka — najbliższa wielka galaktyka obok naszej Drogi Mlecznej. Razem należą do jednej rodziny galaktyk.',
    'Jest od nas tak daleko, że światło leci stamtąd ponad dwa i pół miliona lat!',
    'Za około cztery miliardy lat Droga Mleczna i Andromeda połączą się w jedną wielką galaktykę. To bardzo, bardzo daleka przyszłość — nie ma się czym martwić!',
    'Między gwiazdami w galaktykach jest tyle miejsca, że gdy galaktyki się łączą, gwiazdy rzadko się zderzają — to jak dwa stada owiec, które się mieszają.'
   ]},
  {id: 'voyager1', name: 'Sonda Voyager 1', type: 'Sonda kosmiczna', intro: 'Sonda Voyager 1.', emoji: '🛰️',
   facts: [
    'Voyager 1 to sonda kosmiczna — bezzałogowy statek, który ludzie wysłali, żeby poznawał kosmos.',
    'Wystartował w 1977 roku i przeleciał obok Jowisza oraz Saturna, robiąc im pierwsze dokładne zdjęcia.',
    'Voyager 1 jest teraz najdalej od Ziemi ze wszystkich rzeczy, które zbudowali ludzie — leci już między gwiazdami!',
    'Na pokładzie niesie Złotą Płytę z pozdrowieniami dla kosmitów — z dźwiękami Ziemi, muzyką i obrazkami.'
   ]},
  {id: 'voyager2_gal', name: 'Sonda Voyager 2', type: 'Sonda kosmiczna', intro: 'Sonda Voyager 2.', emoji: '🛰️',
   facts: [
    'Voyager 2 to bliźniak Voyagera 1 — też poleciał w 1977 roku poznawać planety.',
    'To jedyna sonda na świecie, która przeleciała obok wszystkich czterech wielkich planet: Jowisza, Saturna, Urana i Neptuna!',
    'Voyager 2 też leci już między gwiazdami i też niesie wiadomość od Ziemian.',
    'Sygnał z Voyagera 2 leci do nas około 20 godzin — tyle światło potrzebuje, żeby do nas dotrzeć!'
   ]}
 ]
};

const taskCount = item => (item.activity ? 1 : 0) + (item.activity2 ? 1 : 0);
const TOTAL_TASKS = bodies.reduce((sum, body) => sum + taskCount(body), 0) + finds.reduce((sum, find) => sum + taskCount(find), 0);
const allMoons = Object.values(MOONS).flat();
const allGalaxy = [...GALAXY_OBJECTS.orion_arm, ...GALAXY_OBJECTS.milky_way];
const TOTAL_ITEMS = bodies.length + finds.length + allMoons.length + allGalaxy.length;
const bodyIndex = id => bodies.findIndex(body => body.id === id);
const knownIds = new Set([...bodies.map(body => body.id), ...finds.map(find => find.id), ...allMoons.map(moon => moon.id), ...allGalaxy.map(object => object.id)]);
