import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { STREET_SHOPS } from '../data/shops';
import { INITIAL_STAFF } from '../data/staff';
import { sounds } from '../audio/soundSystem';
import { formatVND } from '../utils/formatters';
import {
  Store,
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  UserPlus,
  Clock,
  Sparkles,
} from 'lucide-react';

export const StoreOverviewWidget: React.FC = () => {
  const store = useGameStore();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  if (store.activeModal) return null;

  // Filter unlocked shops
  const unlockedShops = STREET_SHOPS.filter(
    (shop) => (store.shopLevels[shop.id] || (shop.id === 'banh_mi' ? 1 : 0)) > 0,
  );

  // Hired staff
  const hiredStaff = INITIAL_STAFF.filter((s) => store.staff[s.id]);
  const idleStaffCount = hiredStaff.filter(
    (s) => !store.staffAssignments?.[s.id],
  ).length;

  // Total waiting requests across shops
  const waitingShopIds = Object.keys(store.shopCustomerRequests || {});
  const totalWaitingCustomers = waitingShopIds.length;

  const handleOpenShop = (shopId: string) => {
    sounds.playClick();
    const req = store.shopCustomerRequests[shopId];
    store.openShopWorkstation(shopId, req?.serviceId);
  };

  const handleOpenStaffManagement = () => {
    sounds.playClick();
    store.openModal('SMARTPHONE', 'STAFF');
  };

  // If collapsed or on mobile, provide an elegant compact pill
  if (isCollapsed) {
    return (
      <div className="fixed top-14 left-2 sm:left-3 z-20 select-none animate-fadeIn">
        <button
          onClick={() => {
            sounds.playClick();
            setIsCollapsed(false);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800/95 text-white border border-amber-500/40 hover:border-amber-400 rounded-xl shadow-lg backdrop-blur-md transition active:scale-95 group"
        >
          <div className="relative">
            <Store className="w-4 h-4 text-amber-400" />
            {totalWaitingCustomers > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-xs font-black text-amber-300">
            {unlockedShops.length} Gian Hàng
          </span>
          {totalWaitingCustomers > 0 && (
            <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
              {totalWaitingCustomers} khách
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-14 left-2 sm:left-3 z-20 w-64 sm:w-72 max-h-[calc(100vh-17rem)] flex flex-col select-none animate-fadeIn pointer-events-auto">
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-full">
        {/* Header */}
        <div className="px-3 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-white tracking-wide uppercase">
                  Chuỗi Chi Nhánh
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-500/30">
                  {unlockedShops.length} quán
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenStaffManagement}
              title="Quản lý nhân sự & điều phối"
              className="p-1 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setIsCollapsed(true);
              }}
              title="Thu nhỏ danh sách"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Idle Staff Notice (if any) */}
        {idleStaffCount > 0 && (
          <div
            onClick={handleOpenStaffManagement}
            className="px-3 py-1.5 bg-purple-950/60 border-b border-purple-500/30 flex items-center justify-between cursor-pointer hover:bg-purple-900/70 transition text-[11px]"
          >
            <div className="flex items-center gap-1.5 text-purple-300">
              <UserPlus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>
                <strong>{idleStaffCount}</strong> nhân viên đang rảnh
              </span>
            </div>
            <span className="text-[10px] font-bold text-purple-400 underline flex items-center gap-0.5">
              Phân công <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </div>
        )}

        {/* Shop List */}
        <div className="p-2 overflow-y-auto space-y-1.5 max-h-[calc(100vh-22rem)] custom-scrollbar">
          {unlockedShops.map((shop) => {
            const level = store.shopLevels[shop.id] || (shop.id === 'banh_mi' ? 1 : 0);
            const waitingRequest = store.shopCustomerRequests?.[shop.id];

            // Assigned staff
            const assignedMember = hiredStaff.find(
              (s) => store.staffAssignments?.[s.id] === shop.id,
            );

            return (
              <div
                key={shop.id}
                onClick={() => handleOpenShop(shop.id)}
                className={`group p-2 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  waitingRequest
                    ? 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400 hover:bg-rose-900/50 shadow-md shadow-rose-950/40 animate-pulse'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                {/* Shop Card Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">{shop.icon}</span>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs text-white truncate block">
                        {shop.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-amber-500/20 shrink-0">
                    Cấp {level}
                  </span>
                </div>

                {/* Status Line: Customer Request or Staff info */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  {waitingRequest ? (
                    <div className="flex items-center gap-1 text-rose-300 font-bold min-w-0">
                      <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 animate-bounce" />
                      <span className="truncate">
                        Khách chờ: {waitingRequest.serviceName}
                      </span>
                    </div>
                  ) : assignedMember ? (
                    <div className="flex items-center gap-1 text-emerald-300 min-w-0">
                      <span className="shrink-0">{assignedMember.avatar}</span>
                      <span className="truncate font-semibold text-[10px]">
                        {assignedMember.name} (Tự phục vụ)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>Đang chờ khách ghé</span>
                    </div>
                  )}

                  {waitingRequest ? (
                    <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-1 rounded shrink-0">
                      +{formatVND(waitingRequest.payout)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-amber-400 font-semibold flex items-center gap-0.5 shrink-0">
                      Mở trạm <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer quick link */}
        <div className="p-1.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 px-3">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Chạm để mở trạm quán</span>
          </div>
          <button
            onClick={handleOpenStaffManagement}
            className="text-purple-400 hover:text-purple-300 font-bold hover:underline"
          >
            Phân công NV →
          </button>
        </div>
      </div>
    </div>
  );
};
