import React, { useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { format, parseISO } from 'date-fns';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
  date: string;
  existingWeight?: number;
}

const WeightModal: React.FC<WeightModalProps> = ({ isOpen, onClose, onSave, date, existingWeight }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset weight to existing value or empty
      setWeight(existingWeight ? existingWeight.toString() : '');
      setError('');
      // First: Mount the component in closed state
      setShouldRender(true);
      setIsAnimating(false);
      
      // Then: Trigger animation after a short delay to ensure DOM has painted
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      
      return () => clearTimeout(timer);
    } else {
      // Start closing animation
      setIsAnimating(false);
      
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen, existingWeight]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap - focus the input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = document.getElementById('weight-input');
        input?.focus();
        input?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight);
    
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    if (weightValue > 1000) {
      setError('Please enter a realistic weight');
      return;
    }

    onSave(weightValue);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        transition-all duration-200 ease-out
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="weight-modal-title"
    >
      <div
        className={`
          relative w-full max-w-md mx-4
          bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl
          border border-gray-200/80 dark:border-zinc-800
          transition-all duration-200 ease-out
          focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none
          ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 smooth-transition text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          aria-label="Close modal"
        >
          <HiX className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2
            id="weight-modal-title"
            className="text-2xl font-light text-gray-900 dark:text-white tracking-tight mb-2"
          >
            Enter Your Weight
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="mb-6">
            <label htmlFor="weight-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (lbs)
            </label>
            <input
              id="weight-input"
              type="number"
              step="0.1"
              min="0"
              max="1000"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter weight in pounds"
              className={`
                w-full px-4 py-3 rounded-xl
                bg-gray-50 dark:bg-zinc-800
                border ${error ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-zinc-700'}
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                transition-all
                text-lg
              `}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-primary-500 dark:bg-primary-400 text-white hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeightModal;


