import type { CaseTabId } from './constants'

interface TabSpec { id: CaseTabId; label: string }
interface Props {
  tabs: TabSpec[]
  activeTab: CaseTabId
  onTabChange: (tab: CaseTabId) => void
}

export default function CaseDetailTabNav({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-gray-200 mb-7 -mt-1">
      <nav className="flex gap-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
