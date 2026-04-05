import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function StatusFilter() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All Status");

  const options = ["All Status", "Under Review", "Uploaded", "Completed"];

  return (
    <div className="filter-wrapper">
      <div
        className="filter-box"
        onClick={() => setOpen(!open)}
      >
        <span>{selected}</span>
        <ChevronDown size={16} className="icon" />
      </div>

      {open && (
        <div className="dropdown-list">
          {options.map((option) => (
            <div
              key={option}
              className="dropdown-item"
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
