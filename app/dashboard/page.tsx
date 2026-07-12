'use client';

import React, { useState, useEffect } from 'react';
import { ProtocolMetrics, ClusterNode } from '@/lib/types';
import { Activity, ShieldAlert, CheckCircle2, Zap, Database, Cpu, Plus, Minus, Server, Lock } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { hacashEVM } from '../providers';

const OVERCLOCK_CORE_ADDRESS = '0x0000000000000000000000000000000000001000' as const;

// Mock ABI for the MVP smart contract
const overclockABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "lotCount", "type": "uint256" }],
    "name": "mintLot",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "getPassports",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "getOVLBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  
  // Real Balance fetching
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Mock global network state (still fetched from API since it's off-chain or protocol level metrics)
  const [metrics, setMetrics] = useState<ProtocolMetrics | null>(null);
  const [lotCount, setLotCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [localPassports, setLocalPassports] = useState<number>(0);
  const [localOVL, setLocalOVL] = useState<number>(0);

  // Smart Contract Integration
  const { data: hash, writeContract, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({
    hash,
  });

  // Mock read for Passports / OVL from contract
  const { data: passportCount } = useReadContract({
    address: OVERCLOCK_CORE_ADDRESS,
    abi: overclockABI,
    functionName: 'getPassports',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: ovlBalance } = useReadContract({
    address: OVERCLOCK_CORE_ADDRESS,
    abi: overclockABI,
    functionName: 'getOVLBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const fetchGlobalState = async () => {
    try {
      const metricsRes = await fetch('/api/mesh/status');
      const m = await metricsRes.json();
      setMetrics(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalState();
    const interval = setInterval(fetchGlobalState, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simulate smart contract state update for the MVP demo
  useEffect(() => {
    if (isConfirmed && hash) {
      setLocalPassports(prev => prev + lotCount);
      setLocalOVL(prev => prev + (lotCount * 15000));
    }
  }, [isConfirmed, hash]);

  const handleMint = () => {
    if (!isConnected || !address) return;
    
    writeContract({
      address: OVERCLOCK_CORE_ADDRESS,
      abi: overclockABI,
      functionName: 'mintLot',
      args: [BigInt(lotCount)],
      value: parseEther((lotCount * 1).toString()),
      account: address as `0x${string}`,
      chain: hacashEVM,
    });
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/mesh/verify', { method: 'POST' });
      if (res.ok) {
        await fetchGlobalState();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const requiredHACD = lotCount * 1;
  const requiredHAC = lotCount * 0.1;
  const displayPassportCount = (typeof passportCount === 'bigint' ? Number(passportCount) : 0) + localPassports;
  const displayOVL = (typeof ovlBalance === 'bigint' ? Number(ovlBalance) : 0) + localOVL;

  if (loading) {
    return <div suppressHydrationWarning className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center font-sans">Initializing Overclock Mesh...</div>;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-purple-900 selection:text-white pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold tracking-widest uppercase hidden sm:block">Overclock<span className="text-purple-500">Mesh</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <ConnectButton showBalance={true} chainStatus="full" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Network Metrics & Minting */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Protocol Metrics */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Global Metrics
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Mesh Saturation</span>
                  <span className="font-mono">{metrics?.filledSlots} / {metrics?.maxSlots}</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                    style={{ width: `${(metrics?.filledSlots || 0) / (metrics?.maxSlots || 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Circulating $OVL</span>
                  <span className="font-mono text-emerald-400">{metrics?.circulatingOVL.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configurator */}
          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col">
            <div className="p-6">
              <h2 className="text-lg font-serif mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" /> Allocate Mesh Lots
              </h2>

              {!isConnected ? (
                <div className="h-48 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-gray-400">Please Connect Wallet to Access Infrastructure Allocation</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-black/50 rounded-xl p-2 border border-white/5">
                    <button 
                      onClick={() => setLotCount(Math.max(1, lotCount - 1))}
                      className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-mono">{lotCount}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Lots</span>
                    </div>
                    <button 
                      onClick={() => setLotCount(Math.min(10, lotCount + 1))}
                      className="p-3 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">HACD Commitment:</span>
                      <span className="font-mono">{requiredHACD} HACD</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                      <span className="text-purple-400">Est. Yield ($OVL):</span>
                      <span className="font-mono text-purple-400">{(lotCount * 15000).toLocaleString()} OVL</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleMint}
                    disabled={hash !== undefined && !isConfirmed}
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    Mint $GRID Passport
                  </button>

                  {/* Transaction Status UI */}
                  {(hash || writeError || txError) && (
                    <div className={`p-4 rounded-xl text-xs font-mono border ${
                      isConfirmed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      (writeError || txError) ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    }`}>
                      {isConfirming && <span className="animate-pulse">Broadcasting Transaction...</span>}
                      {isConfirmed && <span>Thermodynamic Verification Confirmed (Success)</span>}
                      {(writeError || txError) && <span>Transaction Reverted (Failure)</span>}
                      {!isConfirming && !isConfirmed && !(writeError || txError) && hash && <span>Awaiting Signature...</span>}
                      {hash && <div className="mt-2 text-[10px] break-all opacity-60">TX: {hash}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assets & verification */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Your Sovereign Assets</h2>
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-purple-600/40 transition-colors flex items-center gap-2"
            >
              <Zap className={`w-3 h-3 ${verifying ? 'animate-pulse' : ''}`} />
              Simulate Hardware Pulse
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Native Balance Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">L1 Compute Balance</h3>
              <div className="text-4xl font-mono mb-2">
                {balanceData ? Number(formatEther(balanceData.value)).toFixed(4) : '0.0000'}
              </div>
              <p className="text-xs text-gray-500">Native {balanceData?.symbol || 'HACD'}</p>
            </div>

            {/* $OVL Balance Card */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-transparent border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-500/70 uppercase tracking-widest mb-4">Liquid $OVL Balance</h3>
              <div className="text-4xl font-mono text-emerald-400 mb-2">
                {displayOVL.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Earned via $GRID Passport staking</p>
            </div>
          </div>

          {/* Passports List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Hardware Cluster Status</h3>
            {!isConnected ? (
              <div className="border border-dashed border-white/20 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center">
                <Lock className="w-8 h-8 mb-4 opacity-50" />
                Connect your Web3 wallet to view your active compute clusters.
              </div>
            ) : displayPassportCount === 0 ? (
              <div className="border border-dashed border-white/20 rounded-2xl p-12 text-center text-gray-500">
                No active $GRID Passports found on-chain. Allocate lots to begin.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: displayPassportCount }).map((_, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-mono text-sm text-purple-300 mb-1">GRID-{address?.slice(2, 8)}-{idx}</div>
                        <div className="text-xs text-gray-400 font-mono">ON-CHAIN VERIFIED</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Thermodynamic Active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
