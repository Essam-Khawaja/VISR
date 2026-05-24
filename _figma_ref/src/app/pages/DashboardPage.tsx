import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { OrbitalMap } from "../components/OrbitalMap";
import { Breadcrumb } from "../components/Breadcrumb";
import { NodeData } from "../components/OrbitalNode";

interface PathNode {
  node: NodeData;
  angle?: number;
}

const darkenColor = (hex: string, depth: number): string => {
  const factor = 1 - (depth * 0.15);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.max(0, Math.floor(r * factor));
  const newG = Math.max(0, Math.floor(g * factor));
  const newB = Math.max(0, Math.floor(b * factor));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

const degreeData: NodeData = {
  id: "root",
  label: "B.Sc. Computer Science",
  category: "degree",
  color: "#8FA090",
  subGoals: [
    {
      id: "academics",
      label: "Academics",
      category: "academics",
      color: "#933B5B",
      subGoals: [
        {
          id: "gpa-goal",
          label: "3.8+ GPA",
          category: "academics",
          color: darkenColor("#933B5B", 1),
          subGoals: [
            { id: "study-schedule", label: "Study Schedule", category: "academics", color: darkenColor("#933B5B", 2), subGoals: [] },
            { id: "tutoring", label: "Peer Tutoring", category: "academics", color: darkenColor("#933B5B", 2), subGoals: [] },
          ],
        },
        {
          id: "research",
          label: "Research Project",
          category: "academics",
          color: darkenColor("#933B5B", 1),
          subGoals: [
            { id: "find-lab", label: "Join Lab", category: "academics", color: darkenColor("#933B5B", 2), subGoals: [] },
            { id: "publish", label: "Publish Paper", category: "academics", color: darkenColor("#933B5B", 2), subGoals: [] },
          ],
        },
        {
          id: "courses",
          label: "Core Courses",
          category: "academics",
          color: darkenColor("#933B5B", 1),
          subGoals: [],
        },
      ],
    },
    {
      id: "experience",
      label: "Experience",
      category: "experience",
      color: "#B5728A",
      subGoals: [
        {
          id: "internship",
          label: "Tech Internship",
          category: "experience",
          color: darkenColor("#B5728A", 1),
          subGoals: [
            { id: "resume", label: "Build Resume", category: "experience", color: darkenColor("#B5728A", 2), subGoals: [] },
            { id: "apply", label: "Apply to 50+", category: "experience", color: darkenColor("#B5728A", 2), subGoals: [] },
          ],
        },
        {
          id: "projects",
          label: "Side Projects",
          category: "experience",
          color: darkenColor("#B5728A", 1),
          subGoals: [
            { id: "portfolio", label: "Portfolio Site", category: "experience", color: darkenColor("#B5728A", 2), subGoals: [] },
            { id: "open-source", label: "Open Source", category: "experience", color: darkenColor("#B5728A", 2), subGoals: [] },
          ],
        },
      ],
    },
    {
      id: "skills",
      label: "Skills",
      category: "skills",
      color: "#A8C4A4",
      subGoals: [
        {
          id: "programming",
          label: "Programming",
          category: "skills",
          color: darkenColor("#A8C4A4", 1),
          subGoals: [
            { id: "python", label: "Master Python", category: "skills", color: darkenColor("#A8C4A4", 2), subGoals: [] },
            { id: "javascript", label: "Learn JavaScript", category: "skills", color: darkenColor("#A8C4A4", 2), subGoals: [] },
          ],
        },
        {
          id: "soft-skills",
          label: "Communication",
          category: "skills",
          color: darkenColor("#A8C4A4", 1),
          subGoals: [
            { id: "presentations", label: "Public Speaking", category: "skills", color: darkenColor("#A8C4A4", 2), subGoals: [] },
            { id: "writing", label: "Technical Writing", category: "skills", color: darkenColor("#A8C4A4", 2), subGoals: [] },
          ],
        },
      ],
    },
    {
      id: "network",
      label: "Network",
      category: "network",
      color: "#E3D6BF",
      subGoals: [
        {
          id: "mentors",
          label: "Find Mentors",
          category: "network",
          color: darkenColor("#E3D6BF", 1),
          subGoals: [
            { id: "professor", label: "Professor 1:1", category: "network", color: darkenColor("#E3D6BF", 2), subGoals: [] },
            { id: "alumni", label: "Alumni Coffee", category: "network", color: darkenColor("#E3D6BF", 2), subGoals: [] },
          ],
        },
        {
          id: "events",
          label: "Attend Events",
          category: "network",
          color: darkenColor("#E3D6BF", 1),
          subGoals: [
            { id: "conferences", label: "Conferences", category: "network", color: darkenColor("#E3D6BF", 2), subGoals: [] },
            { id: "meetups", label: "Tech Meetups", category: "network", color: darkenColor("#E3D6BF", 2), subGoals: [] },
          ],
        },
      ],
    },
    {
      id: "wellness",
      label: "Wellness",
      category: "wellness",
      color: "#9F9679",
      subGoals: [
        {
          id: "physical",
          label: "Physical Health",
          category: "wellness",
          color: darkenColor("#9F9679", 1),
          subGoals: [
            { id: "gym", label: "Gym 3x/week", category: "wellness", color: darkenColor("#9F9679", 2), subGoals: [] },
            { id: "sleep", label: "8hrs Sleep", category: "wellness", color: darkenColor("#9F9679", 2), subGoals: [] },
          ],
        },
        {
          id: "mental",
          label: "Mental Health",
          category: "wellness",
          color: darkenColor("#9F9679", 1),
          subGoals: [
            { id: "meditation", label: "Daily Meditation", category: "wellness", color: darkenColor("#9F9679", 2), subGoals: [] },
            { id: "therapy", label: "Counseling", category: "wellness", color: darkenColor("#9F9679", 2), subGoals: [] },
          ],
        },
      ],
    },
  ],
};

export function DashboardPage() {
  const [currentPath, setCurrentPath] = useState<PathNode[]>([{ node: degreeData }]);

  const currentPathNode = currentPath[currentPath.length - 1];
  const currentNode = currentPathNode.node;
  const parentAngle = currentPath.length > 1 ? currentPath[currentPath.length - 1].angle : undefined;

  const categories = degreeData.subGoals;

  const handleNodeClick = (node: NodeData, angle: number) => {
    if (node.subGoals.length > 0) {
      setCurrentPath([...currentPath, { node, angle }]);
    }
  };

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const handleCategoryClick = (category: NodeData) => {
    const categoryIndex = degreeData.subGoals.findIndex(c => c.id === category.id);
    const angleStep = (2 * Math.PI) / degreeData.subGoals.length;
    const angle = categoryIndex * angleStep - Math.PI / 2;
    setCurrentPath([{ node: degreeData }, { node: category, angle }]);
  };

  return (
    <div className="size-full flex" style={{ backgroundColor: "#F5EFDF" }}>
      <Sidebar
        studentName="Alex Morgan"
        degree="B.Sc. Computer Science"
        year="Class of 2028"
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />
      <div className="flex-1 relative">
        <Breadcrumb path={currentPath.map(p => p.node)} onBack={handleBack} />
        <div className="w-full h-full flex items-center justify-center">
          <OrbitalMap
            centerNode={currentNode}
            onNodeClick={handleNodeClick}
            currentPath={currentPath}
            parentAngle={parentAngle}
          />
        </div>
      </div>
    </div>
  );
}
