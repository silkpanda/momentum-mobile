// src/constants/taskIcons.ts
// Icon library for visual task representation (especially for non-readers)

import {
    Utensils, // Eating/meals
    Bed, // Sleep/bedtime
    Bath, // Bathing/hygiene
    Shirt, // Getting dressed/clothes
    Backpack, // School/homework
    BookOpen, // Reading
    Pencil, // Writing/homework
    Trash2, // Taking out trash
    Dog, // Pet care
    Cat, // Pet care (cat)
    Sparkles, // Cleaning/tidying
    Droplets, // Watering plants
    Car, // Car-related chores
    ShoppingCart, // Shopping/groceries
    Music, // Music practice
    Dumbbell, // Exercise
    Gamepad2, // Gaming (limited time)
    Tv, // TV time
    Smartphone, // Phone/screen time
    Heart, // Self-care/kindness
    Users, // Family time
    Baby, // Babysitting/sibling care
    Smile, // Being kind/good behavior
    Star, // Special achievement
    Trophy, // Goal/reward
    Target, // Focus task
    CheckCircle, // Completed
    Clock, // Time-based task
    Calendar, // Scheduled task
    Home, // Home chores
    Leaf, // Outdoor/garden
    Paintbrush, // Art/creativity
    Scissors, // Crafts
    Cookie, // Baking/cooking
    Pizza, // Meal prep
    Apple, // Healthy eating
    Bike, // Biking/outdoor activity
    TreePine, // Nature/outside
    Sun, // Morning routine
    Moon, // Evening routine
    Zap, // Quick task
    Flame, // Important/urgent
} from 'lucide-react-native';

export interface TaskIcon {
    name: string;
    component: any;
    label: string;
    category: 'routine' | 'chores' | 'school' | 'fun' | 'care' | 'special';
    color?: string; // Optional default color
}

