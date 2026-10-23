/*
 * Dane cennikowe – AWF Warszawa, kampus Marymoncka 34.
 * Źródło: Zarządzenie Kanclerza nr 8/2024/2025 z 16.12.2024 r.
 *   zał. 1–2 (cele komercyjne) – brzmienie pierwotne,
 *   zał. 3–6 (sale, cele sportowe, usługi dodatkowe) – w brzmieniu
 *   Zarządzenia Kanclerza nr 63/2025/2026 z 30.07.2026 r. (obowiązuje od 01.08.2026 r.).
 * Wszystkie kwoty netto w zł.
 *
 * Rodzaje opcji (kind):
 *   hour  – stawka za 1 h (opcjonalnie × liczba torów/boisk: qty)
 *   block – pakiet „do 5 h” (p5) / „do 12 h” (p12); night = mnożnik stawki godzinowej (p5/5) za 22:00–6:00;
 *           setup = dzień montażowy za ½ stawki do 12 h
 *   tier  – stawka dobowa zależna od liczby uczestników (poligon, cele komercyjne)
 *   day   – stawka za dzień (8 h) – sale w budynku nr 25
 */

/* Ustawienia wdrożenia – do zmiany przez IT przy publikacji produkcyjnej (patrz WDROZENIE.md). */
const SITE = {
  concept: false,     /* true = pasek „Projekt koncepcyjny” na górze strony; w produkcji: false */
  enquiryEmail: 'wynajem@awf.edu.pl'    /* adres, na który przycisk „Otwórz w programie pocztowym” kieruje zapytanie, np. dedykowana skrzynka działu wynajmu */
};

const PRICING_SOURCE = {
  base: 'Zarządzenie Kanclerza AWF Warszawa nr 8/2024/2025 z 16 grudnia 2024 r.',
  change: 'Zarządzenie Kanclerza AWF Warszawa nr 63/2025/2026 z 30 lipca 2026 r., obowiązuje od 1 sierpnia 2026 r.',
  bipUrl: 'https://awf.edu.pl/bip/dokumenty/zarzadzenia-kanclerza/20252026'
};

const PURPOSES = {
  trening:    { label: 'Treningi i zajęcia', hint: 'Stawka godzinowa, regularne lub jednorazowe zajęcia' },
  zawody:     { label: 'Zawody sportowe', hint: 'Pakiet do 5 h lub do 12 h dziennie' },
  komercja:   { label: 'Wydarzenie komercyjne', hint: 'Eventy firmowe, pikniki, nagrania, pokazy' },
  konferencja:{ label: 'Szkolenie lub konferencja', hint: 'Sale seminaryjne i wykładowe' }
};

/* Rodzaj najemcy podpowiada cel najmu – cennik nie różnicuje cen według najemcy. */
const CLIENTS = [
  { id: 'klub',        label: 'Klub lub sekcja sportowa', purpose: 'trening' },
  { id: 'szkola',      label: 'Szkoła, uczelnia, NGO',    purpose: 'trening' },
  { id: 'grupa',       label: 'Grupa prywatna',           purpose: 'trening' },
  { id: 'organizator', label: 'Organizator zawodów',      purpose: 'zawody' },
  { id: 'firma',       label: 'Firma, agencja eventowa',  purpose: 'komercja' },
  { id: 'szkolenie',   label: 'Organizator szkolenia',    purpose: 'konferencja' }
];

const URL_BASE = 'https://www.awf.edu.pl/obiekty/obiekty-sportowe/';

