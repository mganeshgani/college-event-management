import { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, label, options, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            border-gray-300 dark:border-gray-600
            focus:border-primary-500 dark:focus:border-primary-400
            focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${className}
          `}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )) : children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
