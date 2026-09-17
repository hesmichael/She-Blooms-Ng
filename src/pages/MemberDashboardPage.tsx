import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  User, 
  Calendar, 
  Lock, 
  Database, 
  PlusCircle, 
  ListOrdered, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  Users,
  Mail,
  Sparkles,
  RefreshCw,
  Trash2,
  ExternalLink,
  BarChart3,
  Search,
  MessageCircle,
  Clock,
  Compass
} from 'lucide-react';
import { 
  UserProfile, 
  SheBloomsEvent, 
  RegistrationRecord,
  JoinSubmissionRecord,
  ConferenceSubmissionRecord,
  ContactSubmissionRecord,
  AdminOverviewStats
} from '../types';
import { AdminProductTour } from '../components/AdminProductTour';

interface MemberDashboardPageProps {
  user: UserProfile;
  events: SheBloomsEvent[];
  onRefreshEvents: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

type AdminSubTab = 'overview' | 'rsvps' | 'events' | 'join' | 'conference' | 'contacts' | 'convex';

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({
  user,
  events,
  onRefreshEvents,
  onLogout,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'admin'>(
    user.role === 'admin' ? 'admin' : 'profile'
  );
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('overview');

  // Submissions State
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [joinMembers, setJoinMembers] = useState<JoinSubmissionRecord[]>([]);
  const [conferenceInquiries, setConferenceInquiries] = useState<ConferenceSubmissionRecord[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactSubmissionRecord[]>([]);
  const [overviewStats, setOverviewStats] = useState<AdminOverviewStats | null>(null);

  // Convex Database & Authentication Integration State
  const [convexStatus, setConvexStatus] = useState<{
    configured: boolean;
    url: string | null;
    provider: string;
    collections: string[];
    authSupported: boolean;
    authModel: string;
    realtimeSyncReady: boolean;
  } | null>(null);
  const [exportingConvex, setExportingConvex] = useState(false);
  const [convexExportSuccess, setConvexExportSuccess] = useState<string | null>(null);

  // Deploy to Convex Cloud State
  const [deployKeyInput, setDeployKeyInput] = useState('');
  const [deployingConvex, setDeployingConvex] = useState(false);
  const [deployConvexResult, setDeployConvexResult] = useState<{ success: boolean; message: string } | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Event Action Status
  const [eventActionLoading, setEventActionLoading] = useState<string | null>(null);
  const [eventActionMsg, setEventActionMsg] = useState<string | null>(null);

  // In-App Deletion Confirmation State (eliminates window.confirm iframe blocks)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'event' | 'rsvp' | 'join' | 'conference' | 'contact';
    id: string;
    title: string;
  } | null>(null);

  // Admin New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'Learning' | 'Books' | 'Social' | 'Experience' | 'Outing' | 'Travel' | 'Special'>('Learning');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('Abuja, Nigeria');
  const [newEventPrice, setNewEventPrice] = useState('Free');
  const [newEventStatus, setNewEventStatus] = useState<'Available' | 'Limited Spaces' | 'Sold Out' | 'Past'>('Available');
  const [newEventDeadline, setNewEventDeadline] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventImg, setNewEventImg] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80');
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Admin Onboarding Tour state
  const [showTour, setShowTour] = useState(false);

  const getSessionToken = () => {
    return user.sessionToken || localStorage.getItem('sheblooms_token') || '';
  };

  const fetchAllAdminData = async () => {
    if (user.role !== 'admin') return;
    setLoadingData(true);
    setAuthError(null);

    const token = getSessionToken();
    if (!token) {
      setAuthError('No active admin session found. Please sign in again.');
      setLoadingData(false);
      return;
    }

    try {
      // 1. Fetch Overview Stats
      const overviewRes = await fetch('/api/admin/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (overviewRes.status === 401) {
        setAuthError('Your administrative session has expired. Please sign out and sign in again.');
        return;
      }
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverviewStats(overviewData.stats);
      }

      // 2. Fetch All Submissions
      const subRes = await fetch('/api/admin/submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (subRes.status === 401) {
        setAuthError('Your administrative session has expired. Please sign out and sign in again.');
        return;
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setRegistrations(subData.registrations || []);
        setJoinMembers(subData.joinMembers || []);
        setConferenceInquiries(subData.conference || []);
        setContactMessages(subData.contacts || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setAuthError('Unable to connect to administrative server: ' + (err.message || 'Network error'));
    } finally {
      setLoadingData(false);
    }
  };

  const fetchConvexStatus = async () => {
    try {
      const res = await fetch('/api/convex/status');
      if (res.ok) {
        const data = await res.json();
        setConvexStatus(data);
      }
    } catch (err) {
      console.error('Failed to query Convex status:', err);
    }
  };

  const handleExportConvexSeed = async () => {
    setExportingConvex(true);
    setConvexExportSuccess(null);
    try {
      const token = getSessionToken();
      const res = await fetch('/api/admin/convex/export-seed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sheblooms_convex_seed_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setConvexExportSuccess('Convex database seed package downloaded successfully.');
    } catch (err: any) {
      console.error('Convex export failed:', err);
      setConvexExportSuccess(`Export error: ${err.message}`);
    } finally {
      setExportingConvex(false);
    }
  };

  const handleDeployToConvex = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDeployingConvex(true);
    setDeployConvexResult(null);
    try {
      const token = getSessionToken();
      const res = await fetch('/api/admin/convex/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deployKey: deployKeyInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deployment to Convex Cloud failed');
      }
      setDeployConvexResult({ success: true, message: data.message });
      await fetchConvexStatus();
    } catch (err: any) {
      setDeployConvexResult({ success: false, message: err.message || 'Failed to deploy to Convex Cloud' });
    } finally {
      setDeployingConvex(false);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      fetchAllAdminData();
      fetchConvexStatus();
      const tourKey = `sheblooms_admin_tour_seen_${user.email || user.id || 'admin'}`;
      const tourSeen = localStorage.getItem(tourKey);
      if (!tourSeen) {
        setShowTour(true);
      }
    }
  }, [user]);

  const handleTourComplete = () => {
    const tourKey = `sheblooms_admin_tour_seen_${user.email || user.id || 'admin'}`;
    localStorage.setItem(tourKey, 'true');
    setShowTour(false);
  };

  // Create Event Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    setCreateMsg(null);

    const token = getSessionToken();
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newEventTitle,
          category: newEventCategory,
          date: newEventDate,
          time: newEventTime,
          location: newEventLocation,
          price: newEventPrice,
          description: newEventDesc,
          status: newEventStatus,
          registrationDeadline: newEventDeadline || undefined,
          image: newEventImg,
          isPast: newEventStatus === 'Past',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish event');

