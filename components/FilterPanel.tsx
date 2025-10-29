
import React, { useState } from 'react';
import type { SearchFilters } from '../types';
import { FilterIcon, LocationIcon, SubjectsIcon, RupeeIcon, GraduationCapIcon } from './Icons';

interface FilterPanelProps {
  initialFilters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ initialFilters, onApply }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    location: initialFilters.location || '',
    subjects: initialFilters.subjects || [],
    maxAnnualFees: initialFilters.maxAnnualFees || undefined,
    admissionCriteria: initialFilters.admissionCriteria || '',
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic comma-separated string to array
    const subjectsArray = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFilters(prev => ({ ...prev, subjects: subjectsArray }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 my-2 border border-black/5 dark:border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <FilterIcon />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Filter Your Search</h3>
      </div>
      <form onSubmit={handleApply} className="space-y-4">
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Location</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LocationIcon />
            </div>
            <input
              type="text"
              id="location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Mumbai, Delhi"
              className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none bg-slate-50 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* Subjects */}
        <div>
          <label htmlFor="subjects" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Subjects</label>
          <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SubjectsIcon />
            </div>
            <input
              type="text"
              id="subjects"
              value={filters.subjects?.join(', ')}
              onChange={handleSubjectChange}
              placeholder="e.g., Computer Science, Physics"
              className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none bg-slate-50 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* Max Annual Fees */}
        <div>
          <label htmlFor="maxAnnualFees" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Max Annual Fees (₹)</label>
           <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <RupeeIcon />
            </div>
            <input
              type="number"
              id="maxAnnualFees"
              value={filters.maxAnnualFees || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, maxAnnualFees: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="e.g., 200000"
              className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none bg-slate-50 dark:bg-slate-700"
            />
          </div>
        </div>
        
        {/* Admission Criteria */}
        <div>
          <label htmlFor="admissionCriteria" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Admission Criteria</label>
           <div className="relative">
             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <GraduationCapIcon />
            </div>
            <input
              type="text"
              id="admissionCriteria"
              value={filters.admissionCriteria}
              onChange={(e) => setFilters(prev => ({ ...prev, admissionCriteria: e.target.value }))}
              placeholder="e.g., JEE Mains, CUET"
              className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none bg-slate-50 dark:bg-slate-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors"
        >
          <FilterIcon />
          <span>Find Colleges</span>
        </button>
      </form>
    </div>
  );
};

export default FilterPanel;
