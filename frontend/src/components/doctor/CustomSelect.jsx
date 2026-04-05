import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  options = [],
  value,
  onChange,
  label,
  placeholder = "Select..."
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setOpen(false);
  };

  // Normalize options (support both string and object)
  const normalizedOptions = options.map((option) => {
    if (typeof option === "string") {
      return {
        label: option,
        value: option
      };
    }

    return option;
  });

  const selectedLabel =
    normalizedOptions.find((opt) => opt.value === value)?.label ||
    placeholder;

  return (
    <div className="custom-select" ref={dropdownRef}>
      <div
        className="select-trigger"
        onClick={() => setOpen(!open)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={open ? "rotate" : ""}
        />
      </div>

      {open && (
        <div className="select-dropdown">
          {normalizedOptions.map((option) => (
            <div
              key={option.value}
              className={`select-option ${
                value === option.value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {value === option.value && <Check size={14} />}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}