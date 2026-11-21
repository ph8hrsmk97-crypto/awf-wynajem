<?php
/*
 * Wysyłka zapytania z formularza wynajem.awf.edu.pl na skrzynkę Działu Obiektów.
 * Strona (app.js) wysyła tu dane metodą POST (JSON). Skrypt NIE zapisuje danych – tylko wysyła jeden e-mail.
 *
 * Konfiguracja dla IT – poniższe stałe:
 *   TO        – skrzynka, na którą trafiają zapytania (reguły w niej rozdzielają je wg oznaczeń w temacie),
 *   FROM      – adres nadawcy, z którego serwer może wysyłać pocztę (SPF/DKIM domeny awf.edu.pl),
 *   ORIGIN    – adres strony; zapytania z innych stron są odrzucane.
 * Wymaga PHP 7.4+ i działającej funkcji mail() (sendmail/postfix lub przekaźnik SMTP skonfigurowany na serwerze).
 * Odpowiedź tego zawodzi → strona sama pokazuje zapasowy przycisk „Wyślij zapytanie e-mailem” (mailto).
 */

const TO     = 'wynajem@awf.edu.pl';
const FROM   = 'wynajem@awf.edu.pl';
const ORIGIN = 'https://wynajem.awf.edu.pl';
const TAGS   = ['FILM', 'PROMOCJA', 'PIKNIK', 'EVENT', 'PLYWALNIA', 'PILKA', 'SALE', 'INNE'];
const LIMIT_COUNT = 5;      /* maks. zapytań z jednego adresu IP… */
const LIMIT_WINDOW = 600;   /* …w ciągu 10 minut */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') reply(405, ['ok' => false, 'error' => 'method']);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $origin !== ORIGIN) reply(403, ['ok' => false, 'error' => 'origin']);

$raw = file_get_contents('php://input', false, null, 0, 60001);
if ($raw === false || strlen($raw) > 60000) reply(413, ['ok' => false, 'error' => 'size']);
$in = json_decode($raw, true);
if (!is_array($in)) reply(400, ['ok' => false, 'error' => 'json']);

/* Pułapka na roboty: ukryte pole wypełnione albo formularz wysłany szybciej niż w 3 s → udajemy sukces, nic nie wysyłamy. */
if (trim((string)($in['website'] ?? '')) !== '' || (int)($in['ms'] ?? 0) < 3000) reply(200, ['ok' => true]);

/* Pola tekstowe: bez znaków sterujących; w polach do nagłówka także bez nowych linii. */
function field($v, int $max, bool $multiline = false): string {
    $s = is_string($v) ? $v : '';
    $s = $multiline ? preg_replace('/[^\P{C}\n\t]/u', '', $s) : preg_replace('/\p{C}/u', ' ', $s);
    $s = trim((string)$s);
    return mb_substr($s, 0, $max, 'UTF-8');
}
$name    = field($in['name'] ?? '', 200);
$person  = field($in['person'] ?? '', 200);
$email   = field($in['email'] ?? '', 200);
$subject = field($in['subject'] ?? '', 200);
$text    = field($in['text'] ?? '', 30000, true);
if ($name === '' || $person === '' || $text === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) reply(400, ['ok' => false, 'error' => 'fields']);
$tags = array_values(array_intersect(TAGS, is_array($in['tags'] ?? null) ? $in['tags'] : []));
if (!$tags) $tags = ['INNE'];

/* Limit zapytań z jednego IP (plik w katalogu tymczasowym; zapisywany jest tylko skrót adresu IP i godziny). */
$dir = sys_get_temp_dir() . '/awf-wynajem-limit';
if (!is_dir($dir)) @mkdir($dir, 0700, true);
$file = $dir . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$now = time();
$hits = array_filter(array_map('intval', @file($file, FILE_IGNORE_NEW_LINES) ?: []), fn($x) => $x > $now - LIMIT_WINDOW);
if (count($hits) >= LIMIT_COUNT) reply(429, ['ok' => false, 'error' => 'limit']);
$hits[] = $now;
@file_put_contents($file, implode("\n", $hits), LOCK_EX);

$subj = implode('', array_map(fn($t) => "[$t]", $tags)) . ' ' . ($subject !== '' ? $subject : 'Zapytanie o wynajem');
$body = $text . "\n\n---\nZapytanie wysłane z formularza na stronie " . ORIGIN . ' (' . date('d.m.Y H:i') . ").\n"
      . "Odpowiedz na tę wiadomość – odpowiedź trafi do: $person <$email>.\n";

$headers = implode("\r\n", [
    'From: =?UTF-8?B?' . base64_encode('Wynajem obiektów AWF – formularz') . '?= <' . FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
]);
$ok = mail(TO, '=?UTF-8?B?' . base64_encode($subj) . '?=', chunk_split(base64_encode($body)), $headers, '-f' . FROM);

reply($ok ? 200 : 500, $ok ? ['ok' => true] : ['ok' => false, 'error' => 'mail']);
