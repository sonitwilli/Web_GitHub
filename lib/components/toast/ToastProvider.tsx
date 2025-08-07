'use client';

import { useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ToastReport from './ToastReport';
import { registerToastHandler } from '@/lib/utils/globalToast';
import styles from './Toast.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

type ToastData = {
  title?: string;
  desc?: string;
  timeout?: number;
  icon?: string;
  styleData?: string;
  customIcon?: React.ReactNode;
  wrapperStyle?: string;
  preventOnClickOutside?: boolean;
};

interface ToastProviderProps {
  children: ReactNode;
  container?: HTMLElement | React.RefObject<HTMLElement | null> | null;
}

export const ToastProvider = ({ children, container }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const toastStateRef = useRef<ToastData | null>(null);
  const isFullscreen = useSelector(
    (state: RootState) => state.player.isFullscreen
  );
  const prevIsFullscreenRef = useRef<boolean>(isFullscreen);

  const clearToast = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setToast(null);
      toastStateRef.current = null;
      setIsLeaving(false);
    }, 400);
  }, []);

  const show = useCallback(
    (data: ToastData) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast(data);
      toastStateRef.current = data;
      setIsLeaving(false);
      timeoutRef.current = window.setTimeout(clearToast, data.timeout ?? 5000);
    },
    [clearToast]
  );

  useEffect(() => {
    registerToastHandler(show);
  }, [show]);

  useEffect(() => {
    if (!toast?.preventOnClickOutside) {
      const handleClickOutside = (e: MouseEvent) => {
        if (toastRef.current && !toastRef.current.contains(e.target as Node)) {
          clearToast();
        }
      };
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [toast, clearToast]);

  // Get container element
  const getContainer = (): HTMLElement | null => {
    if (isFullscreen) {
      const playerWrapper = document.getElementById('player_wrapper');
      if (playerWrapper) return playerWrapper;
    }

    // Use provided container
    if (!container) return null;
    if (container instanceof HTMLElement) return container;
    if ('current' in container) return container.current;
    return null;
  };

  useEffect(() => {
    // Clear current toast when fullscreen changes to force re-render with new container
    if (prevIsFullscreenRef.current !== isFullscreen && toastStateRef.current) {
      clearToast();
    }
    prevIsFullscreenRef.current = isFullscreen;
  }, [isFullscreen, clearToast]);

  const renderToast = () => {
    if (!toast) return null;

    const toastElement = (
      <div
        ref={toastRef}
        className={`${
          container
            ? 'absolute top-4 right-4 z-[999] w-[250px] sm:w-[400px]'
            : 'fixed top-[136px] right-10 z-[999] w-[250px] sm:w-[400px]'
        } transition-all ${isLeaving ? styles.toastLeave : styles.toastOpen} ${
          toast.wrapperStyle
        }`}
      >
        <ToastReport
          title={toast.title}
          desc={toast.desc}
          icon={toast.icon}
          styleData={toast.styleData}
          customIcon={toast.customIcon}
        />
      </div>
    );

    const containerElement = getContainer();
    if (containerElement) {
      return createPortal(toastElement, containerElement);
    }

    return toastElement;
  };

  return (
    <>
      {children}
      {renderToast()}
    </>
  );
};
