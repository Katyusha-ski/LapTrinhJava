import { useState } from 'react';

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  sessionsIncluded: number;
  features: string[];
}

export const PackageList = () => {
  const [packages] = useState<Package[]>([
    {
      id: 1,
      name: 'Basic',
      description: 'Perfect for beginners',
      price: 99,
      sessionsIncluded: 5,
      features: ['5 sessions', '1 mentor', 'Email support']
    },
    {
      id: 2,
      name: 'Professional',
      description: 'For serious learners',
      price: 199,
      sessionsIncluded: 15,
      features: ['15 sessions', 'Multiple mentors', 'Priority support']
    },
    {
      id: 3,
      name: 'Premium',
      description: 'Full access',
      price: 399,
      sessionsIncluded: 50,
      features: ['50 sessions', 'All mentors', '24/7 support']
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Packages & Subscriptions</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold mb-4">{pkg.name}</h3>
              <p className="text-gray-600 mb-6">{pkg.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">${pkg.price}</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <span className="text-green-600 mr-3">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageList;
