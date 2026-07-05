import {
  LayoutGrid,
  GraduationCap,
  Users,
  CalendarCheck,
  Bus,
  Wallet,
  BookOpen,
  CalendarClock,
  FileText,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutGrid },
  { label: "Students", icon: GraduationCap },
  { label: "Teachers", icon: Users },
  { label: "Attendance", icon: CalendarCheck },
  { label: "Transport", icon: Bus },
  { label: "Fees", icon: Wallet },
  { label: "Classes", icon: BookOpen },
  { label: "Timetable", icon: CalendarClock },
  { label: "Exams", icon: FileText },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

export type StatCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  statusColor: string;
};

export const stats: StatCard[] = [
  {
    label: "Total Students",
    value: "2,458",
    icon: GraduationCap,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
  },
  {
    label: "Present Today",
    value: "2,234",
    icon: CalendarCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
  },
  {
    label: "Absent Today",
    value: "224",
    icon: Users,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    statusColor: "bg-emerald-500",
  },
  {
    label: "Bus Trips Today",
    value: "1,842",
    icon: Bus,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
  },
  {
    label: "Fees Collected Today",
    value: "$24,890",
    icon: Wallet,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
  },
  {
    label: "Pending Invoices",
    value: "156",
    icon: FileText,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
  },
];

export const tabsList = [
  "Students",
  "Teachers",
  "Attendance",
  "Transport",
  "Classes",
  "Finance",
];

export const weeklyAttendance = [
  { day: "Mon", present: 2100, absent: 200 },
  { day: "Tue", present: 2250, absent: 150 },
  { day: "Wed", present: 2180, absent: 180 },
  { day: "Thu", present: 2340, absent: 120 },
  { day: "Fri", present: 2234, absent: 224 },
];

export const monthlyFees = [
  { month: "Jan", revenue: 18200 },
  { month: "Feb", revenue: 21500 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 24300 },
  { month: "May", revenue: 22100 },
  { month: "Jun", revenue: 24890 },
];

export type ScheduleItem = {
  title: string;
  time: string;
  indicatorColor: string;
};

export const todaySchedule: ScheduleItem[] = [
  {
    title: "Award Show Discussion",
    time: "10:00 AM - 11:00 AM",
    indicatorColor: "bg-emerald-500",
  },
  {
    title: "New Branding with Ace",
    time: "11:00 AM - 12:30 PM",
    indicatorColor: "bg-amber-400",
  },
  {
    title: "Development Discussion",
    time: "02:00 PM - 03:30 PM",
    indicatorColor: "bg-orange-500",
  },
  {
    title: "Parent-Teacher Meeting",
    time: "04:00 PM - 05:00 PM",
    indicatorColor: "bg-emerald-500",
  },
];

export type UpcomingEvent = {
  day: string;
  title: string;
  date: string;
  tag: string;
  tagBg: string;
};

export const upcomingEvents: UpcomingEvent[] = [
  {
    day: "1",
    title: "Annual Sports Day",
    date: "Nov 25, 2023",
    tag: "Event",
    tagBg: "bg-emerald-50 text-emerald-600",
  },
];