export const TASK_ICONS: Record<string, TaskIcon> = {
    // Routine Tasks
    breakfast: { name: 'breakfast', component: Utensils, label: 'Breakfast', category: 'routine', color: '#F59E0B' },
    lunch: { name: 'lunch', component: Utensils, label: 'Lunch', category: 'routine', color: '#F59E0B' },
    dinner: { name: 'dinner', component: Utensils, label: 'Dinner', category: 'routine', color: '#F59E0B' },
    sleep: { name: 'sleep', component: Bed, label: 'Bedtime', category: 'routine', color: '#6366F1' },
    bath: { name: 'bath', component: Bath, label: 'Bath/Shower', category: 'routine', color: '#3B82F6' },
    dressed: { name: 'dressed', component: Shirt, label: 'Get Dressed', category: 'routine', color: '#8B5CF6' },
    morning: { name: 'morning', component: Sun, label: 'Morning Routine', category: 'routine', color: '#FBBF24' },
    evening: { name: 'evening', component: Moon, label: 'Evening Routine', category: 'routine', color: '#6366F1' },

    // Chores
    trash: { name: 'trash', component: Trash2, label: 'Take Out Trash', category: 'chores', color: '#10B981' },
    clean: { name: 'clean', component: Sparkles, label: 'Clean Room', category: 'chores', color: '#14B8A6' },
    vacuum: { name: 'vacuum', component: Sparkles, label: 'Vacuum', category: 'chores', color: '#06B6D4' },
    dishes: { name: 'dishes', component: Utensils, label: 'Dishes', category: 'chores', color: '#0EA5E9' },
    laundry: { name: 'laundry', component: Shirt, label: 'Laundry', category: 'chores', color: '#8B5CF6' },
    water: { name: 'water', component: Droplets, label: 'Water Plants', category: 'chores', color: '#10B981' },
    yard: { name: 'yard', component: Leaf, label: 'Yard Work', category: 'chores', color: '#22C55E' },
    car: { name: 'car', component: Car, label: 'Car Chore', category: 'chores', color: '#64748B' },

    // School/Learning
    homework: { name: 'homework', component: Backpack, label: 'Homework', category: 'school', color: '#EF4444' },
    reading: { name: 'reading', component: BookOpen, label: 'Reading', category: 'school', color: '#F59E0B' },
    writing: { name: 'writing', component: Pencil, label: 'Writing', category: 'school', color: '#3B82F6' },
    study: { name: 'study', component: BookOpen, label: 'Study', category: 'school', color: '#8B5CF6' },

    // Fun/Activities
    music: { name: 'music', component: Music, label: 'Music Practice', category: 'fun', color: '#EC4899' },
    art: { name: 'art', component: Paintbrush, label: 'Art/Drawing', category: 'fun', color: '#F472B6' },
    crafts: { name: 'crafts', component: Scissors, label: 'Crafts', category: 'fun', color: '#A78BFA' },
    gaming: { name: 'gaming', component: Gamepad2, label: 'Gaming Time', category: 'fun', color: '#6366F1' },
    tv: { name: 'tv', component: Tv, label: 'TV Time', category: 'fun', color: '#8B5CF6' },
    bike: { name: 'bike', component: Bike, label: 'Biking', category: 'fun', color: '#10B981' },
    outside: { name: 'outside', component: TreePine, label: 'Play Outside', category: 'fun', color: '#22C55E' },

    // Care (Self & Others)
    pet: { name: 'pet', component: Dog, label: 'Pet Care', category: 'care', color: '#F59E0B' },
    cat: { name: 'cat', component: Cat, label: 'Cat Care', category: 'care', color: '#F59E0B' },
    sibling: { name: 'sibling', component: Baby, label: 'Help Sibling', category: 'care', color: '#EC4899' },
    kindness: { name: 'kindness', component: Heart, label: 'Act of Kindness', category: 'care', color: '#EF4444' },
    family: { name: 'family', component: Users, label: 'Family Time', category: 'care', color: '#8B5CF6' },
    selfcare: { name: 'selfcare', component: Smile, label: 'Self Care', category: 'care', color: '#EC4899' },

    // Special/Meta
    star: { name: 'star', component: Star, label: 'Special Task', category: 'special', color: '#FBBF24' },
    trophy: { name: 'trophy', component: Trophy, label: 'Achievement', category: 'special', color: '#F59E0B' },
    target: { name: 'target', component: Target, label: 'Focus Task', category: 'special', color: '#EF4444' },
    quick: { name: 'quick', component: Zap, label: 'Quick Task', category: 'special', color: '#FBBF24' },
    important: { name: 'important', component: Flame, label: 'Important', category: 'special', color: '#EF4444' },

    // Food/Cooking
    cooking: { name: 'cooking', component: Cookie, label: 'Cooking/Baking', category: 'chores', color: '#F59E0B' },
    meal: { name: 'meal', component: Pizza, label: 'Meal Prep', category: 'chores', color: '#EF4444' },
    healthy: { name: 'healthy', component: Apple, label: 'Healthy Eating', category: 'routine', color: '#22C55E' },

    // Time-based
    timed: { name: 'timed', component: Clock, label: 'Timed Task', category: 'special', color: '#6366F1' },
    scheduled: { name: 'scheduled', component: Calendar, label: 'Scheduled', category: 'special', color: '#8B5CF6' },

    // General
    home: { name: 'home', component: Home, label: 'Home Task', category: 'chores', color: '#64748B' },
    check: { name: 'check', component: CheckCircle, label: 'General Task', category: 'special', color: '#10B981' },
};

export const ICON_CATEGORIES = [
    { id: 'routine', label: 'Daily Routine', emoji: '🌅' },
    { id: 'chores', label: 'Chores', emoji: '🧹' },
    { id: 'school', label: 'School/Learning', emoji: '📚' },
    { id: 'fun', label: 'Fun & Activities', emoji: '🎨' },
    { id: 'care', label: 'Care & Kindness', emoji: '❤️' },
    { id: 'special', label: 'Special', emoji: '⭐' },
] as const;

// Helper to get icon component by name
export const getTaskIcon = (iconName?: string) => {
    if (!iconName || !TASK_ICONS[iconName]) {
        return TASK_ICONS.check; // Default icon
    }
    return TASK_ICONS[iconName];
};

// Get all icons for a category
export const getIconsByCategory = (category: string) => {
    return Object.values(TASK_ICONS).filter(icon => icon.category === category);
};
