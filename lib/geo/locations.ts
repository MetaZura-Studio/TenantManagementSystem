import { City, Country, State } from "country-state-city"

export type LocationOption = {
  value: string
  label: string
}

function toOption(name: string): LocationOption {
  return { value: name, label: name }
}

export function getCountries(): LocationOption[] {
  return Country.getAllCountries()
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b))
    .map(toOption)
}

function findCountryIsoByName(countryName: string | null | undefined): string | null {
  const name = (countryName ?? "").trim()
  if (!name) return null
  const found = Country.getAllCountries().find((c) => c.name.toLowerCase() === name.toLowerCase())
  return found?.isoCode ?? null
}

function findStateIsoByName(
  countryIso: string,
  stateName: string | null | undefined
): string | null {
  const name = (stateName ?? "").trim()
  if (!name) return null
  const states = State.getStatesOfCountry(countryIso)
  const found = states.find((s) => s.name.toLowerCase() === name.toLowerCase())
  return found?.isoCode ?? null
}

export function getStatesByCountryName(countryName: string | null | undefined): LocationOption[] {
  const countryIso = findCountryIsoByName(countryName)
  if (!countryIso) return []
  return State.getStatesOfCountry(countryIso)
    .map((s) => s.name)
    .sort((a, b) => a.localeCompare(b))
    .map(toOption)
}

export function getCitiesByCountryAndStateName(
  countryName: string | null | undefined,
  stateName: string | null | undefined
): LocationOption[] {
  const countryIso = findCountryIsoByName(countryName)
  if (!countryIso) return []
  const stateIso = findStateIsoByName(countryIso, stateName)
  if (!stateIso) return []
  return City.getCitiesOfState(countryIso, stateIso)
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b))
    .map(toOption)
}

export function getCitiesByCountryName(countryName: string | null | undefined): LocationOption[] {
  const countryIso = findCountryIsoByName(countryName)
  if (!countryIso) return []
  return (City.getCitiesOfCountry(countryIso) ?? [])
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b))
    .map(toOption)
}

