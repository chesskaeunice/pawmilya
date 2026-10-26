<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use SimpleXMLElement;
use Throwable;

// Public pet care articles from the RSS feeds in config/pet_care_feeds.php. No API key needed.
class PetCareArticleController extends Controller
{
    private const CACHE_KEY = 'pet-care-articles-v2';
    private const MEDIA_NS = 'http://search.yahoo.com/mrss/';
    private const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/';

    public function index(): JsonResponse
    {
        // A broken cache store must never turn into a 500: it just means no cache
        try {
            $articles = Cache::get(self::CACHE_KEY);
        } catch (Throwable) {
            $articles = null;
        }

        if (! is_array($articles)) {
            $articles = $this->collect();

            // Only a good result is cached, so an outage is retried on the next request
            if ($articles !== []) {
                try {
                    Cache::put(self::CACHE_KEY, $articles, now()->addHour());
                } catch (Throwable) {
                    // served without caching
                }
            }
        }

        return response()->json(['data' => $articles]);
    }

    // Newest first across all feeds; a feed that fails is skipped, never an error
    private function collect(): array
    {
        $feeds = config('pet_care_feeds.feeds');

        try {
            $responses = Http::pool(fn (Pool $pool) => array_map(
                fn ($feed) => $pool->timeout(config('pet_care_feeds.timeout'))
                    ->withUserAgent('Mozilla/5.0 (compatible; PawmilyaBot/1.0)')
                    ->get($feed['url']),
                $feeds
            ));
        } catch (Throwable) {
            return [];
        }

        $articles = [];

        foreach ($feeds as $index => $feed) {
            $response = $responses[$index] ?? null;

            // A feed that timed out comes back as an exception object, not a response
            if (! $response instanceof \Illuminate\Http\Client\Response) {
                continue;
            }

            try {
                if (! $response->successful()) {
                    continue;
                }

                foreach ($this->parse($response->body(), $feed['source']) as $article) {
                    $articles[$article['url']] = $article;
                }
            } catch (Throwable) {
                continue;
            }
        }

        // ISO 8601 strings in the same offset sort correctly; undated items go last
        usort($articles, fn ($a, $b) => strcmp($b['publishedAt'] ?? '', $a['publishedAt'] ?? ''));

        return array_slice($articles, 0, config('pet_care_feeds.limit'));
    }

    private function parse(string $body, string $source): array
    {
        try {
            $previous = libxml_use_internal_errors(true);
            $xml = simplexml_load_string($body, SimpleXMLElement::class, LIBXML_NONET);
            libxml_use_internal_errors($previous);

            if ($xml === false) {
                return [];
            }

            // RSS 2.0 (channel/item) or Atom (entry)
            $items = isset($xml->channel->item) ? $xml->channel->item : $xml->entry;
            $articles = [];

            foreach ($items as $item) {
                $article = $this->shape($item, $source);

                if ($article !== null) {
                    $articles[] = $article;
                }
            }

            return $articles;
        } catch (Throwable) {
            return [];
        }
    }

    private function shape(SimpleXMLElement $item, string $source): ?array
    {
        $url = trim((string) ($item->link['href'] ?? '') ?: (string) $item->link);
        $title = $this->text((string) $item->title);

        // Only real web links; anything else would be an unsafe href
        if ($title === '' || ! preg_match('#^https?://#i', $url)) {
            return null;
        }

        $summary = (string) ($item->description ?? '') ?: (string) ($item->summary ?? '');
        $content = (string) $item->children(self::CONTENT_NS)->encoded ?: (string) ($item->content ?? '');

        return [
            'id' => md5($url),
            'title' => $title,
            'source' => $source,
            'url' => $url,
            'publishedAt' => $this->date((string) ($item->pubDate ?? '') ?: (string) ($item->published ?? '') ?: (string) ($item->updated ?? '')),
            'excerpt' => Str::limit($this->text($summary ?: $content), config('pet_care_feeds.excerpt_length'), '...', true),
            'image' => $this->image($item, $summary.' '.$content),
        ];
    }

    // media:content, media:thumbnail, enclosure, then the first real <img> in the text
    private function image(SimpleXMLElement $item, string $html): ?string
    {
        $media = $item->children(self::MEDIA_NS);
        $enclosureType = $this->attribute($item->enclosure, 'type') ?? 'image';
        $candidates = [
            $this->attribute($media->content, 'url'),
            $this->attribute($media->thumbnail, 'url'),
            str_starts_with($enclosureType, 'image') ? $this->attribute($item->enclosure, 'url') : null,
        ];

        if (preg_match_all('/<img[^>]+src=["\']([^"\']+)["\']/i', html_entity_decode($html), $matches)) {
            array_push($candidates, ...$matches[1]);
        }

        foreach ($candidates as $candidate) {
            $candidate = trim((string) $candidate);

            // Skip lazy-load placeholders and tracking pixels
            if (preg_match('#^https?://#i', $candidate) && ! preg_match('/placeholder|spacer|pixel|blank\.gif/i', $candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    // attributes() is needed on namespaced elements; ['name'] looks in the wrong namespace there
    private function attribute(?SimpleXMLElement $element, string $name): ?string
    {
        $value = $element?->attributes()[$name] ?? null;

        return $value === null ? null : (string) $value;
    }

    private function date(string $value): ?string
    {
        try {
            return $value === '' ? null : Carbon::parse($value)->utc()->toIso8601String();
        } catch (Throwable) {
            return null;
        }
    }

    // Plain text: no tags, decoded entities, single spaces
    private function text(string $html): string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim(preg_replace('/\s+/u', ' ', str_replace("\u{00A0}", ' ', $text)));
    }
}