      setCreateMsg('Event published successfully to community calendar.');
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDeadline('');
      onRefreshEvents();
      fetchAllAdminData();
    } catch (err: any) {
      setCreateMsg(`Error: ${err.message}`);
    } finally {
      setCreatingEvent(false);
    }
  };

  // Update Event Status
  const handleUpdateEventStatus = async (eventId: string, newStatus: string) => {
    setEventActionLoading(eventId);
    setEventActionMsg(null);
    const token = getSessionToken();

    try {
      const isPast = newStatus === 'Past';
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, isPast })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');
      setEventActionMsg(`Status updated to "${newStatus}".`);
      onRefreshEvents();
      fetchAllAdminData();
    } catch (err: any) {
      setEventActionMsg(`Error: ${err.message}`);
    } finally {
      setEventActionLoading(null);
    }
  };

  // Delete Item Initiation
  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setItemToDelete({ type: 'event', id: eventId, title: eventTitle });
  };

  // Perform permanent deletion
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, title, type } = itemToDelete;
    setEventActionLoading(id);
    const token = getSessionToken();

    let endpoint = `/api/admin/events/${id}`;
    if (type === 'rsvp') endpoint = `/api/admin/registrations/${id}`;
    if (type === 'join') endpoint = `/api/admin/join/${id}`;
    if (type === 'conference') endpoint = `/api/admin/conference/${id}`;
    if (type === 'contact') endpoint = `/api/admin/contacts/${id}`;

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record');
      setEventActionMsg(`Successfully deleted "${title}".`);
      setItemToDelete(null);
      if (type === 'event') {
        onRefreshEvents();
      }
      fetchAllAdminData();
    } catch (err: any) {
      setEventActionMsg(`Error: ${err.message}`);
    } finally {
      setEventActionLoading(null);
    }
  };

  // CSV Exporters
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','), 
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRSVPs = () => {
    const headers = ['ID', 'Date', 'Event Title', 'Attendee Name', 'Email', 'Phone', 'City', 'Consent'];
    const rows = registrations.map(r => [
      r.id,
      new Date(r.createdAt).toISOString(),
      r.eventTitle,
      r.userName,
      r.userEmail,
      r.userPhone,
      r.city || 'N/A',
      r.consentGranted ? 'Granted' : 'N/A'
    ]);
    downloadCSV('sheblooms_event_rsvps', headers, rows);
  };

  const handleExportJoin = () => {
    const headers = ['ID', 'Date', 'First Name', 'Surname', 'Email', 'WhatsApp', 'City', 'Age Band', 'Occupation', 'Interests', 'Referral Source'];
    const rows = joinMembers.map(j => [
      j.id,
      new Date(j.createdAt).toISOString(),
      j.firstName,
      j.surname,
      j.email,
      j.whatsapp,
      j.city,
      j.ageBand || 'N/A',
      j.occupation || 'N/A',
      (j.interests || []).join('; '),
      j.referralSource || 'N/A'
    ]);
    downloadCSV('sheblooms_join_memberships', headers, rows);
  };

  const handleExportConference = () => {
    const headers = ['ID', 'Date', 'Name', 'Surname', 'Email', 'WhatsApp', 'City', 'Attending Count'];
    const rows = conferenceInquiries.map(c => [
      c.id,
      new Date(c.createdAt).toISOString(),
      c.name,
      c.surname,
      c.email,
      c.whatsapp,
      c.city,
      String(c.numberAttending || 1)
    ]);
    downloadCSV('sheblooms_conference_rsvps', headers, rows);
  };

  const handleExportContacts = () => {
    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Is Partnership'];
    const rows = contactMessages.map(m => [
      m.id,
      new Date(m.createdAt).toISOString(),
      m.name,
      m.email,
      m.phone,
      m.subject,
      m.message,
      m.isPartnership ? 'Yes' : 'No'
    ]);
    downloadCSV('sheblooms_contact_inquiries', headers, rows);
  };

  // Filtered lists
  const filteredRSVPs = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    const q = searchQuery.toLowerCase();
    return registrations.filter(r => 
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.eventTitle.toLowerCase().includes(q) ||
      r.userPhone.includes(q)
    );
  }, [registrations, searchQuery]);

  const filteredJoin = useMemo(() => {
    if (!searchQuery.trim()) return joinMembers;
    const q = searchQuery.toLowerCase();
    return joinMembers.filter(j => 
      j.firstName.toLowerCase().includes(q) ||
      j.surname.toLowerCase().includes(q) ||
      j.email.toLowerCase().includes(q) ||
      j.whatsapp.includes(q) ||
      j.city.toLowerCase().includes(q)
    );
  }, [joinMembers, searchQuery]);

  const filteredConference = useMemo(() => {
    if (!searchQuery.trim()) return conferenceInquiries;
    const q = searchQuery.toLowerCase();
    return conferenceInquiries.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.surname.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.whatsapp.includes(q)
    );
  }, [conferenceInquiries, searchQuery]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contactMessages;
    const q = searchQuery.toLowerCase();
    return contactMessages.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  }, [contactMessages, searchQuery]);

  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${name}, this is the SheBlooms Africa Community team reaching out regarding your submission.`);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-editorial text-2xl font-bold text-[#332A28]">
              Welcome, {user.name}
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-[#FFF5DE] border border-[#7F876B]/40 rounded-sm text-[10px] font-semibold text-[#7F876B]">
              <ShieldCheck className="w-3 h-3 text-[#7F876B]" />
              <span>2FA Verified</span>
            </span>
            {user.role === 'admin' && (
              <span className="px-2.5 py-0.5 bg-[#332A28] text-[#FFF9F2] text-[10px] font-semibold uppercase tracking-wider rounded-sm">
                Staff Administrator
              </span>
            )}
          </div>
          <p className="text-xs text-[#332A28]/70">
            Encrypted Session: <span className="font-medium text-[#332A28]">{user.email}</span> • Location: {user.city}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {user.role === 'admin' && (
            <button
              id="admin-start-tour-btn"
              onClick={() => setShowTour(true)}
              className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-2 bg-[#FFF5DE] hover:bg-[#F6D5C5] text-[#332A28] rounded-sm border border-[#7F876B]/30 transition-colors"
              title="Start Onboarding and Product Tour"
            >
              <Compass className="w-3.5 h-3.5 text-[#7F876B]" />
              <span>Product Tour</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-[#332A28] hover:text-[#C97C79] transition-colors"
          >
            Community Calendar
          </button>
          <button
            onClick={onLogout}
            className="border border-[#332A28]/30 hover:border-[#332A28] text-xs font-semibold px-4 py-2 rounded-sm text-[#332A28] hover:bg-[#FFF5DE] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-2 border-b border-[#E8A6B2]/40">
        {user.role === 'admin' && (
          <button
            id="admin-dashboard-staff-tab-btn"
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'admin'
                ? 'border-[#C97C79] text-[#C97C79]'
                : 'border-transparent text-[#332A28]/60 hover:text-[#332A28]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C97C79]" />
            <span>Staff Admin Portal</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-[#332A28] text-[#332A28]'
              : 'border-transparent text-[#332A28]/60 hover:text-[#332A28]'
          }`}
        >
          Security & Profile
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 text-xs font-semibold tracking-wider uppercase transition-colors border-b-2 ${
            activeTab === 'events'
              ? 'border-[#332A28] text-[#332A28]'
              : 'border-transparent text-[#332A28]/60 hover:text-[#332A28]'
          }`}
        >
          Upcoming Activities
        </button>
      </div>

      {/* Auth Error Banner if session expired */}
      {authError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-sm text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={onLogout}
            className="underline font-semibold text-amber-900 hover:text-amber-800 ml-4 shrink-0"
          >
            Sign In Again
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: STAFF ADMIN PORTAL                                   */}
      {/* ========================================================= */}
      {activeTab === 'admin' && user.role === 'admin' && (
        <div className="space-y-6">
          {/* Admin Sub-navigation pills */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#E8A6B2]/40 rounded-sm">
            <button
              onClick={() => setAdminSubTab('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'overview'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview & Metrics</span>
            </button>

            <button
              onClick={() => setAdminSubTab('rsvps')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'rsvps'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Event RSVPs</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#C97C79] text-[#FFF9F2] text-[10px] rounded-xs font-mono font-medium">
                {registrations.length}
              </span>
            </button>

            <button
              onClick={() => setAdminSubTab('events')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'events'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Event Management (CMS)</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#7F876B] text-[#FFF9F2] text-[10px] rounded-xs font-mono font-medium">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setAdminSubTab('join')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'join'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Join Applications</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#C97C79] text-[#FFF9F2] text-[10px] rounded-xs font-mono font-medium">
                {joinMembers.length}
              </span>
            </button>

            <button
              onClick={() => setAdminSubTab('conference')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'conference'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conference</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#7F876B] text-[#FFF9F2] text-[10px] rounded-xs font-mono font-medium">
                {conferenceInquiries.length}
              </span>
            </button>

            <button
              onClick={() => setAdminSubTab('contacts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'contacts'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Messages</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#332A28] text-[#FFF9F2] text-[10px] rounded-xs font-mono font-medium">
                {contactMessages.length}
              </span>
            </button>

            <button
              onClick={() => {
                setAdminSubTab('convex');
                fetchConvexStatus();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 ${
                adminSubTab === 'convex'
                  ? 'bg-[#332A28] text-[#FFF9F2]'
                  : 'text-[#332A28]/70 hover:bg-[#FFF5DE]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#C89A61]" />
              <span>Convex Database</span>
              <span className={`ml-1 px-1.5 py-0.2 text-[#FFF9F2] text-[10px] rounded-xs font-mono font-medium ${
                convexStatus?.configured ? 'bg-[#7F876B]' : 'bg-[#C97C79]'
              }`}>
                {convexStatus?.configured ? 'Connected' : 'Ready'}
              </span>
            </button>

            <div className="ml-auto flex items-center">
              <button
                onClick={fetchAllAdminData}
                disabled={loadingData}
                className="px-2.5 py-1 text-xs font-medium text-[#332A28]/70 hover:text-[#332A28] flex items-center space-x-1"
                title="Refresh database state"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Sub-tab: Overview & Metrics */}
          {adminSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-1">
                  <span className="text-[11px] font-medium text-[#332A28]/70 uppercase tracking-wider">
                    Total Events
                  </span>
                  <div className="font-editorial text-3xl font-bold text-[#332A28]">
                    {overviewStats?.totalEvents ?? events.length}
                  </div>
                  <p className="text-[11px] text-[#7F876B]">
                    {overviewStats?.upcomingEvents ?? events.filter(e => !e.isPast).length} upcoming in Abuja
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-1">
                  <span className="text-[11px] font-medium text-[#332A28]/70 uppercase tracking-wider">
                    Event RSVPs
                  </span>
                  <div className="font-editorial text-3xl font-bold text-[#C97C79]">
                    {overviewStats?.registrationsCount ?? registrations.length}
                  </div>
                  <p className="text-[11px] text-[#332A28]/60">
                    Active attendee registrations
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-1">
                  <span className="text-[11px] font-medium text-[#332A28]/70 uppercase tracking-wider">
                    Community Members
                  </span>
                  <div className="font-editorial text-3xl font-bold text-[#7F876B]">
                    {overviewStats?.joinMembersCount ?? joinMembers.length}
                  </div>
                  <p className="text-[11px] text-[#332A28]/60">
                    Submitted membership forms
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-1">
                  <span className="text-[11px] font-medium text-[#332A28]/70 uppercase tracking-wider">
                    Conference Interest
                  </span>
                  <div className="font-editorial text-3xl font-bold text-[#332A28]">
                    {overviewStats?.conferenceInquiriesCount ?? conferenceInquiries.length}
                  </div>
                  <p className="text-[11px] text-[#332A28]/60">
                    2026 Annual Conference inquiries
                  </p>
                </div>
              </div>

              {/* Security & Audit Summary */}
              <div className="p-5 bg-[#FFF5DE] border border-[#7F876B]/30 rounded-sm space-y-3">
                <div className="flex items-center space-x-2 text-[#7F876B] font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Administrative Security & Cryptographic Compliance</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#332A28]/80">
                  <div className="bg-white p-3 rounded-sm border border-[#7F876B]/20">
                    <span className="font-semibold block text-[#332A28]">2FA Multi-Factor Auth</span>
                    <p className="text-[11px] text-[#332A28]/70 mt-0.5">
                      Enforced for all administrative endpoints via RFC 6238 TOTP verification.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-sm border border-[#7F876B]/20">
                    <span className="font-semibold block text-[#332A28]">AES-256-GCM Vault</span>
                    <p className="text-[11px] text-[#332A28]/70 mt-0.5">
                      Personal identifiables (PII), phone numbers, and messages are encrypted at rest.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-sm border border-[#7F876B]/20">
                    <span className="font-semibold block text-[#332A28]">Brute-Force Shield</span>
                    <p className="text-[11px] text-[#332A28]/70 mt-0.5">
                      Automatic 15-minute account lockout triggered after 5 consecutive bad attempts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Event RSVPs */}
          {adminSubTab === 'rsvps' && (
            <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#332A28] flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-[#C97C79]" />
                    Event RSVPs & Attendees ({registrations.length})
                  </h3>
                  <p className="text-xs text-[#332A28]/70">
                    Decrypted attendee contact details for coordinated community access in Abuja.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {registrations.length > 0 && (
                    <button
                      onClick={handleExportRSVPs}
                      className="inline-flex items-center space-x-1.5 bg-[#FFF5DE] hover:bg-[#E8A6B2]/40 text-[#332A28] text-xs font-semibold px-3 py-1.5 rounded-sm border border-[#E8A6B2]/60 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#7F876B]" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#332A28]/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search RSVPs by name, email, event, or phone..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFF9F2] border border-[#E8A6B2]/40 rounded-sm outline-none focus:border-[#C97C79]"
                />
              </div>

              {loadingData ? (
                <p className="text-xs text-[#332A28]/70 py-4 text-center">Loading registrations...</p>
              ) : filteredRSVPs.length === 0 ? (
                <p className="text-xs text-[#332A28]/70 py-6 text-center">
                  {searchQuery ? 'No RSVPs match your search.' : 'No event registrations recorded yet.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8A6B2]/30 divide-y divide-[#E8A6B2]/30">
                    <thead className="bg-[#FFF5DE] text-[#332A28]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Event</th>
                        <th className="p-2.5">Attendee</th>
                        <th className="p-2.5">Contact Details</th>
                        <th className="p-2.5">City</th>
                        <th className="p-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8A6B2]/20">
                      {filteredRSVPs.map((reg) => (
                        <tr key={reg.id} className="hover:bg-[#FFF9F2]">
                          <td className="p-2.5 text-[#332A28]/70 font-mono text-[11px]">
                            {new Date(reg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5 font-semibold text-[#332A28]">
                            {reg.eventTitle}
                          </td>
                          <td className="p-2.5 text-[#332A28] font-medium">
                            {reg.userName}
                          </td>
                          <td className="p-2.5 text-[#332A28]/80">
                            <div>{reg.userEmail}</div>
                            <div className="font-mono text-[11px] text-[#7F876B]">{reg.userPhone}</div>
                          </td>
                          <td className="p-2.5 text-[#332A28]/70">{reg.city || 'Abuja'}</td>
                          <td className="p-2.5">
                            <div className="flex items-center space-x-2">
                              {reg.userPhone && (
                                <a
                                  href={getWhatsAppLink(reg.userPhone, reg.userName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-[11px] rounded-sm transition-colors"
                                  title="Message on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <button
                                onClick={() => setItemToDelete({ type: 'rsvp', id: reg.id, title: `RSVP from ${reg.userName} (${reg.eventTitle})` })}
                                disabled={eventActionLoading === reg.id}
                                className="p-1 text-[#332A28]/40 hover:text-red-700 transition-colors rounded-sm cursor-pointer"
                                title="Delete RSVP"
                                aria-label="Delete RSVP"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: Event Management (CMS) */}
          {adminSubTab === 'events' && (
            <div className="space-y-6">
              {/* Status Message */}
              {eventActionMsg && (
                <div className="p-3 bg-[#FFF5DE] border border-[#7F876B]/40 rounded-sm text-xs text-[#332A28] flex items-center justify-between">
                  <span>{eventActionMsg}</span>
                  <button onClick={() => setEventActionMsg(null)} className="font-bold ml-2">×</button>
                </div>
              )}

              {/* Publish New Event Form */}
              <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
                <h3 className="font-editorial text-xl font-bold text-[#332A28] flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-[#C97C79]" />
                  Publish New SheBlooms Activity / Event
                </h3>

                {createMsg && (
                  <div className="p-3 bg-[#FFF5DE] border border-[#7F876B]/40 rounded-sm text-xs text-[#332A28]">
                    {createMsg}
                  </div>
                )}

                <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Event Title *</label>
                      <input
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="e.g. Masterclass: Personal Balance & Career"
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Category *</label>
                      <select
                        value={newEventCategory}
                        onChange={(e) => setNewEventCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none cursor-pointer"
                      >
                        <option value="Learning">Learning</option>
                        <option value="Books">Books</option>
                        <option value="Social">Social</option>
                        <option value="Experience">Experience</option>
                        <option value="Outing">Outing</option>
                        <option value="Travel">Travel</option>
                        <option value="Special">Special</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Date String *</label>
                      <input
                        type="text"
                        required
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        placeholder="e.g. Saturday, 24 October 2026"
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Time *</label>
                      <input
                        type="text"
                        required
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        placeholder="e.g. 11:00 AM - 02:00 PM"
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Pricing *</label>
                      <input
                        type="text"
                        required
                        value={newEventPrice}
                        onChange={(e) => setNewEventPrice(e.target.value)}
                        placeholder="e.g. Free or ₦25,000"
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Status Badge *</label>
                      <select
                        value={newEventStatus}
                        onChange={(e) => setNewEventStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none cursor-pointer"
                      >
                        <option value="Available">Available (Open for RSVPs)</option>
                        <option value="Limited Spaces">Limited Spaces (High Demand)</option>
                        <option value="Sold Out">Sold Out (Waitlist Only)</option>
                        <option value="Past">Past Event (Archive)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-[#332A28] mb-1">Registration Deadline (Optional)</label>
                      <input
                        type="text"
                        value={newEventDeadline}
                        onChange={(e) => setNewEventDeadline(e.target.value)}
                        placeholder="e.g. Closes Thursday 22 October, 5:00 PM"
                        className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#332A28] mb-1">Location Details *</label>
                    <input
                      type="text"
                      required
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      placeholder="e.g. Maitama, Abuja (Curated Venue)"
                      className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#332A28] mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      placeholder="Brief description of the activity and what attendees can look forward to."
                      className="w-full px-3 py-2 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingEvent}
                    className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] uppercase tracking-wider font-semibold px-6 py-2.5 rounded-sm transition-colors disabled:opacity-50"
                  >
                    {creatingEvent ? 'Publishing...' : 'Publish Event'}
                  </button>
                </form>
              </div>

              {/* Existing Events List & Status Manager */}
              <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-xl font-bold text-[#332A28] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#7F876B]" />
                    Manage Community Calendar Events ({events.length})
                  </h3>
                  <button
                    onClick={onRefreshEvents}
                    className="text-xs text-[#C97C79] hover:underline font-medium"
                  >
                    Reload Calendar
                  </button>
                </div>

                <div className="divide-y divide-[#E8A6B2]/20 text-xs">
                  {events.map((evt) => (
                    <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-[#332A28]">{evt.title}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-[#FFF5DE] text-[#7F876B]">
                            {evt.category}
                          </span>
                        </div>
                        <p className="text-[#332A28]/70">
                          {evt.date} • {evt.time} • {evt.location} • <span className="font-medium text-[#332A28]">{evt.price}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <select
                          value={evt.status}
                          disabled={eventActionLoading === evt.id}
                          onChange={(e) => handleUpdateEventStatus(evt.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-[#FFF9F2] border border-[#E8A6B2]/60 rounded-sm text-xs text-[#332A28] cursor-pointer font-medium"
                        >
                          <option value="Available">Available</option>
                          <option value="Limited Spaces">Limited Spaces</option>
                          <option value="Sold Out">Sold Out</option>
                          <option value="Past">Past Event</option>
                        </select>

                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          disabled={eventActionLoading === evt.id}
                          className="p-1.5 text-[#332A28]/50 hover:text-red-700 transition-colors rounded-sm"
                          title="Delete event"
                          aria-label="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Join Applications */}
          {adminSubTab === 'join' && (
            <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#332A28] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C97C79]" />
                    Community Membership Applications ({joinMembers.length})
                  </h3>
                  <p className="text-xs text-[#332A28]/70">
                    Prospective members who completed the SheBlooms Africa intake application.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {joinMembers.length > 0 && (
                    <button
                      onClick={handleExportJoin}
                      className="inline-flex items-center space-x-1.5 bg-[#FFF5DE] hover:bg-[#E8A6B2]/40 text-[#332A28] text-xs font-semibold px-3 py-1.5 rounded-sm border border-[#E8A6B2]/60 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#7F876B]" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#332A28]/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applicants by name, email, city, or phone..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFF9F2] border border-[#E8A6B2]/40 rounded-sm outline-none focus:border-[#C97C79]"
                />
              </div>

              {loadingData ? (
                <p className="text-xs text-[#332A28]/70 py-4 text-center">Loading applications...</p>
              ) : filteredJoin.length === 0 ? (
                <p className="text-xs text-[#332A28]/70 py-6 text-center">
                  {searchQuery ? 'No applicants match your search.' : 'No join applications submitted yet.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8A6B2]/30 divide-y divide-[#E8A6B2]/30">
                    <thead className="bg-[#FFF5DE] text-[#332A28]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Applicant</th>
                        <th className="p-2.5">Contact Details</th>
                        <th className="p-2.5">City & Age</th>
                        <th className="p-2.5">Occupation & Interests</th>
                        <th className="p-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8A6B2]/20">
                      {filteredJoin.map((member) => (
                        <tr key={member.id} className="hover:bg-[#FFF9F2]">
                          <td className="p-2.5 text-[#332A28]/70 font-mono text-[11px]">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5 font-semibold text-[#332A28]">
                            {member.firstName} {member.surname}
                          </td>
                          <td className="p-2.5 text-[#332A28]/80">
                            <div>{member.email}</div>
                            <div className="font-mono text-[11px] text-[#7F876B]">{member.whatsapp}</div>
                          </td>
                          <td className="p-2.5 text-[#332A28]/70">
                            <div>{member.city}</div>
                            {member.ageBand && <div className="text-[10px] text-[#332A28]/60">{member.ageBand}</div>}
                          </td>
                          <td className="p-2.5 text-[#332A28]/80">
                            <div className="font-medium">{member.occupation || 'N/A'}</div>
                            {member.interests && member.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.interests.map((it, idx) => (
                                  <span key={idx} className="px-1.5 py-0.2 bg-[#FFF5DE] text-[#7F876B] text-[10px] rounded-xs">
                                    {it}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center space-x-2">
                              {member.whatsapp && (
                                <a
                                  href={getWhatsAppLink(member.whatsapp, member.firstName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-[11px] rounded-sm transition-colors"
                                  title="Message on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <button
                                onClick={() => setItemToDelete({ type: 'join', id: member.id, title: `Application from ${member.firstName} ${member.surname}` })}
                                disabled={eventActionLoading === member.id}
                                className="p-1 text-[#332A28]/40 hover:text-red-700 transition-colors rounded-sm cursor-pointer"
                                title="Delete membership application"
                                aria-label="Delete application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: Conference Inquiries */}
          {adminSubTab === 'conference' && (
            <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#332A28] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#7F876B]" />
                    Conference 2026 Pre-registrations ({conferenceInquiries.length})
                  </h3>
                  <p className="text-xs text-[#332A28]/70">
                    Prospective attendees registered for the SheBlooms Abuja Conference.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {conferenceInquiries.length > 0 && (
                    <button
                      onClick={handleExportConference}
                      className="inline-flex items-center space-x-1.5 bg-[#FFF5DE] hover:bg-[#E8A6B2]/40 text-[#332A28] text-xs font-semibold px-3 py-1.5 rounded-sm border border-[#E8A6B2]/60 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#7F876B]" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#332A28]/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conference attendees..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFF9F2] border border-[#E8A6B2]/40 rounded-sm outline-none focus:border-[#C97C79]"
                />
              </div>

              {loadingData ? (
                <p className="text-xs text-[#332A28]/70 py-4 text-center">Loading conference inquiries...</p>
              ) : filteredConference.length === 0 ? (
                <p className="text-xs text-[#332A28]/70 py-6 text-center">
                  {searchQuery ? 'No attendees match your search.' : 'No conference inquiries recorded yet.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#E8A6B2]/30 divide-y divide-[#E8A6B2]/30">
                    <thead className="bg-[#FFF5DE] text-[#332A28]">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Attendee</th>
                        <th className="p-2.5">Contact Details</th>
                        <th className="p-2.5">City</th>
                        <th className="p-2.5">Delegates</th>
                        <th className="p-2.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8A6B2]/20">
                      {filteredConference.map((conf) => (
                        <tr key={conf.id} className="hover:bg-[#FFF9F2]">
                          <td className="p-2.5 text-[#332A28]/70 font-mono text-[11px]">
                            {new Date(conf.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5 font-semibold text-[#332A28]">
                            {conf.name} {conf.surname}
                          </td>
                          <td className="p-2.5 text-[#332A28]/80">
                            <div>{conf.email}</div>
                            <div className="font-mono text-[11px] text-[#7F876B]">{conf.whatsapp}</div>
                          </td>
                          <td className="p-2.5 text-[#332A28]/70">{conf.city}</td>
                          <td className="p-2.5 text-[#332A28] font-semibold">{conf.numberAttending || 1}</td>
                          <td className="p-2.5">
                            <div className="flex items-center space-x-2">
                              {conf.whatsapp && (
                                <a
                                  href={getWhatsAppLink(conf.whatsapp, conf.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-[11px] rounded-sm transition-colors"
                                  title="Message on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <button
                                onClick={() => setItemToDelete({ type: 'conference', id: conf.id, title: `Conference Registration for ${conf.name} ${conf.surname}` })}
                                disabled={eventActionLoading === conf.id}
                                className="p-1 text-[#332A28]/40 hover:text-red-700 transition-colors rounded-sm cursor-pointer"
                                title="Delete conference registration"
                                aria-label="Delete conference registration"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: Contact Inquiries */}
          {adminSubTab === 'contacts' && (
            <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#332A28] flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#332A28]" />
                    General & Partnership Inquiries ({contactMessages.length})
                  </h3>
                  <p className="text-xs text-[#332A28]/70">
                    Direct messages sent from the SheBlooms Africa contact portal.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {contactMessages.length > 0 && (
                    <button
                      onClick={handleExportContacts}
                      className="inline-flex items-center space-x-1.5 bg-[#FFF5DE] hover:bg-[#E8A6B2]/40 text-[#332A28] text-xs font-semibold px-3 py-1.5 rounded-sm border border-[#E8A6B2]/60 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#7F876B]" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#332A28]/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages by name, subject, or message content..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFF9F2] border border-[#E8A6B2]/40 rounded-sm outline-none focus:border-[#C97C79]"
                />
              </div>

              {loadingData ? (
                <p className="text-xs text-[#332A28]/70 py-4 text-center">Loading inquiries...</p>
              ) : filteredContacts.length === 0 ? (
                <p className="text-xs text-[#332A28]/70 py-6 text-center">
                  {searchQuery ? 'No messages match your search.' : 'No contact inquiries submitted yet.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map((msg) => (
                    <div key={msg.id} className="p-4 bg-[#FFF9F2] border border-[#E8A6B2]/30 rounded-sm space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#332A28]">{msg.name}</span>
                          {msg.isPartnership && (
                            <span className="px-2 py-0.5 bg-[#C97C79] text-[#FFF9F2] text-[10px] font-bold uppercase rounded-sm">
                              Partnership Proposal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[#332A28]/60 font-mono text-[11px]">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                          <button
                            onClick={() => setItemToDelete({ type: 'contact', id: msg.id, title: `Message from ${msg.name} (${msg.subject})` })}
                            disabled={eventActionLoading === msg.id}
                            className="p-1 text-[#332A28]/40 hover:text-red-700 transition-colors rounded-sm cursor-pointer"
                            title="Delete message"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[#332A28]/70">
                        <span>Email: <a href={`mailto:${msg.email}`} className="text-[#C97C79] hover:underline">{msg.email}</a></span>
                        {msg.phone && <span className="ml-3">Phone: {msg.phone}</span>}
                      </div>

                      <div className="pt-1">
                        <span className="font-semibold text-[#332A28]">Subject: {msg.subject}</span>
                        <p className="mt-1 text-[#332A28]/85 leading-relaxed bg-white p-3 rounded-sm border border-[#E8A6B2]/20">
                          {msg.message}
                        </p>
                      </div>

                      {msg.phone && (
                        <div className="pt-1">
                          <a
                            href={getWhatsAppLink(msg.phone, msg.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs text-[#128C7E] font-semibold hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Reply via WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab: Convex Database & Authentication Integration */}
          {adminSubTab === 'convex' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8A6B2]/30">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-[#FFF5DE] text-[#332A28] rounded-sm border border-[#C89A61]/30">
                        <Database className="w-5 h-5 text-[#C89A61]" />
                      </span>
                      <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                        Convex Database & Authentication Integration
                      </h3>
                    </div>
                    <p className="text-xs text-[#332A28]/70">
                      Real-time reactivity, schema definition, and persistent authentication data models powered by Convex.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={fetchConvexStatus}
                      className="px-3 py-1.5 border border-[#332A28]/30 rounded-sm text-xs font-medium text-[#332A28] hover:bg-[#FFF5DE] flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Check Status</span>
                    </button>
                    <button
                      onClick={handleExportConvexSeed}
                      disabled={exportingConvex}
                      className="px-3 py-1.5 bg-[#332A28] hover:bg-[#332A28]/90 text-[#FFF9F2] rounded-sm text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-60"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#C89A61]" />
                      <span>{exportingConvex ? 'Exporting...' : 'Download Convex Seed JSON'}</span>
                    </button>
                  </div>
                </div>

                {convexExportSuccess && (
                  <div className="p-3 bg-[#FFF5DE] border border-[#C89A61]/40 rounded-sm text-xs text-[#332A28] flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#7F876B] shrink-0" />
                    <span>{convexExportSuccess}</span>
                  </div>
                )}

                {/* Connection Status Banner */}
                <div className={`p-4 rounded-sm border ${
                  convexStatus?.configured
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    : 'bg-[#FFF9F2] border-[#C89A61]/40 text-[#332A28]'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          convexStatus?.configured ? 'bg-emerald-600 animate-pulse' : 'bg-[#C97C79]'
                        }`} />
                        <span className="font-bold text-sm">
                          {convexStatus?.configured ? 'Convex Cloud Connected' : 'Convex Schema & Client Configured (Awaiting Deployment URL)'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#332A28]/70">
                        {convexStatus?.configured
                          ? `Active Deployment: ${convexStatus.url}`
                          : 'The official Convex client and schema definitions are bundled and active. To connect to your dedicated Convex cloud backend, set VITE_CONVEX_URL in your environment.'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-mono font-medium bg-white rounded-xs border border-[#E8A6B2]/40">
                      {convexStatus?.configured ? 'Live Sync Active' : 'Offline/Local Mode'}
                    </span>
                  </div>
                </div>

                {/* Grid of Convex Capabilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Authentication Model */}
                  <div className="p-4 bg-[#FFF9F2] border border-[#E8A6B2]/30 rounded-sm space-y-2">
                    <div className="flex items-center space-x-2 text-[#332A28] font-bold text-xs">
                      <Lock className="w-4 h-4 text-[#C97C79]" />
                      <span>Convex Authentication Architecture</span>
                    </div>
                    <p className="text-xs text-[#332A28]/70 leading-relaxed">
                      Configured with PBKDF2 (SHA-512) password hashing with unique per-user cryptographically random salts, coupled with RFC 6238 time-based one-time password (TOTP) two-factor verification.
                    </p>
                    <ul className="text-[11px] text-[#332A28]/80 space-y-1 list-disc list-inside pt-1">
                      <li>Users stored under <code className="font-mono bg-white px-1 py-0.5 rounded text-[#332A28]">users</code> table</li>
                      <li>Token sessions verified via <code className="font-mono bg-white px-1 py-0.5 rounded text-[#332A28]">sessions</code> table</li>
                      <li>Role-based access controls for Staff Administrators vs Members</li>
                    </ul>
                  </div>

                  {/* Schema Collections */}
                  <div className="p-4 bg-[#FFF9F2] border border-[#E8A6B2]/30 rounded-sm space-y-2">
                    <div className="flex items-center space-x-2 text-[#332A28] font-bold text-xs">
                      <Database className="w-4 h-4 text-[#7F876B]" />
                      <span>Defined Convex Database Schema</span>
                    </div>
                    <p className="text-xs text-[#332A28]/70 leading-relaxed">
                      Structured with TypeScript type-safety in <code className="font-mono text-[#332A28]">convex/schema.ts</code>, including secondary query indexes for rapid event filtering.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(convexStatus?.collections || [
                        'events',
                        'registrations',
                        'members',
                        'conferenceSubmissions',
                        'conferenceSpeakers',
                        'conferenceAgenda',
                        'books',
                        'contactSubmissions',
                        'users',
                        'sessions'
                      ]).map((coll) => (
                        <span key={coll} className="px-2 py-0.5 bg-white text-[#332A28] border border-[#E8A6B2]/40 rounded-xs text-[10px] font-mono">
                          {coll}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Administrative Access Governance */}
                <div className="p-4 bg-[#FFF9F2] border border-[#C89A61]/40 rounded-sm space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#332A28]">
                    <ShieldCheck className="w-4 h-4 text-[#7F876B]" />
                    <span>Administrative Access Governance</span>
                  </div>
                  <p className="text-xs text-[#332A28]/75 leading-relaxed">
                    Per security requirements, access to this console is restricted exclusively to authorized administrative accounts. Mock users and non-administrative profiles have been permanently removed. Unauthorized registrations and login attempts are cryptographically blocked and logged.
                  </p>
                </div>

                {/* 2FA Architecture & Security Standards */}
                <div className="p-4 bg-[#FFF9F2] border border-[#E8A6B2]/40 rounded-sm space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#332A28]">
                    <ShieldCheck className="w-4 h-4 text-[#C97C79]" />
                    <span>Two-Factor Authentication (2FA) Standards & Security Controls</span>
                  </div>
                  <p className="text-xs text-[#332A28]/75 leading-relaxed">
                    SheBlooms enforces cryptographic multi-factor authentication adhering to RFC 6238 and NIST SP 800-63B standards to protect member data and administrative capabilities:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="bg-white p-3 border border-[#E8A6B2]/30 rounded-xs space-y-1.5">
                      <div className="font-semibold text-xs text-[#332A28] flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C97C79]"></span>
                        <span>1. Code Generation Rules</span>
                      </div>
                      <p className="text-[11px] text-[#332A28]/70 leading-relaxed">
                        Uses RFC 6238 TOTP with HMAC-SHA1. 6-digit codes cycle every 30 seconds based on mathematical epoch time synchronization. Works 100% offline without cellular or network connection.
                      </p>
                    </div>

                    <div className="bg-white p-3 border border-[#E8A6B2]/30 rounded-xs space-y-1.5">
                      <div className="font-semibold text-xs text-[#332A28] flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#7F876B]"></span>
                        <span>2. How Codes Are Delivered</span>
                      </div>
                      <p className="text-[11px] text-[#332A28]/70 leading-relaxed">
                        <strong>Dual Mode:</strong> Generated in standard authenticator apps (Google Authenticator, Microsoft Authenticator, Apple Passwords) via QR code, or dispatched as a secure 6-digit OTP to the verified email.
                      </p>
                    </div>

                    <div className="bg-white p-3 border border-[#E8A6B2]/30 rounded-xs space-y-1.5">
                      <div className="font-semibold text-xs text-[#332A28] flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C89A61]"></span>
                        <span>3. Emergency Security Key</span>
                      </div>
                      <p className="text-[11px] text-[#332A28]/70 leading-relaxed">
                        A high-entropy emergency recovery passkey is configured for administrative emergency recovery if authenticator devices are unavailable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Tool: Deploy Schema & Initialize Tables on Convex Cloud */}
                <div className="p-5 bg-white border border-[#C89A61]/40 rounded-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 bg-[#FFF5DE] text-[#C89A61] rounded-xs border border-[#C89A61]/30">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-[#332A28]">
                          Initialize & Deploy Tables to Your Convex Cloud Dashboard
                        </h4>
                        <p className="text-[11px] text-[#332A28]/70">
                          Why was your Convex dashboard initially blank? In Convex Cloud, database tables only appear in your account's web dashboard once the schema (<code className="font-mono">convex/schema.ts</code>) has been deployed to your project.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FFF9F2] p-3.5 rounded-xs border border-[#E8A6B2]/30 space-y-2 text-xs">
                    <p className="font-semibold text-[#332A28]">
                      3 Simple Steps to Connect & See All Tables:
                    </p>
                    <ol className="text-[11px] text-[#332A28]/80 space-y-1 list-decimal list-inside pl-1">
                      <li>Log into <a href="https://dashboard.convex.dev" target="_blank" rel="noreferrer" className="text-[#C97C79] font-bold underline inline-flex items-center gap-0.5">dashboard.convex.dev <ExternalLink className="w-3 h-3 inline" /></a> and open your project (or click "Create Project" named <strong>sheblooms</strong>).</li>
                      <li>In your project, go to <strong>Project Settings</strong> → <strong>Deploy Keys</strong>, and copy your key (starts with <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#E8A6B2]/40 text-[#332A28]">prod:</code>).</li>
                      <li>Paste your Deploy Key below and click <strong>Deploy Schema to Convex Cloud</strong>. All 10 tables will immediately be initialized with real records and show in your dashboard!</li>
                    </ol>
                  </div>

                  <form onSubmit={handleDeployToConvex} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#332A28] mb-1">
                        Convex Deploy Key
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="password"
                          placeholder="prod:your-project-name|0123456789abcdef..."
                          value={deployKeyInput}
                          onChange={(e) => setDeployKeyInput(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs font-mono bg-[#FFF9F2] border border-[#332A28]/20 rounded-xs text-[#332A28] focus:outline-none focus:border-[#C97C79]"
                        />
                        <button
                          type="submit"
                          disabled={deployingConvex}
                          className="px-4 py-2 bg-[#332A28] hover:bg-[#332A28]/90 text-[#FFF9F2] rounded-xs text-xs font-semibold flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-60"
                        >
                          {deployingConvex ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Deploying Schema & Seeding Tables...</span>
                            </>
                          ) : (
                            <>
                              <Database className="w-3.5 h-3.5 text-[#C89A61]" />
                              <span>Deploy Schema to Convex Cloud</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#332A28]/60 mt-1">
                        Alternatively, you can save <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">CONVEX_DEPLOY_KEY</code> in your environment settings.
                      </p>
                    </div>
                  </form>

                  {deployConvexResult && (
                    <div className={`p-3 rounded-xs border text-xs flex items-start space-x-2 ${
                      deployConvexResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}>
                      {deployConvexResult.success ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{deployConvexResult.success ? 'Deployment Successful!' : 'Deployment Issue'}</p>
                        <p className="text-[11px] mt-0.5">{deployConvexResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guide: How to Verify Tables & Data in Convex Database */}
                <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#C97C79]" />
                    <h4 className="font-bold text-sm text-[#332A28]">
                      How to Inspect Your 10 Convex Database Tables
                    </h4>
                  </div>
                  <p className="text-xs text-[#332A28]/80 leading-relaxed">
                    Once the schema is deployed to your Convex project, you can view and query all tables and documents using either method:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#FFF9F2] rounded-xs border border-[#E8A6B2]/30 space-y-2">
                      <span className="font-bold text-[#332A28] flex items-center space-x-1.5">
                        <span className="w-5 h-5 bg-[#332A28] text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                        <span>Convex Web Dashboard (Visual Explorer)</span>
                      </span>
                      <ol className="text-[11px] text-[#332A28]/75 space-y-1.5 list-decimal list-inside pl-1">
                        <li>Visit <a href="https://dashboard.convex.dev" target="_blank" rel="noreferrer" className="text-[#C97C79] font-semibold underline">dashboard.convex.dev</a> in your web browser.</li>
                        <li>Select your project.</li>
                        <li>Click <strong>"Data"</strong> in the left sidebar menu.</li>
                        <li>You will see all 10 schema tables listed: <code className="font-mono text-[10px]">events</code>, <code className="font-mono text-[10px]">registrations</code>, <code className="font-mono text-[10px]">members</code>, <code className="font-mono text-[10px]">conferenceSubmissions</code>, etc.</li>
                        <li>Click any table to view real-time stored rows, document IDs (<code className="font-mono text-[10px]">_id</code>), creation timestamps, and fields.</li>
                      </ol>
                    </div>

                    <div className="p-3 bg-[#FFF9F2] rounded-xs border border-[#E8A6B2]/30 space-y-2">
                      <span className="font-bold text-[#332A28] flex items-center space-x-1.5">
                        <span className="w-5 h-5 bg-[#332A28] text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                        <span>Direct Terminal / CLI Command</span>
                      </span>
                      <p className="text-[11px] text-[#332A28]/75 leading-relaxed">
                        If running locally or in your terminal, execute the official Convex CLI command:
                      </p>
                      <pre className="bg-[#332A28] text-[#FFF9F2] p-2.5 rounded-xs font-mono text-[11px] select-all overflow-x-auto">
                        npx convex dashboard
                      </pre>
                      <p className="text-[10px] text-[#332A28]/60">
                        This immediately opens your browser directly to your live cloud tables and records.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connection Information */}
                <div className="p-4 bg-[#FFF5DE]/60 border border-[#C89A61]/30 rounded-sm space-y-2">
                  <h4 className="font-bold text-xs text-[#332A28]">
                    Active Convex Cloud Deployment:
                  </h4>
                  <p className="text-xs text-[#332A28]/80 font-mono break-all bg-white px-3 py-1.5 border border-[#C89A61]/30 rounded-xs">
                    {convexStatus?.url || 'https://patient-goldfinch-945.eu-west-1.convex.cloud/'}
                  </p>
                  <p className="text-[11px] text-[#332A28]/70">
                    Real-time data synchronization and live event management are configured on your Convex cloud instance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Administrative Compliance and Legal Policies Bar */}
          <div className="pt-6 mt-4 border-t border-[#E8A6B2]/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#332A28]/70 gap-2">
            <div>
              <span className="font-semibold text-[#332A28]">SheBlooms Administrative Suite</span>
              <span className="mx-2">•</span>
              <span>Bloom and Beyond Ltd (Abuja, Nigeria)</span>
              <span className="mx-2">•</span>
              <span>NDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-3 font-medium">
              <button
                onClick={() => onNavigate('privacy')}
                className="hover:text-[#C97C79] hover:underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('terms')}
                className="hover:text-[#C97C79] hover:underline"
              >
                Terms & Conditions
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('cookies')}
                className="hover:text-[#C97C79] hover:underline"
              >
                Cookies Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: PROFILE & SECURITY                                   */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-[#332A28] flex items-center gap-2">
              <User className="w-4 h-4 text-[#C97C79]" /> Account Profile
            </h3>
            <div className="space-y-2 text-xs divide-y divide-[#E8A6B2]/20">
              <div className="pt-2 flex justify-between">
                <span className="text-[#332A28]/70">Full Name</span>
                <span className="font-semibold text-[#332A28]">{user.name}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#332A28]/70">Email Address</span>
                <span className="font-semibold text-[#332A28]">{user.email}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#332A28]/70">WhatsApp / Phone</span>
                <span className="font-semibold text-[#332A28]">{user.phone}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#332A28]/70">City</span>
                <span className="font-semibold text-[#332A28]">{user.city}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#332A28]/70">System Role</span>
                <span className="font-semibold text-[#332A28] uppercase">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF5DE] p-6 rounded-sm border border-[#E8A6B2]/40 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-[#332A28] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#7F876B]" /> Security & Encryption Safeguards
            </h3>
            <div className="space-y-3 text-xs text-[#332A28]/85">
              <div className="p-3 bg-white border border-[#7F876B]/30 rounded-sm space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#7F876B]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Two-Factor Authentication Active</span>
                </div>
                <p className="text-[11px] text-[#332A28]/75 leading-relaxed">
                  Your staff administrator account is secured by RFC 6238 TOTP two-factor verification.
                </p>
              </div>

              <div className="p-3 bg-white border border-[#7F876B]/30 rounded-sm space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-[#7F876B]">
                  <Database className="w-3.5 h-3.5" />
                  <span>AES-256-GCM Encrypted Storage</span>
                </div>
                <p className="text-[11px] text-[#332A28]/75 leading-relaxed">
                  Attendee submissions, telephone numbers, and inquiry contents are encrypted in local persistent storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: CALENDAR ACTIVITIES                                 */}
      {/* ========================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-editorial text-xl font-bold text-[#332A28]">
              Upcoming SheBlooms Abuja Experiences
            </h3>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs uppercase tracking-wider font-semibold text-[#C97C79] hover:underline"
            >
              View Full Calendar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.filter(e => !e.isPast).map((evt) => (
              <div key={evt.id} className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
                <span className="text-[10px] font-semibold text-[#7F876B] uppercase tracking-wider">
                  {evt.category} • {evt.date}
                </span>
                <h4 className="font-editorial text-base font-bold text-[#332A28]">
                  {evt.title}
                </h4>
                <p className="text-xs text-[#332A28]/70 line-clamp-2">
                  {evt.description}
                </p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#332A28]">{evt.price}</span>
                  <span className="text-[11px] text-[#7F876B] font-medium">{evt.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Onboarding and Product Tour */}
      <AdminProductTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={handleTourComplete}
        adminName={user.name}
      />

      {/* CMS In-App Delete Confirmation Modal (Works reliably in iframe without window.confirm) */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="bg-[#FFF9F2] p-6 max-w-md w-full rounded-sm border border-[#C97C79] shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-100 text-red-700 rounded-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 id="confirm-delete-title" className="font-editorial text-lg font-bold text-[#332A28]">
                  Confirm Deletion
                </h4>
                <p className="text-xs text-[#332A28]/70">This action permanently deletes the selected record.</p>
              </div>
            </div>

            <p className="text-xs text-[#332A28]/85 leading-relaxed bg-white p-3 border border-[#E8A6B2]/30 rounded-sm">
              Are you sure you want to permanently delete <strong className="text-[#332A28]">{itemToDelete.title}</strong>?
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={Boolean(eventActionLoading)}
                className="px-4 py-2 text-xs font-semibold text-[#332A28] hover:bg-[#E8A6B2]/30 rounded-sm border border-[#332A28]/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(eventActionLoading)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {eventActionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
