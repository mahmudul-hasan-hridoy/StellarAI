"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { X, Save, RotateCcw, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface SettingsProps {
  systemPrompt: string
  setSystemPrompt: (prompt: string) => void
  temperature: number
  setTemperature: (temp: number) => void
  maxTokens: number
  setMaxTokens: (tokens: number) => void
  topP: number
  setTopP: (topP: number) => void
  model: string
  setModel: (model: string) => void
  isDemoMode: boolean
  setIsDemoMode: (isDemoMode: boolean) => void
  onClose: () => void
}

export function Settings({
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  topP,
  setTopP,
  model,
  setModel,
  isDemoMode,
  setIsDemoMode,
  onClose,
}: SettingsProps) {
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt)
  const [streamResponse, setStreamResponse] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [apiEndpoint, setApiEndpoint] = useState("")

  const handleSave = () => {
    setSystemPrompt(localSystemPrompt)
  }

  const handleReset = () => {
    setLocalSystemPrompt(
      "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">API Configuration</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="demo-mode">Demo Mode</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        When enabled, uses simulated responses instead of calling the actual API.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground">Use simulated responses for testing</p>
            </div>
            <Switch id="demo-mode" checked={isDemoMode} onCheckedChange={setIsDemoMode} />
          </div>

          {!isDemoMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="api-key">Azure API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Azure API key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-endpoint">Azure Endpoint</Label>
                <Input
                  id="api-endpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://your-resource.openai.azure.com"
                />
              </div>

              <Button className="w-full">Save API Configuration</Button>
            </>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    The system prompt sets the behavior and capabilities of the AI assistant. It helps guide the AI to
                    provide more relevant responses.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="system-prompt"
            value={localSystemPrompt}
            onChange={(e) => setLocalSystemPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
            placeholder="Enter system instructions for the AI..."
          />
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" className="gap-1" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Model Parameters</h3>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DeepSeek-V3">DeepSeek-V3</SelectItem>
                <SelectItem value="DeepSeek-Coder">DeepSeek-Coder</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select the AI model to use for generating responses.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="temperature">Temperature</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Controls randomness: Lower values are more deterministic, higher values are more creative.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{temperature.toFixed(1)}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              className="py-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Maximum number of tokens to generate in the response.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{maxTokens}</span>
            </div>
            <Slider
              id="max-tokens"
              min={256}
              max={4096}
              step={256}
              value={[maxTokens]}
              onValueChange={(value) => setMaxTokens(value[0])}
              className="py-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="top-p">Top P</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Controls diversity via nucleus sampling.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{topP.toFixed(1)}</span>
            </div>
            <Slider
              id="top-p"
              min={0}
              max={1}
              step={0.1}
              value={[topP]}
              onValueChange={(value) => setTopP(value[0])}
              className="py-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="stream">Stream Response</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Show responses as they are generated.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground">Show responses as they are generated.</p>
            </div>
            <Switch id="stream" checked={streamResponse} onCheckedChange={setStreamResponse} />
          </div>
        </div>
      </div>
    </div>
  )
}

