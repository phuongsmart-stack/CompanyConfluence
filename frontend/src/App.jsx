import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Video, FileText, Film, UserCircle,
  Search, Bell, CheckCircle, XCircle, Upload,
  PlayCircle, MessageSquare, ArrowRight, Plus, Check,
  X, File, Link as LinkIcon, Calendar, User, Clock
} from 'lucide-react';
// --- RELATIONAL MOCK DATA ---
const INITIAL_DATA = {
  notifications: [
    { id: 'N1', text: 'Footage submitted for SummerBreeze_Studio_01', type: 'footage', targetId: 'S-001', read: false },
    { id: 'N2', text: 'NAV Script Cargo_NAV_01 rejected by TL', type: 'nav_scripts', targetId: 'NS-002', read: false },
    { id: 'N3', text: 'Creative submitted Draft for Gown_NAV_01', type: 'nav_management', targetId: 'NAV-003', read: true }
  ],
  scripts: [
    { id: 'S-001', name: 'SummerBreeze_Studio_01', productId: 'PRD-001', productName: 'Summer Breeze Dress', type: 'Studio', owner: 'Content Specialist 05', status: 'Fulfilled by CDM', content: 'Focus on lightweight fabric and floral pattern. Include twirling shots and close-ups of the hem.', date: '2023-10-20' },
    { id: 'S-002', name: 'CargoPants_Fiverr_01', productId: 'PRD-002', productName: 'Urban Cargo Pants', type: 'Fiverr', owner: 'Content Specialist 02', status: 'In Progress by CDM', content: 'Streetwear style. Need shots of deep pockets and ankle cuffs. Urban background.', date: '2023-10-24' },
    { id: 'S-003', name: 'SilkGown_Studio_01', productId: 'PRD-003', productName: 'Silk Evening Gown', type: 'Studio', owner: 'Content Specialist 05', status: 'Draft', content: 'Elegant lighting. Close up on the embroidery. Slow panning shots.', date: '2023-10-26' },
  ],
  footage: [
    // 5 footage items for S-001 (Fulfilled)
    { id: 'FTG-001', scriptId: 'S-001', productId: 'PRD-001', pic: 'CDM Specialist 03', status: 'Approved', dateSubmitted: '2023-10-22', comments: [{author: 'Content Specialist 05', text: 'Great lighting on this one.', time: '10:00 AM'}] },
    { id: 'FTG-002', scriptId: 'S-001', productId: 'PRD-001', pic: 'CDM Specialist 03', status: 'Approved', dateSubmitted: '2023-10-22', comments: [] },
    { id: 'FTG-003', scriptId: 'S-001', productId: 'PRD-001', pic: 'CDM Specialist 03', status: 'Approved', dateSubmitted: '2023-10-22', comments: [{author: 'CO_TL', text: 'Make sure the color matches reality.', time: '11:30 AM'}] },
    { id: 'FTG-004', scriptId: 'S-001', productId: 'PRD-001', pic: 'CDM Specialist 03', status: 'Approved', dateSubmitted: '2023-10-23', comments: [] },
    { id: 'FTG-005', scriptId: 'S-001', productId: 'PRD-001', pic: 'CDM Specialist 03', status: 'Approved', dateSubmitted: '2023-10-23', comments: [{author: 'Content Specialist 05', text: 'Perfect twirl shot!', time: '09:15 AM'}] },
    // Footage for S-002 (In Progress)
    { id: 'FTG-006', scriptId: 'S-002', productId: 'PRD-002', pic: 'Fiverr Creator A', status: 'Submitted', dateSubmitted: '2023-10-25', comments: [{author: 'Content Specialist 02', text: 'Can we get a wider angle on the pocket?', time: '2:00 PM'}] },
    { id: 'FTG-007', scriptId: 'S-002', productId: 'PRD-002', pic: 'Fiverr Creator A', status: 'Needs Reshoot', dateSubmitted: '2023-10-25', comments: [{author: 'Content Specialist 02', text: 'Too blurry. Reshoot requested.', time: '2:05 PM'}] },
    { id: 'FTG-008', scriptId: 'S-002', productId: 'PRD-002', pic: 'Fiverr Creator A', status: 'Submitted', dateSubmitted: '2023-10-26', resubmissionOf: 'FTG-007', comments: [] },
  ],
  navScripts: [
    { id: 'NS-001', name: 'SummerBreeze_NAV_01', scriptId: 'S-001', productId: 'PRD-001', owner: 'Content Specialist 05', status: 'Fulfilled by Creative', content: '0:00 - FTG-005 Twirl\n0:04 - Text "Summer Ready"\n0:08 - FTG-001 Close up', relatedNavId: 'NAV-001', date: '2023-10-24' },
    { id: 'NS-002', name: 'Cargo_NAV_01', scriptId: 'S-002', productId: 'PRD-002', owner: 'Content Specialist 02', status: 'NAV Script Pending TL', content: '0:00 - Intro pocket shot\n0:05 - Urban walking shot', relatedNavId: null, date: '2023-10-26' },
  ],
  navs: [
    { id: 'NAV-001', navScriptId: 'NS-001', productId: 'PRD-001', pic: 'Creative Specialist 07', status: 'Final Approved', footageUsed: ['FTG-001', 'FTG-005'], comments: [{author: 'CO_TL', text: 'Excellent pacing.', time: '4:00 PM'}], dateSubmitted: '2023-10-25' },
    { id: 'NAV-002', navScriptId: 'NS-002', productId: 'PRD-002', pic: 'Creative Specialist 03', status: 'Needs Edits', footageUsed: ['FTG-006'], comments: [{author: 'CO', text: 'Music is too loud compared to the voiceover.', time: '1:00 PM'}], dateSubmitted: '2023-10-26' },
    { id: 'NAV-003', navScriptId: 'NS-003', productId: 'PRD-003', pic: 'Creative Specialist 02', status: 'Pending CO Review', footageUsed: ['External Source'], comments: [], dateSubmitted: '2023-10-26' },
    { id: 'NAV-004', navScriptId: 'NS-002', productId: 'PRD-002', pic: 'Creative Specialist 03', status: 'Pending CO Review', footageUsed: ['FTG-006', 'FTG-008'], comments: [], dateSubmitted: '2023-10-27', resubmissionOf: 'NAV-002' }
  ]
};
const TABS = [
  { id: 'scripts', label: 'Studio/Fiverr Scripts', icon: ClipboardList },
  { id: 'footage', label: 'Footage Management', icon: Video },
  { id: 'nav_scripts', label: 'NAV Script Management', icon: FileText },
  { id: 'nav_management', label: 'NAV Management', icon: Film },
];
// --- REUSABLE COMPONENTS ---
const StatusBadge = ({ status }) => {
  let colors = 'bg-gray-100 text-gray-800';
  if (status.includes('Draft') || status.includes('Pending')) colors = 'bg-yellow-100 text-yellow-800';
  if (status.includes('Approved') || status.includes('Fulfilled')) colors = 'bg-green-100 text-green-800';
  if (status.includes('In Progress')) colors = 'bg-blue-100 text-blue-800';
  if (status.includes('Reject') || status.includes('Reshoot') || status.includes('Edits')) colors = 'bg-red-100 text-red-800';
  return <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${colors}`}>{status}</span>;
};
const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
      </div>
      <div className="p-6 overflow-y-auto flex-grow bg-white">
        {children}
      </div>
    </div>
  </div>
);
export default function App() {
  const [role, setRole] = useState('CO');
  const [activeTab, setActiveTab] = useState('scripts');
  const [viewFilters, setViewFilters] = useState({});
  const [data, setData] = useState(INITIAL_DATA);
  const [toast, setToast] = useState(null);

  const [detailModal, setDetailModal] = useState({ isOpen: false, type: null, item: null });
  const [createModal, setCreateModal] = useState({ isOpen: false, type: null });
  const [showNotifications, setShowNotifications] = useState(false);
  const [newComment, setNewComment] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };
  const updateData = (collection, id, updates) => {
    setData(prev => ({
      ...prev,
      [collection]: prev[collection].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };
  const navigateToTab = (tabId, filters = {}) => {
    setActiveTab(tabId);
    setViewFilters(filters);
    setDetailModal({ isOpen: false, type: null, item: null });
    setShowNotifications(false);
  };

  const renderCreateScriptModal = () => {
    const isNav = createModal.type === 'nav_scripts';
    return (
      <ModalWrapper title={`Upload New ${isNav ? 'NAV' : 'Studio/Fiverr'} Script`} onClose={() => setCreateModal({ isOpen: false })}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Script ID / Name</label>
            <input type="text" placeholder={isNav ? "e.g., SummerBreeze_NAV_02" : "e.g., SummerBreeze_Studio_02"} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
            <input type="text" placeholder="e.g., PRD-001" className="w-full p-2 border rounded-lg" />
          </div>
          {!isNav && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Studio</option>
                <option>Fiverr</option>
              </select>
            </div>
          )}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-600 mb-1">Drag and drop your script file here</p>
            <p className="text-xs text-gray-400">Supported formats: {isNav ? '.xls, .xlsx' : '.csv, .xls, .xlsx, .pdf'}</p>
            <button className="mt-4 bg-white border border-gray-300 text-sm px-4 py-2 rounded shadow-sm hover:bg-gray-50">Browse Files</button>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setCreateModal({ isOpen: false })} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => { showToast('Script Uploaded Successfully'); setCreateModal({ isOpen: false }); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Upload & Save</button>
          </div>
        </div>
      </ModalWrapper>
    );
  };
  const renderMediaUploadModal = () => {
    const { type, parentItem } = createModal;
    const isFootage = type === 'footage';
    const isResubmit = !!parentItem;

    const title = isResubmit
      ? `Resubmit ${isFootage ? 'Footage' : 'NAV'} for ${parentItem.id}`
      : `Upload New ${isFootage ? 'Footage' : 'NAV'}`;
    return (
      <ModalWrapper title={title} onClose={() => setCreateModal({ isOpen: false })}>
        <div className="space-y-4">
          {isResubmit ? (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start border border-blue-100 mb-4 shadow-sm">
              <LinkIcon size={18} className="mr-2 mt-0.5 flex-shrink-0 text-blue-600"/>
              <p>This upload will be automatically linked as a revised resubmission for <strong className="font-bold">{parentItem.id}</strong>.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Reference ID</label>
              <input type="text" placeholder={isFootage ? "e.g., S-001 (Script ID)" : "e.g., NS-001 (NAV Script ID)"} className="w-full p-2 border rounded-lg" />
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 group hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
            <Upload className="mx-auto text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" size={32} />
            <p className="text-sm text-gray-600 mb-1 font-medium">Drag and drop your video file here</p>
            <p className="text-xs text-gray-400">Supported formats: .mp4, .mov (Max 1GB)</p>
            <button className="mt-4 bg-white border border-gray-300 text-sm px-4 py-2 rounded shadow-sm hover:bg-gray-50 text-gray-700 font-medium">Browse Files</button>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setCreateModal({ isOpen: false })} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={() => {
              showToast(`${isFootage ? 'Footage' : 'NAV'} Uploaded Successfully`);
              setCreateModal({ isOpen: false });
            }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm">
              {isResubmit ? 'Submit Revision' : 'Upload File'}
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  };

  const renderScriptDetail = () => {
    const { item } = detailModal;
    return (
      <ModalWrapper title="Script Details" onClose={() => setDetailModal({ isOpen: false })}>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div><p className="text-xs text-gray-500">Script ID</p><p className="font-bold">{item.id}</p></div>
          <div><p className="text-xs text-gray-500">Product</p><p className="font-bold">{item.productId} - {item.productName}</p></div>
          <div><p className="text-xs text-gray-500">Owner</p><p className="font-bold flex items-center"><User size={14} className="mr-1"/>{item.owner}</p></div>
          <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={item.status} /></div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm font-mono text-gray-800">
          {item.content}
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          {item.status === 'Fulfilled by CDM' && (
            <button
              onClick={() => navigateToTab('footage', { scriptId: item.id })}
              className="flex items-center text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 font-medium"
            >
              <LinkIcon size={16} className="mr-2"/> View Related Footage Output
            </button>
          )}
        </div>
      </ModalWrapper>
    );
  };
  const renderFootageDetail = () => {
    const { item } = detailModal;

    return (
      <ModalWrapper
        title="Footage Details"
        onClose={() => {
          setDetailModal({ isOpen: false });
          setNewComment('');
        }}
      >
        <div className="flex gap-6">
          <div className="w-1/2">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden mb-4">
              <img src={`https://picsum.photos/seed/${item.id}/600/400`} className="absolute opacity-50 object-cover w-full h-full" alt="video frame"/>
              <PlayCircle size={48} className="text-white z-10 opacity-80" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs">Footage ID</p><p className="font-bold">{item.id}</p></div>
              <div><p className="text-gray-500 text-xs">Origin Script</p>
                <button onClick={() => navigateToTab('scripts')} className="text-indigo-600 hover:underline font-bold flex items-center">
                  {item.scriptId} <LinkIcon size={12} className="ml-1"/>
                </button>
              </div>
              <div><p className="text-gray-500 text-xs">Date Submitted</p><p className="font-medium flex items-center"><Calendar size={12} className="mr-1"/>{item.dateSubmitted}</p></div>
              <div><p className="text-gray-500 text-xs">PIC</p><p className="font-medium">{item.pic}</p></div>
              {item.resubmissionOf && (
                <div className="col-span-2 bg-yellow-50 p-2.5 rounded border border-yellow-200 mt-1 shadow-sm">
                  <p className="text-yellow-800 text-xs font-bold mb-1 flex items-center"><LinkIcon size={12} className="mr-1"/> Resubmission Of:</p>
                  <button onClick={() => setDetailModal({ isOpen: true, type: 'footage', item: data.footage.find(f => f.id === item.resubmissionOf) })} className="text-indigo-600 font-bold hover:underline text-xs flex items-center">
                    {item.resubmissionOf}
                  </button>
                </div>
              )}
              <div className="col-span-2"><p className="text-gray-500 text-xs">Status</p><StatusBadge status={item.status} /></div>
            </div>
          </div>

          <div className="w-1/2 flex flex-col border-l pl-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center"><MessageSquare size={16} className="mr-2"/> Worklog & Comments</h4>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 mb-4 max-h-[300px]">
              {item.comments.length === 0 ? <p className="text-sm text-gray-400 italic">No comments yet.</p> : null}
              {item.comments.map((c, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-700">{c.author}</span>
                    <span className="text-xs text-gray-400 flex items-center"><Clock size={10} className="mr-1"/>{c.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{c.text}</p>
                </div>
              ))}
            </div>
            {(role === 'CO' || role === 'CO_TL') && (
              <div className="mt-auto">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add feedback for CDM team..."
                  className="w-full text-sm p-2 border rounded-lg resize-none h-20 mb-2 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button onClick={() => {
                    const comment = { author: role, text: newComment, time: new Date().toLocaleTimeString() };
                    updateData('footage', item.id, { comments: [...item.comments, comment] });
                    setNewComment('');
                    showToast('Comment added');
                  }} className="flex-1 bg-gray-800 text-white text-sm py-2 rounded-lg hover:bg-gray-900">Post Comment</button>
                  {item.status === 'Submitted' && (
                     <button onClick={() => { updateData('footage', item.id, { status: 'Approved' }); setDetailModal({isOpen: false}); showToast('Footage Approved'); }} className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"><Check size={14} className="mr-1"/> Approve</button>
                  )}
                </div>
              </div>
            )}
            {item.status === 'Needs Reshoot' && role === 'CDM' && (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setDetailModal({isOpen: false}); setCreateModal({ isOpen: true, type: 'footage', parentItem: item }); }}
                  className="w-full bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-bold shadow-sm"
                >
                  <Upload size={16} className="mr-2"/> Resubmit Footage
                </button>
              </div>
            )}
          </div>
        </div>
      </ModalWrapper>
    );
  };
  const renderNavScriptDetail = () => {
    const { item } = detailModal;
    return (
      <ModalWrapper title="NAV Script Details" onClose={() => setDetailModal({ isOpen: false })}>
         <div className="grid grid-cols-3 gap-4 mb-6">
          <div><p className="text-xs text-gray-500">NAV Script ID</p><p className="font-bold">{item.id}</p></div>
          <div><p className="text-xs text-gray-500">Origin Studio/Fiverr Script</p>
            <button onClick={() => navigateToTab('scripts')} className="text-indigo-600 hover:underline font-bold text-sm flex items-center">{item.scriptId} <LinkIcon size={12} className="ml-1"/></button>
          </div>
          <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={item.status} /></div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm font-mono text-gray-800 h-48 overflow-y-auto">
          {item.content}
        </div>
        <div className="mt-6 flex justify-between items-center border-t pt-4">
           <button
              onClick={() => navigateToTab('footage', { scriptId: item.scriptId })}
              className="flex items-center text-gray-600 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <Video size={16} className="mr-2"/> View Source Footage
            </button>
          {item.status === 'Fulfilled by Creative' && item.relatedNavId && (
            <button
              onClick={() => navigateToTab('nav_management')}
              className="flex items-center text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium"
            >
              <Film size={16} className="mr-2"/> View Final NAV Output
            </button>
          )}
        </div>
      </ModalWrapper>
    );
  };
  const renderNavDetail = () => {
    const { item } = detailModal;
    const navScript = data.navScripts.find(ns => ns.id === item.navScriptId);

    return (
      <ModalWrapper title="Final NAV Output Details" onClose={() => setDetailModal({ isOpen: false })}>
        <div className="flex gap-6">
           <div className="w-1/2">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden mb-4 border border-gray-200 shadow-inner">
              <img src={`https://picsum.photos/seed/${item.id}NAV/600/400`} className="absolute opacity-80 object-cover w-full h-full" alt="final nav"/>
              <PlayCircle size={48} className="text-white z-10 hover:scale-110 transition cursor-pointer drop-shadow-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div><p className="text-gray-500 text-xs">NAV ID</p><p className="font-bold">{item.id}</p></div>
              <div><p className="text-gray-500 text-xs">Creative PIC</p><p className="font-medium">{item.pic}</p></div>
              <div>
                <p className="text-gray-500 text-xs">Origin Request</p>
                {navScript && <button onClick={() => navigateToTab('scripts')} className="text-indigo-600 hover:underline font-bold flex items-center text-xs">{navScript.scriptId} <LinkIcon size={10} className="ml-1"/></button>}
              </div>
              <div><p className="text-gray-500 text-xs">Status</p><StatusBadge status={item.status} /></div>
              {item.resubmissionOf && (
                <div className="col-span-2 bg-yellow-50 p-2.5 rounded border border-yellow-200 mt-1 shadow-sm">
                  <p className="text-yellow-800 text-xs font-bold mb-1 flex items-center"><LinkIcon size={12} className="mr-1"/> Resubmission Of:</p>
                  <button onClick={() => setDetailModal({ isOpen: true, type: 'nav', item: data.navs.find(n => n.id === item.resubmissionOf) })} className="text-indigo-600 font-bold hover:underline text-xs flex items-center">
                    {item.resubmissionOf}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="w-1/2 flex flex-col border-l pl-6">
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center text-sm"><Video size={14} className="mr-2"/> Footage Used in this NAV</h4>
              <div className="flex flex-wrap gap-2">
                {item.footageUsed.map(fId => (
                  <button key={fId} onClick={() => navigateToTab('footage')} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 flex items-center">
                    {fId} <LinkIcon size={10} className="ml-1"/>
                  </button>
                ))}
              </div>
            </div>
            <h4 className="font-bold text-gray-800 mb-2 flex items-center text-sm"><MessageSquare size={14} className="mr-2"/> Review Comments</h4>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {item.comments.length === 0 ? <p className="text-sm text-gray-400 italic">No review notes.</p> : null}
              {item.comments.map((c, i) => (
                <div key={i} className="mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">{c.author}</span>
                    <span className="text-[10px] text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            {item.status === 'Needs Edits' && role === 'CREATIVE' && (
              <div className="mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setDetailModal({isOpen: false}); setCreateModal({ isOpen: true, type: 'nav', parentItem: item }); }}
                  className="w-full bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-bold shadow-sm"
                >
                  <Upload size={16} className="mr-2"/> Resubmit Edited NAV
                </button>
              </div>
            )}
          </div>
        </div>
      </ModalWrapper>
    );
  }

  const renderScriptManagement = () => {
    return (
      <div className="space-y-4 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Studio / Fiverr Scripts</h2>
          {(role === 'CO' || role === 'CO_TL') && (
            <button onClick={() => setCreateModal({ isOpen: true, type: 'scripts' })} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 shadow-sm">
              <Plus size={18} className="mr-2" /> New Script
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4">Product Name</th>
                <th className="p-4">Script ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.scripts.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4"><p className="font-medium text-gray-900">{item.productName}</p><p className="text-xs text-gray-400">{item.productId}</p></td>
                  <td className="p-4">
                    <button onClick={() => setDetailModal({ isOpen: true, type: 'script', item })} className="text-indigo-600 font-medium hover:underline flex items-center">
                      <File size={14} className="mr-1"/>{item.id}
                    </button>
                  </td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'Studio' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{item.type}</span></td>
                  <td className="p-4 text-sm text-gray-600">{item.owner}</td>
                  <td className="p-4"><StatusBadge status={item.status} /></td>
                  <td className="p-4 text-right">
                    {item.status === 'Draft' && (role === 'CO' || role === 'CO_TL') && (
                      <button onClick={() => updateData('scripts', item.id, { status: 'Ready for CDM' })} className="text-indigo-600 hover:underline text-sm font-medium inline-flex items-center">
                        Send to CDM
                      </button>
                    )}
                    {item.status === 'Ready for CDM' && role === 'CDM' && (
                      <button onClick={() => updateData('scripts', item.id, { status: 'In Progress by CDM' })} className="text-green-600 hover:underline text-sm font-medium inline-flex items-center">
                        Start Work
                      </button>
                    )}
                    {item.status === 'Fulfilled by CDM' && (
                      <button onClick={() => navigateToTab('footage', { scriptId: item.id })} className="text-indigo-600 hover:underline text-sm font-medium inline-flex items-center transition">
                        View Footage <ArrowRight size={12} className="ml-1"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderFootageManagement = () => {
    const displayFootage = viewFilters.scriptId ? data.footage.filter(f => f.scriptId === viewFilters.scriptId) : data.footage;
    return (
      <div className="space-y-4 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Footage Management</h2>
          <div className="flex items-center gap-3">
            {viewFilters.scriptId && (
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                Filtered by Script: {viewFilters.scriptId}
                <button onClick={() => setViewFilters({})} className="ml-2 hover:text-indigo-900"><X size={14}/></button>
              </span>
            )}
            {role === 'CDM' && (
              <button onClick={() => setCreateModal({ isOpen: true, type: 'footage' })} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 shadow-sm font-medium">
                <Plus size={18} className="mr-2" /> New Footage
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 w-16">Preview</th>
                <th className="p-4">Footage ID</th>
                <th className="p-4">Origin Script</th>
                <th className="p-4">Date Submitted</th>
                <th className="p-4">PIC</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayFootage.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden relative cursor-pointer" onClick={() => setDetailModal({ isOpen: true, type: 'footage', item })}>
                      <img src={`https://picsum.photos/seed/${item.id}/100/100`} className="w-full h-full object-cover" alt="thumb"/>
                      <PlayCircle size={14} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80" />
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => setDetailModal({ isOpen: true, type: 'footage', item })} className="text-indigo-600 font-bold hover:underline">
                      {item.id}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => navigateToTab('scripts')} className="text-sm text-gray-600 hover:text-indigo-600 hover:underline flex items-center">
                      {item.scriptId} <LinkIcon size={10} className="ml-1"/>
                    </button>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.dateSubmitted}</td>
                  <td className="p-4 text-sm text-gray-600">{item.pic}</td>
                  <td className="p-4"><StatusBadge status={item.status} /></td>
                  <td className="p-4 text-right">
                    <button onClick={() => setDetailModal({ isOpen: true, type: 'footage', item })} className="text-indigo-600 hover:underline text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayFootage.length === 0 && (
            <div className="p-8 text-center text-gray-500 bg-white border-t border-gray-200">
              No footage found.
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderNavScriptManagement = () => {
    return (
      <div className="space-y-4 fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">NAV Script Management</h2>
          {(role === 'CO' || role === 'CO_TL') && (
            <button onClick={() => setCreateModal({ isOpen: true, type: 'nav_scripts' })} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 shadow-sm">
              <Plus size={18} className="mr-2" /> New NAV Script
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4">NAV Script ID / Name</th>
                <th className="p-4">Base Product</th>
                <th className="p-4">Source Script</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
               {data.navScripts.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <button onClick={() => setDetailModal({ isOpen: true, type: 'navScript', item })} className="text-indigo-600 font-bold hover:underline flex items-center">
                      <FileText size={14} className="mr-2"/>
                      <div>
                        {item.name}
                        <span className="block text-xs text-gray-400 font-normal">{item.id}</span>
                      </div>
                    </button>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">{item.productId}</td>
                  <td className="p-4">
                    <button onClick={() => navigateToTab('scripts')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border border-gray-200 flex items-center">
                      {item.scriptId} <LinkIcon size={10} className="ml-1"/>
                    </button>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.owner}</td>
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-4 text-right">
                    {item.status === 'Fulfilled by Creative' ? (
                      <button onClick={() => navigateToTab('nav_management')} className="text-indigo-600 hover:underline text-sm font-medium inline-flex items-center">
                        View Output <ArrowRight size={12} className="ml-1"/>
                      </button>
                    ) : (
                      <button onClick={() => setDetailModal({ isOpen: true, type: 'navScript', item })} className="text-indigo-600 hover:underline text-sm font-medium inline-flex items-center">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderNavManagement = () => {
    return (
      <div className="space-y-4 fade-in h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Final NAV Management</h2>
          {role === 'CREATIVE' && (
            <button onClick={() => setCreateModal({ isOpen: true, type: 'nav' })} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 shadow-sm font-medium">
              <Plus size={18} className="mr-2" /> New NAV
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 w-16">Preview</th>
                <th className="p-4">NAV ID</th>
                <th className="p-4">Product ID</th>
                <th className="p-4">NAV Script Ref</th>
                <th className="p-4">Creative PIC</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.navs.map(item => (
                 <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailModal({ isOpen: true, type: 'nav', item })}>
                    <td className="p-4">
                      <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden relative">
                        <img src={`https://picsum.photos/seed/${item.id}NAV/100/100`} className="w-full h-full object-cover" alt="thumb"/>
                        <PlayCircle size={14} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900 text-sm">{item.id}</td>
                    <td className="p-4 text-sm text-gray-600">{item.productId}</td>
                    <td className="p-4">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{item.navScriptId}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{item.pic}</td>
                    <td className="p-4"><StatusBadge status={item.status} /></td>
                    <td className="p-4 text-right">
                       <button className="text-indigo-600 hover:underline text-sm font-medium" onClick={(e) => { e.stopPropagation(); setDetailModal({ isOpen: true, type: 'nav', item }) }}>
                         View Details
                       </button>
                    </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900 selection:bg-indigo-100">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center transform transition-all duration-300 animate-bounce">
          <CheckCircle size={18} className="mr-3 text-green-400" /> {toast}
        </div>
      )}
      {/* Modals */}
      {createModal.isOpen && (createModal.type === 'scripts' || createModal.type === 'nav_scripts') && renderCreateScriptModal()}
      {createModal.isOpen && (createModal.type === 'footage' || createModal.type === 'nav') && renderMediaUploadModal()}
      {detailModal.isOpen && detailModal.type === 'script' && renderScriptDetail()}
      {detailModal.isOpen && detailModal.type === 'footage' && renderFootageDetail()}
      {detailModal.isOpen && detailModal.type === 'navScript' && renderNavScriptDetail()}
      {detailModal.isOpen && detailModal.type === 'nav' && renderNavDetail()}
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-indigo-700 tracking-tighter flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg mr-2 flex items-center justify-center">
              <span className="text-white text-sm">OP</span>
            </div>
            Portal<span className="text-gray-300">.</span>
          </h1>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigateToTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <Icon size={18} className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center bg-gray-100/80 rounded-lg px-3 py-2 w-72 border border-gray-200 focus-within:border-indigo-300 focus-within:bg-white transition-colors">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search product ID or script..." className="bg-transparent border-none focus:outline-none text-sm w-full placeholder-gray-400" disabled />
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-400 mr-3 uppercase tracking-wider text-[10px]">Role Simulator</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5 cursor-pointer font-bold hover:bg-gray-100 transition"
              >
                <option value="CO">Content Owner (CO)</option>
                <option value="CO_TL">CO Team Lead (CO TL)</option>
                <option value="CDM">Delivery Mgt (CDM)</option>
                <option value="CREATIVE">Creative Team</option>
              </select>
            </div>

            <div className="h-6 w-px bg-gray-200"></div>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
              >
                <Bell size={20} />
                {data.notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800">Notifications</span>
                    <button className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {data.notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => navigateToTab(notif.type)}
                        className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-60' : 'bg-indigo-50/30'}`}
                      >
                        <p className="text-sm text-gray-800">{notif.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{notif.type.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200 cursor-pointer shadow-sm">
              <UserCircle size={20} />
            </div>
          </div>
        </header>
        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-auto p-8 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'scripts' && renderScriptManagement()}
            {activeTab === 'footage' && renderFootageManagement()}
            {activeTab === 'nav_scripts' && renderNavScriptManagement()}
            {activeTab === 'nav_management' && renderNavManagement()}
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
