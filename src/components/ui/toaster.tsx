import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-xl px-4 py-3 shadow-lg text-sm animate-fade-in pointer-events-auto',
            toast.variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-card text-foreground border border-border'
          )}
        >
          {toast.title && <p className="font-medium">{toast.title}</p>}
          {toast.description && (
            <p className={cn('text-sm', toast.title ? 'text-muted-foreground mt-0.5' : '')}>
              {toast.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
