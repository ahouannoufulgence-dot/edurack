
/**
 * @fileOverview Service de journalisation d'audit (Anti-Fraude).
 */
import { AuditLog } from './school-types';
import { getFromStorage, saveToStorage } from './data-service';

export function createAuditLog(userId: string, userName: string, action: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') {
  const logs = getFromStorage<AuditLog>('edutrack_audit_logs');
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
    severity,
    ipAddress: "Connecté via EduTrack Pro App"
  };
  logs.unshift(newLog); // Plus récent en premier
  saveToStorage('edutrack_audit_logs', logs.slice(0, 1000)); // Garder les 1000 derniers
}

export function getAuditLogs(): AuditLog[] {
  return getFromStorage<AuditLog>('edutrack_audit_logs');
}
