// ORIGINAL TYPES 
export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  imageUrl: string;
  videoUrl?: string;
  description: string;
  speakerImageUrl?: string;
  series: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl: string;
  category: 'Worship' | 'Community' | 'Outreach' | 'Youth';
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socials?: {
    twitter?: string;
    instagram?: string;
  };
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contactEmail: string;
}

// API RESPONSE TYPES 
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  errors: unknown;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

// AUTH 
export interface NewUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  module: string | null;
  roles: string[];
  token: string;
  refreshToken: string;
  profilePictureUrl: string | null;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResendConfirmationDto {
  email: string;
}

// USER 
export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  profilePictureUrl: string | null;
  module: string | null;
  emailConfirmed: boolean;
  createdOn: string;
  roles: string[];
}

// SERMON 
export interface SermonDto {
  id: number;
  slug: string;
  title: string;
  speaker: string;
  series: string;
  description: string;
  speakerImageUrl: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  sermonDate: string;
  isPublished: boolean;
  createdOn: string;
}

// ANNOUNCEMENT 
export interface AnnouncementDto {
  id: number;
  slug: string;
  title: string;
  content: string;
  module: string;
  category: string;
  isPublished: boolean;
  createdOn: string;
  updatedOn: string | null;
}

// EVENT 
export interface EventDto {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string | null;
  ministryId: number | null;
  ministryName: string | null;
  ministrySlug: string | null;
  module: string;
  isCancelled: boolean;
  acceptsRegistrations: boolean;
  acceptsDonations: boolean;
  donationLabel: string | null;
  createdOn: string;
}

// TESTIMONY 
export interface TestimonyDto {
  id: number;
  name: string;
  content: string;
  attachment: string | null;
  status: string;
  createdAt: string;
}

export interface CreateTestimonyDto {
  name?: string;
  content: string;
  email: string;
  phoneNumber?: string;
}

// CONTACT 
export interface CreateContactDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  type: number;
}

export interface ContactDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface UpdateContactStatusDto {
  status: number;
}

// PRAYER REQUEST 
export interface CreatePrayerRequestDto {
  name: string;
  email: string;
  topic?: string;
  phoneNumber?: string;
  preferredContact: string;
  content: string;
  attachment?: string;
}

export interface PrayerRequestDto {
  id: number;
  name: string;
  content: string;
  anonymousToken: string;
  isAttendedTo: boolean;
  createdAt: string;
}

// DONATION 
export interface CreateDonationDto {
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  donationType: string;
  eventId?: number;
  eventTitle?: string;
}

export interface DonationResponseDto {
  id: number;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  transactionReference: string;
  paymentMethod: string;
  status: string;
  donationType: string;
  eventId: number | null;
  eventTitle: string | null;
  createdAt: string;
}

export interface DonationGroupDto {
  groupKey: string;
  totalAmount: number;
  count: number;
}

export interface BlogBlockDto {
  id: number;
  blockType: 'Heading' | 'Paragraph' | 'Image' | 'Quote';
  content: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface BlogPostResponseDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorId: string;
  authorName: string;
  isPublished: boolean;
  createdOn: string;
  updatedOn: string | null;
  department: string;
  videoUrl: string | null;
  blocks: BlogBlockDto[];
}

export interface CreateBlogBlockDto {
  blockType: 'Heading' | 'Paragraph' | 'Image' | 'Quote';
  content?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface CreateBlogPostDto {
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  isPublished: boolean;
  department: string;
  videoUrl?: string;
  blocks: CreateBlogBlockDto[];
}

export type UpdateBlogPostDto = CreateBlogPostDto;

export interface BlogQueryObject {
  isPublished?: boolean;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
  department?: string;
}

export interface DonationStatsDto {
  grandTotal: number;
  byType: DonationGroupDto[];
  byMethod: DonationGroupDto[];
  byCurrency: DonationGroupDto[];
}

// BOOK 
export interface BookDto {
  id: number;
  slug: string;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  amazonUrl: string | null;
  selarUrl: string | null;
  price: number | null;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdOn: string;
  updatedOn: string | null;
}

export interface CreateBookDto {
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  amazonUrl?: string;
  selarUrl?: string;
  price?: number;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface UpdateBookDto {
  title: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  amazonUrl?: string;
  selarUrl?: string;
  price?: number;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
}

// TEAM MEMBER 
export interface TeamMemberDto {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  module: string;
  displayOrder: number;
  isPublished: boolean;
}

// MINISTRY DEPARTMENT 
export interface MinistryDepartmentDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  contactEmail: string | null;
  displayOrder: number;
  isPublished: boolean;
}

//  ACTIVITY 
export interface ActivityDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  iconName: string | null;
  linkUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
}

