import "@/app/globals.css";
import * as NextImage from "next/image";
import * as NextNavigation from "next/navigation";

const OriginalNextImage = NextImage.default;

// Patch Image to disable optimisations within Preview.js.
Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props: NextImage.ImageProps) => (
    <OriginalNextImage {...props} unoptimized />
  ),
});

// Mock Next.js App Router hooks for Preview.js
Object.defineProperty(NextNavigation, "useRouter", {
  configurable: true,
  value: () => ({
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  }),
});

Object.defineProperty(NextNavigation, "usePathname", {
  configurable: true,
  value: () => "/",
});

Object.defineProperty(NextNavigation, "useSearchParams", {
  configurable: true,
  value: () => new URLSearchParams(),
});