import React, { useState, useCallback, useEffect } from 'react';
import Card from './Card';
import { getFinancialInsights } from '../services/geminiService';
import type { GroundingChunk } from '../types';

const Insights: React.FC = () => {
    const [topic, setTopic] = useState('latest trends in personal budgeting');
    const [isLoading, setIsLoading] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const fetchInsights = useCallback(async (currentTopic: string) => {
        if (!currentTopic) return;
        setIsLoading(true);
        setError(null);
        setInsight(null);
        setSources([]);

        try {
            const result = await getFinancialInsights(currentTopic);
            setInsight(result.text);
            setSources(result.sources);
        } catch (e) {
            setError('Failed to fetch insights. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchInsights(topic);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInsights(topic);
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h2 className="text-3xl font-bold text-white">Financial Insights</h2>

            <Card>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., how to invest in stocks"
                        className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {isLoading ? 'Searching...' : 'Get Insights'}
                    </button>
                </form>
            </Card>

            <Card>
                {isLoading && <div className="text-center p-8 text-gray-300">Fetching the latest insights from the web...</div>}
                {error && <div className="text-center p-8 text-red-400">{error}</div>}
                {insight && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-white">Insights on "{topic}"</h3>
                        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-white">
                           <p className="whitespace-pre-wrap">{insight}</p>
                        </div>
                        {sources.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-300">Sources:</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {sources.map((source, index) => source.web && (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Insights;
