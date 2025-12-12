/**
 * Toast Types
 *
 * Type definitions and utilities for the Toast notification system.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export const initialToastState: ToastState = {
  message: '',
  type: 'info',
  isVisible: false,
};
