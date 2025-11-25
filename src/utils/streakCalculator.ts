// src/utils/streakCalculator.ts
import { Member } from '../types';

/**
 * Streak Multiplier Tiers
 * Based on consecutive days of task completion
 */
export const STREAK_TIERS = [
    { days: 0, multiplier: 1.0, label: 'Getting Started', emoji: '🌱' },
    { days: 3, multiplier: 1.5, label: 'On Fire', emoji: '🔥' },
    { days: 7, multiplier: 2.0, label: 'Unstoppable', emoji: '⚡' },
    { days: 14, multiplier: 2.5, label: 'Legendary', emoji: '🌟' },
    { days: 30, multiplier: 3.0, label: 'Champion', emoji: '👑' },
] as const;

/**
 * Get the multiplier for a given streak count
 */
export const getMultiplierForStreak = (streakDays: number): number => {
    // Find the highest tier the user has reached
    let multiplier = 1.0;
    for (const tier of STREAK_TIERS) {
        if (streakDays >= tier.days) {
            multiplier = tier.multiplier;
        } else {
            break;
        }
    }
    return multiplier;
};

/**
 * Get the current tier information for a streak
 */
export const getCurrentTier = (streakDays: number) => {
    let currentTier = STREAK_TIERS[0];
    for (let i = 0; i < STREAK_TIERS.length; i++) {
        const tier = STREAK_TIERS[i];
        if (streakDays >= tier.days) {
            currentTier = tier;
        } else {
            break;
        }
    }
    return currentTier;
};

/**
 * Get the next tier information
 */
export const getNextTier = (streakDays: number) => {
    for (const tier of STREAK_TIERS) {
        if (streakDays < tier.days) {
            return tier;
        }
    }
    return null; // Already at max tier
};

/**
 * Check if a streak should be maintained or reset
 * Returns updated streak count
 */
export const calculateStreak = (
    lastCompletionDate: string | undefined,
    completedToday: boolean
): number => {
    if (!lastCompletionDate) {
        // First time completing tasks
        return completedToday ? 1 : 0;
    }

    const lastDate = new Date(lastCompletionDate);
    const today = new Date();

    // Reset time to midnight for accurate day comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
        // Same day - no change to streak
        return 0; // Caller should maintain current streak
    } else if (daysDifference === 1 && completedToday) {
        // Consecutive day - increment streak
        return 1; // Caller should increment by 1
    } else {
        // Missed a day - reset streak
        return completedToday ? 1 : 0; // Start fresh if completed today
    }
};

/**
 * Update member's streak based on task completion
 * Returns updated member data
 */
export const updateMemberStreak = (
    member: Member,
    allTasksCompletedToday: boolean
): Partial<Member> => {
    const currentStreak = member.currentStreak || 0;
    const longestStreak = member.longestStreak || 0;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (!allTasksCompletedToday) {
        // Don't update if not all tasks are done
        return {};
    }

    const streakChange = calculateStreak(member.lastCompletionDate, true);

    let newStreak: number;
    if (streakChange === 0) {
        // Same day, no change
        newStreak = currentStreak;
    } else if (streakChange === 1) {
        // Increment streak
        newStreak = currentStreak + 1;
    } else {
        // Reset streak
        newStreak = 1;
    }

    const newLongestStreak = Math.max(longestStreak, newStreak);
    const newMultiplier = getMultiplierForStreak(newStreak);

    return {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCompletionDate: today,
        streakMultiplier: newMultiplier,
    };
};

/**
 * Check if streak is at risk (no completion yesterday)
 */
export const isStreakAtRisk = (lastCompletionDate: string | undefined): boolean => {
    if (!lastCompletionDate) return false;

    const lastDate = new Date(lastCompletionDate);
    const today = new Date();

    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    // At risk if last completion was yesterday (need to complete today)
    return daysDifference === 1;
};

/**
 * Apply multiplier to points
 */
export const applyMultiplier = (basePoints: number, multiplier: number): number => {
    return Math.floor(basePoints * multiplier);
};

/**
 * Get days until next tier
 */
export const getDaysToNextTier = (currentStreak: number): number | null => {
    const nextTier = getNextTier(currentStreak);
    return nextTier ? nextTier.days - currentStreak : null;
};
