import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { VoiceType } from "@/types/ai";

interface VoiceToggleProps {
  voice: VoiceType;
  onToggle: (voice: VoiceType) => void;
}

export function VoiceToggle({voice, onToggle}: VoiceToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="voice-mode"
        checked={voice === 'uncleSam'}
        onCheckedChange={(checked) => onToggle(checked ? 'uncleSam' : 'analyst')}
      />
      <Label htmlFor="voice-mode" className="text-sm font-medium">
        {voice === 'uncleSam' ? "Uncle Sam" : "Analyst"}
      </Label>
    </div>
  )
}