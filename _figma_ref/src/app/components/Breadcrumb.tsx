import { ChevronLeft } from "lucide-react";
import { NodeData } from "./OrbitalNode";

interface BreadcrumbProps {
  path: NodeData[];
  onBack: () => void;
}

export function Breadcrumb({ path, onBack }: BreadcrumbProps) {
  return (
    <div className="absolute top-8 left-8 flex items-center gap-3">
      {path.length > 1 && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm border border-[#D5CFBD]/40 flex items-center justify-center hover:bg-white/80 hover:shadow-sm transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: '#6B6B6B' }} />
        </button>
      )}
      <div className="flex items-center gap-2 text-[13px]" style={{ color: '#6B6B6B' }}>
        {path.map((node, index) => (
          <span key={node.id}>
            {index > 0 && <span className="mx-1.5" style={{ color: '#C5BFAF' }}>/</span>}
            <span
              className={index === path.length - 1 ? "" : ""}
              style={{
                fontWeight: index === path.length - 1 ? 500 : 400,
                color: index === path.length - 1 ? '#2C4F52' : '#6B6B6B',
                letterSpacing: '0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
              }}
            >
              {node.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
