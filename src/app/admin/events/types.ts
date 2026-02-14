export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'ERROR' | 'CRITICAL';

export type EventType =
    | 'SYSTEM_STATUS'
    | 'TOKEN_ROTATION_SUCCESS'
    | 'TOKEN_ROTATION_FAILURE'
    | 'SYNC_COMPLETED'
    | 'SYNC_FAILED'
    | 'ONBOARDING_COMPLETED'
    | 'SECURITY_ALERT'
    | 'API_ERROR'
    | 'DATABASE_MAINTENANCE';

export interface SystemEvent {
    id: string;
    type: EventType;
    severity: EventSeverity;
    title: string;
    description: string | null;
    data: any;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventFilters {
    type?: EventType;
    severity?: EventSeverity;
    dateFrom?: string;
    dateTo?: string;
    isRead?: boolean;
}
