import { useState } from 'react';
import { FiClock, FiMapPin, FiUsers, FiTag, FiX } from 'react-icons/fi';

const QueueForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    maxCapacity: '',
    estimatedServiceTime: '',
    operatingHours: {
      startTime: '',
      startPeriod: 'AM',
      endTime: '',
      endPeriod: 'PM',
    },
    category: '',
  });

  const categoryOptions = [
    'Restaurant',
    'Retail',
    'Healthcare',
    'Government Services',
    'Entertainment',
    'Education',
    'Financial Services',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('operatingHours.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        operatingHours: { ...prev.operatingHours, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      operatingHours: {
        start: `${formData.operatingHours.startTime} ${formData.operatingHours.startPeriod}`,
        end: `${formData.operatingHours.endTime} ${formData.operatingHours.endPeriod}`,
      },
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Queue Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows="3"
          required
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="location"
            id="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          id="category"
          required
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select a category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700">
            Max Capacity
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUsers className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="maxCapacity"
              id="maxCapacity"
              required
              min="1"
              value={formData.maxCapacity}
              onChange={handleChange}
              className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="estimatedServiceTime" className="block text-sm font-medium text-gray-700">
            Estimated Service Time (minutes)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiClock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="estimatedServiceTime"
              id="estimatedServiceTime"
              required
              min="1"
              value={formData.estimatedServiceTime}
              onChange={handleChange}
              className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="operatingHours.startTime" className="block text-sm font-medium text-gray-700">
            Opening Time
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="time"
              name="operatingHours.startTime"
              id="operatingHours.startTime"
              required
              value={formData.operatingHours.startTime}
              onChange={handleChange}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            />
            <select
              name="operatingHours.startPeriod"
              value={formData.operatingHours.startPeriod}
              onChange={handleChange}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="operatingHours.endTime" className="block text-sm font-medium text-gray-700">
            Closing Time
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="time"
              name="operatingHours.endTime"
              id="operatingHours.endTime"
              required
              value={formData.operatingHours.endTime}
              onChange={handleChange}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            />
            <select
              name="operatingHours.endPeriod"
              value={formData.operatingHours.endPeriod}
              onChange={handleChange}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || !formData.category}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Queue'}
        </button>
      </div>
    </form>
  );
};

export default QueueForm;