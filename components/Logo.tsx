import Image from "next/image";

export default function Logo({ size = 34, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo-mark.png" alt="" width={size} height={size} priority className={light ? "brightness-0 invert" : ""} />
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-navy-900"}`}>
        ZETTA <span className="font-medium">TECH</span>
      </span>
    </span>
  );
}
