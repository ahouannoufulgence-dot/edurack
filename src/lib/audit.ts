
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
  const log: AuditLog = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
    oldValue,
    newValue,
    severity
  };
  
  // Dans une version réelle, ceci serait envoyé vers Firestore
  const existingLogs = JSON.parse(localStorage.getItem('edutrack_audit_logs') || '[]');
  localStorage.setItem('edutrack_audit_logs', JSON.stringify([log, ...existingLogs]));
  
  return log;
}

export function getAuditLogs(): AuditLog[] {
  return JSON.parse(localStorage.getItem('edutrack_audit_logs') || '[]');
}
