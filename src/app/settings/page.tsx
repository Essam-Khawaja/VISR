import Header from "@/components/layout/Header";
import SettingsForm from "@/components/settings/SettingsForm";
import SavedLocationsManager from "@/components/settings/SavedLocationsManager";
import DefaultsManager from "@/components/settings/DefaultsManager";

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <div className="px-1">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            Settings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Personalize how StraighterNoodles thinks about your day.
          </p>
        </div>

        <SettingsForm />
        <SavedLocationsManager />
        <DefaultsManager />
      </main>
    </div>
  );
}
