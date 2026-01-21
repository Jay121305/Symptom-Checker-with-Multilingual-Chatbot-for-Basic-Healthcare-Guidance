'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, Check, X, User, Baby, Heart } from 'lucide-react';
import { FamilyProfile } from '@/types';
import toast from 'react-hot-toast';

interface FamilyProfilesProps {
    onProfileSelect: (profile: FamilyProfile | null) => void;
    currentProfile: FamilyProfile | null;
}

export default function FamilyProfiles({ onProfileSelect, currentProfile }: FamilyProfilesProps) {
    const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newProfile, setNewProfile] = useState<Partial<FamilyProfile>>({
        name: '',
        age: 0,
        gender: 'male',
        relationship: 'self',
    });

    // Load profiles from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('familyProfiles');
        if (saved) {
            const parsed = JSON.parse(saved);
            setProfiles(parsed);
            // Auto-select first profile if none selected
            if (!currentProfile && parsed.length > 0) {
                onProfileSelect(parsed[0]);
            }
        }
    }, []);

    // Save profiles to localStorage
    const saveProfiles = (updatedProfiles: FamilyProfile[]) => {
        localStorage.setItem('familyProfiles', JSON.stringify(updatedProfiles));
        setProfiles(updatedProfiles);
    };

    const addProfile = () => {
        if (!newProfile.name || !newProfile.age) {
            toast.error('Please fill in name and age');
            return;
        }

        const profile: FamilyProfile = {
            id: Date.now().toString(),
            name: newProfile.name || '',
            age: newProfile.age || 0,
            gender: newProfile.gender || 'male',
            relationship: newProfile.relationship || 'self',
            allergies: [],
            chronicConditions: [],
            medications: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updated = [...profiles, profile];
        saveProfiles(updated);
        setIsAddingNew(false);
        setNewProfile({ name: '', age: 0, gender: 'male', relationship: 'self' });
        toast.success(`${profile.name} added to family!`);

        // Auto-select if first profile
        if (updated.length === 1) {
            onProfileSelect(profile);
        }
    };

    const deleteProfile = (id: string) => {
        const updated = profiles.filter(p => p.id !== id);
        saveProfiles(updated);
        if (currentProfile?.id === id) {
            onProfileSelect(updated[0] || null);
        }
        toast.success('Profile removed');
    };

    const getAgeIcon = (age: number) => {
        if (age < 12) return <Baby className="w-4 h-4" />;
        if (age > 60) return <Heart className="w-4 h-4" />;
        return <User className="w-4 h-4" />;
    };

    const getAgeCategory = (age: number) => {
        if (age < 2) return 'Infant';
        if (age < 12) return 'Child';
        if (age < 18) return 'Teen';
        if (age < 60) return 'Adult';
        return 'Senior';
    };

    const relationships = [
        { value: 'self', label: 'Self', labelHi: 'खुद' },
        { value: 'spouse', label: 'Spouse', labelHi: 'पति/पत्नी' },
        { value: 'child', label: 'Child', labelHi: 'बच्चा' },
        { value: 'parent', label: 'Parent', labelHi: 'माता-पिता' },
        { value: 'sibling', label: 'Sibling', labelHi: 'भाई/बहन' },
        { value: 'grandparent', label: 'Grandparent', labelHi: 'दादा-दादी' },
        { value: 'other', label: 'Other', labelHi: 'अन्य' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Family Profiles</h3>
                </div>
                <button
                    onClick={() => setIsAddingNew(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Profile Cards */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {profiles.map((profile) => (
                    <motion.div
                        key={profile.id}
                        layout
                        className={`flex-shrink-0 p-3 rounded-lg border-2 cursor-pointer transition-all min-w-[120px] ${currentProfile?.id === profile.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                        onClick={() => onProfileSelect(profile)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-full ${profile.gender === 'male' ? 'bg-blue-100' :
                                    profile.gender === 'female' ? 'bg-pink-100' : 'bg-purple-100'
                                }`}>
                                {getAgeIcon(profile.age)}
                            </div>
                            {currentProfile?.id === profile.id && (
                                <Check className="w-4 h-4 text-blue-500" />
                            )}
                        </div>
                        <p className="font-medium text-sm truncate">{profile.name}</p>
                        <p className="text-xs text-gray-500">
                            {profile.age}y • {getAgeCategory(profile.age)}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{profile.relationship}</p>

                        {/* Quick Actions */}
                        {currentProfile?.id === profile.id && (
                            <div className="flex gap-1 mt-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingId(profile.id); }}
                                    className="p-1 text-gray-400 hover:text-blue-500"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); }}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}

                {profiles.length === 0 && !isAddingNew && (
                    <div className="w-full text-center py-4 text-gray-500 text-sm">
                        <p>No family members added yet</p>
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="text-blue-500 hover:underline mt-1"
                        >
                            Add your first profile
                        </button>
                    </div>
                )}
            </div>

            {/* Add New Profile Form */}
            <AnimatePresence>
                {isAddingNew && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t mt-4 pt-4"
                    >
                        <h4 className="font-medium mb-3">Add Family Member</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newProfile.name}
                                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    placeholder="Enter name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Age</label>
                                <input
                                    type="number"
                                    value={newProfile.age || ''}
                                    onChange={(e) => setNewProfile({ ...newProfile, age: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    placeholder="Age"
                                    min="0"
                                    max="120"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Gender</label>
                                <select
                                    value={newProfile.gender}
                                    onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Relationship</label>
                                <select
                                    value={newProfile.relationship}
                                    onChange={(e) => setNewProfile({ ...newProfile, relationship: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                >
                                    {relationships.map((rel) => (
                                        <option key={rel.value} value={rel.value}>{rel.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={addProfile}
                                className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                            >
                                Add Member
                            </button>
                            <button
                                onClick={() => setIsAddingNew(false)}
                                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Profile Summary */}
            {currentProfile && !isAddingNew && (
                <div className="border-t mt-4 pt-4">
                    <p className="text-xs text-gray-500 mb-1">Currently viewing health data for:</p>
                    <p className="font-medium text-blue-600">
                        {currentProfile.name} ({currentProfile.age}y, {currentProfile.gender})
                    </p>
                </div>
            )}
        </div>
    );
}
