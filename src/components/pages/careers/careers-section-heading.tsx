type Props = {
  title: string;
  description?: string;
  align?: "center" | "left";
};

export function SectionHeading({ title, description, align = "center" }: Props) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      <span
        aria-hidden="true"
        className={`block h-1 w-12 rounded-full bg-primary ${centered ? "mx-auto" : ""}`}
      />
      <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-3 max-w-2xl text-pretty text-muted-foreground ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}