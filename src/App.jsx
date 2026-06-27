import React, { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, Package, AlertCircle, ChevronDown, GripVertical, Sun, Moon, Pencil, Truck, Car } from "lucide-react";
import { DndContext, DragOverlay, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const POD_CAPACITY_CUFT = 257;
const POD_WEIGHT_LIMIT = 2000;
const PACKING_EFFICIENCY = 0.75;
const POD_USABLE_CUFT = POD_CAPACITY_CUFT * PACKING_EFFICIENCY;
const DEFAULT_COST_PER_POD = 1500;

const ROOMS = ["Living Room", "Bedroom", "Kitchen", "Dining Room", "Office", "Bathroom", "Garage/Storage", "Outdoor", "Other"];

const THEMES = {
  light: {
    bg: "#F7F4EE",
    text: "#2B2520",
    muted: "#7A726A",
    dimmer: "#8A8076",
    faint: "#A8A096",
    accent: "#C75B2A",
    accentLight: "#F2924B",
    card: "#1F2937",
    cardText: "#F7F4EE",
    cardMuted: "#A8B0BB",
    cardBarBg: "#374151",
    surface: "#fff",
    surfaceBorder: "#E8E1D3",
    inputBorder: "#E0D9CC",
    inputBg: "#FBF9F4",
    rowDivider: "#F0EBE0",
    dragHandle: "#C7C1B8",
    dropHighlight: "#FEF3EB",
    presetBorder: "#E0D9CC",
    presetBg: "#fff",
    errorBg: "#FDECEA",
    errorText: "#9A3412",
  },
  dark: {
    bg: "#18181B",
    text: "#E4E4E7",
    muted: "#A1A1AA",
    dimmer: "#A1A1AA",
    faint: "#8B8B94",
    accent: "#E8793B",
    accentLight: "#F2924B",
    card: "#0F0F12",
    cardText: "#E4E4E7",
    cardMuted: "#9CA3AF",
    cardBarBg: "#27272A",
    surface: "#27272A",
    surfaceBorder: "#3F3F46",
    inputBorder: "#52525B",
    inputBg: "#1E1E22",
    rowDivider: "#3F3F46",
    dragHandle: "#71717A",
    dropHighlight: "#2A2018",
    presetBorder: "#52525B",
    presetBg: "#27272A",
    errorBg: "#451A03",
    errorText: "#FB923C",
  },
};

const PRESETS = [
  { name: "Sofa (3-seat)", cuft: 45, l: 84, w: 36, h: 34, room: "Living Room" },
  { name: "Loveseat", cuft: 30, l: 60, w: 34, h: 34, room: "Living Room" },
  { name: "Armchair", cuft: 20, l: 36, w: 34, h: 34, room: "Living Room" },
  { name: "Coffee table", cuft: 10, l: 48, w: 24, h: 18, room: "Living Room" },
  { name: "TV (55\"+) w/ stand", cuft: 15, l: 55, w: 14, h: 50, room: "Living Room" },
  { name: "Bookshelf", cuft: 18, l: 36, w: 12, h: 72, room: "Living Room" },
  { name: "Queen bed (frame+mattress)", cuft: 55, l: 80, w: 60, h: 14, room: "Bedroom" },
  { name: "King bed (frame+mattress)", cuft: 65, l: 80, w: 76, h: 14, room: "Bedroom" },
  { name: "Dresser", cuft: 25, l: 60, w: 18, h: 34, room: "Bedroom" },
  { name: "Nightstand", cuft: 8, l: 24, w: 18, h: 26, room: "Bedroom" },
  { name: "Dining table", cuft: 30, l: 60, w: 36, h: 30, room: "Dining Room" },
  { name: "Dining chair", cuft: 6, l: 20, w: 20, h: 36, room: "Dining Room" },
  { name: "Refrigerator", cuft: 50, l: 36, w: 30, h: 70, room: "Kitchen" },
  { name: "Washer or Dryer", cuft: 35, l: 27, w: 27, h: 38, room: "Garage/Storage" },
  { name: "Desk", cuft: 20, l: 48, w: 24, h: 30, room: "Office" },
  { name: "Office chair", cuft: 10, l: 26, w: 26, h: 40, room: "Office" },
  { name: "Small box", cuft: 3, l: 18, w: 14, h: 16, room: "Other" },
  { name: "Medium box", cuft: 4.5, l: 22, w: 16, h: 22, room: "Other" },
  { name: "Large box", cuft: 6, l: 24, w: 18, h: 24, room: "Other" },
  { name: "Bike", cuft: 12, l: 68, w: 24, h: 42, room: "Garage/Storage" },
  { name: "Chuhay bed frame — disassembled", cuft: 10, l: 80, w: 6, h: 36, room: "Bedroom" },
  { name: "Chuhay bed frame — assembled", cuft: 35, l: 80, w: 76, h: 10, room: "Bedroom" },
];

const STORAGE_KEY = "moving-inventory-items-v1";
const THEME_KEY = "moving-inventory-theme";

const REAL_ITEMS = [
  { name: "Ashley Bixler Sofa (3-seat)", room: "Living Room", qty: 1, cuft: 64.3, l: 79, w: 38, h: 37, lbs: 121, estimated: true, url: "https://www.amazon.com/Signature-Design-Ashley-Bixler-Sofas/dp/B0D6GZSYCM" },
  { name: "Flash Furniture Whitney desk chair", room: "Office", qty: 1, cuft: 17.5, l: 27, w: 26, h: 43, estimated: true, url: "https://www.amazon.com/Flash-Furniture-Leather-Executive-Swivel/dp/B01MQYP11W" },
  { name: "Marsail ergonomic desk chair", room: "Office", qty: 1, cuft: 14.4, l: 25, w: 25, h: 39, estimated: true, url: "https://www.amazon.com/Marsail-Ergonomic-Office-Chair-Adjustable/dp/B0CP22DQQS" },
  { name: "Corrigan Studio Ljubka swivel stool", room: "Dining Room", qty: 4, cuft: 10.5, l: 22, w: 22, h: 38, estimated: true, url: "https://www.wayfair.com/furniture/pdp/corrigan-studio-ljubka-swivel-stools-w110120715.html" },
  { name: "Hazo Haus washable 8x10 rug", room: "Living Room", qty: 1, cuft: 3, l: 120, w: 96, h: 0.25, estimated: true, url: "https://www.amazon.com/Hazo-Haus-Washable-Oriental-Resistant/dp/B0DYV556CG" },
  { name: "Vintage 3x8 runner rug", room: "Other", qty: 1, cuft: 1.5, l: 96, w: 36, h: 0.25, estimated: true },
  { name: "Lahome jute-look rug", room: "Other", qty: 1, cuft: 2.5, l: 84, w: 60, h: 0.25, estimated: true, url: "https://www.amazon.com/Lahome-Farmhouse-Washable-Outdoor-Natural/dp/B0CQYD4FPB" },
  { name: "RoomTalks mid-century rug", room: "Living Room", qty: 1, cuft: 3, l: 120, w: 96, h: 0.2, estimated: true, url: "https://www.amazon.com/RoomTalks-Washable-Aesthetic-8x10-Contemporary/dp/B0DBLLP75B" },
  { name: "BESTSWEETIE 8x10 rug", room: "Living Room", qty: 1, cuft: 3, l: 120, w: 96, h: 0.25, estimated: true, url: "https://www.amazon.com/BESTSWEETIE-Washable-Vintage-Bedroom-Dinning/dp/B0CB6B8QKR" },
  { name: "Mohawk non-slip rug pad", room: "Other", qty: 3, cuft: 1, l: 120, w: 96, h: 0.25, estimated: true, url: "https://www.amazon.com/Mohawk-Home-Surface-Hardwood-Surfaces/dp/B007T58OM0" },
  { name: "YOMT TV floor stand/mount", room: "Living Room", qty: 1, cuft: 9.8, l: 22, w: 15, h: 52, lbs: 30, estimated: true, url: "https://www.amazon.com/YOMT-Floor-TV-Stand-Universal/dp/B08BLBRRKC" },
  { name: "Casper Element mattress (King)", room: "Bedroom", qty: 1, cuft: 34.7, l: 76, w: 80, h: 10, estimated: true, url: "https://www.amazon.com/Casper-Sleep-Element-Mattress-California/dp/B085HDS3LQ" },
  { name: 'ARTPOWER 55" fluted TV console', room: "Living Room", qty: 1, cuft: 10.1, l: 55, w: 13, h: 25, lbs: 37, estimated: true, url: "https://www.amazon.com/ARTPOWER-Century-Console-Entertainment-Television/dp/B0CVX66F1Z" },
  { name: 'HANXIN 78" convertible sofa (open/assembled)', room: "Living Room", qty: 1, cuft: 45.8, l: 78, w: 39, h: 26, estimated: true, url: "https://www.amazon.com/HANXIN-Convertible-Mattress-Fixed-Shape-Boneless/dp/B0FNMYJ664" },
  { name: "Chuhay bed frame — disassembled", room: "Bedroom", qty: 1, cuft: 10, l: 80, w: 6, h: 36, estimated: true },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function DraggableItem({ item, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.3 : 1 }}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

function DroppableRoom({ room, isOver, t, children }) {
  const { setNodeRef } = useDroppable({ id: `room:${room}` });
  return (
    <div ref={setNodeRef} style={{
      marginBottom: 20,
      borderRadius: 14,
      outline: isOver ? `2px solid ${t.accent}` : "2px solid transparent",
      outlineOffset: 4,
      transition: "outline-color 0.15s",
    }}>
      {children}
    </div>
  );
}

function DroppablePriority({ priority, isOver, t, children }) {
  const { setNodeRef } = useDroppable({ id: `priority:${priority}` });
  return (
    <div ref={setNodeRef} style={{
      marginBottom: 20,
      borderRadius: 14,
      outline: isOver ? `2px solid ${t.accent}` : "2px solid transparent",
      outlineOffset: 4,
      transition: "outline-color 0.15s",
    }}>
      {children}
    </div>
  );
}

function SortableCarItem({ it, onToggleTransport, onRemove, onUpdateName, t }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: it.id, data: { priority: it.priority || "must" } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };
  const [editing, setEditing] = React.useState(false);
  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
      }}>
        <div {...attributes} {...listeners} style={{ cursor: "grab", color: t.dragHandle, display: "flex", alignItems: "center", touchAction: "none" }}>
          <GripVertical size={16} />
        </div>
        <div style={{ flex: 1, fontSize: 14, minWidth: 0 }}>
          {editing ? (
            <input
              type="text"
              value={it.name}
              onChange={(e) => onUpdateName(it.id, e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              autoFocus
              style={{
                width: "100%", border: `1px solid ${t.inputBorder}`, background: t.inputBg,
                color: t.text, fontSize: 14, padding: "2px 6px", borderRadius: 4,
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          ) : (
            <div
              onClick={() => setEditing(true)}
              style={{ cursor: "text", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              title="Click to edit"
            >
              {it.name}
            </div>
          )}
        </div>
        <button
          onClick={() => onToggleTransport(it.id)}
          title="Move to pod"
          style={{ background: "none", border: "none", cursor: "pointer", color: t.dragHandle, padding: 4, flexShrink: 0 }}
        >
          <Truck size={15} />
        </button>
        <button onClick={() => onRemove(it.id)} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, padding: 4, flexShrink: 0 }}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function ItemRowContent({ it, dragHandleProps, onUpdateQty, onUpdateDim, onUpdateLbs, onUpdateName, onUpdateUrl, onRemove, onToggleTransport, activeTab, t }) {
  const dimInput = { width: 38, padding: "1px 3px", fontSize: 11, border: `1px solid ${t.inputBorder}`, borderRadius: 3, textAlign: "center", background: t.inputBg, color: t.text };
  const [editing, setEditing] = React.useState(false);
  return (
    <>
      <div {...dragHandleProps} style={{ cursor: "grab", color: t.dragHandle, display: "flex", alignItems: "center", touchAction: "none" }}>
        <GripVertical size={16} />
      </div>
      <input
        type="number" min={0} value={it.qty}
        onChange={(e) => onUpdateQty(it.id, e.target.value)}
        style={{ width: 36, padding: "2px 4px", fontSize: 12, border: `1px solid ${t.inputBorder}`, borderRadius: 4, textAlign: "center", background: t.inputBg, color: it.qty === 0 ? t.faint : t.text }}
      />
      <div style={{ flex: 1, minWidth: 0, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
        {editing ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              value={it.name}
              onChange={(e) => onUpdateName(it.id, e.target.value)}
              autoFocus
              placeholder="Item name"
              style={{
                width: "100%", border: `1px solid ${t.inputBorder}`, background: t.inputBg,
                color: t.text, fontSize: 14, padding: "2px 6px", borderRadius: 4,
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
            <input
              type="text"
              value={it.url || ""}
              onChange={(e) => onUpdateUrl(it.id, e.target.value)}
              placeholder="https://... (optional)"
              style={{
                width: "100%", border: `1px solid ${t.inputBorder}`, background: t.inputBg,
                color: t.text, fontSize: 11, padding: "2px 6px", borderRadius: 4,
                outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginTop: 3,
              }}
            />
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {it.url ? (
                <a href={it.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textDecorationColor: t.dragHandle, textUnderlineOffset: 2 }}>
                  {it.name}
                </a>
              ) : it.name}
            </div>
            {it.url && (
              <div style={{ fontSize: 10, color: t.dragHandle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                {it.url.replace(/^https?:\/\//, "").slice(0, 50)}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setEditing((e) => !e)}
          style={{ background: "none", border: "none", cursor: "pointer", color: editing ? t.accent : t.dragHandle, padding: 2, flexShrink: 0 }}
          title="Edit name & link"
        >
          <Pencil size={13} />
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", fontSize: 11, color: t.dragHandle, width: 170, flexShrink: 0, justifyContent: "flex-end" }}>
        <input type="number" min={0} step="any" value={it.h ?? ""} onChange={(e) => onUpdateDim(it.id, "h", e.target.value)} placeholder="H" style={dimInput} />
        ×
        <input type="number" min={0} step="any" value={it.w ?? ""} onChange={(e) => onUpdateDim(it.id, "w", e.target.value)} placeholder="W" style={dimInput} />
        ×
        <input type="number" min={0} step="any" value={it.l ?? ""} onChange={(e) => onUpdateDim(it.id, "l", e.target.value)} placeholder="L" style={dimInput} />
        <span>in</span>
      </div>
      <div style={{ width: 60, flexShrink: 0, textAlign: "right", whiteSpace: "nowrap", fontSize: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
          <input
            type="number" min={0} step="any" value={it.lbs ?? ""}
            onChange={(e) => onUpdateLbs(it.id, e.target.value)}
            placeholder="lbs"
            style={{ width: 40, padding: "1px 3px", fontSize: 11, border: `1px solid ${t.inputBorder}`, borderRadius: 3, textAlign: "center", background: t.inputBg, color: t.text }}
          />
          <span style={{ color: t.dragHandle }}>lb</span>
        </div>
        {it.lbs && it.qty > 1 && (
          <div style={{ fontSize: 10, color: t.dragHandle, marginTop: 1 }}>
            {it.lbs * it.qty} lb total
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, textAlign: "right", whiteSpace: "nowrap", width: 90, flexShrink: 0 }}>
        {+(it.cuft * it.qty).toFixed(1)} ft³{it.estimated ? <span style={{ fontWeight: 400, fontSize: 11, color: t.dimmer }}> est.</span> : ""}
      </div>
      {onToggleTransport && (
        <button
          onClick={() => onToggleTransport(it.id)}
          title={activeTab === "pod" ? "Move to car" : "Move to pod"}
          style={{ background: "none", border: "none", cursor: "pointer", color: t.dragHandle, padding: 4 }}
        >
          {activeTab === "pod" ? <Car size={15} /> : <Truck size={15} />}
        </button>
      )}
      <button onClick={() => onRemove(it.id)} style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, padding: 4 }}>
        <Trash2 size={15} />
      </button>
    </>
  );
}

function getInitialDark() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === "dark";
  } catch (e) {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export default function MovingInventory() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saveErr, setSaveErr] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [form, setForm] = useState({ name: "", room: "Living Room", qty: 1, cuft: "", l: "", w: "", h: "" });
  const [cuftManual, setCuftManual] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [dark, setDark] = useState(getInitialDark);
  const [activeTab, setActiveTab] = useState("pod");
  const [costPerPod, setCostPerPod] = useState(() => {
    try { return Number(localStorage.getItem("moving-inventory-cost")) || DEFAULT_COST_PER_POD; } catch (e) { return DEFAULT_COST_PER_POD; }
  });

  const t = THEMES[dark ? "dark" : "light"];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function toggleDark() {
    setDark((d) => {
      const next = !d;
      try { localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch (e) {}
      return next;
    });
  }

  function updateFormDim(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (!cuftManual && next.l && next.w && next.h) {
        next.cuft = (Number(next.l) * Number(next.w) * Number(next.h) / 1728).toFixed(1);
      }
      return next;
    });
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw).map((it) => ({ transport: "pod", ...it })));
      } else {
        // First-ever visit — seed with the known inventory
        setItems(REAL_ITEMS.map((it) => ({
          id: uid(), name: it.name, room: it.room, qty: it.qty, cuft: it.cuft, transport: "pod",
          ...(it.l != null && { l: it.l }), ...(it.w != null && { w: it.w }), ...(it.h != null && { h: it.h }),
          ...(it.estimated && { estimated: true }),
          ...(it.url && { url: it.url }),
          ...(it.lbs != null && { lbs: it.lbs }),
        })));
      }
    } catch (e) {
      setItems(REAL_ITEMS.map((it) => ({
        id: uid(), name: it.name, room: it.room, qty: it.qty, cuft: it.cuft, transport: "pod",
        ...(it.l != null && { l: it.l }), ...(it.w != null && { w: it.w }), ...(it.h != null && { h: it.h }),
        ...(it.estimated && { estimated: true }),
        ...(it.url && { url: it.url }),
      })));
    }
    setLoaded(true);
  }, []);

  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setSaveErr(false);
    } catch (e) {
      setSaveErr(true);
    }
  }, [items, loaded]);

  // Safety net: save on page unload in case useEffect hasn't flushed
  useEffect(() => {
    const save = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsRef.current)); } catch (e) {}
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, []);

  const tabItems = useMemo(
    () => items.filter((it) => (it.transport || "pod") === activeTab),
    [items, activeTab]
  );

  const podItems = useMemo(
    () => items.filter((it) => (it.transport || "pod") === "pod"),
    [items]
  );

  const totalCuft = useMemo(
    () => podItems.reduce((sum, it) => sum + it.cuft * it.qty, 0),
    [podItems]
  );
  const totalLbs = useMemo(
    () => podItems.reduce((sum, it) => sum + (it.lbs || 0) * it.qty, 0),
    [podItems]
  );
  const itemsWithWeight = useMemo(
    () => podItems.filter((it) => it.lbs && it.qty > 0).length,
    [podItems]
  );
  const itemsTotal = useMemo(
    () => podItems.filter((it) => it.qty > 0).length,
    [podItems]
  );
  const podsNeeded = totalCuft > 0 ? Math.ceil(totalCuft / POD_USABLE_CUFT) : 0;
  const lastPodFill = podsNeeded > 0 ? (totalCuft / (podsNeeded * POD_USABLE_CUFT)) * 100 : 0;

  const carItemCount = useMemo(
    () => items.filter((it) => it.transport === "car").reduce((sum, it) => sum + it.qty, 0),
    [items]
  );
  const carCuft = useMemo(
    () => items.filter((it) => it.transport === "car").reduce((sum, it) => sum + it.cuft * it.qty, 0),
    [items]
  );
  const carLbs = useMemo(
    () => items.filter((it) => it.transport === "car").reduce((sum, it) => sum + (it.lbs || 0) * it.qty, 0),
    [items]
  );

  const byRoom = useMemo(() => {
    const groups = {};
    tabItems.forEach((it) => {
      groups[it.room] = groups[it.room] || [];
      groups[it.room].push(it);
    });
    return groups;
  }, [tabItems]);

  const activeRooms = useMemo(() => {
    const roomsWithItems = Object.keys(byRoom);
    const allRooms = [...new Set([...roomsWithItems, ...ROOMS])];
    return ROOMS.filter((r) => allRooms.includes(r));
  }, [byRoom]);

  function addItem(name, room, qty, cuft, { l, w, h, estimated } = {}) {
    if (!name.trim() || !cuft || Number(cuft) <= 0) return;
    const item = { id: uid(), name: name.trim(), room, qty: Math.max(1, Number(qty) || 1), cuft: Number(cuft), transport: activeTab };
    if (l) item.l = Number(l);
    if (w) item.w = Number(w);
    if (h) item.h = Number(h);
    if (estimated) item.estimated = true;
    setItems((prev) => [...prev, item]);
  }

  function handleAddCustom(e) {
    e.preventDefault();
    if (activeTab === "car") {
      if (!form.name.trim()) return;
      const item = { id: uid(), name: form.name.trim(), room: "Other", qty: 1, cuft: 0, transport: "car", priority: "must" };
      setItems((prev) => [...prev, item]);
      setForm({ name: "", room: form.room, qty: 1, cuft: "", l: "", w: "", h: "" });
      return;
    }
    const hasAllDims = form.l && form.w && form.h;
    if (!hasAllDims) return;
    const cuftVal = +(Number(form.l) * Number(form.w) * Number(form.h) / 1728).toFixed(1);
    addItem(form.name, form.room, form.qty, cuftVal, {
      l: form.l, w: form.w, h: form.h,
      estimated: true,
    });
    setForm({ name: "", room: form.room, qty: 1, cuft: "", l: "", w: "", h: "" });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function updateQty(id, qty) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, Number(qty) || 0) } : it))
    );
  }

  function updateDim(id, field, value) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value === "" ? undefined : Number(value) };
        if (updated.l && updated.w && updated.h) {
          updated.cuft = +(Number(updated.l) * Number(updated.w) * Number(updated.h) / 1728).toFixed(1);
          updated.estimated = true;
        }
        return updated;
      })
    );
  }

  function updateLbs(id, value) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, lbs: value === "" ? undefined : Number(value) } : it))
    );
  }

  function updateName(id, value) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, name: value } : it))
    );
  }

  function updateUrl(id, value) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, url: value || undefined } : it))
    );
  }

  function addPreset(p) {
    addItem(p.name, p.room, 1, p.cuft, { l: p.l, w: p.w, h: p.h, estimated: true });
  }

  function toggleTransport(id) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, transport: (it.transport || "pod") === "pod" ? "car" : "pod" } : it
      )
    );
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (overId.startsWith("room:")) {
      const targetRoom = overId.slice(5);
      const draggedItem = items.find((it) => it.id === active.id);
      if (!draggedItem || draggedItem.room === targetRoom) return;
      setItems((prev) => prev.map((it) => (it.id === active.id ? { ...it, room: targetRoom } : it)));
    } else if (overId.startsWith("priority:")) {
      const targetPriority = overId.slice(9);
      const draggedItem = items.find((it) => it.id === active.id);
      if (!draggedItem || (draggedItem.priority || "must") === targetPriority) return;
      setItems((prev) => prev.map((it) => (it.id === active.id ? { ...it, priority: targetPriority } : it)));
    } else if (activeTab === "car") {
      // Sortable reorder: dropped on another car item
      const draggedItem = items.find((it) => it.id === active.id);
      const overItem = items.find((it) => it.id === over.id);
      if (!draggedItem || !overItem) return;
      const targetPriority = overItem.priority || "must";
      const sourcePriority = draggedItem.priority || "must";
      setItems((prev) => {
        let next = prev.map((it) =>
          it.id === active.id ? { ...it, priority: targetPriority } : it
        );
        // Get indices in the full array for reordering
        const oldIndex = next.findIndex((it) => it.id === active.id);
        const newIndex = next.findIndex((it) => it.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          next = arrayMove(next, oldIndex, newIndex);
        }
        return next;
      });
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const draggedItem = activeId ? items.find((it) => it.id === activeId) : null;
  const [overRoom, setOverRoom] = useState(null);

  function handleDragOver(event) {
    const { over } = event;
    const overId = over ? String(over.id) : "";
    if (overId.startsWith("room:")) {
      setOverRoom(overId.slice(5));
    } else if (overId.startsWith("priority:")) {
      setOverRoom(overId);
    } else {
      setOverRoom(null);
    }
  }

  const themedInput = {
    width: "100%", padding: "8px 10px", fontSize: 14, border: `1px solid ${t.inputBorder}`,
    borderRadius: 8, marginTop: 4, boxSizing: "border-box", background: t.inputBg, color: t.text,
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: t.bg, minHeight: "100vh", color: t.text, transition: "background 0.2s, color 0.2s" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Package size={26} color={t.accent} />
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, flex: 1 }}>
              Moving Inventory
            </h1>
            <button
              onClick={toggleDark}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, padding: 6, borderRadius: 8 }}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <p style={{ margin: 0, color: t.muted, fontSize: 14 }}>
            Log what's coming with you, and we'll estimate how many U-Box pods you need.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[
            { key: "pod", label: "Pod Inventory", icon: <Truck size={15} /> },
            { key: "car", label: "Car Items", icon: <Car size={15} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 999, border: "none",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                background: activeTab === tab.key ? t.accent : t.surfaceBorder,
                color: activeTab === tab.key ? "#fff" : t.muted,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Summary card */}
        {activeTab === "pod" ? (
          <div style={{
            background: t.card, color: t.cardText, borderRadius: 14, padding: "22px 24px",
            marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, color: t.cardMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Estimated volume
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
                  {totalCuft.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ fontSize: 16, fontWeight: 500, color: t.cardMuted }}>cu ft</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: t.cardMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Known weight
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
                  {totalLbs.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 500, color: t.cardMuted }}>lbs</span>
                </div>
                {itemsWithWeight < itemsTotal && (
                  <div style={{ fontSize: 11, color: t.cardMuted, marginTop: 2 }}>
                    {itemsWithWeight}/{itemsTotal} items weighed
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: t.cardMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  U-Box pods needed
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: t.accentLight, lineHeight: 1.1 }}>
                  {podsNeeded}
                </div>
              </div>
            </div>

            {podsNeeded > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: podsNeeded }).map((_, i) => {
                    const isLast = i === podsNeeded - 1;
                    const fillPct = isLast ? lastPodFill : 100;
                    return (
                      <div key={i} style={{ flex: 1, height: 14, background: t.cardBarBg, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                        <div style={{ width: `${fillPct}%`, height: "100%", background: t.accentLight }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: t.cardMuted, marginTop: 8 }}>
                  Each pod fits ~{Math.round(POD_USABLE_CUFT)} cu ft / {POD_WEIGHT_LIMIT.toLocaleString()} lbs. Last pod is ~{Math.round(lastPodFill)}% full by volume.
                </div>
                {totalLbs > podsNeeded * POD_WEIGHT_LIMIT && (
                  <div style={{ fontSize: 12, color: "#FB923C", marginTop: 4, fontWeight: 700 }}>
                    Warning: estimated weight exceeds {podsNeeded}-pod limit of {(podsNeeded * POD_WEIGHT_LIMIT).toLocaleString()} lbs
                  </div>
                )}
              </div>
            )}

            {/* Cost estimate */}
            {podsNeeded > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${t.cardBarBg}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.cardMuted }}>
                  <span>Raleigh → Brooklyn</span>
                  <span>·</span>
                  <span>$</span>
                  <input
                    type="number" min={0} step={50} value={costPerPod}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setCostPerPod(v);
                      try { localStorage.setItem("moving-inventory-cost", String(v)); } catch (e) {}
                    }}
                    style={{ width: 70, padding: "2px 6px", fontSize: 13, border: `1px solid ${t.cardBarBg}`, borderRadius: 4, textAlign: "center", background: "transparent", color: t.cardText }}
                  />
                  <span>/ pod</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>
                  ${(podsNeeded * costPerPod).toLocaleString()}
                </div>
              </div>
            )}

            {podsNeeded === 0 && (
              <div style={{ fontSize: 13, color: t.cardMuted, marginTop: 10 }}>
                Add items below to see your pod estimate.
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: t.card, color: t.cardText, borderRadius: 14, padding: "18px 24px",
            marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 15, color: t.cardMuted }}>
              Items riding in the car
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              {carItemCount}
            </div>
          </div>
        )}

        {saveErr && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: t.errorBg, color: t.errorText, padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
            <AlertCircle size={16} /> Couldn't save your changes — they may not persist after you leave.
          </div>
        )}

        {/* Item list */}
        {activeTab === "car" ? (
          /* Car tab: Must Have / Nice to Have boxes with drag between */
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div style={{ display: "flex", gap: 16 }}>
            {[
              { key: "must", label: "Must Have" },
              { key: "nice", label: "Nice to Have" },
            ].map(({ key, label }) => {
              const boxItems = tabItems.filter((it) => (it.priority || "must") === key);
              const isDropTarget = overRoom === `priority:${key}` && draggedItem && (draggedItem.priority || "must") !== key;
              return (
                <div key={key} style={{ flex: 1, minWidth: 0 }}>
                <DroppablePriority priority={key} isOver={isDropTarget} t={t}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isDropTarget ? t.accent : t.dimmer, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, transition: "color 0.15s" }}>
                    {label}
                  </div>
                  <div style={{
                    background: isDropTarget ? t.dropHighlight : t.surface,
                    borderRadius: 12,
                    border: `1px solid ${t.surfaceBorder}`,
                    overflow: "hidden",
                    transition: "background 0.15s",
                    minHeight: 48,
                  }}>
                    <SortableContext items={boxItems.map((it) => it.id)} strategy={verticalListSortingStrategy}>
                      {boxItems.length === 0 ? (
                        <div style={{ padding: "14px", fontSize: 13, color: t.faint, textAlign: "center" }}>
                          {isDropTarget ? `Drop here` : `Drag items here`}
                        </div>
                      ) : (
                        boxItems.map((it, idx) => (
                          <div key={it.id} style={{ borderTop: idx > 0 ? `1px solid ${t.rowDivider}` : "none" }}>
                            <SortableCarItem it={it} onToggleTransport={toggleTransport} onRemove={removeItem} onUpdateName={updateName} t={t} />
                          </div>
                        ))
                      )}
                    </SortableContext>
                  </div>
                </DroppablePriority>
                </div>
              );
            })}
            </div>
            <DragOverlay>
              {draggedItem && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: t.surface, color: t.text, borderRadius: 10, border: `1px solid ${t.surfaceBorder}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontSize: 14,
                }}>
                  <GripVertical size={16} color={t.dragHandle} />
                  {draggedItem.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Pod tab: full room-grouped drag-and-drop view */
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {tabItems.length === 0 ? (
              <div style={{ textAlign: "center", color: t.faint, padding: "40px 0", fontSize: 14 }}>
                No items yet. Quick-add something below to get started.
              </div>
            ) : (
              activeRooms.map((room) => {
                const roomItems = byRoom[room];
                if (!roomItems && !activeId) return null;
                const roomTotal = roomItems ? roomItems.reduce((s, it) => s + it.cuft * it.qty, 0) : 0;
                const isDropTarget = overRoom === room && draggedItem && draggedItem.room !== room;
                return (
                  <DroppableRoom key={room} room={room} isOver={isDropTarget} t={t}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: isDropTarget ? t.accent : t.dimmer, textTransform: "uppercase", letterSpacing: "0.05em", transition: "color 0.15s" }}>
                        {room}
                      </div>
                      <div style={{ fontSize: 12, color: t.dimmer }}>{Math.round(roomTotal)} cu ft</div>
                    </div>
                    <div style={{
                      background: isDropTarget ? t.dropHighlight : t.surface,
                      borderRadius: 12,
                      border: `1px solid ${t.surfaceBorder}`,
                      overflow: "hidden",
                      transition: "background 0.15s",
                      minHeight: isDropTarget && (!roomItems || roomItems.length === 0) ? 48 : undefined,
                    }}>
                      {roomItems && roomItems.map((it, idx) => (
                        <DraggableItem key={it.id} item={it}>
                          {({ dragHandleProps }) => (
                            <div style={{
                              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                              borderTop: idx > 0 ? `1px solid ${t.rowDivider}` : "none",
                              opacity: it.qty === 0 ? 0.4 : 1,
                            }}>
                              <ItemRowContent it={it} dragHandleProps={dragHandleProps} onUpdateQty={updateQty} onUpdateDim={updateDim} onUpdateLbs={updateLbs} onUpdateName={updateName} onUpdateUrl={updateUrl} onRemove={removeItem} onToggleTransport={toggleTransport} activeTab={activeTab} t={t} />
                            </div>
                          )}
                        </DraggableItem>
                      ))}
                      {isDropTarget && (!roomItems || roomItems.length === 0) && (
                        <div style={{ padding: "12px 14px", fontSize: 13, color: t.accent, textAlign: "center" }}>
                          Drop here to move to {room}
                        </div>
                      )}
                    </div>
                  </DroppableRoom>
                );
              })
            )}
            <DragOverlay>
              {draggedItem && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: t.surface, color: t.text, borderRadius: 10, border: `1px solid ${t.surfaceBorder}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)", maxWidth: 700
                }}>
                  <ItemRowContent it={draggedItem} dragHandleProps={{}} onUpdateQty={() => {}} onUpdateDim={() => {}} onUpdateLbs={() => {}} onUpdateName={() => {}} onUpdateUrl={() => {}} onRemove={() => {}} t={t} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {/* Add items section */}
        {activeTab === "car" ? (
          <form onSubmit={handleAddCustom} style={{
            marginTop: 16, display: "flex", gap: 8, alignItems: "center",
          }}>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Add an item..."
              style={{
                flex: 1, padding: "10px 14px", fontSize: 14, border: `1px solid ${t.surfaceBorder}`,
                borderRadius: 10, background: t.surface, color: t.text, outline: "none",
              }}
            />
            <button type="submit" style={{
              background: t.accent, color: "#fff", border: "none", borderRadius: 10,
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}>
              <Plus size={18} />
            </button>
          </form>
        ) : (
          <div style={{ marginTop: 28, marginBottom: 20 }}>
            <button
              onClick={() => setShowPresets((s) => !s)}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                fontSize: 14, fontWeight: 700, color: t.accent, cursor: "pointer", padding: 0, marginBottom: showPresets ? 10 : 0
              }}
            >
              <Plus size={16} /> Add more items <ChevronDown size={16} style={{ transform: showPresets ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {showPresets && (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => addPreset(p)}
                      style={{
                        fontSize: 13, padding: "6px 12px", borderRadius: 999, border: `1px solid ${t.presetBorder}`,
                        background: t.presetBg, cursor: "pointer", color: t.text
                      }}
                      title={`${p.cuft} cu ft · ${p.room}`}
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAddCustom} style={{
                  background: t.surface, borderRadius: 12, padding: 16,
                  border: `1px solid ${t.surfaceBorder}`, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end"
                }}>
                  <div style={{ flex: "2 1 180px" }}>
                    <label style={{ fontSize: 11, color: t.dimmer, fontWeight: 700, textTransform: "uppercase" }}>Item</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Antique mirror"
                      style={themedInput}
                    />
                  </div>
                  <div style={{ flex: "1 1 130px" }}>
                    <label style={{ fontSize: 11, color: t.dimmer, fontWeight: 700, textTransform: "uppercase" }}>Room</label>
                    <select value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} style={themedInput}>
                      {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: "0 1 80px" }}>
                    <label style={{ fontSize: 11, color: t.dimmer, fontWeight: 700, textTransform: "uppercase" }}>Qty</label>
                    <input
                      type="number" min={1} value={form.qty}
                      onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                      style={themedInput}
                    />
                  </div>
                  <div style={{ flex: "0 1 70px" }}>
                    <label style={{ fontSize: 11, color: t.dimmer, fontWeight: 700, textTransform: "uppercase" }}>H (in)</label>
                    <input
                      type="number" min={0} step="any" value={form.h}
                      onChange={(e) => updateFormDim("h", e.target.value)}
                      placeholder="H"
                      style={themedInput}
                    />
                  </div>
                  <div style={{ flex: "0 1 70px" }}>
                    <label style={{ fontSize: 11, color: t.dimmer, fontWeight: 700, textTransform: "uppercase" }}>W (in)</label>
                    <input
                      type="number" min={0} step="any" value={form.w}
                      onChange={(e) => updateFormDim("w", e.target.value)}
                      placeholder="W"
                      style={themedInput}
                    />
                  </div>
                  <div style={{ flex: "0 1 70px" }}>
                    <label style={{ fontSize: 11, color: t.dimmer, fontWeight: 700, textTransform: "uppercase" }}>L (in)</label>
                    <input
                      type="number" min={0} step="any" value={form.l}
                      onChange={(e) => updateFormDim("l", e.target.value)}
                      placeholder="L"
                      style={themedInput}
                    />
                  </div>
                  <button type="submit" style={{
                    display: "flex", alignItems: "center", gap: 6, background: t.accent, color: "#fff",
                    border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", height: 40
                  }}>
                    <Plus size={16} /> Add
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <div style={{ fontSize: 12, color: t.faint, marginTop: 24, lineHeight: 1.6 }}>
          Estimates are based on a U-Haul U-Box's 257 cu ft rated capacity at ~75% realistic packing efficiency.
          Dense or oddly-shaped items (mattresses, appliances) pack less efficiently — when in doubt, round up a pod.
          U-Box also caps each container at 2,000 lbs, so a very heavy load (books, tools) may hit the weight limit before the volume limit.
        </div>
      </div>
    </div>
  );
}
