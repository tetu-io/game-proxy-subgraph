import os from 'os';

export function logSystemResources() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = process.memoryUsage();
  const cpuAverage = os.loadavg();
  console.log(`
    Total Memory: ${(totalMemory / 1024 / 1024).toFixed(2)} MB,
    Free Memory: ${(freeMemory / 1024 / 1024).toFixed(2)} MB,
    Used Memory: ${(usedMemory / 1024 / 1024).toFixed(2)} MB,
    Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB,
    Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB,
    CPU Load Average: ${cpuAverage.map(x => x.toFixed(2)).join(', ')}
  `);
}