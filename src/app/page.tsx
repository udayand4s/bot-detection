'use client';

import { useState } from 'react';
import axios from 'axios';

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

interface Bet {
  _id: string;
  userId: string;
  betAmount: number;
  gameId: string;
  gameName: string;
  timestamp: string;
  clientIP?: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
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
  const [errors, setErrors] = useState<Partial<Record<keyof BetFormData, string>>>({});
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [showBets, setShowBets] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BetFormData, string>> = {};
    
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
      const res = await axios.post('/api/bet', {
          ...formData,
          timestamp: new Date().toISOString(),
        }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data: ApiResponse = res.data;
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

  const handleGetBets = async () => {
    setIsLoadingBets(true);
    try {
      const res = await axios.get('/api/getbets');
      const data = res.data;
      
      if (data.success) {
        setBets(data.bets || []);
        setShowBets(true);
      } else {
        console.error('Failed to fetch bets:', data.message);
      }
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setIsLoadingBets(false);
    }
  };

  const gameOptions = [
    { id: '2986', name: 'Manchester United vs Chelsea' },
    { id: '0962', name: 'IND vs AUS' },
    { id: '4175', name: 'RCB vs CSK' },
    { id: '7268', name: 'Real Madrid vs Barcelona' },
    { id: '0032', name: 'Celtics vs Warriors' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Place Your Bet
            </h1>
            <p className="text-gray-300">
              Enter your betting details below to place a new bet
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-[rgb(26,26,26)] rounded-2xl shadow-2xl border border-[rgb(68,68,68)] overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User ID */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-200 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-[rgb(26,26,26)] border rounded-lg focus:ring-2 focus:ring-[rgb(255,199,44)] focus:border-transparent transition-all duration-200 text-white ${
                      errors.userId ? 'border-red-500' : 'border-[rgb(68,68,68)]'
                    }`}
                    placeholder="Enter your user ID"
                  />
                  {errors.userId && (
                    <p className="mt-1 text-sm text-red-400">{errors.userId}</p>
                  )}
                </div>

                {/* Game Selection */}
                <div>
                  <label htmlFor="gameName" className="block text-sm font-medium text-gray-200 mb-2">
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
                    className={`w-full px-4 py-3 bg-[rgb(26,26,26)] border rounded-lg focus:ring-2 focus:ring-[rgb(255,199,44)] focus:border-transparent transition-all duration-200 text-white ${
                      errors.gameName ? 'border-red-500' : 'border-[rgb(68,68,68)]'
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
                  <label htmlFor="gameId" className="block text-sm font-medium text-gray-200 mb-2">
                    Game ID
                  </label>
                  <input
                    type="text"
                    id="gameId"
                    name="gameId"
                    value={formData.gameId}
                    readOnly
                    className="w-full px-4 py-3 bg-[rgb(26,26,26)] border border-[rgb(68,68,68)] rounded-lg text-gray-200 cursor-not-allowed"
                    placeholder="Auto-filled when game is selected"
                  />
                </div>

                {/* Bet Amount */}
                <div>
                  <label htmlFor="betAmount" className="block text-sm font-medium text-gray-200 mb-2">
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
                    className={`w-full px-4 py-3 bg-[rgb(26,26,26)] border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-white ${
                      errors.betAmount ? 'border-red-500' : 'border-[rgb(68,68,68)]'
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
                  className="w-full bg-[rgb(256,199,44)] disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
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
                  {response.bet.location && (
                    <p><span className="text-gray-400">Location:</span> {response.bet.location.city}, {response.bet.location.region}, {response.bet.location.country}</p>
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

          {/* Get Bets Section */}
          <div className="mt-8">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    View All Bets
                  </h2>
                  <button
                    onClick={handleGetBets}
                    disabled={isLoadingBets}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoadingBets ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      'Get Bets'
                    )}
                  </button>
                </div>

                {/* Bets Display */}
                {showBets && (
                  <div className="space-y-4">
                    {bets.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-lg">No bets found</p>
                        <p className="text-gray-500 text-sm mt-2">Place a bet to see it here</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {bets.map((bet) => (
                          <div
                            key={bet._id}
                            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-white mb-1">
                                  {bet.gameName}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  Game ID: {bet.gameId}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-400">
                                  ${bet.betAmount}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(bet.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">User ID:</span>
                                <p className="text-white">{bet.userId}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Bet ID:</span>
                                <p className="text-white font-mono text-xs">
                                  {bet._id.slice(-8)}...
                                </p>
                              </div>
                              {bet.location && (
                                <div className="col-span-2">
                                  <span className="text-gray-400">Location:</span>
                                  <p className="text-white">
                                    {bet.location.city}, {bet.location.region}, {bet.location.country}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}