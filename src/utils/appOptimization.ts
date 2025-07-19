// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Local storage utilities with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }
};

// Data validation utilities
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phoneNumber: (phone: string): boolean => {
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  notEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  }
};

// Image optimization utilities
export const imageUtils = {
  compress: async (file: File, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  resize: async (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

// Format utilities
export const formatters = {
  number: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  },

  currency: (amount: number, currency: string = "EUR"): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency
    }).format(amount);
  },

  date: (date: Date | string, format: "short" | "long" | "relative" = "short"): string => {
    const d = new Date(date);
    
    if (format === "relative") {
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (days > 0) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
      if (hours > 0) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
      if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
      return "maintenant";
    }

    return d.toLocaleDateString("fr-FR", 
      format === "long" 
        ? { year: "numeric", month: "long", day: "numeric" }
        : { year: "numeric", month: "2-digit", day: "2-digit" }
    );
  }
};

// Performance monitoring
export const performance = {
  measure: (name: string, fn: () => any) => {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
    console.log(`Performance: ${name} took ${duration}ms`);
    return result;
  },

  measureAsync: async (name: string, fn: () => Promise<any>) => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`Performance: ${name} took ${duration}ms`);
    return result;
  }
};