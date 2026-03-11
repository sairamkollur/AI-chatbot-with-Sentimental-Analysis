import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChart = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/dashboard");
      const data = await response.json();
      if (data.image) {
        setChart(data.image);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md mt-4 print:shadow-none print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h3 className="text-lg font-bold text-gray-800">Mental Health Analytics</h3>
        <button 
          onClick={fetchChart}
          className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200"
        >
          Refresh Stats
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 italic">
          Generating your mood trend...
        </div>
      ) : chart ? (
        <div className="flex flex-col items-center">
          <img 
            src={`data:image/png;base64,${chart}`} 
            alt="Mood Dashboard" 
            className="max-w-full h-auto rounded-lg border border-gray-100"
          />
          
          {/* ADDED EXPORT BUTTON HERE */}
          <button 
            onClick={() => window.print()}
            className="mt-6 w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition font-medium shadow-sm print:hidden"
          >
            Export Health Report (PDF)
          </button>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Not enough data yet. Keep chatting to see your trends!
        </div>
      )}
    </div>
  );
}