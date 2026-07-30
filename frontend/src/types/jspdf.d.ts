declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    setFillColor(r: number, g?: number, b?: number): void;
    setFillColor(colorStr: string): void;
    rect(x: number, y: number, w: number, h: number, style?: string): void;
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void;
    setTextColor(r: number, g?: number, b?: number): void;
    setTextColor(colorStr: string): void;
    setFont(fontName: string, fontStyle?: string): void;
    setFontSize(size: number): void;
    text(text: string, x: number, y: number, options?: any): void;
    setDrawColor(colorStr: string): void;
    setLineWidth(width: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    output(type: 'blob'): Blob;
    output(type: 'arraybuffer'): ArrayBuffer;
    output(type: string): any;
  }
  export default jsPDF;
}