const FACILITIES = [
  {
    id: 'stadion-la', name: 'Stadion lekkoatletyczny', place: 'Teren otwarty', type: 'outdoor',
    area: 18000, seats: 2800, tags: ['Lekkoatletyka'],
    features: ['bieżnia tartanowa, 8 torów', 'sztuczne oświetlenie', 'trzy koła do rzutu dyskiem i młotem', 'zeskoki do skoku wzwyż i o tyczce', 'siatka ochronna koła do rzutów'],
    photos: ['stadion-la.jpg', 'stadion-la-2.jpg'], url: URL_BASE + 'stadion-lekkoatletyczny',
    extras: ['jupitery', 'nagl-stadion', 'szatnia-la', 'podium', 'barierki'],
    options: [
      { id: 'g10', purpose: 'trening', kind: 'hour', label: 'Grupa do 10 osób', rate: 165 },
      { id: 'g20', purpose: 'trening', kind: 'hour', label: 'Grupa do 20 osób', rate: 250 },
      { id: 'g30', purpose: 'trening', kind: 'hour', label: 'Grupa do 30 osób', rate: 340 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 5000, p12: 9000, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 8800, p12: 14300, night: 1.5, setup: true, note: 'Koncerty – wycena indywidualna.' }
    ]
  },
  {
    id: 'hala-la', name: 'Hala lekkoatletyczna im. Janusza Kusocińskiego', short: 'Hala lekkoatletyczna', place: 'Budynek nr 1', type: 'indoor',
    area: 3665, seats: 300, tags: ['Lekkoatletyka', 'Siatkówka', 'Piłka ręczna'],
    features: ['Sektor I – gry zespołowe, nawierzchnia syntetyczna', 'Sektor II – skok wzwyż, skok o tyczce, piłka ręczna', 'Sektor III – rzuty, nawierzchnia tartanowa', 'Sektor IV – bieżnia 5-torowa, 100 m'],
    photos: ['hala-la.jpg', 'hala-la-2.jpg'], url: URL_BASE + 'hala-lekkoatletyczna',
    extras: ['szatnia-la', 'nagl-hala-la'],
    options: [
      { id: 's1', purpose: 'trening', kind: 'hour', label: 'Sektor I – boisko do siatkówki', rate: 180 },
      { id: 's10', purpose: 'trening', kind: 'hour', label: 'Sektor II, III lub IV – do 10 osób', rate: 165 },
      { id: 's20', purpose: 'trening', kind: 'hour', label: 'Sektor II, III lub IV – do 20 osób', rate: 250 },
      { id: 's30', purpose: 'trening', kind: 'hour', label: 'Sektor II, III lub IV – do 30 osób', rate: 340 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody – cała hala', p5: 5500, p12: 9350, setup: true },
      { id: 'zaw-sek', purpose: 'zawody', kind: 'block', label: 'Zawody – do dwóch sektorów', p5: 800, p12: 1600, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Komercyjnie – cała hala', p5: 12000, p12: 20000, night: 2, setup: true },
      { id: 'kom-sek', purpose: 'komercja', kind: 'block', label: 'Komercyjnie – sektor', p5: 3300, p12: 5500, night: 2, setup: true }
    ]
  },
  {
    id: 'silownia-la', name: 'Siłownia przy Hali LA', place: 'Budynek nr 1', type: 'indoor',
    capacity: 'do 24 osób', tags: ['Siłownia'], features: ['dla klubów sportowych, maks. 24 osoby'],
    photos: [], url: URL_BASE + 'hala-lekkoatletyczna', extras: ['szatnia-la'],
    options: [
      { id: 'klub', purpose: 'trening', kind: 'hour', label: 'Kluby sportowe (maks. 24 os.)', rate: 220 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 2500, p12: 5000, night: 2 }
    ]
  },
  {
    id: 'plywalnia', name: 'Pływalnia', place: 'Budynek nr 1', type: 'indoor',
    area: 977, seats: 200, tags: ['Pływanie'],
    features: ['6 torów', 'głębokość od 1,40 do 3,60 m', 'sauna sucha do 8 osób'],
    photos: ['plywalnia.jpg', 'plywalnia-2.jpg'], url: URL_BASE + 'plywalnia', extras: ['sauna'],
    options: [
      { id: 'tor', purpose: 'trening', kind: 'hour', label: 'Tor basenu sportowego', rate: 137, qty: { label: 'Liczba torów', max: 6 } },
      { id: 'cala', purpose: 'trening', kind: 'hour', label: 'Cała pływalnia', rate: 690 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody – cały basen', p5: 4000, p12: 6900 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Komercyjnie – cała pływalnia', p5: 9500, p12: 16000, night: 2 }
    ]
  },
  {
    id: 'hala-gier', name: 'Hala Gier', place: 'Kampus Marymoncka 34', type: 'indoor',
    area: 1400, seats: 1000, tags: ['Koszykówka', 'Piłka ręczna', 'Siatkówka', 'Futsal'],
    features: ['nawierzchnia z parkietu', 'trybuny na 1000 miejsc', 'pełnowymiarowe boisko do gier zespołowych'],
    photos: ['hala-gier.jpg', 'hala-gier-2.jpg'], url: URL_BASE + 'hala-gier',
    extras: ['szatnia-hg', 'szatnia-pod-hg', 'hol-hg', 'nagl-hg'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 330 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 1540, p12: 3300, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 6000, p12: 12000, night: 2, setup: true }
    ]
  },
  {
    id: 'sg1', name: 'Sala gimnastyczna nr 1 (SG 1)', place: 'Budynek nr 1', type: 'indoor',
    area: 306.88, tags: ['Koszykówka', 'Piłka ręczna', 'Siatkówka', 'Futsal', 'Badminton'],
    features: ['nawierzchnia z gumoleum', 'gry zespołowe i badminton'],
    photos: ['sg-1.jpg'], url: URL_BASE + 'sale-gimnastyczne', extras: ['szatnia-sg1'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 180 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 800, p12: 1600, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3000, p12: 6000, night: 2, setup: true }
    ]
  },
  {
    id: 'sg3', name: 'Sala gimnastyczna nr 3 (SG 3)', place: 'Budynek nr 20', type: 'indoor',
    area: 312, capacity: 'do 49 osób', tags: ['Gimnastyka'], features: ['sala do gimnastyki', 'maks. 49 osób'],
    photos: ['sg-3.jpg'], url: URL_BASE + 'sale-gimnastyczne', extras: [],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe (maks. 49 os.)', rate: 180 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 800, p12: 1600, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3000, p12: 6000, night: 2, setup: true }
    ]
  },
  {
    id: 'sg4', name: 'Sala gimnastyczna nr 4 (SG 4)', place: 'Budynek nr 1', type: 'indoor',
    area: 457, capacity: 'do 49 osób', tags: ['Koszykówka', 'Siatkówka', 'Futsal', 'Badminton', 'Tenis'],
    features: ['nawierzchnia z parkietu', 'gry zespołowe, badminton, tenis ziemny', 'maks. 49 osób'],
    photos: ['sg-4.jpg'], url: URL_BASE + 'sale-gimnastyczne', extras: ['szatnia-sg4'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe (maks. 49 os.)', rate: 180 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 800, p12: 1600, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3000, p12: 6000, night: 2, setup: true }
    ]
  },
  {
    id: 'sg5', name: 'Sala gimnastyczna nr 5 (SG 5)', place: 'Budynek nr 23', type: 'indoor',
    area: 1512, tags: ['Gimnastyka'], features: ['nawierzchnia z parkietu', 'największa sala gimnastyczna kampusu', 'dodatkowo mała sala treningowa'],
    photos: ['sg-5.jpg'], url: URL_BASE + 'sale-gimnastyczne', extras: [],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe – cała sala', rate: 385 },
      { id: 'mala', purpose: 'trening', kind: 'hour', label: 'Sala mała', rate: 50 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 1650, p12: 3300, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 8000, p12: 16000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'taniec', name: 'Sala Tańca', place: 'Budynek nr 4', type: 'indoor',
    tags: ['Fitness i taniec'], features: ['zajęcia taneczne i fitness'],
    photos: [], url: null, extras: [],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 275 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody sportowe', p5: 1320, p12: 2640, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 5000, p12: 10000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'psw-maty', name: 'Sala judo i zapasów', short: 'Judo i zapasy', place: 'Budynek nr 22 · Pawilon Sportów Walki', type: 'indoor',
    area: 609, tags: ['Judo', 'Zapasy'], features: ['powierzchnia matowa 609 m²', 'zapasy, judo'],
    photos: ['judo.jpg'], url: URL_BASE + 'pawilon-sportow-walki', extras: [],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe – judo lub zapasy', rate: 132 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody', p5: 575, p12: 1150, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3000, p12: 6000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'psw-szerm', name: 'Sala szermierki', place: 'Budynek nr 22 · Pawilon Sportów Walki', type: 'indoor',
    area: 388, tags: ['Szermierka'], features: ['szpada, floret, szabla'],
    photos: ['szermierka.jpg'], url: URL_BASE + 'pawilon-sportow-walki', extras: [],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 275 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody', p5: 880, p12: 2200, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3000, p12: 6000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'psw-dolna', name: 'Sala treningowa dolna (szermierka)', short: 'Sala treningowa dolna', place: 'Budynek nr 22 · Pawilon Sportów Walki', type: 'indoor',
    tags: ['Szermierka'], features: ['sala treningowa na poziomie dolnym'],
    photos: [], url: URL_BASE + 'pawilon-sportow-walki', extras: [],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 77 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 2000, p12: 4000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'b18', name: 'Pawilon 42 – sale A–E', short: 'Pawilon 42', place: 'Budynek nr 18', type: 'indoor',
    tags: ['Siłownia', 'Judo', 'Szermierka', 'Joga'],
    features: ['Sala C – siłownia, 167 m²', 'Sala D – szermierka na wózkach, 243,6 m²', 'Sala E – joga, relaksacja, 46,8 m²', 'Sale A i B – sporty walki'],
    photos: ['b18-silownia.jpg', 'b18-sala-c.jpg'], url: URL_BASE + 'pawilon-42', extras: [],
    options: [
      { id: 'a', purpose: 'trening', kind: 'hour', label: 'Sala A – sporty walki', rate: 132 },
      { id: 'b', purpose: 'trening', kind: 'hour', label: 'Sala B – sporty walki', rate: 132 },
      { id: 'c', purpose: 'trening', kind: 'hour', label: 'Sala C – siłownia', rate: 220 },
      { id: 'd', purpose: 'trening', kind: 'hour', label: 'Sala D – szermierka na wózkach', rate: 132 },
      { id: 'e', purpose: 'trening', kind: 'hour', label: 'Sala E – fitness, joga (po 16:00)', rate: 66 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Komercyjnie – sala A, B, C lub D', p5: 2500, p12: 6000, night: 1.5, setup: true },
      { id: 'kom-e', purpose: 'komercja', kind: 'block', label: 'Komercyjnie – sala E', p5: 1100, p12: 2200, night: 1.5, setup: true }
    ]
  },
  {
    id: 'b19', name: 'Pawilon 43 – sale A i B', short: 'Pawilon 43', place: 'Budynek nr 19', type: 'indoor',
    tags: ['Taekwondo', 'Fitness i taniec'],
    features: ['Sala A – 231 m², parkiet i maty do taekwondo', 'Sala B – 190 m², fitness i taniec, parkiet'],
    photos: ['b19-sala-a.jpg', 'b19-sala-b.jpg'], url: URL_BASE + 'pawilon-43', extras: [],
    options: [
      { id: 'a', purpose: 'trening', kind: 'hour', label: 'Sala A – taekwondo', rate: 132 },
      { id: 'b', purpose: 'trening', kind: 'hour', label: 'Sala B – fitness i taniec', rate: 132 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Komercyjnie – sale A i B', p5: 2500, p12: 6000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'korektywa', name: 'Sale do korektywy', place: 'Budynki nr 1 i 20', type: 'indoor',
    tags: ['Gimnastyka'], features: ['sala do korektywy w budynku nr 1', 'sala nr 63 w budynku nr 20'],
    photos: [], url: null, extras: [],
    options: [
      { id: 'b1', purpose: 'trening', kind: 'hour', label: 'Sala do korektywy (bud. nr 1)', rate: 65 },
      { id: 'b20', purpose: 'trening', kind: 'hour', label: 'Sala nr 63 (bud. nr 20)', rate: 50 }
    ]
  },
  {
    id: 'boisko-2', name: 'Stadion Rugby (boisko nr 2)', short: 'Stadion Rugby', place: 'Teren otwarty', type: 'outdoor',
    area: 10000, seats: 200, tags: ['Rugby', 'Piłka nożna'],
    features: ['sztuczne oświetlenie', 'okrężna bieżnia żużlowa 500 m', 'trybuny na 200 miejsc'],
    photos: ['rugby.jpg'], url: URL_BASE + 'stadion-rugby', extras: ['podium', 'barierki'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 400 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3900, p12: 7000, night: 1.5, setup: true, note: 'Koncerty – wycena indywidualna.' }
    ]
  },
  {
    id: 'boisko-3', name: 'Boisko piłkarskie nr 3', place: 'Teren otwarty', type: 'outdoor',
    area: 9000, tags: ['Piłka nożna'], features: ['pełnowymiarowe boisko piłkarskie'],
    photos: ['boisko-3.jpg'], url: URL_BASE + 'boisko-pilki-noznej', extras: ['podium', 'barierki'],
    options: [
      { id: 'dz', purpose: 'trening', kind: 'hour', label: 'Dni robocze do 17:00', rate: 182 },
      { id: 'wk', purpose: 'trening', kind: 'hour', label: 'Po 17:00 i w weekendy', rate: 315 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3900, p12: 7000, night: 1.5, setup: true }
    ]
  },
  {
    id: 'boisko-4', name: 'Boisko piłkarskie nr 4', place: 'Teren otwarty', type: 'outdoor',
    area: 9394, seats: 100, tags: ['Piłka nożna'], features: ['pełnowymiarowe boisko piłkarskie', 'trybuny na ok. 100 miejsc'],
    photos: ['boisko-4.jpg'], url: URL_BASE + 'boisko-pilki-noznej', extras: ['podium', 'barierki'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 440 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 3900, p12: 7000, night: 1.5, setup: true, note: 'Koncerty – wycena indywidualna.' }
    ]
  },
  {
    id: 'boisko-5', name: 'Boisko piłkarskie nr 5', place: 'Teren otwarty', type: 'outdoor',
    area: 4300, tags: ['Piłka nożna'], features: ['boisko treningowe'],
    photos: ['boisko-5.jpg'], url: URL_BASE + 'boisko-pilki-noznej', extras: ['podium', 'barierki'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 220 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 1900, p12: 3300, night: 1.5, setup: true }
    ]
  },
  {
    id: 'boisko-6', name: 'Boisko piłkarskie nr 6', place: 'Teren otwarty', type: 'outdoor',
    area: 7000, tags: ['Piłka nożna', 'Pikniki i eventy'], features: ['boisko piłkarskie', 'przyłącze prądu na imprezy'],
    photos: ['boisko-6.jpg'], url: URL_BASE + 'boisko-pilki-noznej', extras: ['prad-b6', 'podium', 'barierki'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 330 },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny', p5: 2800, p12: 5000, setup: true }
    ]
  },
  {
    id: 'poligon', name: 'Poligon lekkoatletyczny (boisko nr 7)', short: 'Poligon lekkoatletyczny', place: 'Teren otwarty, ogrodzony', type: 'outdoor',
    area: 18700, tags: ['Lekkoatletyka', 'Pikniki i eventy'],
    features: ['koła do rzutów i siatka ochronna', 'pikniki, pokazy, wystawy', 'dostęp do wody i prądu (60 kW)', 'teren ogrodzony'],
    photos: ['poligon.jpg'], url: 'https://www.awf.edu.pl/obiekty/tereny-rekreacyjne/poligon-lekkoatletyczny',
    extras: ['prad-poligon', 'podium', 'barierki'],
    options: [
      { id: 'tr', purpose: 'trening', kind: 'hour', label: 'Zajęcia sportowe', rate: 200 },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Imprezy sportowe', p5: 3300, p12: 5500, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'tier', label: 'Impreza rekreacyjna zamknięta (piknik, pokaz, wystawa)',
        tiers: [[500, 11000], [1000, 13500], [2000, 15000], [3000, 16500], [4000, 18000]] }
    ]
  },
  {
    id: 'plazowka', name: 'Boiska do siatkówki plażowej', place: 'Teren otwarty', type: 'outdoor',
    area: 1180, seats: 400, tags: ['Siatkówka plażowa'], features: ['3 boiska z kompletami słupków', 'trybuny na ok. 400 osób'],
    photos: ['plazowka.jpg'], url: URL_BASE + 'boiska-pilki-plazowej', extras: [],
    options: [
      { id: 'rano', purpose: 'trening', kind: 'hour', label: 'Do 15:00', rate: 30, qty: { label: 'Liczba boisk', max: 3 } },
      { id: 'pop', purpose: 'trening', kind: 'hour', label: 'Po 15:00', rate: 40, qty: { label: 'Liczba boisk', max: 3 } },
      { id: 'zaw', purpose: 'zawody', kind: 'block', label: 'Zawody – 3 boiska', p5: 550, p12: 935, setup: true },
      { id: 'kom', purpose: 'komercja', kind: 'block', label: 'Wynajem komercyjny – 3 boiska', p5: 2000, p12: 3000, night: 1.5, setup: true }
    ]
  }
];

