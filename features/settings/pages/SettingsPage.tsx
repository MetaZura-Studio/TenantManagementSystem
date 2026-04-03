"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/shared/cards"
import { PageHeader } from "@/components/shared/page-header"
import { toast } from "@/components/shared/feedback/use-toast"
import { useSettings, useUpdateSetting } from "../hooks"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FormRequirementsSettings } from "@/features/settings/components/FormRequirementsSettings"

export function SettingsPage() {
  const { data: settings = [], isLoading } = useSettings()
  const updateMutation = useUpdateSetting()
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleChange = (key: string, value: string, category: string) => {
    setFormData({ ...formData, [`${category}.${key}`]: value })
  }

  const getValue = (category: string, key: string, fallback: string) => {
    const k = `${category}.${key}`
    return formData[k] ?? fallback
  }

  const handleSave = (category: string) => {
    const categorySettings = settings.filter((s) => s.category === category)
    categorySettings.forEach((setting) => {
      const key = `${category}.${setting.key}`
      if (formData[key] !== undefined) {
        updateMutation.mutate(
          {
            key: setting.key,
            value: formData[key],
            category: category,
          },
          {
            onSuccess: () => {
              toast({
                title: "Success",
                description: "Settings saved successfully",
              })
            },
            onError: () => {
              toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
              })
            },
          }
        )
      }
    })
  }

  const categories = Array.from(new Set(settings.map((s) => s.category)))
  const defaultCategory = categories[0] || "general"

  const categoryLabel = (c: string) =>
    c.charAt(0).toUpperCase() + c.slice(1)

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure system settings"
        breadcrumbs={[{ label: "Settings" }]}
      />

      {isLoading ? (
        <GlassCard variant="subtle">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">Loading...</div>
          </GlassCardContent>
        </GlassCard>
      ) : settings.length === 0 ? (
        <GlassCard variant="subtle" className="max-w-4xl">
          <GlassCardContent className="p-12">
            <div className="text-center text-muted-foreground">
              No settings found.
            </div>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <GlassCard variant="default" className="max-w-6xl rounded-3xl">
          <GlassCardHeader>
            <GlassCardTitle>System Settings</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <Tabs defaultValue={defaultCategory} className="w-full">
              <div className="rounded-2xl border border-border/30 bg-white/50 p-2 overflow-x-auto">
                <TabsList className="w-max min-w-full bg-transparent p-0 h-auto justify-start rounded-none gap-1">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm whitespace-nowrap",
                        "data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      )}
                    >
                      {categoryLabel(category)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="mt-6 rounded-2xl border border-border/30 bg-white/55 p-6">
                {categories.map((category) => {
                  const categorySettings = settings.filter((s) => s.category === category)

                  return (
                    <TabsContent key={category} value={category} className="m-0 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">{categoryLabel(category)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Update {categoryLabel(category).toLowerCase()} settings for the system.
                        </p>
                      </div>

                      {category === "forms" ? (
                        <FormRequirementsSettings
                          settings={settings}
                          valueOverride={getValue(
                            "forms",
                            "requiredFields",
                            categorySettings.find((s) => s.key === "requiredFields")?.value || ""
                          )}
                          isSaving={updateMutation.isPending}
                          onSave={(newJson) => {
                            handleChange("requiredFields", newJson, "forms")
                            updateMutation.mutate(
                              { key: "requiredFields", value: newJson, category: "forms" },
                              {
                                onSuccess: () => {
                                  toast({
                                    title: "Success",
                                    description: "Form requirements saved successfully",
                                  })
                                },
                                onError: () => {
                                  toast({
                                    title: "Error",
                                    description: "Failed to save form requirements",
                                    variant: "destructive",
                                  })
                                },
                              }
                            )
                          }}
                        />
                      ) : (
                      <div className="space-y-5">
                        {categorySettings.map((setting) => {
                          const value = getValue(category, setting.key, setting.value || "")
                          const type = setting.type || "text"
                          const isBoolean =
                            setting.key.toLowerCase().includes("enable") ||
                            type === "boolean"

                          return (
                            <div key={setting.key} className="rounded-2xl border border-border/30 bg-white/70 p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <Label htmlFor={setting.key} className="text-sm font-semibold">
                                    {setting.label || setting.key}
                                  </Label>
                                  {setting.description ? (
                                    <p className="text-xs text-muted-foreground">
                                      {setting.description}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="w-[320px] max-w-full">
                                  {isBoolean ? (
                                    <div className="flex items-center justify-end gap-3">
                                      <span className="text-xs text-muted-foreground">
                                        {String(value).toLowerCase() === "true" ? "Enabled" : "Disabled"}
                                      </span>
                                      <Switch
                                        checked={String(value).toLowerCase() === "true"}
                                        onCheckedChange={(checked) =>
                                          handleChange(setting.key, checked ? "true" : "false", category)
                                        }
                                      />
                                    </div>
                                  ) : type === "textarea" || setting.key === "invoiceTerms" ? (
                                    <Textarea
                                      id={setting.key}
                                      value={value}
                                      onChange={(e) => handleChange(setting.key, e.target.value, category)}
                                      className="min-h-[90px]"
                                    />
                                  ) : (
                                    <Input
                                      id={setting.key}
                                      type={type}
                                      value={value}
                                      onChange={(e) => handleChange(setting.key, e.target.value, category)}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      )}

                      {category === "forms" ? null : (
                        <div className="flex justify-end pt-2">
                          <Button
                            onClick={() => handleSave(category)}
                            disabled={updateMutation.isPending}
                            className="rounded-2xl px-6"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  )
                })}
              </div>
            </Tabs>
          </GlassCardContent>
        </GlassCard>
      )}
    </>
  )
}
