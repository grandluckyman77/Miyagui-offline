export interface NetworkScanResult {
  devices: Array<{
    ip: string;
    hostname?: string;
    mac?: string;
    vendor?: string;
    ports: number[];
    services: string[];
    responseTime: number;
  }>;
  scanTime: number;
  totalHosts: number;
  activeHosts: number;
}

export class NetworkScanner {
  private abortController: AbortController | null = null;

  async scanLocalNetwork(subnet: string = "192.168.1"): Promise<NetworkScanResult> {
    this.abortController = new AbortController();
    const devices = [];
    const startTime = Date.now();

    // Scan common ports for each IP
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080, 8443];

    for (let i = 1; i <= 254; i++) {
      if (this.abortController.signal.aborted) break;

      const ip = `${subnet}.${i}`;
      try {
        const result = await this.probeHost(ip, commonPorts);
        if (result.ports.length > 0) {
          devices.push({
            ip,
            hostname: await this.resolveHostname(ip),
            ports: result.ports,
            services: result.services,
            responseTime: result.responseTime
          });
        }
      } catch {
        // Host unreachable
      }

      // Small delay to prevent overwhelming
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return {
      devices,
      scanTime: Date.now() - startTime,
      totalHosts: 254,
      activeHosts: devices.length
    };
  }

  private async probeHost(ip: string, ports: number[]): Promise<{ ports: number[]; services: string[]; responseTime: number }> {
    const openPorts: number[] = [];
    const services: string[] = [];
    const startTime = Date.now();

    for (const port of ports) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 500);

        await fetch(`http://${ip}:${port}`, { 
          mode: 'no-cors',
          signal: controller.signal 
        });

        clearTimeout(timeout);
        openPorts.push(port);
        services.push(this.identifyService(port));
      } catch {
        // Port closed or filtered
      }
    }

    return {
      ports: openPorts,
      services,
      responseTime: Date.now() - startTime
    };
  }

  private identifyService(port: number): string {
    const services: Record<number, string> = {
      21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
      53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
      443: 'HTTPS', 445: 'SMB', 3306: 'MySQL', 3389: 'RDP',
      5432: 'PostgreSQL', 8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt'
    };
    return services[port] || 'Unknown';
  }

  private async resolveHostname(ip: string): Promise<string | undefined> {
    try {
      // Try to get hostname via reverse DNS (limited in browser)
      return undefined;
    } catch {
      return undefined;
    }
  }

  stopScan(): void {
    this.abortController?.abort();
  }

  async getNetworkInfo(): Promise<{
    ip?: string;
    userAgent: string;
    platform: string;
    language: string;
    online: boolean;
    connectionType?: string;
    downlink?: number;
    rtt?: number;
  }> {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      connectionType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }
}
