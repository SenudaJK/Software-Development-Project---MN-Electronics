import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hoverable
    ? 'transition-shadow duration-300 hover:shadow-md'
    : '';
  
  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;