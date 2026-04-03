import { useMemo } from "react"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { getRequiredFieldsMatrix, type RequiredFieldsMatrix } from "@/lib/forms/required-fields"

export function useRequiredFieldsMatrix(): {
  matrix: RequiredFieldsMatrix
  isLoading: boolean
} {
  const { data: settings = [], isLoading } = useSettings()
  const matrix = useMemo(() => getRequiredFieldsMatrix(settings), [settings])
  return { matrix, isLoading }
}

