"use client";

import { useMemo } from "react";

import { useLocale } from "next-intl";

import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@louez/ui";
import { CountryFlag } from "@louez/ui/icons/flags";

import {
  getAllCountriesSortedByName,
  getCountriesSortedByName,
  getCountryName,
  type Country,
} from "@/lib/utils/countries";

import { getFieldError, useFieldContext } from "@/hooks/form/form-context";

interface FormCountrySelectProps {
  label?: string;
  description?: string;
  placeholder?: string;
  locale?: string;
  countries?: readonly Country[];
  allCountries?: boolean;
  onValueChange?: (countryCode: string) => void;
}

export const FormCountrySelect = ({
  label,
  description,
  placeholder,
  locale: localeOverride,
  countries,
  allCountries,
  onValueChange,
}: FormCountrySelectProps) => {
  const field = useFieldContext<string>();
  const activeLocale = useLocale();
  const locale = localeOverride ?? activeLocale;
  const errors = field.state.meta.errors;
  const error = errors[0];
  const errorId = `${field.name}-error`;
  const sortedCountries = useMemo(
    () => {
      if (countries) {
        return [...countries].sort((firstCountry, secondCountry) =>
          getCountryName(firstCountry.code, locale).localeCompare(
            getCountryName(secondCountry.code, locale),
            locale,
          ),
        );
      }
      if (allCountries) {
        return getAllCountriesSortedByName(locale);
      }
      return getCountriesSortedByName(locale);
    },
    [countries, allCountries, locale],
  );
  const selectedCountryName = field.state.value
    ? getCountryName(field.state.value, locale)
    : undefined;

  const handleValueChange = (countryCode: string | null) => {
    if (countryCode === null) return;

    field.handleChange(countryCode);
    onValueChange?.(countryCode);
  };

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {label && (
        <Label htmlFor={field.name} data-error={errors.length > 0}>
          {label}
        </Label>
      )}
      <Select value={field.state.value || null} onValueChange={handleValueChange}>
        <SelectTrigger
          id={field.name}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={errors.length > 0}
        >
          <SelectValue placeholder={placeholder}>
            {field.state.value && selectedCountryName && (
              <span className="inline-flex items-center gap-2">
                <CountryFlag
                  country={field.state.value}
                  countryName={selectedCountryName}
                  className="h-4 w-6 shrink-0 rounded-md [&_img]:size-full [&_svg]:size-full"
                />
                <span>{selectedCountryName}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedCountries.map((country) => {
            const countryName = getCountryName(country.code, locale);

            return (
              <SelectItem key={country.code} value={country.code} label={countryName}>
                <span className="sr-only">{countryName}</span>
                <span aria-hidden className="inline-flex items-center gap-2">
                  <CountryFlag
                    country={country.code}
                    countryName={countryName}
                    className="h-auto w-6 "
                  />
                  <span>{countryName}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      {error && (
        <p id={errorId} className="text-destructive text-sm">
          {getFieldError(error)}
        </p>
      )}
    </div>
  );
};
