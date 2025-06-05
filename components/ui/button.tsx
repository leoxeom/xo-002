import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-glassmorphic text-sm font-medium ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-dark-blue-900 dark:focus-visible:ring-fairway-400 hover-lift",
  {
    variants: {
      variant: {
        default:
          "bg-fairway-500 text-white hover:bg-fairway-600 dark:bg-fairway-600 dark:hover:bg-fairway-700 shadow-glassmorphic hover:shadow-glassmorphic-hover",
        primary:
          "bg-fairway-500 text-white hover:bg-fairway-600 dark:bg-fairway-600 dark:hover:bg-fairway-700 shadow-glassmorphic hover:shadow-glassmorphic-hover",
        secondary:
          "bg-light-green-400 text-dark-blue-800 hover:bg-light-green-500 dark:bg-light-green-500 dark:text-dark-blue-900 dark:hover:bg-light-green-600 shadow-glassmorphic hover:shadow-glassmorphic-hover",
        destructive:
          "bg-accent-500 text-white hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-700 shadow-glassmorphic hover:shadow-glassmorphic-hover",
        outline:
          "border-2 border-fairway-500 bg-transparent text-fairway-500 hover:bg-fairway-500 hover:text-white dark:border-fairway-400 dark:text-fairway-400 dark:hover:bg-fairway-400 dark:hover:text-dark-blue-900",
        ghost:
          "hover:bg-fairway-100 hover:text-fairway-700 dark:hover:bg-dark-blue-800 dark:hover:text-fairway-300",
        link: "text-fairway-500 underline-offset-4 hover:underline dark:text-fairway-400",
        glass:
          "bg-glassmorphic text-white hover:bg-white/20 dark:bg-glassmorphic-dark dark:hover:bg-black/20 border border-white/20 dark:border-black/20 shadow-glassmorphic hover:shadow-glassmorphic-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-glassmorphic px-3",
        lg: "h-11 rounded-glassmorphic px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText = "Chargement...",
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={twMerge(clsx(buttonVariants({ variant, size, className })))}
        ref={ref}
        disabled={isLoading || props.disabled}
        aria-disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText || "Chargement..."}
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
