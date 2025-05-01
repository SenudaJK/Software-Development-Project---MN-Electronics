import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`form-input ${leftIcon ? 'pl-10' : ''} ${
            rightIcon ? 'pr-10' : ''
          } ${error ? 'border-error focus:ring-error' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default Input;