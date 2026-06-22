import { useState, useRef } from "react";

// Element types available on the palette
const TYPES = [
  { type: "table", label: "Table", w: 70, h: 70 },
  { type: "booth", label: "Booth", w: 100, h: 60 },
  { type: "stage", label: "Stage", w: 140, h: 60 },
  { type: "door", label: "Door", w: 60, h: 30 },
  { type: "chair", label: "Chair", w: 40, h: 40 },
];

// Drag-and-drop floor plan designer (FR-24). Pass readOnly for the staff view (FR-25).
export default function LayoutDesigner({ value = [], onChange, readOnly = false }) {
  const [elements, setElements] = useState(value);
  const dragId = useRef(null);
  const canvasRef = useRef(null);

  function update(next) {
    setElements(next);
    if (onChange) onChange(next);
  }

  function addEl(t) {
    const el = { id: "e" + Date.now(), type: t.type, x: 30, y: 30, w: t.w, h: t.h, label: t.label };
    update([...elements, el]);
  }

  function removeEl(id) {
    update(elements.filter((e) => e.id !== id));
  }

  function onMouseMove(e) {
    if (!dragId.current || readOnly) return;
    const rect = canvasRef.current.getBoundingClientRect();
    update(
      elements.map((el) =>
        el.id === dragId.current
          ? {
              ...el,
              x: Math.max(0, Math.min(rect.width - el.w, e.clientX - rect.left - el.w / 2)),
              y: Math.max(0, Math.min(rect.height - el.h, e.clientY - rect.top - el.h / 2)),
            }
          : el
      )
    );
  }

  return (
    <div className="designer">
      {!readOnly && (
        <div className="palette">
          <b className="small muted">Add element</b>
          {TYPES.map((t) => (
            <button key={t.type} className="btn btn-sm btn-outline" onClick={() => addEl(t)}>
              + {t.label}
            </button>
          ))}
          <p className="small muted mt">Drag elements to arrange. Click ✕ to remove.</p>
        </div>
      )}
      <div
        className="canvas"
        id="layout-canvas"
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseUp={() => (dragId.current = null)}
        onMouseLeave={() => (dragId.current = null)}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            className={`layout-el ${el.type}`}
            style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
            onMouseDown={() => { if (!readOnly) dragId.current = el.id; }}
          >
            {el.label}
            {!readOnly && (
              <span className="del" onMouseDown={(e) => e.stopPropagation()} onClick={() => removeEl(el.id)}>
                ×
              </span>
            )}
          </div>
        ))}
        {elements.length === 0 && (
          <div className="empty" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span className="emoji">🗺️</span>
            {readOnly ? "No layout has been designed yet" : "Add elements and drag to arrange the venue"}
          </div>
        )}
      </div>
    </div>
  );
}
