import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KioskTransitionCardProps {
  floorsSkipped: number[];
  getFloorName: (floorId: number) => string;
  stairsName?: string;
  message?: string;
}

export function KioskTransitionCard({ 
  floorsSkipped, 
  getFloorName, 
  stairsName,
  message 
}: KioskTransitionCardProps) {
  if (floorsSkipped.length === 0) return null;

  const direction = floorsSkipped[0] > floorsSkipped[floorsSkipped.length - 1] ? 'down' : 'up';
  const Icon = direction === 'up' ? ArrowUp : ArrowDown;

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
          <ArrowUpDown className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-lg text-gray-800">
              {stairsName 
                ? `${stairsName} orqali ${direction === 'up' ? 'yuqoriga chiqing' : 'pastga tushing'}`
                : `Zinadan ${direction === 'up' ? 'yuqoriga chiqing' : 'pastga tushing'}`
              }
            </h3>
          </div>
          {message ? (
            <p className="text-amber-700">{message}</p>
          ) : (
            <p className="text-amber-700">
              {floorsSkipped.length === 1 
                ? `${getFloorName(floorsSkipped[0])} orqali o'ting`
                : `${floorsSkipped.map(getFloorName).join(', ')} qavatlaridan o'ting`
              }
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-600">{floorsSkipped.length}</p>
          <p className="text-sm text-amber-500">qavat</p>
        </div>
      </div>
    </Card>
  );
}