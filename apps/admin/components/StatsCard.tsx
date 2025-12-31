/**
 * Stats card component
 */
export function StatsCard({
  title,
  value,
  trend,
  icon,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  trend?: { value: number; direction: 'up' | 'down' };
  icon?: React.ReactNode;
  color?: 'primary' | 'green' | 'blue' | 'red' | 'yellow';
}) {
  const bgColor = {
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
  }[color];

  const borderColor = {
    primary: 'border-primary-200',
    green: 'border-green-200',
    blue: 'border-blue-200',
    red: 'border-red-200',
    yellow: 'border-yellow-200',
  }[color];

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '📈' : '📉'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}

/**
 * Stats grid
 */
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{children}</div>;
}
