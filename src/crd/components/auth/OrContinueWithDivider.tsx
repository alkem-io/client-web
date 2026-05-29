export type OrContinueWithDividerProps = {
  /** Translation-resolved label, e.g. "or continue with". */
  label: string;
};

export function OrContinueWithDivider({ label }: OrContinueWithDividerProps) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-body whitespace-nowrap text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
