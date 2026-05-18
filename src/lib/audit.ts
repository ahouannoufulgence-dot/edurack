import { AuditLog } from './school-types';

export function createAuditLog(
  userId: string,
  userName: string,
  action: AuditLog['action'],
  details: string,
  oldValue?: any,
  newValue?: any,
  severity: AuditLog['severity'] = 'low'
): AuditLog {
  // Simulation de récupération de métadonnées de sécurité
  const simulatedIP = `192.168.1.${Math.floor(Math.random() * 254)}`;
  const simulatedDevice = typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') : 'Unknown';

  const log: AuditLog = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
    oldValue,
    newValue,
    severity,
    ipAddress: simulatedIP,
    deviceInfo: simulatedDevice
  };
  
  if (typeof window !== 'undefined') {
    const existingLogs = JSON.parse(localStorage.getItem('edutrack_audit_logs') || '[]');
    localStorage.setItem('edutrack_audit_logs', JSON.stringify([log, ...existingLogs]));
  }
  
  return log;
}

export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('edutrack_audit_logs') || '[]');
}
