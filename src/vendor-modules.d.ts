declare module 'read-excel-file/browser' {
  export function readSheet(...args: unknown[]): Promise<unknown>
}

declare module 'write-excel-file/browser' {
  const writeExcelFile: (...args: unknown[]) => { toFile: (fileName: string) => Promise<void> }
  export default writeExcelFile
}
