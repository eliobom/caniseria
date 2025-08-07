import React from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { Clock } from 'lucide-react';

interface BusinessHoursProps {
  className?: string;
  showTitle?: boolean;
}

const BusinessHours: React.FC<BusinessHoursProps> = ({ 
  className = '', 
  showTitle = true 
}) => {
  const { config, loading } = useSystemConfig();

  if (loading || !config.business_hours) {
    return null;
  }

  const businessHours = config.business_hours;
  const days = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center mb-3">
          <Clock className="text-yellow-400 mr-2" size={20} />
          <h3 className="text-white font-semibold">Horarios de Atención</h3>
        </div>
      )}
      
      <div className="space-y-2">
        {Object.entries(days).map(([key, dayName]) => {
          const dayHours = businessHours[key];
          
          if (!dayHours) return null;
          
          return (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-300">{dayName}:</span>
              <span className="text-white">
                {dayHours.closed ? (
                  <span className="text-red-400">Cerrado</span>
                ) : (
                  `${dayHours.open} - ${dayHours.close}`
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessHours;