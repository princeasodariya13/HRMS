interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-[3px]' };

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-[#E5E7EB] dark:border-[#374151] border-t-[#111827] dark:border-t-[#F3F4F6] rounded-full animate-spin`} />
      {text && <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{text}</p>}
    </div>
  );
}