// DASHBOARD STATS 
export interface DashboardStatsDto {
  totalUsers: number;
  totalAdmins: number;
  totalMembers: number;
  totalYouthMembers: number;
  totalAnnouncements: number;
  publishedAnnouncements: number;
  draftAnnouncements: number;
  ministryAnnouncements: number;
  youthAnnouncements: number;
  totalEvents: number;
  upcomingEvents: number;
  cancelledEvents: number;
  ministryEvents: number;
  youthEvents: number;
  totalPrayerRequests: number;
  pendingPrayerRequests: number;
  attendedPrayerRequests: number;
  totalTestimonies: number;
  pendingTestimonies: number;
  approvedTestimonies: number;
  rejectedTestimonies: number;
  totalContacts: number;
  newContacts: number;
  readContacts: number;
  respondedContacts: number;
  closedContacts: number;
  totalEventRegistrations: number;
  totalSermons: number;
  publishedSermons: number;
  draftSermons: number;
  totalAmountReceived: number;
  completedDonations: number;
  pendingDonations: number;
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  featuredBooks: number;
}

// BULK EMAIL 
export interface SendBulkEmailDto {
  subject: string;
  imageUrl?: string;
  htmlBody: string;
  targetGroup: 'All' | 'Ministry' | 'Youth' | 'Custom';
  customEmails?: string;
  scheduledAt?: string | null;
}

export interface BulkEmailResponseDto {
  id: number;
  subject: string;
  imageUrl: string | null;
  targetGroup: string;
  status: string;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdOn: string;
  createdByName: string | null;
  errorMessage: string | null;
}

export interface BulkEmailStatsDto {
  totalEmailsSent: number;
  totalRecipientsReached: number;
  totalScheduled: number;
  totalFailed: number;
  successRate: number;
}

// MINISTRY RESPONSE 
export interface MinistryResponseDto {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  coverImageUrl: string | null;
  leaderName: string | null;
  leaderTitle: string | null;
  leaderImageUrl: string | null;
  contactEmail: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdOn: string;
  updatedOn: string | null;
}

export interface CreateMinistryDto {
  name: string;
  shortDescription: string;
  description?: string;
  coverImageUrl?: string;
  leaderName?: string;
  leaderTitle?: string;
  leaderImageUrl?: string;
  contactEmail?: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface UpdateMinistryDto {
  name: string;
  shortDescription: string;
  description?: string;
  coverImageUrl?: string;
  leaderName?: string;
  leaderTitle?: string;
  leaderImageUrl?: string;
  contactEmail?: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface MinistryQueryObject {
  name?: string;
  isPublished?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
}

// ACCOUNT / MY PROFILE 
export interface MyProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  profilePictureUrl: string | null;
  module: string | null;
  emailConfirmed: boolean;
  createdOn: string;
  roles: string[];
}

export interface MyPrayerRequestDto {
  id: number;
  content: string;
  isAttendedTo: boolean;
  createdAt: string;
}

export interface MyRegistrationDto {
  id: number;
  eventId: number;
  eventTitle: string;
  eventLocation: string;
  eventStartDate: string;
  eventEndDate: string;
  eventImageUrl: string | null;
  eventModule: string;
  eventIsCancelled: boolean;
  registeredAt: string;
}

export interface MyDonationDto {
  id: number;
  amount: number;
  currency: string;
  donationType: string;
  paymentMethod: string;
  status: string;
  transactionReference: string;
  eventId: number | null;
  eventTitle: string | null;
  createdAt: string;
}

export interface CreateSermonDto {
  title: string;
  speaker: string;
  series: string;
  description: string;
  speakerImageUrl?: string;   // ← ADDED
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  sermonDate: string;
  isPublished: boolean;
}

export interface UpdateSermonDto {
  title: string;
  speaker: string;
  series: string;
  description: string;
  speakerImageUrl?: string;   // ← ADDED
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  sermonDate: string;
  isPublished: boolean;
}
// COUNSELLING 
export interface CounsellingResponseDto {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  topic: string;
  message: string;
  preferredContact: string;
  assignedTo: string | null;
  assignedToEmail: string | null;
  status: string;
  appUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}
