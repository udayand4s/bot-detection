'use client';

import { useState } from 'react';

interface BetFormData {
  userId: string;
  betAmount: number;
  gameId: string;
  gameName: string;
}

interface ApiResponse {
  success: boolean;
  bet?: any;
  message?: string;
  error?: string;
}

export default function Home() {
  const [formData, setFormData] = useState<BetFormData>({
    userId: '',
    betAmount: 0,
    gameId: '',
    gameName: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [errors, setErrors] = useState<Partial<BetFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<BetFormData> = {};
    
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    
    if (!formData.betAmount || formData.betAmount <= 0) {
      newErrors.betAmount = 'Bet amount must be greater than 0';
    }
    
    if (!formData.gameId.trim()) {
      newErrors.gameId = 'Game ID is required';
    }
    
    if (!formData.gameName.trim()) {
      newErrors.gameName = 'Game name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'betAmount' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof BetFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setResponse(null);
    
    try {
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });
      
      const data: ApiResponse = await res.json();
      setResponse(data);
      
      if (data.success) {
        // Reset form on success
        setFormData({
          userId: '',
          betAmount: 0,
          gameId: '',
          gameName: ''
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const gameOptions = [
    { id: 'poker-001', name: 'Texas Hold\'em Poker' },
    { id: 'blackjack-001', name: 'Classic Blackjack' },
    { id: 'roulette-001', name: 'European Roulette' },
    { id: 'slots-001', name: 'Lucky Slots' },
    { id: 'baccarat-001', name: 'Punto Banco' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Place Your Bet
            </h1>
            <p className="text-gray-400">
              Enter your betting details below to place a new bet
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User ID */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.userId ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your user ID"
                  />
                  {errors.userId && (
                    <p className="mt-1 text-sm text-red-400">{errors.userId}</p>
                  )}
                </div>

                {/* Game Selection */}
                <div>
                  <label htmlFor="gameName" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Game
                  </label>
                  <select
                    id="gameName"
                    name="gameName"
                    value={formData.gameName}
                    onChange={(e) => {
                      const selectedGame = gameOptions.find(game => game.name === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        gameName: e.target.value,
                        gameId: selectedGame?.id || ''
                      }));
                    }}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.gameName ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Choose a game...</option>
                    {gameOptions.map((game) => (
                      <option key={game.id} value={game.name}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                  {errors.gameName && (
                    <p className="mt-1 text-sm text-red-400">{errors.gameName}</p>
                  )}
                </div>

                {/* Game ID (Auto-filled, read-only) */}
                <div>
                  <label htmlFor="gameId" className="block text-sm font-medium text-gray-300 mb-2">
                    Game ID
                  </label>
                  <input
                    type="text"
                    id="gameId"
                    name="gameId"
                    value={formData.gameId}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                    placeholder="Auto-filled when game is selected"
                  />
                </div>

                {/* Bet Amount */}
                <div>
                  <label htmlFor="betAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    Bet Amount ($)
                  </label>
                  <input
                    type="number"
                    id="betAmount"
                    name="betAmount"
                    value={formData.betAmount || ''}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.betAmount ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.betAmount && (
                    <p className="mt-1 text-sm text-red-400">{errors.betAmount}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Bet...
                    </div>
                  ) : (
                    'Place Bet'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Response Display */}
          {response && (
            <div className={`mt-6 p-6 rounded-xl border ${
              response.success 
                ? 'bg-green-900/20 border-green-500/30 text-green-300' 
                : 'bg-red-900/20 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  response.success ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <h3 className="font-semibold">
                  {response.success ? 'Bet Placed Successfully!' : 'Error Occurred'}
                </h3>
              </div>
              
              {response.success && response.bet && (
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="text-gray-400">Bet ID:</span> {response.bet._id}</p>
                  <p><span className="text-gray-400">Amount:</span> ${response.bet.betAmount}</p>
                  <p><span className="text-gray-400">Game:</span> {response.bet.gameName}</p>
                  <p><span className="text-gray-400">Timestamp:</span> {new Date(response.bet.timestamp).toLocaleString()}</p>
                  {response.bet.geo && (
                    <p><span className="text-gray-400">Location:</span> {response.bet.geo.city}, {response.bet.geo.region}, {response.bet.geo.country}</p>
                  )}
                </div>
              )}
              
              {!response.success && (
                <p className="mt-2 text-sm">
                  {response.message || response.error || 'An unknown error occurred'}
                </p>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Security Features</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  IP Address Tracking
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Geolocation Detection
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Timestamp Logging
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Available Games</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {gameOptions.slice(0, 3).map((game) => (
                  <li key={game.id} className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    {game.name}
                  </li>
                ))}
                <li className="text-gray-400 text-xs">+ {gameOptions.length - 3} more games</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}