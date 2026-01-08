
import { TranscriptionSegment } from "../types";

export const generateSRT = (segments: TranscriptionSegment[]): string => {
  return segments
    .map((seg) => {
      return `${seg.index}\n${seg.start} --> ${seg.end}\n${seg.text}\n`;
    })
    .join("\n");
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
