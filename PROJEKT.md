# Wynajem obiektów AWF Warszawa – projekt strony

## Pliki
- `index.html` – strona (katalog obiektów, kalkulator, sale, kontakt)
- `data.js` – **cały cennik i opis obiektów w jednym miejscu**. Zmiana cennika = edycja tego pliku.
- `app.js` – logika kalkulatora, harmonogramu, filtrów i formularza zapytania
- `i18n.js` – teksty po polsku i angielsku (interfejs + tłumaczenia nazw z cennika)
- `NAZWY.md` – zestawienie nazw do ujednolicenia między stroną a cennikiem
- `deklaracja-dostepnosci.html` – projekt deklaracji dostępności (do uzupełnienia przez koordynatora)
- `WDROZENIE.md` – instrukcja dla IT, wyniki samooceny dostępności
- `fonts/` – czcionki hostowane lokalnie (RODO)
- `img/` – logotypy i zdjęcia pobrane z awf.edu.pl

## Ustalenia z AWF (06.10.2026)
- Bez rezerwacji online i kalendarza dostępności – dostępność prowadzi system uczelni, strona go nie zastępuje.
  Strona przygotowuje **zapytanie** (dane najemcy + terminy + kosztorys), które Dział Obiektów weryfikuje.
- Kalkulator sam liczy liczbę terminów i godzin z dat, dni tygodnia i godzin (z pominięciem świąt ustawowych),
  a dla wydarzeń – dni, godziny dzienne i nocne oraz pakiet 5 h / 12 h.
- Brak pakietów i rabatów dla stałych najemców – kalkulator stosuje wyłącznie stawki z cennika.
- Obiekty są wynajmowane także w święta i niedziele – kalkulator domyślnie liczy wszystkie wybrane dni; pomijanie świąt to opcja.
- Wersja angielska: przełącznik PL/EN w nagłówku.
- Nazwy sal: ujednolicone w projekcie, rozbieżności do poprawienia w cenniku i na www – patrz `NAZWY.md`.

## Źródła cennika (BIP AWF → Dokumenty → Zarządzenia Kanclerza)
- Zarządzenie Kanclerza nr 8/2024/2025 z 16.12.2024 r. – cenniki najmu (zał. 1–6)
  https://awf.edu.pl/__data/assets/pdf_file/0010/62479/8.pdf
  - zał. 1 – obiekty zewnętrzne, cele komercyjne: https://awf.edu.pl/__data/assets/pdf_file/0003/62481/zal-1-8.pdf
  - zał. 2 – obiekty wewnętrzne, cele komercyjne: https://awf.edu.pl/__data/assets/pdf_file/0006/62484/zal_2_8.pdf
- Zarządzenie Kanclerza nr 63/2025/2026 z 30.07.2026 r. (od 01.08.2026) – nowe brzmienie zał. 3–6
  https://awf.edu.pl/__data/assets/pdf_file/0008/72908/63.pdf
  - sale seminaryjne: https://awf.edu.pl/__data/assets/pdf_file/0009/72909/63_zal_1.pdf
  - obiekty wewnętrzne, cele sportowe: https://awf.edu.pl/__data/assets/pdf_file/0019/72910/63_zal_2.pdf
  - obiekty zewnętrzne, cele sportowe: https://awf.edu.pl/__data/assets/pdf_file/0020/72911/63_zal_3.pdf
  - usługi dodatkowe: https://awf.edu.pl/__data/assets/pdf_file/0003/72912/63_zal_4.pdf
- Poza zakresem kalkulatora: Zarządzenie nr 4/2024/2025 (czynsz za m² biur, magazynów, garaży)
  i nr 38/2025/2026 (pokoje w domach studenckich).

## Założenia przyjęte w kalkulatorze (do potwierdzenia z Działem Obiektów)
1. Pakiety „do 5 h” / „do 12 h”: do 5 h → stawka 5 h, 6–12 h → stawka 12 h.
2. Godziny nocne 22:00–6:00 (cele komercyjne) liczone dodatkowo: 150% lub 200% × (stawka 5 h / 5).
3. Dzień montażowy = ½ stawki do 12 h; poligon: montaż do 3 dni ½, dłużej ¼ stawki dobowej.
4. VAT 23% – cennik podaje ceny netto; stawkę należy potwierdzić z kwesturą.
5. „Stadion Rugby” na stronie = „Boisko nr 2” w cenniku – potwierdzone przez AWF.

## Niespójności znalezione w źródłach
- Budynek 19: strona www – Sala A taekwondo, Sala B fitness; cennik – Sala A fitness, Sala B taekwondo.
- Budynek 18: cennik zawiera sale A i B (sporty walki), strona www opisuje tylko sale C, D, E.
- Brak stron/zdjęć: Sala Tańca (bud. 4), Siłownia przy Hali LA, sala treningowa dolna, sale do korektywy.
- Sale s.s. 58, 60, 64 (bud. 20, 26–30 osób) po 300 zł/h – stawka jak aula; możliwa pomyłka w cenniku.
- Cennik nie różnicuje cen według rodzaju najemcy – tylko według celu (sportowy/komercyjny/szkoleniowy).
- Pływalnia ma tylko dwa starsze zdjęcia; Hala Gier bez numeru budynku na stronie.
