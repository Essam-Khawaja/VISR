import SettingsForm from "@/components/flowgram/settings/SettingsForm";
import SavedLocationsManager from "@/components/flowgram/settings/SavedLocationsManager";
import DefaultsManager from "@/components/flowgram/settings/DefaultsManager";
import PersonalTimeManager from "@/components/flowgram/settings/PersonalTimeManager";

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-4">
        <div className="px-1">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            Settings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Personalize how VISR plans your day.
          </p>
        </div>

        <SettingsForm />
        <SavedLocationsManager />
        <PersonalTimeManager />
        <DefaultsManager />
      </main>
    </div>
  );
}
