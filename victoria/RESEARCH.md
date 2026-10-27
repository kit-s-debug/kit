# Victoria Bookshop — research notes

Compiled 27 October 2026 for the website build. Everything on the site traces back
to a line in this file. Where sources disagree, the site says less, not more.

**How the research was done.** This build environment could run web searches but
could not open most web pages directly (Facebook, Bookshop.org, Hive, Google Maps,
image hosts and local press sites were all blocked). The facts below come from search
results that quote those pages, cross-checked against each other. Before launch,
someone at the shop should read the "Needs confirming" list at the bottom.

---

## Verified (two or more independent sources, or the shop's own words)

| Fact | Sources |
| --- | --- |
| 6 Bridge Street, Haverfordwest, SA61 2AD | Brief; Hive; Companies House PSC record; Cylex; Yell |
| 01437 762750 | Brief; Bookshop.org shop page; eBay profile; Yell |
| bethan@victoriabookshop.co.uk | Brief; Bookshop.org and Facebook list an address at victoriabookshop.co.uk |
| Family-run, independent | Bookshop.org shop page; Facebook; West Wales Life & Style |
| "We specialise in signed & local books." | Facebook page and eBay storefront (the shop's own words) |
| Many signed copies and local books are **not** listed on Bookshop.org | Bookshop.org shop page (the shop's own words) |
| Stocks fiction, history, gardening, biographies, travel guides, natural history and "lots of local books"; signed copies of recent titles | National Book Tokens stockist listing |
| National Book Tokens stockist | nationalbooktokens.com/stockist/victoria-bookshop-haverfordwest-1 |
| Self-description: "Fun, local, friendly." | LoveReading feature, 31 May 2021 |
| Has served the town "in one form or another since 1891"; began as stationers, newsagents, greeting cards, confectionery and tobacco | LoveReading (2021); Pembrokeshire Herald ("dates back to around 1891"); Yell |
| Marley Davies bought the shop on 1 May 1981, at 5 Victoria Place | LoveReading; Pembrokeshire Herald |
| In 1981 it traded "very much as a newsagent with very few books"; he expanded the book side | LoveReading |
| Moved to Bridge Street in 1996 | Pembrokeshire Herald (Coastal Cottages says "late nineties" — consistent) |
| Victoria Place terraces completed 1839, named for Queen Victoria's accession | Cadw listing via British Listed Buildings |
| May 2021: LoveReading "Bookshop of the Month" | lovereading.co.uk blog, by Joanne Owen |
| Bethan is the book buyer (named Bethan Davies in the Herald, Bethan Mason in LoveReading 2021) | Herald; LoveReading; National Book Tokens |
| *People Who Shaped Haverfordwest* by Mark Muller, for the town's 900th celebrations in 2010; the shop is its main outlet and Marley passes all sales money to the Civic Society | Haverfordwest Civic Society publications page |
| Hosts author events and signings, including local authors | Herald; LoveReading; Yelp reviewer |
| Bethan's recommendations in National Book Tokens' *Ask a Bookseller*: *Fresh Apples* (Rachel Trezise), *Fool for Love* (Deborah Moggach), *The Haunting Season* (her favourite); suggested Elif Shafak for a reader wanting women writers | nationalbooktokens.com/ask-a-bookseller/ask-victoria-bookshop |
| Signed copies the shop has listed (eBay / X): *The Killing Stones* (Ann Cleeves, sprayed edges), *Evil in High Places* (Rory Clements), *Empire of the Dawn* (Jay Kristoff), *Is That You, Petula?* (Petula Clark), *Redemption* (Jack Jordan, July 2024), *Rare Singles* (Benjamin Myers, sprayed edges, Aug 2024) | ebay.co.uk/str/victoriabookshop; x.com/Victoria_Books |
| Social accounts: Facebook /VictoriaBookshop, Instagram @victoriabookshop06, X @Victoria_Books, eBay store "victoriabookshop" | Search results for each profile |
| Victoria Bookshop Limited, company no. 03514234, active | Companies House |
| The Old Bridge (1726) and Bridge Street as part of the old thoroughfare to the Quay | Cadw listing; Haverfordwest Civic Society town trail |

## Deliberately **not** used

- **Augustus John's birthplace.** The Herald says 5 Victoria Place was his birthplace.
  Cadw notes the plaque there may be an error for No. 7, and the Dictionary of Welsh
  Biography and others give Tenby. Too contested to print.
- **"First floor" expansion.** One search summary mentioned it; another could not
  find it. Left out.
- **Loyalty scheme.** Mentioned in an article from c.2014. Not confirmed as current.
- **Customer reviews and ratings.** None quoted, none summarised as a score.
- **Prices.** None shown, including the Civic Society book's listed price.
- **Specific events.** A Max Boyce signing (Parthian Books blog) is years old.
  No current schedule was found, so the events component ships empty.

## Needs confirming before launch

1. **Opening hours.** Listings disagree: Mon–Sat 08:30–17:00 (Hive); Mon–Fri
   08:30–17:00, Sat 08:30–16:30 (Cylex, Nov 2025); Mon–Fri 09:00–16:00, Sat
   09:00–13:00 (Yell); Mon–Sat 09:00–17:00 (others). **Every source agrees it is
   closed on Sunday**, so that is the only hours claim on the site. Add confirmed
   hours in `index.html` (search for `HOURS`) and in the JSON-LD.
2. **Ordering service.** LoveReading quotes a customer whose obscure titles were
   sourced "in good time", and Cylex reviews mention special orders. The site says
   the shop is "happy to help" with orders by phone or email. Confirm that wording.
3. **Website domain.** The email domain is victoriabookshop.co.uk; the canonical URL,
   `og:url` and sitemap are left out until the live domain is confirmed.
4. **Children's books, Welsh-language books, cards and gifts.** Not confirmed as
   current stock, so they are not listed as categories.
5. **Whether the name "Victoria" comes from Victoria Place.** Likely, not confirmed.
   The site only states that the shop was at 5 Victoria Place in 1981.
6. **Bethan's surname** and whether she is happy to be named on the site.
7. **The six signed titles** are shown as *examples of what the shop has signed*,
   not as stock. Swap them for current signed stock if preferred.
8. **Photographs.** None could be downloaded. See README for the photo slots.

## Source list

- LoveReading, "May 2021 Bookshop of the Month: Victoria Bookshop" — https://www.lovereading.co.uk/blog/lovereading-bookshop-feature-victoria-bookshop-haverfordwest-wales-8467
- Pembrokeshire Herald, "Death of the book shop in Pembrokeshire?" — https://pembrokeshire-herald.com/8449/death-book-shop-pembrokeshire/
- National Book Tokens, Ask a Bookseller — https://www.nationalbooktokens.com/ask-a-bookseller/ask-victoria-bookshop
- National Book Tokens stockist — https://www.nationalbooktokens.com/stockist/victoria-bookshop-haverfordwest-1
- Bookshop.org — https://uk.bookshop.org/shop/victoriabookshop
- Hive — https://www.hive.co.uk/shops/victoria-bookshop-haverfordwest
- Facebook — https://www.facebook.com/VictoriaBookshop
- Instagram — https://www.instagram.com/victoriabookshop06/
- X — https://x.com/Victoria_Books
- eBay store — https://www.ebay.co.uk/str/victoriabookshop
- Haverfordwest Civic Society publications — https://haverfordwestcivicsociety.org.uk/publications.html
- Companies House — https://find-and-update.company-information.service.gov.uk/company/03514234
- Cadw listing, 5 Victoria Place — https://britishlistedbuildings.co.uk/300087073-5-victoria-place-haverfordwest-sa61-2jx-haverfordwest
- Cadw listing, The Old Bridge — https://britishlistedbuildings.co.uk/300012021-the-old-bridge-haverfordwest
- Coastal Cottages, Pembrokeshire's independent bookshops — https://www.coastalcottages.co.uk/inspiration/explore/pembrokeshires-independent-bookshops/
- Cylex, Yell, Hive, Herald.wales listings (hours comparison)
