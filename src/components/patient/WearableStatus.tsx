/**
 * WearableStatus.tsx
 * Shows connected wearable devices with status indicators
 */

'use client';

import { useState } from 'react';
import {
  WearableStatusProps,
  WearableDevice,
  WearableProvider,
  getProviderIcon,
  getProviderName,
  getStatusColor,
} from './patient-dashboard.types';

export default function WearableStatus({
  devices,
  onConnect,
  onDisconnect,
  onSync,
}: WearableStatusProps) {
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);

  const handleSync = async (deviceId: string) => {
    setSyncingDevice(deviceId);
    try {
      await onSync?.(deviceId);
    } finally {
      setTimeout(() => setSyncingDevice(null), 2000);
    }
  };

  const formatLastSync = (dateString: string | null): string => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-GT');
  };

  const getDeviceStatus = (device: WearableDevice): 'connected' | 'syncing' | 'disconnected' | 'error' => {
    if (device.syncError) return 'error';
    if (syncingDevice === device.id) return 'syncing';
    if (!device.isActive) return 'disconnected';
    return 'connected';
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const statusOrder = { connected: 0, syncing: 1, error: 2, disconnected: 3 };
    return statusOrder[getDeviceStatus(a)] - statusOrder[getDeviceStatus(b)];
  });

  return (
    <div className="bg-slate-900/40 border border-slate-700/30 rounded-2xl p-6 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Dispositivos Conectados</h3>
          <p className="text-slate-400 text-sm mt-1">
            {devices.filter((d) => d.isActive).length} de {devices.length} activos
          </p>
        </div>
        <button
          onClick={() => onConnect?.('WITHINGS')}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Conectar
        </button>
      </div>

      {/* Device List */}
      <div className="space-y-3">
        {sortedDevices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">⌚</div>
            <p className="text-slate-400 mb-2">No hay dispositivos conectados</p>
            <p className="text-slate-500 text-sm">Conecta tu wearable para sincronizar datos</p>
          </div>
        ) : (
          sortedDevices.map((device) => {
            const status = getDeviceStatus(device);
            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Device Icon */}
                  <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-2xl">
                    {getProviderIcon(device.provider)}
                  </div>

                  {/* Device Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">
                        {device.deviceName || getProviderName(device.provider)}
                      </h4>
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${
                          status === 'syncing' ? 'animate-pulse' : ''
                        }`}
                      />
                    </div>
                    {device.deviceModel && (
                      <p className="text-slate-500 text-sm">{device.deviceModel}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">
                      Última sync: {formatLastSync(device.lastSyncAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {status === 'connected' && (
                    <button
                      onClick={() => handleSync(device.id)}
                      disabled={syncingDevice !== null}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                      title="Sincronizar"
                    >
                      <svg
                        className={`w-5 h-5 ${syncingDevice === device.id ? 'animate-spin' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  )}
                  {status === 'error' && device.syncError && (
                    <span className="text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded">
                      Error
                    </span>
                  )}
                  <button
                    onClick={() => onDisconnect?.(device.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Desconectar"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sync All Button */}
      {devices.filter((d) => d.isActive).length > 1 && (
        <button
          onClick={() => devices.filter((d) => d.isActive).forEach((d) => handleSync(d.id))}
          className="w-full mt-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Sincronizar Todos
        </button>
      )}
    </div>
  );
}
