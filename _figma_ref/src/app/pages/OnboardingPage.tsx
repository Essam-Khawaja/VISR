import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

const STEPS = ["Destination", "Goals", "Timeline", "Style"];
const TOTAL = STEPS.length;

function ConstellationSteps({ current }: { current: number }) {
  const cx = (i: number) => 32 + i * 80;
  const cy = (i: number) => (i % 2 === 0 ? 28 : 18);
  const width = 32 + (TOTAL - 1) * 80 + 32;
  const height = 48;

  return (
    <div className="flex flex-col items-start gap-1">
      <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: 13, color: "#9B8F7E", fontWeight: 500 }}>
        Step {current} of {TOTAL}
      </span>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* connector lines */}
        {STEPS.map((_, i) => {
          if (i === STEPS.length - 1) return null;
          const x1 = cx(i);
          const y1 = cy(i);
          const x2 = cx(i + 1);
          const y2 = cy(i + 1);
          const done = i + 1 < current;
          return (
            <motion.line
              key={`line-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={done ? "#9B8FBF" : "#D8D0C4"}
              strokeWidth={done ? 1.5 : 1}
              strokeDasharray={done ? "none" : "4 3"}
              opacity={done ? 0.7 : 0.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
          );
        })}

        {/* nodes */}
        {STEPS.map((label, i) => {
          const x = cx(i);
          const y = cy(i);
          const stepNum = i + 1;
          const done = stepNum < current;
          const active = stepNum === current;

          return (
            <g key={label}>
              {/* halo on active */}
              {active && (
                <motion.circle
                  cx={x} cy={y} r={14}
                  fill="#9B8FBF"
                  opacity={0.12}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}

              {/* outer ring */}
              <motion.circle
                cx={x} cy={y} r={active ? 9 : 7}
                fill={active ? "#9B8FBF" : done ? "#C4BAD8" : "#E8E2D8"}
                opacity={active ? 1 : done ? 0.85 : 0.6}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.08, type: "spring", stiffness: 300 }}
              />

              {/* star sparkle for completed */}
              {done && (
                <>
                  <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="white" strokeWidth={1.2} />
                  <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="white" strokeWidth={1.2} />
                  <line x1={x - 3.5} y1={y - 3.5} x2={x + 3.5} y2={y + 3.5} stroke="white" strokeWidth={0.8} opacity={0.6} />
                  <line x1={x + 3.5} y1={y - 3.5} x2={x - 3.5} y2={y + 3.5} stroke="white" strokeWidth={0.8} opacity={0.6} />
                </>
              )}

              {/* dot center on active */}
              {active && (
                <circle cx={x} cy={y} r={3} fill="white" />
              )}

              {/* label */}
              <text
                x={x} y={y + 16}
                textAnchor="middle"
                fill={active ? "#6B5F8A" : done ? "#9B8FBF" : "#B0A898"}
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface FormData {
  targetGoal: string;
  university: string;
  year: string;
  degree: string;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step] = useState(1);
  const [form, setForm] = useState<FormData>({
    targetGoal: "",
    university: "",
    year: "",
    degree: "",
  });

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const inputStyle = {
    fontFamily: '"Nunito", sans-serif',
    fontSize: 14,
    color: "#4A3F35",
    backgroundColor: "white",
    border: "1.5px solid #E2D9CC",
    borderRadius: 16,
    padding: "11px 16px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: '"Nunito", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "#8A7D6E",
    marginBottom: 6,
    display: "block" as const,
    letterSpacing: "0.03em",
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#F5EFDF", fontFamily: '"Nunito", sans-serif' }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-8 py-5">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "#7A6E62", fontFamily: '"Nunito", sans-serif', textDecoration: "none" }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          Constellation
        </Link>
        <span style={{ fontSize: 13, color: "#A89A8B", fontFamily: '"Nunito", sans-serif' }}>
          ~3 min · No signup
        </span>
      </div>

      {/* progress */}
      <div className="px-8 pb-4">
        <ConstellationSteps current={step} />
      </div>

      {/* card */}
      <div className="flex-1 flex items-start justify-center px-4 pt-6 pb-12">
        <motion.div
          className="w-full"
          style={{ maxWidth: 520 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: "36px 40px 32px",
              boxShadow: "0 2px 24px rgba(120,100,80,0.07)",
              border: "1px solid #EDE5D8",
            }}
          >
            <h1
              style={{
                fontFamily: '"Nunito", sans-serif',
                fontSize: 26,
                fontWeight: 800,
                color: "#2E2620",
                marginBottom: 8,
                lineHeight: 1.25,
              }}
            >
              Where are you going?
            </h1>
            <p
              style={{
                fontFamily: '"Nunito", sans-serif',
                fontSize: 14,
                color: "#9A8A7A",
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              Start with the destination. We&apos;ll figure out the route together.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* target goal */}
              <div>
                <label style={labelStyle}>Target Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering Internship Summer 2026"
                  value={form.targetGoal}
                  onChange={e => setForm({ ...form, targetGoal: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#9B8FBF")}
                  onBlur={e => (e.target.style.borderColor = "#E2D9CC")}
                />
              </div>

              {/* university + year */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>University</label>
                  <input
                    type="text"
                    placeholder="University of Calgary"
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#9B8FBF")}
                    onBlur={e => (e.target.style.borderColor = "#E2D9CC")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <input
                    type="text"
                    placeholder="Second year"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#9B8FBF")}
                    onBlur={e => (e.target.style.borderColor = "#E2D9CC")}
                  />
                </div>
              </div>

              {/* degree */}
              <div>
                <label style={labelStyle}>Degree</label>
                <input
                  type="text"
                  placeholder="BSc Computer Science"
                  value={form.degree}
                  onChange={e => setForm({ ...form, degree: e.target.value })}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#9B8FBF")}
                  onBlur={e => (e.target.style.borderColor = "#E2D9CC")}
                />
              </div>
            </div>
          </div>

          {/* continue button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: '"Nunito", sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: "white",
                backgroundColor: "#9B8FBF",
                border: "none",
                borderRadius: 999,
                padding: "12px 32px",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
