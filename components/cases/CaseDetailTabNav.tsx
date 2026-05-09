import type { CaseTabId } from './constants'

interface TabSpec {
  id: CaseTabId
  label: string
}

interface Props {
  tabs: TabSpec[]
  activeTab: CaseTabId
  onTabChange: (tab: CaseTabId) => void
}

export default function CaseDetailTabNav({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
