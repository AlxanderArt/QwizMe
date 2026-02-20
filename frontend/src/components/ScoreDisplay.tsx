interface Props {
  score: number;
  total: number;
  percentage: number;
}

export default function ScoreDisplay({ score, total, percentage }: Props) {
  const getColor = () => {
    if (percentage >= 80) return { ring: 'text-green-500', bg: 'bg-green-50', text: 'text-green-700' };
    if (percentage >= 60) return { ring: 'text-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' };
    return { ring: 'text-red-500', bg: 'bg-red-50', text: 'text-red-700' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center p-8 rounded-2xl ${colors.bg}`}>
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colors.ring} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${colors.text}`}>{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className={`text-lg font-semibold ${colors.text}`}>
        {score} / {total} correct
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good effort!' : 'Keep practicing!'}
      </p>
    </div>
  );
}
