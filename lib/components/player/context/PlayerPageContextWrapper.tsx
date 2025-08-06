import React, { ReactNode } from 'react';
import { PlayerPageContextProvider } from './PlayerPageContext';
import { ToastProvider } from '@/lib/components/toast/ToastProvider';

type Props = {
  children: ReactNode;
};

export default function PlayerPageContextWrapper({ children }: Props) {
  return (
    <PlayerPageContextProvider>
      <ToastProvider>{children}</ToastProvider>
    </PlayerPageContextProvider>
  );
}
