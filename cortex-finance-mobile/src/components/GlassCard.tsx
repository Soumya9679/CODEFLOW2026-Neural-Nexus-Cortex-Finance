import React from 'react';
import { View, ViewProps } from '../tw';
import { cn } from '../utils/cn'; // Let's check if cn utility exists or create one if needed

interface GlassCardProps extends ViewProps {
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, glow = false, ...props }) => {
  return (
    <View
      className={cn(
        "bg-[#18181C]/70 border border-[#2E2E35] rounded-2xl p-4 overflow-hidden",
        glow && "border-[#D7FF3F]/35 shadow-lg shadow-[#D7FF3F]/5",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};
