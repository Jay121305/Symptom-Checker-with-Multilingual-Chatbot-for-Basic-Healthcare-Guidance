import ImpactStatistics from '@/components/ImpactStatistics';

export const metadata = {
  title: 'Impact Statistics - DeepBlue Health',
  description: 'Real-world impact and statistics demonstrating how DeepBlue Health is transforming rural healthcare across India',
};

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ImpactStatistics />
    </div>
  );
}
