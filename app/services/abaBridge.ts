// services/abaBridge.ts
import { callHandler, registerHandler } from 'web-bridge-gateway';
import * as Sentry from '@sentry/vue';

export interface ABALocationResponse {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ABAUserProfile {
  appId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  sex: 'M' | 'F' | string;
  dobShort: string;
  nationality: string;
  phone: string;
  email: string;
  lang: 'en' | 'kh' | 'zh' | string;
  address: string;
  id: string;
  appVersion: string;
  osVersion: string;
  [key: string]: any;
}

export interface ABADeviceInfo {
  platform: 'android' | 'ios';
  os_version: string;
  device_model: string;
  time_zone: string;
  screen_width: number;
  screen_height: number;
  esim_compatible: boolean;
}

export interface ABAGradientColor {
  colors: string[];
  start_point: [number, number];
  end_point: [number, number];
  locations: number[];
}

export interface ABABarTitlePayload {
  title: string;
  bgColor: string | ABAGradientColor;
  color: string;
  safeAreaColor?: string;
}

export interface ABAGetDefaultAccPayload {
  currency: 'USD' | 'KHR';
  amount: string;
}

export interface ABADefaultAccResponse {
  accountName: string;
  accountNumber: string;
  currency: string;
}

export interface ABAPaymentPayload {
  amount: string;
  account: string;
  currency: 'USD' | 'KHR';
  // vendorId: string;
  useDefault: boolean;
  additionalKey: {
    hash: string;
  };
}

export interface ABAPaymentStatusResponse {
  transactionId: string;
  debitAmount: string;
  debitCcy: string;
  accountNumber: string;
  accountName: string;
}

export class ABABridgeService {
  /**
   * Standardized ABA Error Handler
   */
  private static handleBridgeError(handlerName: string, error: any): Promise<never> {
    let errorCode = 'APP-UNKNOWN';
    let displayMessage = 'Service provider technical issues';

    if (error?.code) {
      if (error.code >= 400 && error.code <= 500) {
        displayMessage = `Service provider technical issues. Ref: [${error.transactionId || 'N/A'}][${error.code}]`;
      } else if (error.code === 'TIMEOUT') {
        displayMessage = 'Request timed out. Please try again.';
        errorCode = 'APP-TIMEOUT';
      } else if (error.code.toString().startsWith('NATIVE')) {
        errorCode = error.code;
      }
    }

    const errorObj = new Error(
      `[${handlerName}] ${displayMessage} | Original: ${error?.message || JSON.stringify(error)}`
    );

    // Crash Tracking
    if (import.meta.client) {
      Sentry.captureException(errorObj, {
        extra: { handlerName, errorData: error }
      });
    }

    // Native Bridge Logging
    try {
      callHandler('logError', { detail: errorObj.message });
    } catch (e) {}

    return Promise.reject(errorObj);
  }

  /**
   * Safe execution proxy wrapper for outbound native logic calls
   */
  static async invokeNative<T = any>(handlerName: string, payload: object = {}): Promise<T> {
    try {
      return await callHandler(handlerName, payload);
    } catch (error) {
      return this.handleBridgeError(handlerName, error);
    }
  }

  /**
   * Adjusts the Mobile App Header Layout Styling Configuration properties dynamically
   */
  static async setNavigationBar(config: ABABarTitlePayload): Promise<void> {
    return this.invokeNative<void>('setBarTitle', config);
  }

  /**
   * API #2: Retrieve the user's default account if available and balance is sufficient
   * Payload: { currency: "USD" | "KHR", amount: "xxx" }
   * Response: { accountName: string, accountNumber: string, currency: string }
   */
  static async getDefaultAcc(
    payload: ABAGetDefaultAccPayload = { currency: 'KHR', amount: '0' }
  ): Promise<ABADefaultAccResponse | null> {
    return this.invokeNative<ABADefaultAccResponse | null>('getDefaultAcc', payload);
  }

  /**
   * Manages reactive state event loops with clean functional un-registration bindings
   */
  static observeNativeEvent<T = any>(
    eventName: string,
    onIncomingData: (data: T) => void,
    acknowledgement: object = { success: true }
  ): () => void {
    registerHandler(eventName, (dataObj: any, nativeAckCallback?: Function) => {
      if (dataObj) {
        onIncomingData(dataObj as T);
      }
      if (typeof nativeAckCallback === 'function') {
        nativeAckCallback(acknowledgement);
      }
    });

    return () => {
      registerHandler(eventName, () => {});
    };
  }
}
