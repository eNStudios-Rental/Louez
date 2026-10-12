// Country and timezone utilities for store settings

export interface Country {
  code: string      // ISO 3166-1 alpha-2
  timezone?: string // Primary IANA timezone
}

// Comprehensive list of countries with their primary timezones
// Sorted alphabetically by country code for easy lookup
export const SUPPORTED_COUNTRIES: Country[] = [
  // Europe
  { code: 'AT', timezone: 'Europe/Vienna' },
  { code: 'BE', timezone: 'Europe/Brussels' },
  { code: 'CH', timezone: 'Europe/Zurich' },
  { code: 'CZ', timezone: 'Europe/Prague' },
  { code: 'DE', timezone: 'Europe/Berlin' },
  { code: 'DK', timezone: 'Europe/Copenhagen' },
  { code: 'ES', timezone: 'Europe/Madrid' },
  { code: 'FI', timezone: 'Europe/Helsinki' },
  { code: 'FR', timezone: 'Europe/Paris' },
  { code: 'GB', timezone: 'Europe/London' },
  { code: 'GR', timezone: 'Europe/Athens' },
  { code: 'HR', timezone: 'Europe/Zagreb' },
  { code: 'HU', timezone: 'Europe/Budapest' },
  { code: 'IE', timezone: 'Europe/Dublin' },
  { code: 'IT', timezone: 'Europe/Rome' },
  { code: 'LU', timezone: 'Europe/Luxembourg' },
  { code: 'MC', timezone: 'Europe/Monaco' },
  { code: 'NL', timezone: 'Europe/Amsterdam' },
  { code: 'NO', timezone: 'Europe/Oslo' },
  { code: 'PL', timezone: 'Europe/Warsaw' },
  { code: 'PT', timezone: 'Europe/Lisbon' },
  { code: 'RO', timezone: 'Europe/Bucharest' },
  { code: 'SE', timezone: 'Europe/Stockholm' },

  // North America
  { code: 'CA', timezone: 'America/Toronto' },
  { code: 'MX', timezone: 'America/Mexico_City' },
  { code: 'US', timezone: 'America/New_York' },

  // South America
  { code: 'AR', timezone: 'America/Buenos_Aires' },
  { code: 'BR', timezone: 'America/Sao_Paulo' },
  { code: 'CL', timezone: 'America/Santiago' },
  { code: 'CO', timezone: 'America/Bogota' },

  // Asia Pacific
  { code: 'AU', timezone: 'Australia/Sydney' },
  { code: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'HK', timezone: 'Asia/Hong_Kong' },
  { code: 'IN', timezone: 'Asia/Kolkata' },
  { code: 'JP', timezone: 'Asia/Tokyo' },
  { code: 'KR', timezone: 'Asia/Seoul' },
  { code: 'MY', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'NZ', timezone: 'Pacific/Auckland' },
  { code: 'PH', timezone: 'Asia/Manila' },
  { code: 'SG', timezone: 'Asia/Singapore' },
  { code: 'TH', timezone: 'Asia/Bangkok' },
  { code: 'TW', timezone: 'Asia/Taipei' },
  { code: 'VN', timezone: 'Asia/Ho_Chi_Minh' },

  // Middle East & Africa
  { code: 'AE', timezone: 'Asia/Dubai' },
  { code: 'IL', timezone: 'Asia/Jerusalem' },
  { code: 'MA', timezone: 'Africa/Casablanca' },
  { code: 'SA', timezone: 'Asia/Riyadh' },
  { code: 'ZA', timezone: 'Africa/Johannesburg' },
]

// Sort by translated name for display (will be sorted at runtime)
export function getCountriesSortedByName(locale: string = 'fr'): Country[] {
  return [...SUPPORTED_COUNTRIES].sort((a, b) => {
    const nameA = getCountryName(a.code, locale)
    const nameB = getCountryName(b.code, locale)
    return nameA.localeCompare(nameB, locale)
  })
}

export function getCountryByCode(code: string): Country | undefined {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code)
}

export function getTimezoneForCountry(countryCode: string): string {
  const country = getCountryByCode(countryCode)
  return country?.timezone || 'Europe/Paris' // Default to Paris
}

export function getCountryName(code: string, locale: string = 'fr'): string {
  try {
    const regionNames = new Intl.DisplayNames([locale], { type: 'region' })
    return regionNames.of(code) || code
  } catch {
    // Fallback to code if Intl API fails
    return code
  }
}

// Complete list of ISO 3166-1 alpha-2 country codes
export const ALL_COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const;

export type CountryCode = (typeof ALL_COUNTRY_CODES)[number];

export const ALL_COUNTRIES: Country[] = ALL_COUNTRY_CODES.map((code) => {
  const supported = getCountryByCode(code);
  return supported ?? { code };
});

export function findCountryByCode(code: string): Country | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}

// Sort all countries by translated name for display (at runtime)
export function getAllCountriesSortedByName(locale: string = 'fr'): Country[] {
  return [...ALL_COUNTRIES].sort((a, b) => {
    const nameA = getCountryName(a.code, locale);
    const nameB = getCountryName(b.code, locale);
    return nameA.localeCompare(nameB, locale);
  });
}

