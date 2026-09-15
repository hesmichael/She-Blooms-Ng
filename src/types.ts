export type EventCategory = 
  | 'Learning' 
  | 'Books' 
  | 'Social' 
  | 'Experience' 
  | 'Outing' 
  | 'Travel' 
  | 'Special';

export type EventStatus = 'Available' | 'Limited Spaces' | 'Sold Out' | 'Past';

export interface SheBloomsEvent {
  id: string;
  category: EventCategory;
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
  description: string;
  whatToExpect: string;
  status?: EventStatus;
  registrationDeadline?: string;
  dressCode?: string;
  whatIsIncluded?: string;
  whatToBring?: string;
  isPast?: boolean;
  image: string;
  isTravel?: boolean;
  travelDetails?: {
    route: string;
    itinerary: string;
    accommodation: string;
    whatsIncluded: string;
    whatsNotIncluded: string;
    travelRequirements: string;
    deposit: string;
    paymentSchedule: string;
    cancellationTerms: string;
  };
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  discussionDate: string;
  format: string;
  introduction: string;
  coverImage: string;
  isCurrent: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: 'admin' | 'member';
  twoFactorEnabled: boolean;
  sessionToken?: string;
  backupCodesCount?: number;
}

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  hasConsented: boolean;
}

export type CookieSettings = CookiePreferences;

export interface RegistrationRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  city?: string;
  consentGranted: boolean;
  createdAt: string;
}

export interface JoinSubmissionRecord {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  whatsapp: string;
  city: string;
  ageBand?: string;
  occupation?: string;
  interests?: string[];
  referralSource?: string;
  consentGranted?: boolean;
  createdAt: string;
}

export interface ConferenceSubmissionRecord {
  id: string;
  name: string;
  surname: string;
  email: string;
  whatsapp: string;
  city: string;
  numberAttending?: number;
  consentGranted?: boolean;
  createdAt: string;
}

export interface ContactSubmissionRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isPartnership: boolean;
  consentGranted?: boolean;
  createdAt: string;
}

export interface AdminOverviewStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  registrationsCount: number;
  joinMembersCount: number;
  conferenceInquiriesCount: number;
  contactInquiriesCount: number;
  newsletterCount: number;
}

export interface ConferenceSpeaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  location: string;
  bio: string;
  photo: string;
  isConfirmed: boolean;
}

export interface ConferenceAgendaItem {
  id: string;
  time: string;
  title: string;
  description: string;
  highlight?: boolean;
}