/* Sale seminaryjne i wykładowe – zał. 1 do Zarządzenia nr 63/2025/2026. eq: p – rzutnik, m – monitor biznesowy, s – nagłośnienie, a – klimatyzacja */
const ROOMS = [
  ['Budynek nr 1', 'Aula', 172, 'pms', 300],
  ['Budynek nr 1', 'Sala wykładowa D', 50, 'p', 85],
  ['Budynek nr 1', 'Sala wykładowa E', 150, 'p', 167],
  ['Budynek nr 1', 'Sala wykładowa 1', 42, 'p', 152],
  ['Budynek nr 1', 'Sala wykładowa 2', 90, 'p', 170],
  ['Budynek nr 1', 'Sala wykładowa 3', 50, 'p', 152],
  ['Budynek nr 1', 'Sala seminaryjna A', 40, 'p', 61],
  ['Budynek nr 1', 'Sala seminaryjna B', 30, 'p', 61],
  ['Budynek nr 1', 'Sala seminaryjna C', 40, 'p', 61],
  ['Budynek nr 1', 'Sala seminaryjna 6', 24, 'p', 58],
  ['Budynek nr 1', 'Sala seminaryjna 8', 28, 'p', 58],
  ['Budynek nr 1', 'Sala seminaryjna 9', 28, 'p', 58],
  ['Budynek nr 1', 'Sala seminaryjna 10', 48, 'p', 61],
  ['Budynek nr 1', 'Sala seminaryjna 11', 36, 'p', 61],
  ['Budynek nr 1', 'Sala seminaryjna 14', 34, 'pm', 61],
  ['Budynek nr 1', 'Sala seminaryjna 15', 34, 'p', 61],
  ['Budynek nr 1', 'Sala seminaryjna 20', 32, 'pm', 61],
  ['Budynek nr 1', 'Sala seminaryjna 48', 30, 'p', 58],
  ['Budynek nr 1', 'Sala seminaryjna 49', 20, '', 37],
  ['Budynek nr 1', 'Sala seminaryjna 51', 14, '', 37],
  ['Budynek nr 1', 'Sala seminaryjna 52', 30, 'p', 58],
  ['Budynek nr 1', 'Sala seminaryjna 53', 20, '', 37],
  ['Budynek nr 1', 'Sala gier sportowych', 17, '', 37],
  ['Budynek nr 1', 'Laboratorium teorii sportu', 36, '', 37],
  ['Budynek nr 1', 'Antresola Hali LA', 42, 'pm', 50],
  ['Budynek nr 22', 'Sala seminaryjna 54', 50, 'pa', 114],
  ['Budynek nr 22', 'Sala seminaryjna 55', 95, 'pma', 202],
  ['Budynek F „Rotacyjny”', 'Sala seminaryjna 16', 26, 'm', 46],
  ['Budynek F „Rotacyjny”', 'Sala seminaryjna 27', 30, 'm', 46],
  ['Budynek nr 3', 'Sala seminaryjna 19', 40, 'p', 61],
  ['Budynek nr 3', 'Sala seminaryjna 22', 140, 'p', 167],
  ['Budynek nr 3', 'Sala seminaryjna 23', 28, 'm', 40],
  ['Budynek nr 3', 'Sala seminaryjna 24', 36, 'p', 40],
  ['Budynek nr 3', 'Sala seminaryjna 25', 30, '', 40],
  ['Budynek nr 3', 'Sala seminaryjna 26', 36, 'p', 40],
  ['Budynek nr 3', 'Sala seminaryjna 28', 30, '', 40],
  ['Budynek nr 3', 'Sala seminaryjna 34', 26, 'p', 40],
  ['Budynek nr 3', 'Sala seminaryjna 35', 49, 'p', 61],
  ['Budynek nr 3', 'Sala seminaryjna 37', 30, 'm', 36],
  ['Budynek nr 3', 'Sala konferencyjna', 40, 'm', 61],
  ['Budynek nr 20', 'Sala wykładowa 4', 160, 'p', 238],
  ['Budynek nr 20', 'Sala seminaryjna 56', 35, 'p', 68],
  ['Budynek nr 20', 'Sala seminaryjna 57', 24, 'p', 68],
  ['Budynek nr 20', 'Sala seminaryjna 58', 26, 'p', 300],
  ['Budynek nr 20', 'Sala seminaryjna 59', 62, 'p', 200],
  ['Budynek nr 20', 'Sala seminaryjna 60', 30, 'pm', 300],
  ['Budynek nr 20', 'Sala seminaryjna 61', 28, 'pm', 68],
  ['Budynek nr 20', 'Sala seminaryjna 62', 30, 'p', 96],
  ['Budynek nr 20', 'Sala seminaryjna 64', 26, 'p', 300],
  ['Budynek nr 25', 'Pojedyncza sala', '64–74', 'p', 120, 800],
  ['Budynek nr 25', 'Pakiet dwóch sal', '128–143', 'p', 230, 1680],
  ['Budynek nr 25', 'Pakiet trzech sal', '182–197', 'p', 340, 2560],
  ['Budynek nr 25', 'Cztery sale razem', '223–228', 'p', 400, 3040],
  ['Pozostałe', 'Pozostałe sale dydaktyczne i laboratoria', null, '', 49]
].map(([building, name, cap, eq, rate, day], i) => ({ id: 'r' + i, building, name, cap, eq, rate, day }));

