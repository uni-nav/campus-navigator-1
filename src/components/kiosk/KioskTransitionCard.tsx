import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KioskTransitionCardProps {
  floorsSkipped: number[];
  getFloorName: (floorId: number) => string;
}

export function KioskTransitionCard({ floorsSkipped, getFloorName }: KioskTransitionCardProps) {
  if (floorsSkipped.length === 0) return null;

  const direction = floorsSkipped[0] > floorsSkipped[floorsSkipped.length - 1] ? 'down' : 'up';
  const Icon = direction === 'up' ? ArrowUp : ArrowDown;

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            Zinadan {direction === 'up' ? 'yuqoriga chiqing' : 'pastga tushing'}
          </h3>
          <p className="text-amber-700">
            {floorsSkipped.length === 1 
              ? `${getFloorName(floorsSkipped[0])} orqali o'ting`
              : `${floorsSkipped.map(getFloorName).join(', ')} qavatlaridan o'ting`
            }
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {floorsSkipped.map((floorId) => (
            <div
              key={floorId}
              className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-semibold"
            >
              {floorId}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}