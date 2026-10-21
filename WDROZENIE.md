# Wdrożenie produkcyjne – lista kontrolna dla IT

Strona jest statyczna: HTML, CSS i JavaScript, bez backendu, bazy danych i ciasteczek.
Przeglądarka zapisuje lokalnie (localStorage) tylko wybrany język PL/EN.
Do publikacji potrzebne są pliki: `index.html`, `data.js`, `i18n.js`, `app.js` i katalog `img/`.
Pliki `.md` to dokumentacja i nie muszą trafić na serwer.

## Do zmiany przed publikacją

1. **Indeksowanie** – w `index.html` usunąć `<meta name="robots" content="noindex, nofollow">`.
   Ta blokada chroni wersję prototypową na GitHubie.
2. **Ustawienia w `data.js`** (blok `SITE` na początku pliku):
   - `concept: false` – ukrywa pasek „Projekt koncepcyjny”,
   - `enquiryEmail: '…'` – adres, na który przycisk „Otwórz w programie pocztowym” kieruje zapytanie
     (np. wspólna skrzynka działu wynajmu; bez tego pola klient sam wpisuje adresata).
3. **Czcionki (RODO)** – strona pobiera czcionki z Google Fonts, przez co adres IP odwiedzającego trafia do Google.
   Zalecane jest hostowanie czcionek na serwerze AWF: Barlow Condensed i Source Sans 3, obie na licencji OFL.
   Wystarczy podmienić `<link … fonts.googleapis.com …>` w `index.html` na lokalne `@font-face`.
4. **Ceny** – potwierdzić z Działem Obiektów aktualność cennika i założenia z `PROJEKT.md`
   (pakiety 5 h / 12 h, godziny nocne, dzień montażowy, VAT 23%).
   Cały cennik jest w `data.js`, a każda zmiana zarządzenia oznacza edycję tylko tego pliku.
5. **Linki zewnętrzne** – sprawdzić, czy adresy podstron obiektów na awf.edu.pl, BIP i plan kampusu (PDF) są aktualne.
6. **Dostępność cyfrowa** – uczelnia publiczna musi spełniać ustawę z 4.04.2019 r. o dostępności cyfrowej.
   Trzeba przeprowadzić audyt WCAG 2.1 AA i opublikować deklarację dostępności dla subdomeny.
   W projekcie są już: kontrast w trybie jasnym i ciemnym, widoczny fokus, etykiety pól, teksty alternatywne i obsługa klawiatury.
7. **Serwer** – HTTPS. Proponowane nagłówki bezpieczeństwa: Content-Security-Policy z `script-src 'self'`,
   `img-src 'self' data:`, `style-src 'self' 'unsafe-inline'` (style są osadzone w stronie),
   a do tego `X-Content-Type-Options: nosniff` i `Referrer-Policy: strict-origin-when-cross-origin`.

## Uwagi IT – jak zostały uwzględnione

- **Kalkulator działa po stronie klienta, użytkownik może zmienić kod.** To prawda i dlatego wyliczenie nie jest wiążące.
  Na stronie i w treści każdego zapytania jest teraz zastrzeżenie: wyliczenie ma charakter informacyjny,
  nie stanowi oferty w rozumieniu art. 66 k.c., a wiążącą cenę podaje Dział Obiektów po weryfikacji.
  Dział Obiektów zawsze przelicza cenę według cennika, a kwota z zapytania służy tylko orientacyjnie.
- **Formularz** nie wysyła danych na żaden serwer. Tworzy treść zapytania do skopiowania albo otwiera program pocztowy (mailto).
  Strona nie zbiera więc danych osobowych.
  Jeśli w przyszłości formularz ma wysyłać dane bezpośrednio, potrzebne będą: skrypt po stronie serwera,
  klauzula informacyjna RODO, zabezpieczenie przed spamem i ponowne przeliczenie ceny na serwerze.

## Scenariusze testowe (wynik oczekiwany, netto)

| # | Ustawienia | Oczekiwany wynik |
|---|---|---|
| 1 | Klub sportowy → Treningi → Hala Gier → Co tydzień, wtorek, 18:00–20:00, 13.10.2026–29.12.2026 | 12 terminów × 2 h = 24 h; **7 920,00 zł** netto, 9 741,60 zł brutto |
| 2 | j.w., zaznaczone wtorek i środa, „Pomiń dni ustawowo wolne” | 22 terminy (pominięty 11.11.2026); **14 520,00 zł** |
| 3 | Firma → Wydarzenie komercyjne → Hala Gier → 1 dzień, 16:00–24:00 | pakiet do 12 h 12 000 zł + 2 h nocne × 2 400 zł; **16 800,00 zł** |
| 4 | Treningi → Pływalnia → Tor basenu, 3 tory → Jednorazowo, 2 h | 137 × 2 × 3 = **822,00 zł** |
| 5 | Wydarzenie komercyjne → Poligon → do 1000 osób, 2 dni, 1 dzień montażu | 13 500 × 2 + 6 750 = **33 750,00 zł** |
| 6 | Szkolenie → Budynek nr 25 → Pakiet dwóch sal → Najem na cały dzień, 2 dni | 1 680 × 2 = **3 360,00 zł** |
| 7 | Formularz zapytania: wypełnić pola, „Przygotuj treść zapytania” | treść z terminami, kosztorysem i zastrzeżeniem; działa kopiowanie i otwieranie poczty |
| 8 | Przełącznik EN | wszystkie teksty, nazwy obiektów i treść zapytania po angielsku |
