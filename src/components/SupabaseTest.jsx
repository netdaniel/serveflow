import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function SupabaseTest() {
    const [testResult, setTestResult] = useState('Testing...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const testSupabase = async () => {
            try {
                console.log('Testing Supabase connection...');
                
                // Test 1: Check if we can connect to the database
                const { data, error } = await supabase
                    .from('organizations')
                    .select('count()', { count: 'exact', head: true });
                
                if (error) {
                    console.error('Supabase error:', error);
                    setTestResult(`❌ Connection failed: ${error.message}`);
                    setError(error);
                } else {
                    console.log('Supabase connection successful!');
                    setTestResult('✅ Supabase is working correctly!');
                    setError(null);
                }
            } catch (err) {
                console.error('Test error:', err);
                setTestResult(`❌ Test failed: ${err.message}`);
                setError(err);
            }
        };

        testSupabase();
    }, []);

    return (
        <div className="p-4 bg-gray-100 rounded-lg max-w-md mx-auto mt-8">
            <h2 className="text-lg font-bold mb-2">Supabase Connection Test</h2>
            <div className={`p-3 rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {testResult}
            </div>
            {error && (
                <div className="mt-2 text-sm text-red-600">
                    <strong>Error details:</strong> {error.message}
                </div>
            )}
            <div className="mt-2 text-sm text-gray-600">
                Check browser console for more details
            </div>
        </div>
    );
}