/* Usługi dodatkowe – zał. 4 do Zarządzenia nr 63/2025/2026.
 * per: 'day' – cena × ilość × liczba dni; 'once' – cena × ilość; 'hourday' – cena × godziny × liczba dni.
 * group: own – tylko przy obiektach, które wskazują to id w polu extras. */
const EXTRAS = [
  { id: 'jupitery', group: 'own', label: 'Jupitery', price: 220, unit: 'zł/h', per: 'hourday', qtyLabel: 'h dziennie', max: 12 },
  { id: 'sauna', group: 'own', label: 'Sauna sucha (do 8 os.)', price: 150, unit: 'zł/h', per: 'hourday', qtyLabel: 'h dziennie', max: 12 },
  { id: 'szatnia-la', group: 'own', label: 'Szatnia przy Hali LA', price: 2000, unit: 'zł do 12 h', per: 'day', flag: true },
  { id: 'szatnia-hg', group: 'own', label: 'Szatnia przy Hali Gier (1 korytarz D/M)', price: 1000, unit: 'zł do 12 h', per: 'day', flag: true },
  { id: 'szatnia-pod-hg', group: 'own', label: 'Szatnia pod Halą Gier', price: 1000, unit: 'zł do 12 h', per: 'day', flag: true },
  { id: 'hol-hg', group: 'own', label: 'Hol przy Hali Gier', price: 500, unit: 'zł do 12 h', per: 'day', flag: true },
  { id: 'szatnia-sg4', group: 'own', label: 'Szatnia pod SG 4 (1 szatnia)', price: 500, unit: 'zł do 12 h', per: 'day', flag: true },
  { id: 'szatnia-sg1', group: 'own', label: 'Szatnia przy SG 1', price: 500, unit: 'zł do 12 h', per: 'day', flag: true },
  { id: 'nagl-hg', group: 'own', label: 'Nagłośnienie Hali Gier z obsługą', price: null, unit: 'wycena indywidualna', flag: true },
  { id: 'nagl-hala-la', group: 'own', label: 'Nagłośnienie Hali LA z obsługą', price: null, unit: 'wycena indywidualna', flag: true },
  { id: 'nagl-stadion', group: 'own', label: 'Nagłośnienie Stadionu LA z obsługą', price: null, unit: 'wycena indywidualna', flag: true },
  { id: 'prad-b6', group: 'own', label: 'Prąd na boisku nr 6 (impreza zamknięta)', price: 500, price4: 1000, unit: 'zł ryczałt, od 4 dni 1000 zł', per: 'lump', flag: true },
  { id: 'prad-poligon', group: 'own', label: 'Prąd na poligonie (impreza zamknięta)', price: 1000, price4: 2000, unit: 'zł ryczałt, od 4 dni 2000 zł', per: 'lump', flag: true },
  { id: 'podium', group: 'own', label: 'Podium 1-2-3', price: 200, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'barierki', group: 'own', label: 'Barierki niskie 2,5 × 1 m', price: 20, unit: 'zł/szt./dzień', per: 'day', qtyLabel: 'szt.', max: 80 },

  { id: 'maty', group: 'gear', label: 'Maty zabezpieczające parkiet', price: 6, unit: 'zł/m²/dzień', per: 'day', qtyLabel: 'm²', max: 200 },
  { id: 'krzesla', group: 'gear', label: 'Krzesła standard (drewniane)', price: 6, unit: 'zł/szt./dzień', per: 'day', qtyLabel: 'szt.', max: 100 },
  { id: 'krzesla-iso', group: 'gear', label: 'Krzesła tapicerowane (ISO)', price: 12, unit: 'zł/szt./dzień', per: 'day', qtyLabel: 'szt.', max: 160 },
  { id: 'lawy', group: 'gear', label: 'Ławy szkolne', price: 6, unit: 'zł/szt./dzień', per: 'day', qtyLabel: 'szt.', max: 50 },
  { id: 'stoly', group: 'gear', label: 'Stoły cateringowe', price: 15, unit: 'zł/szt./dzień', per: 'day', qtyLabel: 'szt.', max: 20 },
  { id: 'podest', group: 'gear', label: 'Podest/scena, moduł 1 × 2 m', price: 25, unit: 'zł/szt./dzień', per: 'day', qtyLabel: 'szt.', max: 16 },

  { id: 'p-b', group: 'parking', label: 'Parking B – 90 miejsc', price: 2750, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-rot', group: 'parking', label: 'Parking przy DS Rotacyjny, trawiasty – 140 miejsc', price: 3300, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-asf', group: 'parking', label: 'Parking asfaltowy – 60 miejsc', price: 2200, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-pol', group: 'parking', label: 'Parking Poligonu – 36+4 miejsca', price: 2200, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-e', group: 'parking', label: 'Parking E – 40 miejsc', price: 2200, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-h', group: 'parking', label: 'Parking H – 40 miejsc', price: 1650, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-d', group: 'parking', label: 'Parking D – 40 miejsc', price: 1100, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-g', group: 'parking', label: 'Parking G – 30 miejsc', price: 1650, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-f', group: 'parking', label: 'Parking F – 20 miejsc', price: 1650, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-c', group: 'parking', label: 'Parking C – 18 miejsc', price: 1100, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-j', group: 'parking', label: 'Parking J – 12 miejsc', price: 1100, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'p-szlaban', group: 'parking', label: 'Otwarcie szlabanu wyjazdowego (12 h)', price: 12000, unit: 'zł/12 h', per: 'day', flag: true },

  { id: 'plakat', group: 'promo', label: 'Plakaty A3 na terenie AWF', price: 25, unit: 'zł/szt./tydzień', per: 'once', qtyLabel: 'szt. × tyg.', max: 200 },
  { id: 'baner', group: 'promo', label: 'Baner', price: 30, unit: 'zł/m²/tydzień', per: 'once', qtyLabel: 'm² × tyg.', max: 200 },
  { id: 'stend', group: 'promo', label: 'Stendy (rollup, potykacz, wind)', price: 50, unit: 'zł/szt./tydzień', per: 'once', qtyLabel: 'szt. × tyg.', max: 50 },
  { id: 'hostessy', group: 'promo', label: 'Hostessy najemcy (do 2 osób)', price: 150, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'sampling', group: 'promo', label: 'Degustacja lub sampling (do 2 osób obsługi)', price: 150, unit: 'zł/dzień', per: 'day', flag: true },
  { id: 'stoisko', group: 'promo', label: 'Stoisko promocyjne do 2 m² (do 2 osób obsługi)', price: 300, unit: 'zł/dzień', per: 'day', flag: true }
];

const EXTRA_GROUPS = {
  own: 'Przy tym obiekcie',
  gear: 'Wyposażenie',
  parking: 'Parkingi',
  promo: 'Promocja na terenie AWF'
};

const CONTACTS = [
  { name: 'Daniel Lewandowski', email: 'daniel.lewandowski@awf.edu.pl', phone: '728 984 796' },
  { name: 'Kamila Andrzejczuk', email: 'kamila.andrzejczuk@awf.edu.pl', phone: '506 867 347' },
  { name: 'Sylwia Ćwik', email: 'sylwia.cwik@awf.edu.pl', phone: '880 167 943' }
];


const VAT_RATE = 0.23;
