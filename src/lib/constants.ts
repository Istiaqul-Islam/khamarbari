// App Constants
import { getEnvVar } from "./env";
export const APP_NAME = "KhamarBari";
export const APP_DESCRIPTION = "Comprehensive Livestock Management & E-Commerce Platform";

// IMGBB API - Read from environment variable
export const IMGBB_API_KEY = getEnvVar("IMGBB_API_KEY") || "";
export const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

// Validate IMGBB API key is configured
if (!IMGBB_API_KEY && typeof window === "undefined") {
  console.warn("⚠️  IMGBB_API_KEY not configured. Image uploads will fail.");
}

// Species options for livestock
export const PET_SPECIES = [
  { value: "cow", label: "Cow / Bull", icon: "🐂" },
  { value: "goat", label: "Goat", icon: "🐐" },
  { value: "buffalo", label: "Water Buffalo", icon: "🐃" },
  { value: "sheep", label: "Sheep", icon: "🐑" },
  { value: "camel", label: "Camel", icon: "🐫" },
  { value: "other", label: "Other Livestock", icon: "🚜" },
] as const;

export const LIVESTOCK_SPECIES = PET_SPECIES;

// Gender options
export const LIVESTOCK_GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export const PET_GENDERS = LIVESTOCK_GENDERS;

// Appointment types
export const APPOINTMENT_TYPES = [
  { value: "consultation", label: "General Consultation" },
  { value: "vaccination", label: "Vaccination" },
  { value: "surgery", label: "Surgery" },
  { value: "checkup", label: "Health Checkup" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
] as const;

// Appointment status
export const APPOINTMENT_STATUS = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
] as const;

// Vaccination types
export const VACCINATION_TYPES = [
  { value: "core", label: "Core Vaccine" },
  { value: "non_core", label: "Non-Core Vaccine" },
  { value: "booster", label: "Booster Shot" },
] as const;

// Common vaccines
export const COMMON_VACCINES = [
  { value: "fmd", label: "Foot and Mouth Disease (FMD)", species: ["cow", "buffalo", "sheep", "goat"] },
  { value: "anthrax", label: "Anthrax", species: ["cow", "buffalo", "sheep", "goat"] },
  { value: "ppr", label: "Peste des Petits Ruminants (PPR)", species: ["goat", "sheep"] },
  { value: "hs", label: "Haemorrhagic Septicaemia (HS)", species: ["cow", "buffalo"] },
  { value: "bq", label: "Black Quarter (BQ)", species: ["cow", "buffalo"] },
  { value: "brucellosis", label: "Brucellosis", species: ["cow", "buffalo", "goat", "sheep"] },
  { value: "other", label: "Other Vaccine", species: [] },
] as const;

// Vaccination status
export const VACCINATION_STATUS = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "overdue", label: "Overdue", color: "red" },
  { value: "cancelled", label: "Cancelled", color: "gray" },
] as const;

// Feedback categories
export const FEEDBACK_CATEGORIES = [
  { value: "general", label: "General Feedback" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "ui", label: "UI/UX Feedback" },
  { value: "performance", label: "Performance Issue" },
  { value: "other", label: "Other" },
] as const;

// Feedback status
export const FEEDBACK_STATUS = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "reviewed", label: "Reviewed", color: "blue" },
  { value: "resolved", label: "Resolved", color: "green" },
] as const;

// Day names
export const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
] as const;

// Navigation items
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/pets", label: "My Livestock", icon: "Wheat" },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: "ShoppingBag" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "Calendar" },
  { href: "/dashboard/vaccinations", label: "Vaccinations", icon: "Syringe" },
  { href: "/dashboard/ai-bot", label: "AI Assistant", icon: "Bot" },
  { href: "/dashboard/feedback", label: "Feedback", icon: "MessageSquare" },
  { href: "/dashboard/about", label: "About", icon: "Info" },
] as const;

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/vets", label: "Veterinarians", icon: "Stethoscope" },
  { href: "/admin/feedback", label: "Feedback", icon: "MessageSquare" },
  { href: "/admin/appointments", label: "Appointments", icon: "Calendar" },
] as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Cloudinary Details
export const CLOUDINARY_CLOUD_NAME = getEnvVar("CLOUDINARY_CLOUD_NAME") || "";
export const CLOUDINARY_API_KEY = getEnvVar("CLOUDINARY_API_KEY") || "";
export const CLOUDINARY_API_SECRET = getEnvVar("CLOUDINARY_API_SECRET") || "";

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
export const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB for videos
export const MAX_AUDIO_SIZE = 5 * 1024 * 1024; // 5MB for audio
export const MAX_VIDEO_DURATION = 30; // 30 seconds
export const MAX_AUDIO_DURATION = 60; // 60 seconds

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"];

// Social Reaction Types
export const REACTION_TYPES = [
  { type: 'heart', label: 'Love', emoji: '❤️' },
  { type: 'like', label: 'Like', emoji: '👍' },
  { type: 'care', label: 'Care', emoji: '🥰' },
  { type: 'haha', label: 'Haha', emoji: '😂' },
  { type: 'wow', label: 'Wow', emoji: '😮' },
  { type: 'cry', label: 'Cry', emoji: '😢' },
] as const;

// Session timeout (in milliseconds)
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
