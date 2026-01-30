type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = 'Yuklanmoqda...', className }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center h-full ${className || ''}`}>
      <div className="animate-pulse text-muted-foreground">{label}</div>
    </div>
  );
}
