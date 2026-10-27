# Wdrożenie produkcyjne – lista kontrolna dla IT

> **Stan na 2026-10-23:** strona działa na https://wynajem.awf.edu.pl (na razie tylko w sieci pracowniczej).
> Repozytorium zawiera już wersję produkcyjną: lokalne czcionki (`fonts/`), `concept: false`, bez blokady indeksowania,
> z poprawionymi zakresami `unicode-range` oraz nowymi plikami poniżej. Wystarczy podmienić pliki na serwerze.

## Zmiany od pierwszego wdrożenia (do podmiany na serwerze)

- `index.html` – poprawione `unicode-range` w 5 blokach `@font-face` (było `U+20AD-C0` / `U+20AD-C4`),
  link „Przejdź do treści” dla użytkowników klawiatury, mocniejsza nakładka na zdjęciu w nagłówku (kontrast WCAG AA także na telefonie),
  link do deklaracji dostępności w stopce, metatag `deklaracja-dostępności`.
- `app.js`, `i18n.js` – opisy miniatur zdjęć („Zdjęcie 1 z 2”), nowe teksty PL/EN.
- `deklaracja-dostepnosci.html` – **nowy plik**, projekt deklaracji dostępności (do uzupełnienia przez koordynatora ds. dostępności).
- `fonts/` – te same pliki co na serwerze (Fontsource, licencja OFL), dodane do repozytorium.

## Uwagi do konfiguracji serwera (z testu 2026-10-23)

- Cloudflare dokleja do strony skrypt wykrywania botów (`/cdn-cgi/challenge-platform/…`), który blokuje CSP – w konsoli przeglądarki jest błąd.
  Strona działa; można wyłączyć tę funkcję dla subdomeny albo zostawić.
- CSP nadal dopuszcza `fonts.googleapis.com` i `fonts.gstatic.com` – można je usunąć, czcionki są lokalne.
- Jeśli włączona jest analityka Cloudflare (`static.cloudflareinsights.com`), należy ją uwzględnić w polityce prywatności.

## Informacje ogólne

Strona jest statyczna: HTML, CSS i JavaScript, bez backendu, bazy danych i ciasteczek.
Przeglądarka zapisuje lokalnie (localStorage) tylko wybrany język PL/EN.
Do publikacji potrzebne są pliki: `index.html`, `data.js`, `i18n.js`, `app.js` i katalog `img/`.
Pliki `.md` to dokumentacja i nie muszą trafić na serwer.

## Lista kontrolna (pierwsze wdrożenie – punkty 1–3 wykonane przez IT)

1. **Indeksowanie** – w `index.html` usunąć `<meta name="robots" content="noindex, nofollow">`.
   Ta blokada chroni wersję prototypową na GitHubie.
2. **Ustawienia w `data.js`** (blok `SITE` na początku pliku):
   - `concept: false` – ukrywa pasek „Projekt koncepcyjny”,
   - `enquiryEmail: '…'` – adres, na który przycisk „Otwórz w programie pocztowym” kieruje zapytanie
     – ustawione: `wynajem@awf.edu.pl`; **IT: potwierdzić, że skrzynka istnieje i ktoś ją obsługuje**.
3. **Czcionki (RODO)** – strona pobiera czcionki z Google Fonts, przez co adres IP odwiedzającego trafia do Google.
   Zalecane jest hostowanie czcionek na serwerze AWF: Barlow Condensed i Source Sans 3, obie na licencji OFL.
   Wystarczy podmienić `<link … fonts.googleapis.com …>` w `index.html` na lokalne `@font-face`.
4. **Ceny** – potwierdzić z Działem Obiektów aktualność cennika i założenia z `PROJEKT.md`
   (pakiety 5 h / 12 h, godziny nocne, dzień montażowy, VAT 23%).
   Cały cennik jest w `data.js`, a każda zmiana zarządzenia oznacza edycję tylko tego pliku.
5. **Linki zewnętrzne** – sprawdzić, czy adresy podstron obiektów na awf.edu.pl, BIP i plan kampusu (PDF) są aktualne.
6. **Dostępność cyfrowa** – projekt deklaracji jest w `deklaracja-dostepnosci.html` (link w stopce każdej strony).
   Przed publikacją koordynator ds. dostępności uzupełnia pola oznaczone na żółto i usuwa żółte ostrzeżenie na górze. Szczegóły w sekcji niżej.
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

## Deklaracja dostępności – co uzupełnić (koordynator ds. dostępności)

Projekt: `deklaracja-dostepnosci.html` (PL) i `deklaracja-dostepnosci-en.html` (EN) – przebudowane 2026-10-27 po uwagach pełnomocnik ds. dostępności
według aktualnego przykładu MC: https://www.gov.pl/web/dostepnosc-cyfrowa/deklaracja-dostepnosci-przyklad (formuły, nazwy sekcji, daty słownie).
Mapa kampusu: wyłączenie na podstawie art. 3 ust. 2 pkt 4 ustawy (t.j. Dz.U. 2023 poz. 1440), informacje z mapy podane tekstem.

Do uzupełnienia (pola na żółto):
- daty: publikacji strony dla wszystkich, ostatniej istotnej aktualizacji, sporządzenia i przeglądu deklaracji (format: dzień miesiąc słownie rok, np. 15 listopada 2026 r.),
- termin uzupełnienia opisów zdjęć (sekcja „Plany likwidacji błędów”),
- osoba kontaktowa i telefon (adres e-mail pelnomocnik.ozn@awf.edu.pl i kod pocztowy 00-968 potwierdzone 2026-10-24;
  uwaga: w deklaracji serwisu awf.edu.pl adres jest zapisany z literą „ł”, a kod do skarg jako 01-986 – do poprawienia tam),
- dostępność architektoniczna obiektów sportowych do wynajęcia (wejścia, szatnie, trybuny, pętle indukcyjne),
- wstęp z psem asystującym (obowiązkowy element; brak go w deklaracji awf.edu.pl),
- tłumacz PJM online (czy jest możliwy).

Wyniki samooceny (2026-10-23):
- automatyczny test axe-core 4.10 (WCAG 2.1 A i AA): deklaracja – 0 błędów; strona główna – zgłoszenia wyłącznie fałszywie pozytywne
  (tekst na zdjęciu z nakładką i w ciemnej stopce; narzędzie nie odczytuje tła), sprawdzone ręcznie,
- ręczne obliczenie kontrastu wszystkich kolorów tekstu w trybie jasnym i ciemnym – wszystkie co najmniej 4,5:1 (najgorszy przypadek: jasne niebo pod nakładką),
- obsługa klawiaturą: link „Przejdź do treści”, widoczny fokus, okna dialogowe zamykane klawiszem Esc,
- **nie wykonano** testu z czytnikiem ekranu (NVDA / VoiceOver) – zalecany przed zatwierdzeniem deklaracji,
- status w projekcie: „częściowo zgodna” (opisy alternatywne zdjęć zawierają tylko nazwę obiektu).
