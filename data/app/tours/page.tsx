'use client';

import { useState } from 'react';
import axios from 'axios';

interface TourPlace {
  companyName: string;
  placeOfActivity: string;
  address: string;
  contact: string;
  city: string;
}

export default function ToursPage() {
  const [cities, setCities] = useState('');
  const [keywordGroups, setKeywordGroups] = useState('');
  const [places, setPlaces] = useState<TourPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');

  const handleAutomation = async () => {
    setLoading(true);
    setMessage('');
    setProgress(0);
    setCurrentStatus('');

    const cityList = cities.split('\n').filter(c => c.trim() !== '');
    const keywordGroupList = keywordGroups.split('\n').filter(k => k.trim() !== '');
    const totalRequests = cityList.length * keywordGroupList.length;
    let completedRequests = 0;

    for (const city of cityList) {
      for (const keywords of keywordGroupList) {
        setCurrentStatus(`Processing: ${city} - ${keywords}...`);
        try {
          const response = await axios.post('/api/tours', { city, keywords });
          setPlaces(prevPlaces => [...prevPlaces, ...response.data]);
          if (response.data.length > 0) {
            setMessage(prevMessage => `${prevMessage}\nFound ${response.data.length} results for ${city} with keywords "${keywords}".`);
          }
        } catch (error) {
          console.error(`Error fetching for ${city} with keywords "${keywords}":`, error);
          setMessage(prevMessage => `${prevMessage}\nFailed to fetch for ${city} with keywords "${keywords}".`);
        } finally {
          completedRequests++;
          setProgress((completedRequests / totalRequests) * 100);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    setCurrentStatus('Automation Complete.');
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post('/api/download', places, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tourist_activities.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleClear = () => {
    setPlaces([]);
    setMessage('Results cleared.');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Find Tourist Activities</h1>
      <div className="flex gap-4 mb-4">
        <textarea
          value={cities}
          onChange={(e) => setCities(e.target.value)}
          placeholder="Enter cities, one per line"
          className="border p-2 rounded w-full"
          rows={5}
        />
        <textarea
          value={keywordGroups}
          onChange={(e) => setKeywordGroups(e.target.value)}
          placeholder="Enter keyword groups, one per line"
          className="border p-2 rounded w-full"
          rows={5}
        />
      </div>
      <button onClick={handleAutomation} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
        {loading ? 'Running Automation...' : 'Start Automation'}
      </button>
      {loading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-center mt-2">{currentStatus}</p>
        </div>
      )}
      {message && <pre className="mb-4 whitespace-pre-wrap">{message}</pre>}
      {places.length > 0 && (
        <div>
          <button onClick={handleDownload} className="bg-green-500 text-white p-2 rounded mb-4">
            Download as Excel ({places.length} results)
          </button>
          <button onClick={handleClear} className="bg-red-500 text-white p-2 rounded mb-4 ml-2">
            Clear Results
          </button>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Company Name</th>
                <th className="border p-2">Place of Activity</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Contact</th>
                <th className="border p-2">City</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place, index) => (
                <tr key={index}>
                  <td className="border p-2">{place.companyName}</td>
                  <td className="border p-2">{place.placeOfActivity}</td>
                  <td className="border p-2">{place.address}</td>
                  <td className="border p-2">{place.contact}</td>
                  <td className="border p-2">{place.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
