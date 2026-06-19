'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { uiFont } from '@/shared/lib/fonts';
import { CheckCircle2, Clock, XCircle, Wallet, Search, Filter } from 'lucide-react';

type DonationStatus = 'pending' | 'confirmed' | 'rejected';

interface Donation {
  id: string;
  name: string;
  memo: string;
  amount: number;
  status: DonationStatus;
  createdAt: string;
  confirmedAt?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDonationsPage() {
  const [activeTab, setActiveTab] = useState<DonationStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch ALL donations unconditionally to build statistics
  const { data: allDonations, error, mutate } = useSWR<Donation[]>(
    `/api/admin/donations`, 
    fetcher,
    { refreshInterval: 15000 }
  );

  const handleUpdateStatus = async (id: string, status: 'confirmed' | 'rejected') => {
    if (!confirm(`정말로 이 항목을 ${status === 'confirmed' ? '승인' : '반려'} 처리하시겠습니까?`)) {
      return;
    }
    
    try {
      await fetch(`/api/admin/donations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      mutate(); // Refresh data
    } catch (err) {
      console.error('Failed to update status', err);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  // Statistics calculations
  const safeDonations = allDonations || [];
  const pendingCount = safeDonations.filter(d => d.status === 'pending').length;
  const confirmedDonations = safeDonations.filter(d => d.status === 'confirmed');
  const confirmedCount = confirmedDonations.length;
  const totalConfirmedAmount = confirmedDonations.reduce((sum, d) => sum + d.amount, 0);

  // Filtered list for display
  const filteredDonations = safeDonations.filter(d => {
    const matchesTab = activeTab === 'all' || d.status === activeTab;
    const matchesSearch = d.name.includes(searchQuery) || d.memo.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const tabs: { label: string; value: DonationStatus | 'all'; count?: number }[] = [
    { label: '확인 대기', value: 'pending', count: pendingCount },
    { label: '승인됨', value: 'confirmed', count: confirmedCount },
    { label: '반려됨', value: 'rejected' },
    { label: '전체 보기', value: 'all' }
  ];

  return (
    <div className={`min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8 ${uiFont.className}`}>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-serif">정성 봉헌 관리</h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 md:mt-2">입금 내역을 실시간으로 확인하고 관리합니다.</p>
          </div>
          <button 
            onClick={() => mutate()} 
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl hover:bg-slate-50 active:bg-slate-100 shadow-sm transition-all"
          >
            새로고침
          </button>
        </div>

        {/* Statistics Widgets - Mobile: 2 cols (Total spans 2), Tablet/Desktop: 3 cols */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {/* Total Amount Widget */}
          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center gap-4 md:gap-5 transition-transform hover:-translate-y-0.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-md">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] md:text-sm font-bold text-slate-500 mb-0.5 md:mb-1">총 누적 승인 금액</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {totalConfirmedAmount.toLocaleString()}<span className="text-sm md:text-base font-bold ml-0.5 md:ml-1">원</span>
              </h3>
            </div>
          </div>

          {/* Pending Widget */}
          <div className="col-span-1 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5 transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-[14px] md:rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] md:text-sm font-bold text-slate-500 mb-0.5 md:mb-1">확인 대기 건수</p>
              <h3 className="text-lg md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {pendingCount}<span className="text-xs md:text-base font-bold ml-0.5 md:ml-1">건</span>
              </h3>
            </div>
          </div>

          {/* Confirmed Widget */}
          <div className="col-span-1 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5 transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-[14px] md:rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <div>
              <p className="text-[11px] md:text-sm font-bold text-slate-500 mb-0.5 md:mb-1">승인 완료 건수</p>
              <h3 className="text-lg md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {confirmedCount}<span className="text-xs md:text-base font-bold ml-0.5 md:ml-1">건</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
          
          {/* Controls Bar */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
            {/* Tabs (Horizontal Scroll on Mobile) */}
            <div className="flex space-x-1 bg-slate-100/80 p-1.5 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 lg:flex-none whitespace-nowrap px-3 sm:px-5 py-2.5 text-[13px] sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 ${
                    activeTab === tab.value 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      activeTab === tab.value ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="이름 또는 메모 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-[15px] sm:text-sm transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="p-3 sm:p-4 md:p-6 bg-white min-h-[50vh]">
            {error && <div className="text-red-500 text-sm font-medium text-center py-10">데이터를 불러오는데 실패했습니다.</div>}
            {!allDonations && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-sm font-bold">목록을 불러오는 중...</p>
              </div>
            )}
            
            {allDonations && filteredDonations.length === 0 && (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-base font-bold text-slate-900">해당하는 내역이 없습니다.</p>
                <p className="text-sm font-medium text-slate-400 mt-1">검색어나 탭 필터를 확인해 주세요.</p>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              {filteredDonations.map((donation) => (
                <div key={donation.id} className="group border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 bg-white relative overflow-hidden">
                  
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 w-1.5 h-full transition-colors ${
                    donation.status === 'pending' ? 'bg-amber-400' : 
                    donation.status === 'confirmed' ? 'bg-green-500' : 'bg-slate-300'
                  }`} />
                  
                  {/* Info Area */}
                  <div className="pl-3 sm:pl-4 flex-1 w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
                      <span className="text-base sm:text-lg font-black text-slate-900 truncate">{donation.name}</span>
                      <span className="text-xs sm:text-sm font-mono font-black text-slate-800 bg-slate-100/80 px-2 sm:px-2.5 py-1 rounded-lg shrink-0">
                        {donation.amount.toLocaleString()}원
                      </span>
                      {donation.status === 'pending' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">확인 대기</span>}
                      {donation.status === 'confirmed' && <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">승인됨</span>}
                      {donation.status === 'rejected' && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">반려됨</span>}
                    </div>
                    {donation.memo && (
                      <div className="mb-3.5">
                        <p className="text-[13px] sm:text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 sm:px-4 py-2.5 rounded-xl block break-words">
                          "{donation.memo}"
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs font-bold text-slate-400">
                      <span>접수: {new Date(donation.createdAt).toLocaleString('ko-KR')}</span>
                      {donation.confirmedAt && (
                        <span>처리: {new Date(donation.confirmedAt).toLocaleString('ko-KR')}</span>
                      )}
                      <span className="text-slate-300 font-mono font-normal">ID: {donation.id.slice(-8)}</span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  {donation.status === 'pending' && (
                    <div className="flex gap-2 shrink-0 md:pl-6 md:border-l md:border-slate-100 pt-4 md:pt-0 border-t border-slate-100 md:border-t-0 mt-1 md:mt-0 w-full md:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(donation.id, 'confirmed')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        승인 처리
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(donation.id, 'rejected')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-3 sm:py-3.5 bg-white text-slate-500 border border-slate-200 rounded-xl text-sm font-bold tracking-wider hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        반려
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
