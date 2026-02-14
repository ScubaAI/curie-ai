// src/hooks/doctor/useAlerts.ts
import { useState, useEffect } from 'react';

export function useAlerts() {
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('/api/doctor/alerts');
            if (!res.ok) throw new Error('Failed to fetch alerts');
            const json = await res.json();
            setData(json.alerts);
            setIsLoading(false);
        } catch (err) {
            setError(err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Polling cada 30 segundos
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    return { data, error, isLoading, mutate: fetchAlerts };
}
