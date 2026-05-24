import { NodeData } from "./OrbitalNode";

interface SidebarProps {
  studentName: string;
  degree: string;
  year: string;
  categories: NodeData[];
  onCategoryClick: (category: NodeData) => void;
}

export function Sidebar({ studentName, degree, year, categories, onCategoryClick }: SidebarProps) {
  return (
    <div className="w-[220px] h-full bg-white/40 backdrop-blur-sm border-r border-[#D5CFBD]/30 p-6 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-[17px] tracking-tight" style={{ color: '#2C4F52', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>{studentName}</h2>
        <p className="text-[13px] tracking-tight" style={{ color: '#6B6B6B', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>{degree}</p>
        <p className="text-[11px] tracking-tight" style={{ color: '#9F9679', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>{year}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category)}
            className="px-4 py-2.5 rounded-full text-[13px] text-white transition-all hover:shadow-md active:scale-95"
            style={{
              backgroundColor: category.color,
              fontWeight: 500,
              letterSpacing: '0.01em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
            }}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
