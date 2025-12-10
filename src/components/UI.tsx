import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const SowCheckbox: React.FC<CheckboxProps> = ({ label, checked, onChange, className = '' }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer group ${className}`}>
      <div 
        className="relative w-4 h-4 border border-black bg-white flex items-center justify-center transition-all"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        {checked && (
          <Check size={14} className="text-[#72bf03] stroke-[4]" />
        )}
      </div>
      <span className="text-xs group-hover:text-[#72bf03] transition-colors select-none">
        {label}
      </span>
    </label>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const SowSelect: React.FC<SelectProps> = ({ className = '', children, ...props }) => {
  return (
    <div className="relative w-full">
      <select 
        {...props}
        className={`w-full bg-transparent text-black outline-none border-b border-gray-300 focus:border-[#72bf03] print:border-none appearance-none py-1 pr-4 ${className}`}
      >
        {children}
      </select>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none no-print">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export const SowInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      {...props}
      className={`w-full bg-transparent text-black outline-none px-1 font-sans placeholder-gray-300 focus:placeholder-gray-400 print:placeholder-transparent print:bg-transparent print:border-none ${props.className || ''}`}
    />
  );
};