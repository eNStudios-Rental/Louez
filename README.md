# 📦 Louez — Platforma Zarządzania Wypożyczalnią Sprzętu

> **Centralne Źródło Prawdy (Single Source of Truth)**  
> Niniejszy dokument stanowi punkt startowy oraz oficjalny przewodnik dla wszystkich obecnych i przyszłych członków zespołu deweloperskiego projektu **Louez** (eNStudios). Znajdziesz tutaj mapę architektury, zasady pracy, instrukcję uruchomienia środowiska lokalnego oraz odnośniki do szczegółowej dokumentacji w katalogu [`docs/`](docs/).

---

## 🎯 Czym jest Louez?

**Louez** to nowoczesna, otwarta platforma do kompleksowego zarządzania wypożyczalnią sprzętu (m.in. sprzęt AV/filmowy, narzędzia, pojazdy, sprzęt eventowy).

System działa w architekturze **multi-tenant** i udostępnia:

1. **Panel administracyjny (`/dashboard` lub `app.twojadomena.pl`):**
   - Zarządzanie asortymentem, jednostkami magazynowymi (track units) i cennikami (stawki godzinowe, dzienne, okresy sezonowe, ceny negocjowalne).
   - Obsługa rezerwacji: statusy, kaucje, płatności online (Stripe) i stacjonarne, kalendarz operacyjny.
   - Protokoły zdawczo-odbiorcze (inspekcje sprzętu, zdjęcia stanu, podpisy).
   - Fakturowanie i rachunki (w tym integracje PDP / Factur-X / KSeF).
   - Baza klientów B2C i B2B.
   - Wielojęzyczność (13 wbudowanych języków, w tym PL, EN, FR, DE, ES, IT).
2. **Publiczne witryny sklepowe dla klientów (`/` lub `{store}.twojadomena.pl`):**
   - Prezentacja katalogu produktów z dostępnością w czasie rzeczywistym.
   - Koszyk z wyborem przedziału dat i godzin, automatycznym naliczaniem stawek i kaucji.
   - Bezhasłowe logowanie klientów (OTP / magic link) i podgląd historii rezerwacji.
3. **Moduł Asystenta AI:**
   - **Storefront AI Advisor:** wirtualny doradca klienta na stronie sklepu, sprawdzający dostępność i sugerujący produkty.
   - **AI Voice Receptionist:** recepcjonista telefoniczny (Twilio + ElevenLabs + Deepgram) odbierający połączenia, odpowiadający na pytania o asortyment i rejestrujący wstępne rezerwacje.
   - **Automatyczne usuwanie tła (`rembg`):** worker AI do wycinania tła ze zdjęć produktów jednym kliknięciem.

---

## 🏗️ Stos Technologiczny (Imposed Stack)

Projekt wykorzystuje ściśle określony, nowoczesny ekosystem technologiczny (zob. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)):

