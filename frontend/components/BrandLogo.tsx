import Image from "next/image";

type BrandLogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md";
  showText?: boolean;
};

export default function BrandLogo({
  variant = "light",
  size = "sm",
  showText = true,
}: BrandLogoProps) {
  const markSize = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const textSize = size === "md" ? "text-2xl" : "text-xl";
  const textColor = variant === "light" ? "text-white" : "text-deep";
  const accentColor = variant === "light" ? "text-sage" : "text-secondary";

  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt=""
        width={40}
        height={40}
        className={`${markSize} object-contain`}
        aria-hidden="true"
      />
      {showText && (
        <span className={`font-display font-semibold tracking-tight ${textSize} ${textColor}`}>
          FABRIX <span className={accentColor}>AI</span>
        </span>
      )}
    </span>
  );
}
