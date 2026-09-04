import { useState } from "react";
import { Plus, Check, X } from "lucide-react";

// Inline "add a custom category" control, rendered as the trailing tile in a
// category grid. Click to reveal a text input; Enter/check to confirm.
export default function AddCategoryTile({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const label = value.trim();
    if (!label || busy) return;
    setBusy(true);
    try {
      await onAdd(label);
      setValue("");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border border-dashed border-navy-border text-white/30 hover:border-electric-500/40 hover:text-electric-400 transition-all duration-150"
      >
        <Plus size={15} />
        <span className="text-[8px] leading-tight text-center">Custom</span>
      </button>
    );
  }

  return (
    <div className="col-span-2 flex items-center gap-1.5 py-1">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); submit(); }
          if (e.key === "Escape") { setOpen(false); setValue(""); }
        }}
        placeholder="Category name"
        maxLength={30}
        className="input-field text-xs py-2 flex-1"
      />
      <button type="button" onClick={submit} disabled={busy || !value.trim()}
        className="w-8 h-8 shrink-0 rounded-lg bg-electric-500/15 border border-electric-500/30 text-electric-400 flex items-center justify-center disabled:opacity-40">
        <Check size={13} />
      </button>
      <button type="button" onClick={() => { setOpen(false); setValue(""); }}
        className="w-8 h-8 shrink-0 rounded-lg bg-white/5 text-white/40 flex items-center justify-center">
        <X size={13} />
      </button>
    </div>
  );
}