| Warstwa                    | Technologia                                                                                | Zastosowanie                                                     |
| :------------------------- | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **Monorepo**               | [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)                               | Koordynacja workspace'ów, szybki cache zadań                     |
| **Główna Aplikacja**       | [Next.js 15+ (App Router)](https://nextjs.org/)                                            | Serwer SSR/RSC, Server Actions, storefront i dashboard           |
| **Język**                  | [TypeScript](https://www.typescriptlang.org/) (Strict Mode)                                | Pełne, end-to-end typowanie od bazy po UI                        |
| **Baza Danych**            | [MySQL 8.4](https://www.mysql.com/) + [Drizzle ORM](https://orm.drizzle.team/)             | Relacyjna baza danych i typowane zapytania                       |
| **Autoryzacja**            | [Better Auth](https://www.better-auth.com/)                                                | Sesje, role (owner, admin, member), Google OAuth, kody logowania |
| **Warstwa API**            | [oRPC](https://orpc.dev/)                                                                  | Type-safe RPC routery dla komunikacji modułów                    |
| **Zarządzanie Stanem**     | [TanStack Query v5](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs/) | Server cache & client state                                      |
| **Formularze i Walidacja** | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev/)                       | Reaktywne formularze z walidacją po stronie klienta i serwera    |
| **Style & UI**             | [Tailwind CSS 4](https://tailwindcss.com/) + [@base-ui/react](https://base-ui.com/)        | Dostępne, modularne komponenty i spójny design system            |
| **Formatowanie i Linting** | [Oxfmt](https://oxc.rs/) + [Oxlint](https://oxc.rs/)                                       | Błyskawiczny tooling nowej generacji                             |

---

## 📁 Struktura Monorepo

```
Louez/
├── apps/
│   ├── web/                    # Główna aplikacja Next.js (Storefront, Dashboard, API routes)
│   ├── voice-relay/            # Serwer WebSocket do streamingu głosu AI (Twilio <-> ElevenLabs)
│   └── background-removal/     # Worker w Pythonie do usuwania tła ze zdjęć (rembg)
│
├── packages/
│   ├── api/                    # Routery oRPC i serwisy biznesowe
│   ├── auth/                   # Konfiguracja Better Auth i adapter sesji
│   ├── config/                 # Wspólne konfiguracje TypeScript, Tailwind i narzędzi
│   ├── db/                     # Schemat bazy danych (Drizzle), migracje i seedery
│   ├── email/                  # Szablony React Email i adaptery wysyłki SMTP/Resend
│   ├── mcp/                    # Model Context Protocol server (integracja z agentami AI)
│   ├── pdf/                    # Generowanie umów i protokołów w React-PDF
│   ├── types/                  # Wspólne interfejsy domenowe
│   ├── ui/                     # System komponentów UI (@base-ui/react + Tailwind)
│   ├── utils/                  # Uniwersalne funkcje pomocnicze (kalkulacja cen, formatowanie)
│   └── validations/            # Schematy Zod współdzielone między frontem a backendem
│
├── docs/                       # Kompletna dokumentacja projektowa i procedury
├── docker/                     # Pliki Dockerfile i konfiguracja obrazów produkcyjnych
├── docker-compose.yml          # Definicja kontenerów dla instalacji produkcyjnej / stagingu
└── update.sh                   # Automatyczny skrypt aktualizacji na serwerze produkcyjnym
```

---

## 📚 Indeks Dokumentacji (`docs/`)

Przed rozpoczęciem pisania kodu zapoznaj się z odpowiednimi dokumentami w [`docs/`](docs/):

### 1. Praca codzienna i wdrożenia

- 🚀 [**docs/workflow.md**](docs/workflow.md) — **Obowiązkowy przewodnik dla każdego programisty.** Opisuje tworzenie gałęzi, Conventional Commits, lokalne bramki jakości, rozwiązywanie konfliktów oraz proces wdrożenia na serwer.
- 📋 [**docs/code-review/07-checklist.md**](docs/code-review/07-checklist.md) — Skondensowana lista kontrolna do weryfikacji przed każdym commitem.
- 🔍 [**docs/code-review/**](docs/code-review/) — Zasady pisania kodu: TypeScript, React, warstwa danych, bezpieczeństwo, style.

### 2. Architektura i Konwencje

- 🏛️ [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) — Oficjalny przewodnik architektoniczny i zasady monorepo.
- 📖 [**docs/domain/glossary.md**](docs/domain/glossary.md) — Kanoniczny słownik pojęć domenowych (Store, Reservation, Unit, Tier, Consumable).
- 📦 [**docs/architecture/module-ownership.md**](docs/architecture/module-ownership.md) — Podział odpowiedzialności między pakietami.
- 🤖 [**AGENTS.md**](AGENTS.md) — Wytyczne i zasady pracy dla asystentów AI (Claude, Codex, Antigravity).

### 3. Integracje i Moduły Specjalne

- 🛡️ [**docs/integrations/architecture.md**](docs/integrations/architecture.md) — Architektura integracji zewnętrznych (Stripe, Tulip, Kalendarze).
- 📞 [**docs/ai-phone-receptionist.md**](docs/ai-phone-receptionist.md) — Działanie asystenta telefonicznego i protokołu ConversationRelay.
- 🧪 [**docs/testing/storefront-qa.md**](docs/testing/storefront-qa.md) — Procedury testów automatycznych i QA storefrontu.

---

## 🚀 Szybki Start (Lokalne Środowisko Deweloperskie)

### Wymagania wstępne:

- **Node.js**: wersja `>= 22.0.0`
- **pnpm**: wersja `10.27.0` (zalecane użycie [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`)
- **Docker & Docker Compose**: do uruchomienia lokalnej bazy danych MySQL i MinIO

### 1. Klonowanie i instalacja zależności

```bash
git clone https://github.com/eNStudios-Rental/Louez.git
cd Louez

# Włącz Corepack (jeśli jeszcze nie używasz pnpm 10)
corepack enable

# Zainstaluj zależności monorepo
pnpm install
```

### 2. Konfiguracja zmiennych środowiskowych

Skopiuj przykładowe pliki środowiskowe do plików lokalnych:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
```

_(Dla lokalnego uruchomienia domyślne wartości w plikach `.env` są wystarczające do działania aplikacji)._

### 3. Uruchomienie lokalnej bazy danych (Docker)

W osobnym terminalu uruchom bazę MySQL i magazyn MinIO:

```bash
docker compose up -d db minio
```

### 4. Inicjalizacja schematu bazy danych

Zsynchronizuj schemat tabel z bazą i opcjonalnie załaduj dane demonstracyjne:

```bash
# Wypchnięcie schematu Drizzle do bazy
pnpm db:push

# (Opcjonalnie) Załadowanie przykładowych produktów i rezerwacji do testów
pnpm db:seed:demo
```

### 5. Uruchomienie serwera deweloperskiego

```bash
# Uruchomienie głównej aplikacji webowej
pnpm dev:web

# LUB uruchomienie wszystkich aplikacji monorepo naraz
pnpm dev
```

Aplikacja jest dostępna pod adresem: [**http://localhost:3000**](http://localhost:3000) 🎉

- Panel administracyjny: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🛡️ Bramki Jakości Kodu (Quality Gates)

Zanim zgłosisz Pull Request, Twój kod **musi** spełniać 3 wymogi jakościowe:

```bash
# 1. Formatowanie kodu (Oxfmt)
pnpm format:check       # Sprawdzenie
pnpm format             # Automatyczna naprawa

# 2. Linter i brak duplikatów (Oxlint)
pnpm lint

# 3. Weryfikacja typów TypeScript w całym monorepo
pnpm type-check

# Skrót: uruchomienie lintera i type-checka naraz
pnpm check
```

---

## 🚢 Cykl Wdrożeniowy (CI/CD i Produkcja)

Nasz pipeline wdrożeniowy gwarantuje stabilność środowiska produkcyjnego:

1. **Pull Request do `main`:**
   - GitHub Actions uruchamia workflow `CI` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
   - Sprawdzane są: formatowanie (`oxfmt`), linter (`oxlint`) oraz typowanie (`turbo run type-check`).
   - Żaden kod z błędami typów nie może zostać dołączony do `main`.
2. **Tworzenie Wydania (Release):**
   - Merge do `main` **nie wdraża** kodu automatycznie.
   - Wdrożenie następuje po utworzeniu taga/wydania w GitHubie (np. `v3.0.1`) zgodnie z zasadami **SemVer**.
3. **Pipeline Produkcyjny ([`.github/workflows/docker.yml`](.github/workflows/docker.yml)):**
   - Wykonuje testy dymne kontenerów.
   - Buduje i publikuje zoptymalizowane obrazy do GitHub Container Registry (`ghcr.io`).
   - Wstrzymuje proces w oczekiwaniu na **zatwierdzenie przez wyznaczonego członka zespołu** (_Required Reviewers_ w środowisku `production`).
4. **Wdrożenie na serwerze:**
   - Po zatwierdzeniu dedykowany **GitHub Runner** na serwerze Debian autoryzuje się w GHCR, synchronizuje pliki i wykonuje [`update.sh`](update.sh).
   - Skrypt bezpiecznie pobiera nowe obrazy, restartuje kontenery (`docker compose up -d --remove-orphans`) i weryfikuje healthcheck (`/api/health`).

> Szczegółowy podręcznik krok po kroku z instrukcją rozwiązywania awarii znajdziesz w dokumencie [**docs/workflow.md**](docs/workflow.md).

---

## 🤝 Przydatne Polecenia (Drizzle, Baza, Narzędzia)

```bash
pnpm db:push          # Natychmiastowa synchronizacja schematu z bazą (dev)
pnpm db:generate      # Wygenerowanie migracji SQL na podstawie zmian w schema.ts
pnpm db:migrate       # Uruchomienie oczekujących migracji SQL
pnpm db:studio        # Uruchomienie wizualnego podglądu bazy Drizzle Studio w przeglądarce
pnpm clean            # Wyczyszczenie cache'u Turborepo i node_modules
```

---

## ⚖️ Licencja i Informacje Prawne

- Kod źródłowy projektu objęty jest licencją **GNU AGPLv3** (zob. [LICENSE](LICENSE)).
- Prawa autorskie do modyfikacji i wdrożenia należą do **eNStudios**.
- Projekt bazuje na otwartoźródłowym projekcie Louez stworzonym przez Synapsr.
