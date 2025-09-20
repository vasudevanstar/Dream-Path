import React from 'react';
import { LocationIcon, GraduationCapIcon, ChartBarIcon, RupeeIcon, TrophyIcon, PhoneIcon, GlobeIcon } from './Icons';

interface RecommendationCardProps {
  data: { [key: string]: string };
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
      <div className="flex-shrink-0 text-teal-500">{icon}</div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
};


const RecommendationCard: React.FC<RecommendationCardProps> = ({ data }) => {
  const { Course, College, Location, Justification, Website, Contact, ...details } = data;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 my-2 border border-black/5 dark:border-white/10">
      <div className="bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 p-4 rounded-t-lg -m-4 mb-4">
        <h3 className="text-lg font-bold text-white mb-1">{Course}</h3>
        <p className="text-md font-semibold text-white/90 flex items-center">
          <LocationIcon />
          {[College, Location].filter(Boolean).join(', ')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <DetailItem icon={<GraduationCapIcon />} label="Stream" value={details.Stream} />
        <DetailItem icon={<ChartBarIcon />} label="Cutoff" value={details.Cutoff} />
        <DetailItem icon={<RupeeIcon />} label="Annual Fees" value={details.Fees} />
        <DetailItem icon={<TrophyIcon />} label="Ranking" value={details.Ranking} />
        <DetailItem icon={<PhoneIcon />} label="Contact" value={Contact} />
      </div>

      {Justification && (
        <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg">
          <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-1 text-sm">Why it's a good fit:</h4>
          <p className="text-sm text-slate-700 dark:text-slate-400 italic">"{Justification}"</p>
        </div>
      )}

      {Website && (
        <a
          href={Website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors"
        >
          <GlobeIcon />
          <span>Visit Website</span>
        </a>
      )}
    </div>
  );
};

export default RecommendationCard;