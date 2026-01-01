/**
 * Pepo Accessibility Utilities
 * WCAG 2.1 AA compliant accessibility helpers
 */

import { ReactNode } from 'react';

/**
 * ARIA Live Region Component
 * Announces dynamic content changes to screen readers
 */
export function AriaLiveRegion({
  children,
  polite = true,
  className = '',
}: {
  children: ReactNode;
  polite?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live={polite ? 'polite' : 'assertive'}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Skip to Main Content Link
 * Allows keyboard users to skip navigation
 */
export function SkipToMainLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:font-bold"
    >
      Skip to main content
    </a>
  );
}

/**
 * Accessible Button Component
 * Ensures proper ARIA attributes and keyboard support
 */
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaPressed,
  className = '',
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Accessible Form Label
 * Links label to input using htmlFor
 */
export function AccessibleFormLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
      {children}
      {required && <span aria-label="required">*</span>}
    </label>
  );
}

/**
 * Accessible Input Component
 * Proper ARIA attributes for form controls
 */
export function AccessibleInput({
  id,
  label,
  error,
  required = false,
  helperText,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  [key: string]: unknown;
}) {
  const describedBy = [
    error ? `${id}-error` : null,
    helperText ? `${id}-helper` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <AccessibleFormLabel htmlFor={id} required={required}>
        {label}
      </AccessibleFormLabel>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        required={required}
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Accessible Dialog/Modal
 * Proper ARIA attributes and focus management
 */
export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 ${sizeClasses[size]}`}
      >
        <h2 id="dialog-title" className="text-lg font-bold text-gray-900 mb-4">
          {title}
        </h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-900 font-medium"
          aria-label={`Close ${title}`}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * Accessibility Service
 * Helper functions for common accessibility patterns
 */
export class AccessibilityService {
  /**
   * Announce message to screen reader
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  /**
   * Set focus to element
   */
  static setFocus(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }

  /**
   * Trap focus within modal
   */
  static trapFocus(modalElement: HTMLElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener('keydown', handleKeyDown);

    return () => {
      modalElement.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if user prefers dark mode
   */
  static prefersDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Get user's preferred language
   */
  static getPreferredLanguage(): string {
    if (typeof navigator === 'undefined') return 'en';
    return navigator.language || 'en';
  }

  /**
   * Format date for screen reader
   */
  static formatDateForScreen(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString(this.getPreferredLanguage(), options);
  }

  /**
   * Validate keyboard event (Enter or Space)
   */
  static isActivationKey(event: React.KeyboardEvent): boolean {
    return event.key === 'Enter' || event.key === ' ';
  }

  /**
   * Create accessible tooltip
   */
  static createTooltip(
    element: HTMLElement,
    text: string,
    position: 'top' | 'bottom' | 'left' | 'right' = 'top'
  ) {
    element.setAttribute('role', 'tooltip');
    element.setAttribute('aria-describedby', `tooltip-${element.id}`);

    const tooltip = document.createElement('div');
    tooltip.id = `tooltip-${element.id}`;
    tooltip.textContent = text;
    tooltip.className = `sr-only`;

    element.appendChild(tooltip);

    return tooltip;
  }
}

/**
 * CSS class for screen readers only
 * Add to your global CSS:
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0, 0, 0, 0);
 *   white-space: nowrap;
 *   border-width: 0;
 * }
 */

/**
 * Accessible Color Contrast Helper
 */
export const ColorContrast = {
  // WCAG AA (minimum)
  HIGH: '4.5:1', // For text
  LARGE_TEXT: '3:1', // For large text (18pt+, 14pt+ bold)
  UI_COMPONENTS: '3:1', // For UI components

  // WCAG AAA (enhanced)
  ENHANCED: '7:1', // For text
  ENHANCED_LARGE: '4.5:1', // For large text

  // Common accessible color pairs
  pairs: {
    white_black: '21:1',
    white_darkGray: '12.63:1',
    white_darkBlue: '8.59:1',
    lightGray_black: '12.63:1',
    yellow_black: '19.56:1',
    yellow_darkGray: '10.98:1',
  },
};

/**
 * Accessible Focus Styles
 */
export const AccessibleFocus = {
  ringColor: 'focus:ring-2 focus:ring-blue-500',
  offset: 'focus:ring-offset-2',
  combined:
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
};
