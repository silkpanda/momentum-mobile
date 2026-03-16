// src/hooks/useOptimisticUpdate.ts
import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';

interface OptimisticUpdateOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
}

/**
 * Custom hook for optimistic UI updates with automatic rollback on error
 * 
 * Usage:
 * const { execute, isLoading } = useOptimisticUpdate();
 * 
 * await execute({
 *   optimisticUpdate: () => setData(newData),
 *   rollback: () => setData(oldData),
 *   apiCall: () => api.updateSomething(newData),
 * });
 */
export function useOptimisticUpdate<T = any>() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async ({
        optimisticUpdate,
        rollback,
        apiCall,
        onSuccess,
        onError,
        successMessage,
        errorMessage,
    }: {
        optimisticUpdate: () => void;
        rollback: () => void;
        apiCall: () => Promise<T>;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
        successMessage?: string;
        errorMessage?: string;
    }): Promise<T | null> => {
        try {
            setIsLoading(true);
            setError(null);

            // Apply optimistic update immediately
            optimisticUpdate();

            // Make the API call
            const result = await apiCall();

            // Success!
            if (successMessage) {
                logger.info(successMessage);
            }

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (err) {
            // Rollback the optimistic update
            rollback();

            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);

            logger.error(errorMessage || 'Optimistic update failed:', error);

            if (onError) {
                onError(error);
            }

            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        execute,
        isLoading,
        error,
    };
}

/**
 * Simplified version for state updates
 */
export function useOptimisticState<T>(initialState: T) {
    const [state, setState] = useState<T>(initialState);
    const [previousState, setPreviousState] = useState<T>(initialState);
    const { execute, isLoading, error } = useOptimisticUpdate<T>();

    const updateOptimistically = useCallback(async (
        newState: T | ((prev: T) => T),
        apiCall: () => Promise<any>,
        options?: OptimisticUpdateOptions<any>
    ) => {
        const computedNewState = typeof newState === 'function'
            ? (newState as (prev: T) => T)(state)
            : newState;

        return execute({
            optimisticUpdate: () => {
                setPreviousState(state);
                setState(computedNewState);
            },
            rollback: () => {
                setState(previousState);
            },
            apiCall,
            ...options,
        });
    }, [state, previousState, execute]);

    return {
        state,
        setState,
        updateOptimistically,
        isLoading,
        error,
    };
}
