// src/hooks/doctor/usePatientDetail.ts
import { useState, useEffect } from 'react';

export function usePatientDetail(patientId: string) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!patientId) return;

        let isMounted = true;
        setIsLoading(true);

        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/doctor/patients/${patientId}`);
                if (!res.ok) throw new Error('Failed to fetch patient details');
                const json = await res.json();

                if (isMounted) {
                    setData(json.patient);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err);
                    setIsLoading(false);
                }
            }
        };

        fetchDetail();
        return () => { isMounted = false; };
    }, [patientId]);

    return { data, error, isLoading };
}
