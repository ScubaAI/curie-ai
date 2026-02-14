// src/hooks/doctor/usePatients.ts
import { useState, useEffect } from 'react';

export function usePatients(query?: string) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const fetchPatients = async () => {
            try {
                const url = query
                    ? `/api/doctor/patients?q=${encodeURIComponent(query)}`
                    : '/api/doctor/patients';

                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch patients');
                const json = await res.json();

                if (isMounted) {
                    setData(json.patients);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err);
                    setIsLoading(false);
                }
            }
        };

        fetchPatients();
        return () => { isMounted = false; };
    }, [query]);

    return { data, error, isLoading };
}
