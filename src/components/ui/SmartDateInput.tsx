import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { parseSmartDate } from '../../core/utils/dateUtils';

interface SmartDateInputProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  className?: string;
}

const SmartDateInput: React.FC<SmartDateInputProps> = ({ 
  value, 
  onChange, 
  name, 
  placeholder,
  className 
}) => {
  // Internal state for text input to allow free typing
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state if prop value changes externally
  useEffect(() => {
    if (value) {
        setInputValue(value);
        setIsValid(true);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Try to parse immediately
    const parsedDate = parseSmartDate(val);
    if (parsedDate) {
      setIsValid(true);
      onChange(parsedDate); // Update parent with standardized date
    } else {
      setIsValid(false);
      // We don't update parent with invalid data, or we could send ''
      if (val === '') onChange('');
    }
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setInputValue(val);
      setIsValid(true);
      onChange(val);
    }
  };

  const triggerDatePicker = () => {
    if (dateInputRef.current) {
        try {
            dateInputRef.current.showPicker();
        } catch (err) {
            // Fallback for browsers not supporting showPicker
            dateInputRef.current.focus();
        }
    }
  };

  return (
    <div className="relative w-full">
      {/* Visual Input (Text) */}
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleTextChange}
        placeholder={placeholder || "YYYY-MM-DD"}
        className={`${className} ${!isValid && inputValue ? 'border-amber-400 focus:ring-amber-400' : ''}`}
        autoComplete="off"
      />

      {/* Status Indicator or Calendar Trigger */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
         {/* Hidden Real Date Input */}
         <input
            ref={dateInputRef}
            type="date"
            onChange={handleDatePick}
            className="sr-only" // Visually hidden but accessible
            tabIndex={-1}
        />
        
        <button
          type="button"
          onClick={triggerDatePicker}
          className="text-slate-400 hover:text-medical-600 transition-colors focus:outline-none"
          title="اختر من التقويم"
        >
          {isValid && inputValue && parseSmartDate(inputValue) ? (
             <Check className="w-4 h-4 text-green-500" />
          ) : (
             <CalendarIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Error / Hint for Format */}
      {!isValid && inputValue.length > 2 && (
         <span className="absolute -bottom-5 right-1 text-[10px] text-amber-500 font-bold">
           تنسيق غير معروف (حاول: 251130)
         </span>
      )}
    </div>
  );
};

export default SmartDateInput;
