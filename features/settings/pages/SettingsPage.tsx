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

export function SettingsPage() {
  const { data: settings = [], isLoading } = useSettings()
  const updateMutation = useUpdateSetting()
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleChange = (key: string, value: string, category: string) => {
    setFormData({ ...formData, [`${category}.${key}`]: value })
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
      ) : (
        <GlassCard variant="default" className="max-w-4xl">
          <GlassCardHeader>
            <GlassCardTitle>System Settings</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <Tabs defaultValue={categories[0] || "general"} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((category) => {
                const categorySettings = settings.filter((s) => s.category === category)
                return (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="space-y-4">
                      {categorySettings.map((setting) => (
                        <div key={setting.key} className="space-y-2">
                          <Label htmlFor={setting.key}>{setting.label || setting.key}</Label>
                          <Input
                            id={setting.key}
                            type={setting.type || "text"}
                            defaultValue={setting.value}
                            onChange={(e) => handleChange(setting.key, e.target.value, category)}
                          />
                          {setting.description && (
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          )}
                        </div>
                      ))}
                      <div className="flex justify-end">
                        <Button onClick={() => handleSave(category)} disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </GlassCardContent>
        </GlassCard>
      )}
    </>
  )
}
