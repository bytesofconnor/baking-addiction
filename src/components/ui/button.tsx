import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type To } from "react-router";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn inline-flex min-h-14 cursor-pointer items-center justify-center px-5 text-[18px] leading-6 font-medium rounded-lg touch-manipulation transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cinnamon-deep disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "btn-primary hover:bg-cocoa active:bg-ink",
        secondary:
          "border-[1.5px] border-cocoa bg-transparent text-ink hover:border-cinnamon-deep hover:bg-paper-raised hover:text-ink active:border-ink active:bg-paper-press",
        ghost:
          "px-3 text-ink underline decoration-rule decoration-2 underline-offset-4 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa active:decoration-cocoa",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}

export function ButtonLink({
  to,
  variant,
  className,
  children,
}: {
  to: To;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={cn(buttonVariants({ variant }), className)}>
      {children}
    </Link>
  );
}
