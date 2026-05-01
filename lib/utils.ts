import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function bytesToSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
}

export function formatFileSize(sizeInBytes: number): string {
  return bytesToSize(sizeInBytes)
}

export function isValidFileType(file: File, acceptedTypes: string[]): boolean {
  return acceptedTypes.includes(file.type)
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Simulate processing for demo purposes
export async function simulateProcessing(
  steps: number,
  updateProgress: (progress: number) => void
): Promise<void> {
  const stepTime = 500 // ms per step
  for (let i = 1; i <= steps; i++) {
    await delay(stepTime)
    updateProgress(Math.floor((i / steps) * 100))
  }
}
